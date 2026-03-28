
-- 1. Additive fields to recruiting_profiles
ALTER TABLE public.recruiting_profiles
  ADD COLUMN IF NOT EXISTS intended_major TEXT,
  ADD COLUMN IF NOT EXISTS school_interest_list JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS verified_stats JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS highlight_clip_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS coach_recommendation_id UUID,
  ADD COLUMN IF NOT EXISTS eligibility_checklist JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS showcase_history JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS shareable_link TEXT,
  ADD COLUMN IF NOT EXISTS last_exported_at TIMESTAMPTZ;

-- 2. Coach recommendations
CREATE TABLE public.coach_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id UUID NOT NULL,
  coach_user_id UUID NOT NULL,
  recommendation_text TEXT NOT NULL,
  written_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_attached_to_profile BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes read own recommendations" ON public.coach_recommendations
  FOR SELECT USING (auth.uid() = athlete_user_id);
CREATE POLICY "Coaches manage own recommendations" ON public.coach_recommendations
  FOR ALL USING (auth.uid() = coach_user_id) WITH CHECK (auth.uid() = coach_user_id);
CREATE POLICY "Parents read linked recommendations" ON public.coach_recommendations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.parent_athlete_links pal
      WHERE pal.parent_user_id = auth.uid() AND pal.athlete_user_id = coach_recommendations.athlete_user_id AND pal.status = 'active')
  );
CREATE POLICY "Owners view all recommendations" ON public.coach_recommendations
  FOR SELECT USING (public.is_owner(auth.uid()));

-- 3. Recruiting exports
CREATE TABLE public.recruiting_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id UUID NOT NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('athlete_report','recruiting_profile','coach_summary','parent_summary')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recruiting_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes manage own exports" ON public.recruiting_exports
  FOR ALL USING (auth.uid() = athlete_user_id) WITH CHECK (auth.uid() = athlete_user_id);
CREATE POLICY "Coaches read assigned athlete exports" ON public.recruiting_exports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.coach_athlete_assignments ca
      WHERE ca.coach_user_id = auth.uid() AND ca.athlete_user_id = recruiting_exports.athlete_user_id AND ca.is_active = true)
  );
CREATE POLICY "Parents read linked exports" ON public.recruiting_exports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.parent_athlete_links pal
      WHERE pal.parent_user_id = auth.uid() AND pal.athlete_user_id = recruiting_exports.athlete_user_id AND pal.status = 'active')
  );
CREATE POLICY "Owners view all exports" ON public.recruiting_exports
  FOR SELECT USING (public.is_owner(auth.uid()));
