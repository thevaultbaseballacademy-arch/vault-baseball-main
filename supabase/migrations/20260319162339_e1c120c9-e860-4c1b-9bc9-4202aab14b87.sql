
-- 1. Additive fields to profiles (athlete_profiles equivalent)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS secondary_positions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS wingspan_inches FLOAT,
  ADD COLUMN IF NOT EXISTS academic_gpa FLOAT,
  ADD COLUMN IF NOT EXISTS intended_major TEXT,
  ADD COLUMN IF NOT EXISTS division_target TEXT,
  ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '{}';

-- 2. Additive fields to athlete_kpis (kpi_records equivalent)
ALTER TABLE public.athlete_kpis
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS session_id UUID,
  ADD COLUMN IF NOT EXISTS recorded_by UUID;

-- 3. New table: kpi_definitions (owner-managed thresholds)
CREATE TABLE public.kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_type TEXT NOT NULL DEFAULT 'baseball',
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  scale JSONB DEFAULT '{"min": 0, "max": 100}',
  thresholds JSONB DEFAULT '{"belowStandard": 0, "developing": 25, "proficient": 50, "elite": 75}',
  age_group_adjustments JSONB DEFAULT '{}',
  position_relevance TEXT[] DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sport_type, name)
);

ALTER TABLE public.kpi_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read kpi_definitions" ON public.kpi_definitions
  FOR SELECT USING (true);
CREATE POLICY "Owners manage kpi_definitions" ON public.kpi_definitions
  FOR ALL USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

CREATE TRIGGER update_kpi_definitions_updated_at
  BEFORE UPDATE ON public.kpi_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Additive fields to athlete_development_scores (athlete_scores equivalent)
ALTER TABLE public.athlete_development_scores
  ADD COLUMN IF NOT EXISTS sport_type TEXT DEFAULT 'baseball',
  ADD COLUMN IF NOT EXISTS readiness_score FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS consistency_score FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS compliance_score FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS workload_score FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS improvement_status TEXT DEFAULT 'stable',
  ADD COLUMN IF NOT EXISTS strengths_summary TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS gaps_summary TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS top_priorities TEXT[] DEFAULT '{}';

-- 5. New table: mental_performance_records
CREATE TABLE public.mental_performance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id UUID NOT NULL,
  week_of DATE NOT NULL,
  confidence_score INT CHECK (confidence_score BETWEEN 1 AND 10),
  focus_consistency FLOAT,
  pressure_performance_index FLOAT,
  bounce_back_rate FLOAT,
  goal_completion_rate FLOAT,
  journal_entry TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(athlete_user_id, week_of)
);

ALTER TABLE public.mental_performance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes manage own mental records" ON public.mental_performance_records
  FOR ALL USING (auth.uid() = athlete_user_id) WITH CHECK (auth.uid() = athlete_user_id);
CREATE POLICY "Coaches view assigned athletes mental records" ON public.mental_performance_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.coach_athlete_assignments ca
      WHERE ca.coach_user_id = auth.uid() AND ca.athlete_user_id = mental_performance_records.athlete_user_id AND ca.is_active = true)
  );
CREATE POLICY "Owners view all mental records" ON public.mental_performance_records
  FOR SELECT USING (public.is_owner(auth.uid()));
