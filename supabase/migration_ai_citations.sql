-- ============================================================================
-- AI Citations Table - 引用溯源系统
-- ============================================================================
-- 存储 AI 输出的引用信息，支持溯源到原始文档

CREATE TABLE IF NOT EXISTS public.ai_citations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    knowledge_file_id UUID REFERENCES public.knowledge_files(id) ON DELETE SET NULL,

    -- 引用信息
    citation_number INTEGER NOT NULL, -- [1], [2], [3]...

    -- 来源信息
    source_file_name TEXT,
    source_page INTEGER,
    source_paragraph INTEGER,

    -- 引用原文片段
    source_text_preview TEXT,

    -- 在 AI 输出中的上下文
    context_before TEXT,
    context_after TEXT,

    -- 时间戳
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_ai_citations_task_id ON public.ai_citations(task_id);
CREATE INDEX IF NOT EXISTS idx_ai_citations_knowledge_file_id ON public.ai_citations(knowledge_file_id);
CREATE INDEX IF NOT EXISTS idx_ai_citations_citation_number ON public.ai_citations(task_id, citation_number);

-- 启用 RLS
ALTER TABLE public.ai_citations ENABLE ROW LEVEL SECURITY;

-- RLS 策略（通过 tasks 表关联）
DROP POLICY IF EXISTS "Users can view own task citations" ON public.ai_citations;
CREATE POLICY "Users can view own task citations" ON public.ai_citations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE public.tasks.id = task_id AND auth.uid() = public.tasks.user_id
        )
    );

DROP POLICY IF EXISTS "Users can insert own task citations" ON public.ai_citations;
CREATE POLICY "Users can insert own task citations" ON public.ai_citations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE public.tasks.id = task_id AND auth.uid() = public.tasks.user_id
        )
    );

-- ============================================================================
-- 扩展 tasks 表 - 添加灵魂一致性评分
-- ============================================================================

-- 添加 consistency_score 字段到 tasks 表
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS consistency_score INTEGER CHECK (consistency_score IS NULL OR (consistency_score >= 0 AND consistency_score <= 100));

-- 添加 active_meridians 字段到 tasks 表（JSON 数组）
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS active_meridians JSONB;

-- 添加 citations_count 字段到 tasks 表
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS citations_count INTEGER NOT NULL DEFAULT 0;
