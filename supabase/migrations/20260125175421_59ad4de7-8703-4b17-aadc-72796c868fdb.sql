-- Security hardening for sensitive tables: device integrations, sessions, coach payouts
-- Previous attempt failed due to dollar-quoting syntax in a DO/EXECUTE block. This migration retries with corrected quoting.

BEGIN;

-- ===============
-- Device integrations
-- ===============

CREATE OR REPLACE VIEW public.device_integrations_safe
WITH (security_invoker=on)
AS
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

REVOKE SELECT ON TABLE public.device_integrations FROM PUBLIC;
REVOKE SELECT ON TABLE public.device_integrations FROM anon;
REVOKE SELECT ON TABLE public.device_integrations FROM authenticated;

GRANT SELECT ON TABLE public.device_integrations_safe TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.device_integrations TO authenticated;


-- ===============
-- User sessions
-- ===============

CREATE OR REPLACE VIEW public.user_sessions_safe
WITH (security_invoker=on)
AS
SELECT
  id,
  user_id,
  session_token,
  device_info,
  NULL::text AS ip_address_masked,
  user_agent,
  browser,
  os,
  NULL::text AS location,
  last_active_at,
  created_at,
  is_current
FROM public.user_sessions
WHERE auth.uid() = user_id;

ALTER TABLE public.user_sessions DROP COLUMN IF EXISTS ip_address;
ALTER TABLE public.user_sessions DROP COLUMN IF EXISTS location;

REVOKE SELECT ON TABLE public.user_sessions FROM PUBLIC;
REVOKE SELECT ON TABLE public.user_sessions FROM anon;
REVOKE SELECT ON TABLE public.user_sessions FROM authenticated;

GRANT SELECT ON TABLE public.user_sessions_safe TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.user_sessions TO authenticated;


-- ===============
-- Coach payouts
-- ===============

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'coach_payouts'
      AND policyname = 'Coaches can view their own payouts'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Coaches can view their own payouts"
      ON public.coach_payouts
      FOR SELECT
      TO authenticated
      USING (
        public.has_role(auth.uid(), 'coach'::app_role)
        AND EXISTS (
          SELECT 1
          FROM public.coaches c
          WHERE c.id = coach_payouts.coach_id
            AND c.user_id = auth.uid()
        )
      );
    $policy$;
  END IF;
END
$do$;

COMMIT;