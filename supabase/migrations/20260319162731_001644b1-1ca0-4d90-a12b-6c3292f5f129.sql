
-- 1. Additive fields to intelligence_rules
ALTER TABLE public.intelligence_rules
  ADD COLUMN IF NOT EXISTS softball_format TEXT,
  ADD COLUMN IF NOT EXISTS age_group_filter TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS position_filter TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '{"logic":"AND","rules":[]}',
  ADD COLUMN IF NOT EXISTS actions JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS trigger_history JSONB DEFAULT '[]';

-- 2. New table: intelligence_outputs
CREATE TABLE IF NOT EXISTS public.intelligence_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id UUID NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sport_type TEXT NOT NULL DEFAULT 'baseball',
  strengths_summary TEXT[] DEFAULT '{}',
  gaps_summary TEXT[] DEFAULT '{}',
  top_priorities TEXT[] DEFAULT '{}',
  recommended_drills UUID[] DEFAULT '{}',
  recommended_programs UUID[] DEFAULT '{}',
  recommended_courses TEXT[] DEFAULT '{}',
  weekly_focus_plan JSONB DEFAULT '[]',
  alerts JSONB DEFAULT '[]',
  status TEXT DEFAULT 'stable' CHECK (status IN ('improving','stable','stalled','regressing'))
);

ALTER TABLE public.intelligence_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes read own intelligence outputs" ON public.intelligence_outputs
  FOR SELECT USING (auth.uid() = athlete_user_id);
CREATE POLICY "Coaches read assigned athlete outputs" ON public.intelligence_outputs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.coach_athlete_assignments ca
      WHERE ca.coach_user_id = auth.uid() AND ca.athlete_user_id = intelligence_outputs.athlete_user_id AND ca.is_active = true)
  );
CREATE POLICY "Parents read linked athlete outputs" ON public.intelligence_outputs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.parent_athlete_links pal
      WHERE pal.parent_user_id = auth.uid() AND pal.athlete_user_id = intelligence_outputs.athlete_user_id AND pal.status = 'active')
  );
CREATE POLICY "Owners manage all intelligence outputs" ON public.intelligence_outputs
  FOR ALL USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));
