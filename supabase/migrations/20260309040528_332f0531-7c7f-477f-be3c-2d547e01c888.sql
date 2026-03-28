-- Fix Security Definer View: add security_invoker=on to user_sessions_safe
-- This ensures the view runs with the querying user's permissions (not the creator's)
DROP VIEW IF EXISTS public.user_sessions_safe;

CREATE VIEW public.user_sessions_safe
WITH (security_invoker = on)
AS
SELECT
  id,
  user_id,
  device_info,
  NULL::text AS ip_address_masked,
  user_agent,
  browser,
  os,
  NULL::text AS location,
  last_active_at,
  created_at,
  is_current
FROM user_sessions
WHERE auth.uid() = user_id;