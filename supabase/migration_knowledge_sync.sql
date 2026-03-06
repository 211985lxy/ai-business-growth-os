-- ============================================================================
-- Knowledge Sync Log Table - 知识库同步状态追踪
-- ============================================================================
-- 记录知识库同步状态，计算灵魂覆盖度

CREATE TABLE IF NOT EXISTS public.knowledge_sync_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- 同步状态
    sync_status TEXT NOT NULL DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'completed', 'failed')),

    -- 统计信息
    total_files INTEGER NOT NULL DEFAULT 0,
    indexed_files INTEGER NOT NULL DEFAULT 0,
    failed_files INTEGER NOT NULL DEFAULT 0,

    -- 覆盖度计算（灵魂覆盖度）
    coverage_percentage INTEGER CHECK (coverage_percentage IS NULL OR (coverage_percentage >= 0 AND coverage_percentage <= 100)),

    -- 错误信息
    sync_error TEXT,

    -- 时间戳
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_knowledge_sync_user_id ON public.knowledge_sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_sync_status ON public.knowledge_sync_log(sync_status);
CREATE INDEX IF NOT EXISTS idx_knowledge_sync_last_sync ON public.knowledge_sync_log(last_sync_at DESC);

-- 启用 RLS
ALTER TABLE public.knowledge_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS 策略
DROP POLICY IF EXISTS "Users can view own sync log" ON public.knowledge_sync_log;
CREATE POLICY "Users can view own sync log" ON public.knowledge_sync_log
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sync log" ON public.knowledge_sync_log;
CREATE POLICY "Users can insert own sync log" ON public.knowledge_sync_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sync log" ON public.knowledge_sync_log;
CREATE POLICY "Users can update own sync log" ON public.knowledge_sync_log
    FOR UPDATE USING (auth.uid() = user_id);

-- 自动更新时间戳
DROP TRIGGER IF EXISTS handle_knowledge_sync_updated_at ON public.knowledge_sync_log;
CREATE TRIGGER handle_knowledge_sync_updated_at
    BEFORE UPDATE ON public.knowledge_sync_log
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
