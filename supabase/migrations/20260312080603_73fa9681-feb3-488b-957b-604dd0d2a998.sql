
-- Athlete Development Score table
CREATE TABLE public.athlete_development_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  overall_score integer NOT NULL DEFAULT 0,
  training_consistency integer NOT NULL DEFAULT 0,
  skill_development integer NOT NULL DEFAULT 0,
  work_ethic integer NOT NULL DEFAULT 0,
  athletic_metrics integer NOT NULL DEFAULT 0,
  weekly_focus text,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  period_start date NOT NULL DEFAULT (CURRENT_DATE - INTERVAL '30 days')::date,
  period_end date NOT NULL DEFAULT CURRENT_DATE,
  lessons_attended integer NOT NULL DEFAULT 0,
  lessons_missed integer NOT NULL DEFAULT 0,
  homework_completed integer NOT NULL DEFAULT 0,
  homework_total integer NOT NULL DEFAULT 0,
  feedback_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.athlete_development_scores ENABLE ROW LEVEL SECURITY;

-- Athletes see their own score
CREATE POLICY "Athletes view own score"
  ON public.athlete_development_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Coaches see scores of assigned athletes
CREATE POLICY "Coaches view assigned athlete scores"
  ON public.athlete_development_scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_athlete_assignments caa
      WHERE caa.coach_user_id = auth.uid()
        AND caa.athlete_user_id = athlete_development_scores.user_id
        AND caa.is_active = true
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- System can upsert via edge function / service role
CREATE POLICY "Users can upsert own score"
  ON public.athlete_development_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own score"
  ON public.athlete_development_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to calculate and upsert ADS for a given user
CREATE OR REPLACE FUNCTION public.calculate_athlete_development_score(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_lessons_attended int := 0;
  v_lessons_total int := 0;
  v_lessons_missed int := 0;
  v_feedback_count int := 0;
  v_avg_improvement numeric := 0;
  v_homework_completed int := 0;
  v_homework_total int := 0;
  v_training_consistency int := 0;
  v_skill_development int := 0;
  v_work_ethic int := 0;
  v_athletic_metrics int := 50; -- baseline for future expansion
  v_overall int := 0;
  v_weekly_focus text := 'General Development';
  v_period_start date := CURRENT_DATE - 30;
BEGIN
  -- Only allow calculating own score or admin
  IF auth.uid() != p_user_id AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Training Consistency: lessons attended vs total (last 30 days)
  SELECT 
    COUNT(*) FILTER (WHERE status IN ('completed', 'confirmed')),
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'cancelled' OR (status = 'confirmed' AND scheduled_at < now()))
  INTO v_lessons_attended, v_lessons_total, v_lessons_missed
  FROM remote_lessons
  WHERE athlete_user_id = p_user_id
    AND scheduled_at >= v_period_start;

  -- If no lessons at all, count cancelled bookings as missed
  IF v_lessons_total > 0 THEN
    v_training_consistency := LEAST(100, GREATEST(0,
      ROUND((v_lessons_attended::numeric / GREATEST(v_lessons_total, 1)) * 100)::int
    ));
  ELSE
    v_training_consistency := 0;
  END IF;

  -- Skill Development: based on coach feedback count and variety
  SELECT COUNT(*)
  INTO v_feedback_count
  FROM coach_lesson_feedback
  WHERE athlete_user_id = p_user_id
    AND created_at >= v_period_start;

  -- Score based on feedback received (more feedback = more development tracking)
  v_skill_development := LEAST(100, v_feedback_count * 20);

  -- Work Ethic: homework completion
  SELECT 
    COUNT(*) FILTER (WHERE is_completed = true),
    COUNT(*)
  INTO v_homework_completed, v_homework_total
  FROM player_homework
  WHERE athlete_user_id = p_user_id
    AND created_at >= v_period_start;

  IF v_homework_total > 0 THEN
    v_work_ethic := ROUND((v_homework_completed::numeric / v_homework_total) * 100)::int;
  ELSE
    v_work_ethic := 0;
  END IF;

  -- Determine weekly focus based on weakest area
  IF v_training_consistency <= v_skill_development AND v_training_consistency <= v_work_ethic THEN
    v_weekly_focus := 'Book and attend more lessons';
  ELSIF v_work_ethic <= v_skill_development THEN
    v_weekly_focus := 'Complete assigned homework and drills';
  ELSE
    v_weekly_focus := 'Schedule a lesson for coach feedback';
  END IF;

  -- Overall: weighted average (consistency 35%, skill 30%, work ethic 25%, metrics 10%)
  v_overall := ROUND(
    v_training_consistency * 0.35 +
    v_skill_development * 0.30 +
    v_work_ethic * 0.25 +
    v_athletic_metrics * 0.10
  )::int;

  -- Upsert the score
  INSERT INTO athlete_development_scores (
    user_id, overall_score, training_consistency, skill_development,
    work_ethic, athletic_metrics, weekly_focus, calculated_at,
    period_start, period_end, lessons_attended, lessons_missed,
    homework_completed, homework_total, feedback_count
  ) VALUES (
    p_user_id, v_overall, v_training_consistency, v_skill_development,
    v_work_ethic, v_athletic_metrics, v_weekly_focus, now(),
    v_period_start, CURRENT_DATE, v_lessons_attended, v_lessons_missed,
    v_homework_completed, v_homework_total, v_feedback_count
  )
  ON CONFLICT (user_id) DO UPDATE SET
    overall_score = EXCLUDED.overall_score,
    training_consistency = EXCLUDED.training_consistency,
    skill_development = EXCLUDED.skill_development,
    work_ethic = EXCLUDED.work_ethic,
    athletic_metrics = EXCLUDED.athletic_metrics,
    weekly_focus = EXCLUDED.weekly_focus,
    calculated_at = EXCLUDED.calculated_at,
    period_start = EXCLUDED.period_start,
    period_end = EXCLUDED.period_end,
    lessons_attended = EXCLUDED.lessons_attended,
    lessons_missed = EXCLUDED.lessons_missed,
    homework_completed = EXCLUDED.homework_completed,
    homework_total = EXCLUDED.homework_total,
    feedback_count = EXCLUDED.feedback_count;

  RETURN jsonb_build_object(
    'overall_score', v_overall,
    'training_consistency', v_training_consistency,
    'skill_development', v_skill_development,
    'work_ethic', v_work_ethic,
    'athletic_metrics', v_athletic_metrics,
    'weekly_focus', v_weekly_focus,
    'lessons_attended', v_lessons_attended,
    'lessons_missed', v_lessons_missed,
    'homework_completed', v_homework_completed,
    'homework_total', v_homework_total,
    'feedback_count', v_feedback_count
  );
END;
$$;
