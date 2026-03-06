-- ============================================================================
-- Migration: Add output_content to strategy_contexts
-- ============================================================================
-- Purpose: Store AI-generated strategy output directly in strategy_contexts
--          This allows other modules (神韵·内容) to read the full strategy report
-- ============================================================================

-- Add output_content column to store AI-generated strategy report
ALTER TABLE public.strategy_contexts
ADD COLUMN IF NOT EXISTS output_content TEXT;

-- Add column comment
COMMENT ON COLUMN public.strategy_contexts.output_content IS
'AI-generated complete strategy report (Markdown format)';
