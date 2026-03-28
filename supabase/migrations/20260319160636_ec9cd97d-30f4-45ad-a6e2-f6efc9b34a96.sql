
-- Parent-athlete linking table
CREATE TABLE public.parent_athlete_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  linked_at TIMESTAMPTZ,
  link_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_user_id, athlete_user_id)
);

ALTER TABLE public.parent_athlete_links ENABLE ROW LEVEL SECURITY;

-- Parents can see their own links
CREATE POLICY "Parents view own links" ON public.parent_athlete_links
  FOR SELECT USING (auth.uid() = parent_user_id);

-- Athletes can see links to them (to approve)
CREATE POLICY "Athletes view links to them" ON public.parent_athlete_links
  FOR SELECT USING (auth.uid() = athlete_user_id);

-- Parents can create links
CREATE POLICY "Parents create links" ON public.parent_athlete_links
  FOR INSERT WITH CHECK (auth.uid() = parent_user_id);

-- Athletes can update links to them (approve/revoke)
CREATE POLICY "Athletes update links to them" ON public.parent_athlete_links
  FOR UPDATE USING (auth.uid() = athlete_user_id);

-- Parents can update their own links (revoke)
CREATE POLICY "Parents update own links" ON public.parent_athlete_links
  FOR UPDATE USING (auth.uid() = parent_user_id);

-- Owners can see all links
CREATE POLICY "Owners view all parent links" ON public.parent_athlete_links
  FOR SELECT USING (public.is_owner(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_parent_athlete_links_updated_at 
  BEFORE UPDATE ON public.parent_athlete_links 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC: parents can view linked athlete data securely
CREATE OR REPLACE FUNCTION public.get_parent_athlete_data(p_parent_id UUID, p_athlete_id UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  -- Verify the link exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM parent_athlete_links
    WHERE parent_user_id = p_parent_id
      AND athlete_user_id = p_athlete_id
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'No active parent link found';
  END IF;

  SELECT json_build_object(
    'profile', (
      SELECT json_build_object(
        'display_name', p.display_name,
        'avatar_url', p.avatar_url,
        'position', p.position,
        'graduation_year', p.graduation_year,
        'height_inches', p.height_inches,
        'weight_lbs', p.weight_lbs,
        'sport_type', p.sport_type
      ) FROM profiles p WHERE p.user_id = p_athlete_id
    ),
    'development_score', (
      SELECT json_build_object(
        'overall_score', d.overall_score,
        'training_consistency', d.training_consistency,
        'skill_development', d.skill_development,
        'work_ethic', d.work_ethic,
        'weekly_focus', d.weekly_focus,
        'lessons_attended', d.lessons_attended,
        'lessons_missed', d.lessons_missed,
        'homework_completed', d.homework_completed,
        'homework_total', d.homework_total
      ) FROM athlete_development_scores d WHERE d.user_id = p_athlete_id
    ),
    'recent_kpis', (
      SELECT json_agg(json_build_object(
        'kpi_name', k.kpi_name,
        'kpi_category', k.kpi_category,
        'kpi_value', k.kpi_value,
        'kpi_unit', k.kpi_unit,
        'recorded_at', k.recorded_at
      ) ORDER BY k.recorded_at DESC)
      FROM (SELECT * FROM athlete_kpis WHERE user_id = p_athlete_id ORDER BY recorded_at DESC LIMIT 20) k
    ),
    'recent_lessons', (
      SELECT json_agg(json_build_object(
        'id', cl.id,
        'lesson_focus', cl.lesson_focus,
        'strengths_observed', cl.strengths_observed,
        'areas_for_improvement', cl.areas_for_improvement,
        'ai_summary', cl.ai_summary,
        'created_at', cl.created_at
      ) ORDER BY cl.created_at DESC)
      FROM (
        SELECT * FROM coach_lesson_feedback 
        WHERE athlete_user_id = p_athlete_id 
          AND delivered_to_athlete = true
        ORDER BY created_at DESC LIMIT 10
      ) cl
    ),
    'checkins', (
      SELECT json_agg(json_build_object(
        'checkin_date', c.checkin_date,
        'energy_level', c.energy_level,
        'mood', c.mood,
        'training_completed', c.training_completed,
        'soreness_level', c.soreness_level
      ) ORDER BY c.checkin_date DESC)
      FROM (SELECT * FROM athlete_checkins WHERE user_id = p_athlete_id ORDER BY checkin_date DESC LIMIT 14) c
    ),
    'recruiting', (
      SELECT json_build_object(
        'commitment_status', r.commitment_status,
        'committed_school', r.committed_school,
        'gpa', r.gpa,
        'division_target', r.division_target
      ) FROM recruiting_profiles r WHERE r.user_id = p_athlete_id AND r.visibility IN ('public', 'coaches_only')
    )
  ) INTO result;

  RETURN result;
END;
$$;
