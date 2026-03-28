
-- Fix the SECURITY DEFINER view issue by using security_invoker
DROP VIEW IF EXISTS public.user_sessions_safe;

CREATE VIEW public.user_sessions_safe 
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  session_token,
  browser,
  os,
  device_info,
  obfuscate_ip(ip_address) as ip_address_masked,
  location,
  user_agent,
  is_current,
  last_active_at,
  created_at
FROM public.user_sessions;
