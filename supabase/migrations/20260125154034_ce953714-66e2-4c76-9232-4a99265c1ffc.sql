-- Security fixes: make highlight-videos private and restrict device_integrations_safe to owners

BEGIN;

-- 1) Make highlight-videos bucket private
UPDATE storage.buckets
SET public = false
WHERE id = 'highlight-videos';

-- 2) Re-create device_integrations_safe view with authentication check and owner-only access
DROP VIEW IF EXISTS public.device_integrations_safe;

CREATE VIEW public.device_integrations_safe
WITH (security_invoker = on) AS
SELECT
  id,
  user_id,
  device_type,
  is_connected,
  last_sync_at,
  created_at,
  updated_at
FROM public.device_integrations
WHERE auth.uid() IS NOT NULL
  AND auth.uid() = user_id;

REVOKE ALL ON public.device_integrations_safe FROM PUBLIC;
REVOKE ALL ON public.device_integrations_safe FROM anon;
GRANT SELECT ON public.device_integrations_safe TO authenticated;

COMMIT;
