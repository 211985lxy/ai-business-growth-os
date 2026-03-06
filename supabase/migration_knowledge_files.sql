-- ============================================================================
-- Knowledge Files Table - 灵魂仓库核心表
-- ============================================================================
-- 存储上传的知识文件，支持六脉分类和 Dify 集成

CREATE TABLE IF NOT EXISTS public.knowledge_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- 文件基本信息
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,

    -- Dify 集成
    dify_file_id TEXT NOT NULL,
    dify_dataset_id TEXT,

    -- 六脉分类
    meridian_type TEXT NOT NULL CHECK (meridian_type IN ('tian', 'di', 'ren', 'shen', 'cai', 'fa')),

    -- 元数据
    page_count INTEGER,
    word_count INTEGER,

    -- 同步状态
    sync_status TEXT NOT NULL DEFAULT 'uploading' CHECK (sync_status IN ('uploading', 'indexing', 'synced', 'failed')),
    sync_error TEXT,

    -- 时间戳
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    synced_at TIMESTAMPTZ
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_knowledge_files_user_id ON public.knowledge_files(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_files_meridian_type ON public.knowledge_files(meridian_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_files_sync_status ON public.knowledge_files(sync_status);
CREATE INDEX IF NOT EXISTS idx_knowledge_files_user_meridian ON public.knowledge_files(user_id, meridian_type);

-- 启用 RLS
ALTER TABLE public.knowledge_files ENABLE ROW LEVEL SECURITY;

-- RLS 策略
DROP POLICY IF EXISTS "Users can view own knowledge files" ON public.knowledge_files;
CREATE POLICY "Users can view own knowledge files" ON public.knowledge_files
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own knowledge files" ON public.knowledge_files;
CREATE POLICY "Users can insert own knowledge files" ON public.knowledge_files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own knowledge files" ON public.knowledge_files;
CREATE POLICY "Users can update own knowledge files" ON public.knowledge_files
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own knowledge files" ON public.knowledge_files;
CREATE POLICY "Users can delete own knowledge files" ON public.knowledge_files
    FOR DELETE USING (auth.uid() = user_id);

-- 自动更新时间戳
DROP TRIGGER IF EXISTS handle_knowledge_files_updated_at ON public.knowledge_files;
CREATE TRIGGER handle_knowledge_files_updated_at
    BEFORE UPDATE ON public.knowledge_files
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
