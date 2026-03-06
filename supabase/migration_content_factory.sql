-- ============================================================================
-- Content Factory Tables
-- 内容工厂相关表：选题洞察报告和生成的文章
-- ============================================================================

-- ============================================================================
-- 1. TOPIC_REPORTS TABLE (选题洞察报告)
-- ============================================================================
-- 存储爆款选题搜索的洞察报告

CREATE TABLE IF NOT EXISTS public.topic_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    top_articles JSONB NOT NULL, -- 存储 Top 5 列表
    insights JSONB NOT NULL, -- 存储 5 个选题建议
    word_cloud JSONB NOT NULL, -- 存储词云数据
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_topic_reports_user_id ON public.topic_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_reports_keyword ON public.topic_reports(keyword);
CREATE INDEX IF NOT EXISTS idx_topic_reports_created_at ON public.topic_reports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.topic_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own topic reports" ON public.topic_reports;
CREATE POLICY "Users can view own topic reports" ON public.topic_reports
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own topic reports" ON public.topic_reports;
CREATE POLICY "Users can insert own topic reports" ON public.topic_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own topic reports" ON public.topic_reports;
CREATE POLICY "Users can delete own topic reports" ON public.topic_reports
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 2. ARTICLES TABLE (生成的文章)
-- ============================================================================
-- 存储AI生成的文章及其发布状态

CREATE TABLE IF NOT EXISTS public.articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    images JSONB NOT NULL DEFAULT '[]'::jsonb, -- 存储 Unsplash 图片 URL 数组
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    platform TEXT NOT NULL CHECK (platform IN ('wechat', 'xiaohongshu', 'douyin', 'shipinhao')),
    topic_report_id UUID REFERENCES public.topic_reports(id) ON DELETE SET NULL, -- 关联的选题报告 ID
    category TEXT, -- 内容类目
    sub_type TEXT, -- 子类型
    metadata JSONB DEFAULT '{}'::jsonb, -- 额外的元数据（身份、平台等）
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON public.articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_platform ON public.articles(platform);
CREATE INDEX IF NOT EXISTS idx_articles_topic_report_id ON public.articles(topic_report_id);
CREATE INDEX IF NOT EXISTS idx_articles_user_created ON public.articles(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own articles" ON public.articles;
CREATE POLICY "Users can view own articles" ON public.articles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own articles" ON public.articles;
CREATE POLICY "Users can insert own articles" ON public.articles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own articles" ON public.articles;
CREATE POLICY "Users can update own articles" ON public.articles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own articles" ON public.articles;
CREATE POLICY "Users can delete own articles" ON public.articles
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 3. TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================================================

-- Apply to tables
DROP TRIGGER IF EXISTS handle_topic_reports_updated_at ON public.topic_reports;
CREATE TRIGGER handle_topic_reports_updated_at
    BEFORE UPDATE ON public.topic_reports
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_articles_updated_at ON public.articles;
CREATE TRIGGER handle_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 4. GRANT PERMISSIONS
-- ============================================================================

-- Grant select on tables for authenticated users
GRANT SELECT ON public.topic_reports TO authenticated;
GRANT SELECT ON public.articles TO authenticated;

-- Grant all permissions for service_role
GRANT ALL ON public.topic_reports TO service_role;
GRANT ALL ON public.articles TO service_role;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- New tables created:
-- - topic_reports (选题洞察报告)
-- - articles (生成的文章)
-- ============================================================================
