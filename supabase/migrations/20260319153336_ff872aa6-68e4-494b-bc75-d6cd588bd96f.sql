
-- Access audit log for 403 attempts
CREATE TABLE IF NOT EXISTS public.access_denied_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  attempted_route text NOT NULL,
  attempted_permission text NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.access_denied_logs ENABLE ROW LEVEL SECURITY;

-- Only owners/admins can read these logs
CREATE POLICY "Owners can read access denied logs"
ON public.access_denied_logs
FOR SELECT
TO authenticated
USING (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- Anyone authenticated can insert (to log their own denial)
CREATE POLICY "Authenticated users can log denials"
ON public.access_denied_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Index for owner audit queries
CREATE INDEX idx_access_denied_logs_created ON public.access_denied_logs (created_at DESC);
CREATE INDEX idx_access_denied_logs_user ON public.access_denied_logs (user_id);
