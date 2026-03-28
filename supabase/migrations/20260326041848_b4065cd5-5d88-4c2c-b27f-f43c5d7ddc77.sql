
-- Content access tracking for IP protection
CREATE TABLE public.content_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_type text NOT NULL,
  content_id text NOT NULL,
  module_name text,
  sport_type text DEFAULT 'baseball',
  accessed_at timestamptz NOT NULL DEFAULT now(),
  session_id text,
  ip_hash text
);

CREATE INDEX idx_content_access_user ON public.content_access_logs(user_id, accessed_at DESC);
CREATE INDEX idx_content_access_content ON public.content_access_logs(content_type, content_id);

ALTER TABLE public.content_access_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert their own access logs
CREATE POLICY "Users log own access" ON public.content_access_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only admins can read access logs
CREATE POLICY "Admins read access logs" ON public.content_access_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Concurrent session detection view
CREATE OR REPLACE FUNCTION public.detect_concurrent_sessions(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COUNT(DISTINCT session_id)::integer
  FROM public.content_access_logs
  WHERE user_id = p_user_id
    AND accessed_at > now() - interval '10 minutes'
    AND session_id IS NOT NULL
$$;
