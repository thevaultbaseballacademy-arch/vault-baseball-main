-- ============================================================
-- VAULT™ Weekly Maintenance Cron Schedule
-- Runs every Saturday at 11:00 PM ET (03:00 Sunday UTC)
-- Calls the weekly-maintenance edge function
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Remove any existing maintenance job
SELECT cron.unschedule('vault-weekly-maintenance') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'vault-weekly-maintenance');

-- Schedule: Saturday 23:00 ET = Sunday 03:00 UTC
-- Cron format: minute hour day-of-month month day-of-week
-- 0 3 * * 0 = Every Sunday at 03:00 UTC (Saturday 11pm ET)
SELECT cron.schedule(
  'vault-weekly-maintenance',
  '0 3 * * 0',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/weekly-maintenance',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.anon_key')
    ),
    body := '{"source":"cron"}'::jsonb
  ) AS request_id;
  $$
);

-- Verify the job was scheduled
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'vault-weekly-maintenance') THEN
    RAISE WARNING 'Weekly maintenance cron job was not created successfully';
  ELSE
    RAISE NOTICE 'Weekly maintenance cron job scheduled: Saturday 11pm ET (Sunday 03:00 UTC)';
  END IF;
END $$;

-- Also create a maintenance_reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.maintenance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  run_ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds NUMERIC,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'completed_with_errors', 'failed')),
  trigger_type TEXT NOT NULL DEFAULT 'scheduled' CHECK (trigger_type IN ('scheduled', 'manual')),
  triggered_by UUID,
  report_data JSONB,
  errors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view maintenance reports"
ON public.maintenance_reports FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'owner'))
);
