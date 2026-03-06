-- ============================================================================
-- Migration: Strategy Contexts & Agent Outputs
-- ============================================================================
-- Purpose: Replace localStorage with Supabase for strategic contexts
--          and add comprehensive AI agent logging
-- ============================================================================

-- ============================================================================
-- 1. STRATEGY_CONTEXTS TABLE
-- ============================================================================
-- Replaces localStorage for global strategy context storage
-- Supports cross-device access, persistence, and analytics

CREATE TABLE IF NOT EXISTS public.strategy_contexts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Core strategy fields (migrated from localStorage)
    niche TEXT NOT NULL,
    revenue_goal TEXT,
    founder_story TEXT,
    strengths JSONB DEFAULT '[]'::jsonb,

    -- Metadata
    is_active BOOLEAN NOT NULL DEFAULT true,  -- User's current active strategy
    source TEXT NOT NULL DEFAULT 'ai_generated', -- 'ai_generated' | 'manual'

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_source CHECK (source IN ('ai_generated', 'manual'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_strategy_contexts_user_id ON public.strategy_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_contexts_active ON public.strategy_contexts(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_strategy_contexts_created ON public.strategy_contexts(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.strategy_contexts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own strategy contexts" ON public.strategy_contexts;
CREATE POLICY "Users can view own strategy contexts" ON public.strategy_contexts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own strategy contexts" ON public.strategy_contexts;
CREATE POLICY "Users can insert own strategy contexts" ON public.strategy_contexts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own strategy contexts" ON public.strategy_contexts;
CREATE POLICY "Users can update own strategy contexts" ON public.strategy_contexts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own strategy contexts" ON public.strategy_contexts;
CREATE POLICY "Users can delete own strategy contexts" ON public.strategy_contexts
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS handle_strategy_contexts_updated_at ON public.strategy_contexts;
CREATE TRIGGER handle_strategy_contexts_updated_at
    BEFORE UPDATE ON public.strategy_contexts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 2. AGENT_OUTPUTS TABLE
-- ============================================================================
-- Comprehensive logging for all AI agent calls
-- Enables analytics, debugging, and context sharing between agents

CREATE TABLE IF NOT EXISTS public.agent_outputs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Agent identification
    agent_type TEXT NOT NULL, -- 'strategy' | 'content' | 'earth' | 'man' | 'law' | 'money'
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,

    -- Input/Output tracking
    input_prompt TEXT NOT NULL,
    input_params JSONB DEFAULT '{}'::jsonb,
    output_content TEXT,
    output_summary TEXT, -- Brief summary for quick preview

    -- Performance metrics
    duration_ms INTEGER,
    tokens_used INTEGER,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'timeout')),
    error_message TEXT,

    -- Context linking (for agent-to-agent communication)
    related_agent_ids UUID[], -- Array of related agent_outputs IDs

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for analytics and queries
CREATE INDEX IF NOT EXISTS idx_agent_outputs_user_id ON public.agent_outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_outputs_agent_type ON public.agent_outputs(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_outputs_status ON public.agent_outputs(status);
CREATE INDEX IF NOT EXISTS idx_agent_outputs_user_created ON public.agent_outputs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_outputs_task_id ON public.agent_outputs(task_id);

-- Enable Row Level Security
ALTER TABLE public.agent_outputs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own agent outputs" ON public.agent_outputs;
CREATE POLICY "Users can view own agent outputs" ON public.agent_outputs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own agent outputs" ON public.agent_outputs;
CREATE POLICY "Users can insert own agent outputs" ON public.agent_outputs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own agent outputs" ON public.agent_outputs;
CREATE POLICY "Users can update own agent outputs" ON public.agent_outputs
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 3. HELPER FUNCTIONS
-- ============================================================================

-- Function: Get or create active strategy context for user
CREATE OR REPLACE FUNCTION public.get_active_strategy_context(
    p_user_id UUID
) RETURNS TABLE (
    id UUID,
    niche TEXT,
    revenue_goal TEXT,
    founder_story TEXT,
    strengths JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT id, niche, revenue_goal, founder_story, strengths
    FROM public.strategy_contexts
    WHERE user_id = p_user_id
      AND is_active = true
    ORDER BY created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Save or update strategy context
CREATE OR REPLACE FUNCTION public.save_strategy_context(
    p_user_id UUID,
    p_niche TEXT,
    p_revenue_goal TEXT DEFAULT NULL,
    p_founder_story TEXT DEFAULT NULL,
    p_strengths JSONB DEFAULT '[]'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_context_id UUID;
BEGIN
    -- Deactivate existing active contexts
    UPDATE public.strategy_contexts
    SET is_active = false
    WHERE user_id = p_user_id AND is_active = true;

    -- Insert new active context
    INSERT INTO public.strategy_contexts (
        user_id, niche, revenue_goal, founder_story, strengths, is_active, source
    ) VALUES (
        p_user_id, p_niche, p_revenue_goal, p_founder_story, p_strengths, true, 'ai_generated'
    ) RETURNING id INTO v_context_id;

    RETURN v_context_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Log agent call (simplified)
CREATE OR REPLACE FUNCTION public.log_agent_call(
    p_user_id UUID,
    p_agent_type TEXT,
    p_input_prompt TEXT,
    p_input_params JSONB DEFAULT '{}'::jsonb,
    p_task_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.agent_outputs (
        user_id, agent_type, task_id, input_prompt, input_params, status
    ) VALUES (
        p_user_id, p_agent_type, p_task_id, p_input_prompt, p_input_params, 'processing'
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Complete agent log with results
CREATE OR REPLACE FUNCTION public.complete_agent_call(
    p_log_id UUID,
    p_output_content TEXT,
    p_output_summary TEXT DEFAULT NULL,
    p_duration_ms INTEGER DEFAULT NULL,
    p_tokens_used INTEGER DEFAULT NULL,
    p_status TEXT DEFAULT 'completed',
    p_error_message TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.agent_outputs
    SET
        output_content = p_output_content,
        output_summary = p_output_summary,
        duration_ms = p_duration_ms,
        tokens_used = p_tokens_used,
        status = p_status,
        error_message = p_error_message,
        completed_at = NOW()
    WHERE id = p_log_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.strategy_contexts TO authenticated, service_role;
GRANT DELETE ON public.strategy_contexts TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.agent_outputs TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_active_strategy_context TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.save_strategy_context TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_agent_call TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.complete_agent_call TO authenticated, service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- New tables:
-- - strategy_contexts (replaces localStorage)
-- - agent_outputs (comprehensive AI logging)
--
-- New functions:
-- - get_active_strategy_context(user_id)
-- - save_strategy_context(user, niche, goal, story, strengths)
-- - log_agent_call(user, agent_type, prompt, params, task_id)
-- - complete_agent_call(log_id, content, summary, duration, tokens, status, error)
-- ============================================================================
