
-- Fix user_sessions_safe view: drop and recreate without session_token
DROP VIEW IF EXISTS public.user_sessions_safe;

CREATE VIEW public.user_sessions_safe AS
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
