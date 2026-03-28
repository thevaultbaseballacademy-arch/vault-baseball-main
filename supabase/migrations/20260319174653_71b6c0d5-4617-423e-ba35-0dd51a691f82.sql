
-- Notifications archive table
CREATE TABLE IF NOT EXISTS public.notifications_archive (
  id uuid PRIMARY KEY,
  user_id uuid,
  type text,
  title text,
  message text,
  actor_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamptz,
  archived_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view notification archives"
  ON public.notifications_archive FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Maintenance reports table
CREATE TABLE IF NOT EXISTS public.maintenance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_started_at timestamptz NOT NULL,
  run_ended_at timestamptz,
  duration_seconds numeric,
  status text NOT NULL DEFAULT 'running',
  trigger_type text NOT NULL DEFAULT 'scheduled',
  triggered_by uuid,
  report_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  errors jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins/owners can view maintenance reports"
  ON public.maintenance_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()));

CREATE POLICY "System can insert maintenance reports"
  ON public.maintenance_reports FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()));

-- Maintenance schedule config (stored in platform_settings)
-- We'll use platform_settings with key 'maintenance_schedule'

-- Index for faster archive queries
CREATE INDEX IF NOT EXISTS idx_notifications_archive_archived_at ON public.notifications_archive(archived_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_reports_status ON public.maintenance_reports(status, created_at DESC);
