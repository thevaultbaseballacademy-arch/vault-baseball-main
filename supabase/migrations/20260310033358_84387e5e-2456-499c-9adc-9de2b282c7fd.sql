
-- Coach-generated athlete progress reports with AI-assisted insights
CREATE TABLE public.athlete_progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id UUID NOT NULL,
  athlete_user_id UUID NOT NULL,
  report_title TEXT NOT NULL DEFAULT 'Weekly Progress Report',
  report_period TEXT, -- e.g. "Week 1-6", "March 2026"
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  
  -- Coach-entered metrics (nullable, coaches fill what applies)
  pitch_velocity JSONB DEFAULT '[]'::jsonb, -- [{week: 1, value: 72}, {week: 6, value: 76}]
  exit_velocity JSONB DEFAULT '[]'::jsonb,
  sprint_speed JSONB DEFAULT '[]'::jsonb,
  bat_speed JSONB DEFAULT '[]'::jsonb,
  pop_time JSONB DEFAULT '[]'::jsonb,
  
  -- Coach notes
  coach_notes TEXT,
  areas_of_improvement TEXT,
  strengths_observed TEXT,
  
  -- AI-generated fields
  ai_summary TEXT,
  ai_accuracy_notes TEXT,
  ai_projections JSONB,
  ai_recommendations JSONB DEFAULT '[]'::jsonb,
  
  -- Delivery
  is_published BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  parent_viewed_at TIMESTAMPTZ,
  athlete_viewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.athlete_progress_reports ENABLE ROW LEVEL SECURITY;

-- Coaches can manage reports they created
CREATE POLICY "Coaches can manage own reports"
ON public.athlete_progress_reports
FOR ALL TO authenticated
USING (coach_user_id = auth.uid())
WITH CHECK (coach_user_id = auth.uid());

-- Athletes can view their own published reports
CREATE POLICY "Athletes can view own published reports"
ON public.athlete_progress_reports
FOR SELECT TO authenticated
USING (athlete_user_id = auth.uid() AND is_published = true);

-- Public access via share token (for parents)
CREATE POLICY "Anyone can view via share token"
ON public.athlete_progress_reports
FOR SELECT TO anon
USING (is_published = true);

-- Admins can view all
CREATE POLICY "Admins can view all reports"
ON public.athlete_progress_reports
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_athlete_progress_reports_updated_at
  BEFORE UPDATE ON public.athlete_progress_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
