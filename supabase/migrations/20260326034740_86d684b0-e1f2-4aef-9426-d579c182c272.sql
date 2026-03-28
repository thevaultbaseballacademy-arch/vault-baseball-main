
-- Create badge_level enum
CREATE TYPE public.badge_level AS ENUM (
  'foundations',
  'performance', 
  'specialist',
  'pro',
  'director'
);

-- Video questions table for video-based certification
CREATE TABLE public.video_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url text NOT NULL,
  certification_type text NOT NULL,
  question_1 text NOT NULL,
  question_2 text NOT NULL,
  question_3 text NOT NULL,
  question_4 text NOT NULL,
  options_1 jsonb NOT NULL DEFAULT '[]'::jsonb,
  options_2 jsonb NOT NULL DEFAULT '[]'::jsonb,
  options_3 jsonb NOT NULL DEFAULT '[]'::jsonb,
  options_4 jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answers jsonb NOT NULL DEFAULT '{"q1": 0, "q2": 0, "q3": 0, "q4": 0}'::jsonb,
  scenario_description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.video_questions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read active video questions (answers are graded server-side)
CREATE POLICY "Authenticated users can read active video questions"
  ON public.video_questions FOR SELECT TO authenticated
  USING (is_active = true);

-- Admins can manage video questions
CREATE POLICY "Admins can manage video questions"
  ON public.video_questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Video exam attempts
CREATE TABLE public.video_exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_type text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer,
  total_points integer,
  passed boolean,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.video_exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own video attempts"
  ON public.video_exam_attempts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own video attempts"
  ON public.video_exam_attempts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own video attempts"
  ON public.video_exam_attempts FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Coach badges table
CREATE TABLE public.coach_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_level public.badge_level NOT NULL,
  badge_name text NOT NULL,
  badge_status text NOT NULL DEFAULT 'active' CHECK (badge_status IN ('active', 'expired', 'revoked', 'pending')),
  earned_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  certification_score numeric,
  kpi_validated boolean DEFAULT false,
  compliance_status text DEFAULT 'compliant',
  last_validated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, badge_level)
);

ALTER TABLE public.coach_badges ENABLE ROW LEVEL SECURITY;

-- Anyone can read badges (public trust display)
CREATE POLICY "Anyone can read coach badges"
  ON public.coach_badges FOR SELECT TO authenticated
  USING (true);

-- Users can read their own badges
CREATE POLICY "Users can manage own badges via system"
  ON public.coach_badges FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage all badges
CREATE POLICY "Admins can manage all badges"
  ON public.coach_badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to determine badge level from certifications
CREATE OR REPLACE FUNCTION public.get_coach_badge_level(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_certs text[];
  v_has_video_cert boolean := false;
  v_badge_level text;
  v_badge_name text;
BEGIN
  -- Get active certification types
  SELECT array_agg(certification_type::text)
  INTO v_certs
  FROM user_certifications
  WHERE user_id = _user_id
    AND status = 'active'
    AND expires_at > now();

  IF v_certs IS NULL THEN
    v_certs := '{}';
  END IF;

  -- Check video certification
  SELECT EXISTS (
    SELECT 1 FROM video_exam_attempts
    WHERE user_id = _user_id AND passed = true
  ) INTO v_has_video_cert;

  -- Determine level (highest achieved)
  IF array_length(v_certs, 1) >= 5 AND v_has_video_cert THEN
    v_badge_level := 'pro';
    v_badge_name := 'VAULT™ PRO Coach';
  ELSIF v_certs && ARRAY['softball_slap_specialist', 'softball_hitting_foundations', 'softball_hitting_performance']::text[] THEN
    v_badge_level := 'specialist';
    v_badge_name := 'VAULT™ Specialist';
  ELSIF 'softball_hitting_performance' = ANY(v_certs) OR 'Performance' = ANY(v_certs) THEN
    v_badge_level := 'performance';
    v_badge_name := 'VAULT™ Performance Coach';
  ELSIF 'Foundations' = ANY(v_certs) OR 'softball_hitting_foundations' = ANY(v_certs) THEN
    v_badge_level := 'foundations';
    v_badge_name := 'VAULT™ Certified Coach';
  ELSE
    RETURN jsonb_build_object('badge_level', null, 'badge_name', null);
  END IF;

  RETURN jsonb_build_object(
    'badge_level', v_badge_level,
    'badge_name', v_badge_name,
    'certifications', v_certs,
    'has_video_cert', v_has_video_cert
  );
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_video_questions_updated_at
  BEFORE UPDATE ON public.video_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_badges_updated_at
  BEFORE UPDATE ON public.coach_badges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
