-- ============================================================================
-- AI Business Growth OS - Complete Supabase Database Schema
-- ============================================================================
-- Run this in your Supabase SQL Editor to set up all tables, policies,
-- functions, and triggers for the application.
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
-- Extended user profiles linked to Supabase Auth

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL DEFAULT 'starter' CHECK (tier IN ('starter', 'pro', 'enterprise')),
    credits INTEGER NOT NULL DEFAULT 10 CHECK (credits >= 0),
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON public.profiles(auth_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON public.profiles(tier);
CREATE INDEX IF NOT EXISTS idx_profiles_credits ON public.profiles(credits);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = auth_id);

-- ============================================================================
-- 2. BRAND_ASSETS TABLE
-- ============================================================================
-- Context assets for AI prompt injection with structured JSON content

CREATE TABLE IF NOT EXISTS public.brand_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('persona', 'product_selling_points', 'target_audience', 'writing_style')),
    name TEXT NOT NULL,
    content JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_assets_user_id ON public.brand_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_user_type ON public.brand_assets(user_id, asset_type);
CREATE INDEX IF NOT EXISTS idx_brand_assets_active ON public.brand_assets(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_brand_assets_sort_order ON public.brand_assets(user_id, sort_order);

-- Enable Row Level Security
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own brand assets" ON public.brand_assets;
CREATE POLICY "Users can view own brand assets" ON public.brand_assets
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own brand assets" ON public.brand_assets;
CREATE POLICY "Users can insert own brand assets" ON public.brand_assets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own brand assets" ON public.brand_assets;
CREATE POLICY "Users can update own brand assets" ON public.brand_assets
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own brand assets" ON public.brand_assets;
CREATE POLICY "Users can delete own brand assets" ON public.brand_assets
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 3. TASKS TABLE (for content_pieces and generation_logs)
-- ============================================================================
-- AI generation tasks with workflow tracking
-- This replaces both content_pieces and generation_logs

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workflow_type TEXT NOT NULL CHECK (workflow_type IN ('strategy_research', 'script_draft', 'script_critic', 'script_refiner', 'xhs_generator')),
    workflow_id TEXT NOT NULL,
    input_data JSONB NOT NULL,
    output_content TEXT,
    thinking_process TEXT,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    iteration_count INTEGER NOT NULL DEFAULT 0 CHECK (iteration_count >= 0),
    quality_score INTEGER CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 100)),
    error_message TEXT,
    credits_used INTEGER NOT NULL DEFAULT 0 CHECK (credits_used >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON public.tasks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_workflow_type ON public.tasks(workflow_type);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON public.tasks(completed_at) WHERE completed_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 4. ASSET_USAGE TABLE (Junction table)
-- ============================================================================
-- Links tasks to brand assets used for context injection

CREATE TABLE IF NOT EXISTS public.asset_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.brand_assets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Composite index for querying
CREATE INDEX IF NOT EXISTS idx_asset_usage_task_asset ON public.asset_usage(task_id, asset_id);

-- Unique constraint to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_usage_unique_task_asset
    ON public.asset_usage(task_id, asset_id);

-- Enable Row Level Security
ALTER TABLE public.asset_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies (check ownership via tasks table)
DROP POLICY IF EXISTS "Users can view own asset usage" ON public.asset_usage;
CREATE POLICY "Users can view own asset usage" ON public.asset_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE public.tasks.id = task_id AND auth.uid() = public.tasks.user_id
        )
    );

DROP POLICY IF EXISTS "Users can insert own asset usage" ON public.asset_usage;
CREATE POLICY "Users can insert own asset usage" ON public.asset_usage
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE public.tasks.id = task_id AND auth.uid() = public.tasks.user_id
        )
    );

DROP POLICY IF EXISTS "Users can update own asset usage" ON public.asset_usage;
CREATE POLICY "Users can update own asset usage" ON public.asset_usage
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE public.tasks.id = task_id AND auth.uid() = public.tasks.user_id
        )
    );

DROP POLICY IF EXISTS "Users can delete own asset usage" ON public.asset_usage;
CREATE POLICY "Users can delete own asset usage" ON public.asset_usage
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE public.tasks.id = task_id AND auth.uid() = public.tasks.user_id
        )
    );

-- ============================================================================
-- 5. DATABASE FUNCTIONS
-- ============================================================================

-- Function to get active brand assets for context injection
CREATE OR REPLACE FUNCTION public.get_active_brand_assets(
    p_user_id UUID,
    p_asset_type TEXT DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    asset_type TEXT,
    name TEXT,
    content JSONB
) AS $$
BEGIN
    -- Security check: Ensure user can only access their own assets
    IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized access to brand assets';
    END IF;

    RETURN QUERY
    SELECT id, asset_type, name, content
    FROM public.brand_assets
    WHERE user_id = p_user_id
      AND is_active = true
      AND (p_asset_type IS NULL OR asset_type = p_asset_type)
    ORDER BY sort_order, created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user credits
CREATE OR REPLACE FUNCTION public.check_user_credits(
    p_user_id UUID,
    p_required_credits INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    available_credits INTEGER;
BEGIN
    -- Security check: Ensure user can only check their own credits
    IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized access to user credits';
    END IF;

    SELECT credits INTO available_credits
    FROM public.profiles
    WHERE id = p_user_id;

    RETURN available_credits >= p_required_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct user credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
    p_user_id UUID,
    p_credits_to_deduct INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
    -- Security check: Ensure user can only deduct from their own credits
    -- Service role can bypass this check for server-side operations
    IF auth.uid() IS NULL OR (auth.uid() != p_user_id AND auth.uid()::text != 'service_role') THEN
        RAISE EXCEPTION 'Unauthorized access to deduct credits';
    END IF;

    UPDATE public.profiles
    SET credits = credits - p_credits_to_deduct,
        updated_at = NOW()
    WHERE id = p_user_id AND credits >= p_credits_to_deduct;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================================================

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_brand_assets_updated_at ON public.brand_assets;
CREATE TRIGGER handle_brand_assets_updated_at
    BEFORE UPDATE ON public.brand_assets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_tasks_updated_at ON public.tasks;
CREATE TRIGGER handle_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 7. AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================================

-- Function to create profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (auth_id, id)
    VALUES (NEW.id, NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schemas
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant select on tables for anon/authenticated users
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.brand_assets TO authenticated;
GRANT SELECT ON public.tasks TO authenticated;
GRANT SELECT ON public.asset_usage TO authenticated;

-- Grant all permissions for service_role
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.brand_assets TO service_role;
GRANT ALL ON public.tasks TO service_role;
GRANT ALL ON public.asset_usage TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_active_brand_assets TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_credits TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.deduct_credits TO authenticated, service_role;

-- ============================================================================
-- 9. ENABLE REALTIME (optional, for subscriptions)
-- ============================================================================

-- Uncomment if you want realtime functionality
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.brand_assets;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Your database is now ready! The following tables have been created:
-- - profiles (user profiles with credits and tiers)
-- - brand_assets (AI context assets: persona, products, audience, writing style)
-- - tasks (content generation tracking with status and outputs)
-- - asset_usage (junction table linking tasks to brand assets)
--
-- All tables have Row Level Security enabled to ensure users can only
-- access their own data.
-- ============================================================================
