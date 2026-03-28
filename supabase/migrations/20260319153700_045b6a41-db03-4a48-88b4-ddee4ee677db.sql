
-- Content submission / approval queue
CREATE TABLE IF NOT EXISTS public.content_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('drill', 'program', 'kpi_suggestion')),
  title text NOT NULL,
  description text,
  sport_type text NOT NULL DEFAULT 'baseball',
  skill_category text,
  age_group text,
  difficulty text,
  coaching_points text,
  video_url text,
  tags text[],
  content_data jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'revision_requested')),
  created_by uuid NOT NULL,
  reviewed_by uuid,
  reviewed_at timestamptz,
  rejection_note text,
  revision_note text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;

-- Owners/admins see all; coaches see own
CREATE POLICY "Owners see all content submissions"
ON public.content_submissions FOR SELECT TO authenticated
USING (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin') OR created_by = auth.uid());

CREATE POLICY "Coaches create submissions"
ON public.content_submissions FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners manage submissions"
ON public.content_submissions FOR UPDATE TO authenticated
USING (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin') OR created_by = auth.uid());

CREATE TRIGGER update_content_submissions_updated_at
  BEFORE UPDATE ON public.content_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Intelligence rules (no-code rule builder)
CREATE TABLE IF NOT EXISTS public.intelligence_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 100,
  sport_type text,
  condition_type text NOT NULL,
  condition_field text NOT NULL,
  condition_operator text NOT NULL CHECK (condition_operator IN ('<', '>', '<=', '>=', '=', '!=', 'IN', 'NOT_IN', 'DROPS_BY')),
  condition_value text NOT NULL,
  condition_window_days integer,
  action_type text NOT NULL,
  action_target text NOT NULL,
  action_data jsonb DEFAULT '{}'::jsonb,
  trigger_count integer NOT NULL DEFAULT 0,
  last_triggered_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.intelligence_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage intelligence rules"
ON public.intelligence_rules FOR ALL TO authenticated
USING (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_intelligence_rules_updated_at
  BEFORE UPDATE ON public.intelligence_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Platform settings (feature flags, config)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  category text NOT NULL DEFAULT 'general',
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage platform settings"
ON public.platform_settings FOR ALL TO authenticated
USING (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for fast queue lookups
CREATE INDEX idx_content_submissions_status ON public.content_submissions (status);
CREATE INDEX idx_content_submissions_created_by ON public.content_submissions (created_by);
CREATE INDEX idx_intelligence_rules_active ON public.intelligence_rules (is_active, priority);
