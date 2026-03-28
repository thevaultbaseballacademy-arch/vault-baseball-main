
-- Step 1: lesson_outcomes table - structured post-lesson data capture
CREATE TABLE public.lesson_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id text NOT NULL,
  feedback_id uuid,
  athlete_user_id uuid NOT NULL,
  coach_user_id uuid NOT NULL,
  sport_type text NOT NULL DEFAULT 'baseball',
  skill_category text NOT NULL,
  strengths_noted text[] DEFAULT '{}',
  weaknesses_noted text[] DEFAULT '{}',
  coach_notes text,
  drills_assigned text[] DEFAULT '{}',
  kpi_updates jsonb DEFAULT '[]',
  injury_flags text[] DEFAULT '{}',
  session_number integer DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lesson_outcomes ENABLE ROW LEVEL SECURITY;

-- Athletes can view own outcomes
CREATE POLICY "Athletes view own outcomes"
  ON public.lesson_outcomes FOR SELECT TO authenticated
  USING (athlete_user_id = auth.uid());

-- Coaches can view outcomes for their athletes
CREATE POLICY "Coaches view assigned outcomes"
  ON public.lesson_outcomes FOR SELECT TO authenticated
  USING (coach_user_id = auth.uid());

-- Coaches can insert outcomes
CREATE POLICY "Coaches insert outcomes"
  ON public.lesson_outcomes FOR INSERT TO authenticated
  WITH CHECK (coach_user_id = auth.uid());

-- Admins full access
CREATE POLICY "Admins manage outcomes"
  ON public.lesson_outcomes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 2: development_recommendations table - tracks pattern-based suggestions
CREATE TABLE public.development_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id uuid NOT NULL,
  sport_type text NOT NULL DEFAULT 'baseball',
  recommendation_type text NOT NULL, -- 'drill', 'course', 'program', 'injury_alert'
  title text NOT NULL,
  reason text,
  source_outcome_ids uuid[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'dismissed', 'completed'
  approved_by uuid,
  priority text DEFAULT 'medium',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.development_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes view own recommendations"
  ON public.development_recommendations FOR SELECT TO authenticated
  USING (athlete_user_id = auth.uid());

CREATE POLICY "Coaches view/manage assigned recommendations"
  ON public.development_recommendations FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_athlete_assignments
      WHERE coach_user_id = auth.uid()
        AND athlete_user_id = development_recommendations.athlete_user_id
        AND is_active = true
    )
  );

CREATE POLICY "Admins manage recommendations"
  ON public.development_recommendations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 3: skill_progression table - milestone tracking per skill
CREATE TABLE public.skill_progression (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id uuid NOT NULL,
  sport_type text NOT NULL DEFAULT 'baseball',
  skill_name text NOT NULL,
  skill_category text NOT NULL,
  current_score integer DEFAULT 50,
  previous_score integer DEFAULT 50,
  sessions_count integer DEFAULT 0,
  last_session_at timestamptz,
  trend text DEFAULT 'stable', -- 'improving', 'stable', 'declining'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(athlete_user_id, skill_name)
);

ALTER TABLE public.skill_progression ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes view own progression"
  ON public.skill_progression FOR SELECT TO authenticated
  USING (athlete_user_id = auth.uid());

CREATE POLICY "System manages progression"
  ON public.skill_progression FOR ALL TO authenticated
  USING (
    athlete_user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.coach_athlete_assignments
      WHERE coach_user_id = auth.uid()
        AND athlete_user_id = skill_progression.athlete_user_id
        AND is_active = true
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_skill_progression_updated_at
  BEFORE UPDATE ON public.skill_progression
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
