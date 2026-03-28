-- Security Fix 1: Add explicit deny policy for anonymous users on profiles table
-- This prevents any potential anonymous access to sensitive personal data
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Security Fix 2: Create a function to purge old session data for privacy protection
-- Sessions older than 30 days will be automatically deleted
CREATE OR REPLACE FUNCTION public.purge_old_user_sessions(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.user_sessions
  WHERE last_active_at < NOW() - (retention_days || ' days')::INTERVAL
    AND is_current = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Add index on last_active_at for efficient session cleanup queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active 
ON public.user_sessions (last_active_at);

-- Create a scheduled job config entry for session cleanup (to be invoked via cron)
INSERT INTO public.data_retention_config (config_key, config_value, description)
VALUES (
  'user_sessions_retention',
  '{"retention_days": 30, "enabled": true}'::jsonb,
  'Configuration for automatic user session data cleanup after 30 days'
)
ON CONFLICT (config_key) DO UPDATE 
SET config_value = EXCLUDED.config_value,
    updated_at = NOW();