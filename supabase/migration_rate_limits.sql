-- ================================================
-- Rate Limiting and Anonymous User Support
-- ================================================
-- This migration adds tables for:
-- 1. Rate limiting for anonymous users
-- 2. Temporary storage for anonymous user data
-- 3. Automatic cleanup of expired records

-- ================================================
-- 1. Rate Limits Table
-- ================================================
-- Tracks API usage by IP address for anonymous users

CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_request TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_request_count CHECK (request_count >= 1 AND request_count <= 100)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_window ON public.rate_limits(ip_address, window_start DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits(window_start);

-- Enable Row Level Security
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations (rate limits are public)
CREATE POLICY "Allow all rate limit operations"
    ON public.rate_limits
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ================================================
-- 2. Temp Strategies Table
-- ================================================
-- Stores strategy data for anonymous users (expires after 24h)

CREATE TABLE IF NOT EXISTS public.temp_strategies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    niche TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),

    -- Constraints
    CONSTRAINT valid_niche_length CHECK (char_length(niche) >= 5 AND char_length(niche) <= 1000),
    CONSTRAINT valid_content_length CHECK (char_length(content) >= 50)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_temp_strategies_expires_at ON public.temp_strategies(expires_at);
CREATE INDEX IF NOT EXISTS idx_temp_strategies_ip_address ON public.temp_strategies(ip_address);

-- Enable Row Level Security
ALTER TABLE public.temp_strategies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow anyone to insert temp strategies"
    ON public.temp_strategies
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow anyone to read temp strategies"
    ON public.temp_strategies
    FOR SELECT
    USING (true);

-- ================================================
-- 3. Cleanup Functions
-- ================================================

-- Function to clean up expired temp strategies
CREATE OR REPLACE FUNCTION public.cleanup_expired_temp_strategies()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.temp_strategies
    WHERE expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.rate_limits
    WHERE window_start < NOW() - INTERVAL '7 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- ================================================
-- 4. Helper Functions
-- ================================================

-- Check rate limit for an IP address
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_ip_address TEXT,
    p_max_requests INTEGER DEFAULT 5,
    p_window_minutes INTEGER DEFAULT 60
)
RETURNS TABLE (
    allowed BOOLEAN,
    remaining INTEGER,
    reset_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_window_start TIMESTAMPTZ;
    v_current_count INTEGER;
    v_reset_at TIMESTAMPTZ;
BEGIN
    v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    v_reset_at := v_window_start + (p_window_minutes || ' minutes')::INTERVAL;

    -- Get current count
    SELECT COALESCE(SUM(request_count), 0)
    INTO v_current_count
    FROM public.rate_limits
    WHERE ip_address = p_ip_address
    AND window_start >= v_window_start;

    -- Check if allowed
    IF v_current_count < p_max_requests THEN
        -- Increment or create record
        INSERT INTO public.rate_limits (ip_address, request_count, window_start, last_request)
        VALUES (p_ip_address, 1, NOW(), NOW())
        ON CONFLICT (ip_address, window_start) DO UPDATE
        SET request_count = rate_limits.request_count + 1,
            last_request = NOW();

        RETURN QUERY SELECT TRUE, p_max_requests - v_current_count - 1, v_reset_at;
    ELSE
        RETURN QUERY SELECT FALSE, 0, v_reset_at;
    END IF;
END;
$$;

-- ================================================
-- 5. Scheduled Cleanup (pg_cron)
-- ================================================
-- Note: Requires pg_cron extension to be enabled
-- Uncomment if you have pg_cron available:

-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- SELECT cron.schedule(
--     'cleanup-expired-temp-strategies',
--     '0 */2 * * *', -- Every 2 hours
--     'SELECT cleanup_expired_temp_strategies();'
-- );

-- SELECT cron.schedule(
--     'cleanup-old-rate-limits',
--     '0 3 * * *', -- Daily at 3 AM
--     'SELECT cleanup_old_rate_limits();'
-- );

-- ================================================
-- 6. Manual Cleanup Instructions
-- ================================================
-- If you don't have pg_cron, you can call these functions manually:
-- SELECT cleanup_expired_temp_strategies();
-- SELECT cleanup_old_rate_limits();

-- Or create a Supabase Edge Function to call these periodically
