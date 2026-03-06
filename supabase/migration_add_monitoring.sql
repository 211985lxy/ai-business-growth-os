-- ============================================================================
-- Migration: Add Monitoring and Logging Fields to Tasks Table
-- ============================================================================
-- This migration adds detailed monitoring capabilities for AI calls
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Add new columns to tasks table for enhanced monitoring
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS token_total_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS token_input_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS token_output_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration_ms INTEGER,
ADD COLUMN IF NOT EXISTS input_summary TEXT,
ADD COLUMN IF NOT EXISTS output_summary TEXT,
ADD COLUMN IF NOT EXISTS model_used TEXT,
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'dify',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add indexes for monitoring queries
CREATE INDEX IF NOT EXISTS idx_tasks_duration ON public.tasks(duration_ms) WHERE duration_ms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_token_usage ON public.tasks(token_total_tokens) WHERE token_total_tokens IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_provider ON public.tasks(provider);

-- Add comment for documentation
COMMENT ON COLUMN public.tasks.token_total_tokens IS 'Total tokens used in this AI call';
COMMENT ON COLUMN public.tasks.token_input_tokens IS 'Input tokens (prompt + context)';
COMMENT ON COLUMN public.tasks.token_output_tokens IS 'Output tokens (generated content)';
COMMENT ON COLUMN public.tasks.duration_ms IS 'Execution time in milliseconds';
COMMENT ON COLUMN public.tasks.input_summary IS 'Short summary of input (max 200 chars)';
COMMENT ON COLUMN public.tasks.output_summary IS 'Short summary of output (max 200 chars)';
COMMENT ON COLUMN public.tasks.model_used IS 'AI model identifier (e.g., gpt-4, claude-3)';
COMMENT ON COLUMN public.tasks.provider IS 'AI provider (dify, openai, anthropic, etc.)';
COMMENT ON COLUMN public.tasks.metadata IS 'Additional monitoring data (cost, cache hit rate, etc.)';

-- Create view for monitoring dashboard
CREATE OR REPLACE VIEW public.monitoring_summary AS
SELECT
    user_id,
    workflow_type,
    provider,
    COUNT(*) as total_calls,
    SUM(token_total_tokens) as total_tokens,
    AVG(duration_ms) as avg_duration_ms,
    MIN(duration_ms) as min_duration_ms,
    MAX(duration_ms) as max_duration_ms,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_calls,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_calls,
    ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as success_rate,
    DATE_TRUNC('day', MAX(created_at)) as last_activity
FROM public.tasks
GROUP BY user_id, workflow_type, provider;

-- Grant access to monitoring view
GRANT SELECT ON public.monitoring_summary TO authenticated, service_role;

-- ============================================================================
-- Setup Complete
-- ============================================================================
-- New fields available:
-- - Token usage tracking (input, output, total)
-- - Performance monitoring (duration in ms)
-- - Summaries for quick scanning
-- - Model and provider identification
-- - Flexible metadata for future enhancements
-- ============================================================================
