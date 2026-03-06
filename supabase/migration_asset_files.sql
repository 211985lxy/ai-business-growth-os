-- ============================================================================
-- Migration: Asset Files Table
-- ============================================================================
-- Purpose: Store user asset files from Dify responses
--          Provides permanent URLs for files that were temporarily hosted by Dify
-- ============================================================================

-- ============================================================================
-- 1. ASSET_FILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.asset_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- 文件信息
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,

    -- 存储路径
    storage_path TEXT NOT NULL,
    original_url TEXT NOT NULL,  -- Dify 临时 URL
    permanent_url TEXT NOT NULL, -- Supabase 永久 URL

    -- 元数据
    agent_type TEXT NOT NULL,  -- 哪个智能体生成的文件
    related_content_id UUID,  -- 关联的 strategy_contexts 记录

    -- 时间戳
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- 约束
    CONSTRAINT valid_file_size CHECK (file_size >= 0),
    CONSTRAINT valid_agent_type CHECK (agent_type IN ('strategy', 'content', 'earth', 'man', 'law', 'money'))
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_asset_files_user_id ON public.asset_files(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_files_user_agent ON public.asset_files(user_id, agent_type);
CREATE INDEX IF NOT EXISTS idx_asset_files_related_content ON public.asset_files(related_content_id);
CREATE INDEX IF NOT EXISTS idx_asset_files_created_at ON public.asset_files(created_at DESC);

-- ============================================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.asset_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own asset files" ON public.asset_files;
CREATE POLICY "Users can view own asset files"
    ON public.asset_files
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own asset files" ON public.asset_files;
CREATE POLICY "Users can insert own asset files"
    ON public.asset_files
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own asset files" ON public.asset_files;
CREATE POLICY "Users can delete own asset files"
    ON public.asset_files
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 3. TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================================================

DROP TRIGGER IF EXISTS handle_asset_files_updated_at ON public.asset_files;
CREATE TRIGGER handle_asset_files_updated_at
    BEFORE UPDATE ON public.asset_files
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 4. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, DELETE ON public.asset_files TO authenticated, service_role;

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function: Get user assets by agent type
CREATE OR REPLACE FUNCTION public.get_user_assets(
    p_user_id UUID,
    p_agent_type TEXT DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER,
    permanent_url TEXT,
    agent_type TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        id,
        file_name,
        file_type,
        file_size,
        permanent_url,
        agent_type,
        created_at
    FROM public.asset_files
    WHERE user_id = p_user_id
      AND (p_agent_type IS NULL OR agent_type = p_agent_type)
    ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Delete asset file by ID
CREATE OR REPLACE FUNCTION public.delete_asset_file(
    p_asset_id UUID,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_storage_path TEXT;
BEGIN
    -- Security check
    IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized access to asset file';
    END IF;

    -- Get storage path before deleting record
    SELECT storage_path INTO v_storage_path
    FROM public.asset_files
    WHERE id = p_asset_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Delete from storage
    DELETE FROM storage.files
    WHERE id = (SELECT id FROM storage.buckets WHERE name = 'assets' AND id = v_storage_path);

    -- Delete record
    DELETE FROM public.asset_files
    WHERE id = p_asset_id AND user_id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_user_assets TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_asset_file TO authenticated, service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- 新表：
-- - asset_files (用户资产文件记录)
--
-- 新函数：
-- - get_user_assets(user_id, agent_type) - 获取用户资产列表
-- - delete_asset_file(asset_id, user_id) - 删除资产文件
--
-- 功能：
-- - 存储 Dify 返回的文件信息
-- - 提供永久 URL 替代 Dify 临时 URL
-- - 用户可以管理和删除自己的资产文件
-- ============================================================================
