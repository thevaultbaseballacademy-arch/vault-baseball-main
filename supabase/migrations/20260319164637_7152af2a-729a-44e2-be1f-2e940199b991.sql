CREATE OR REPLACE FUNCTION public.get_parent_athlete_data(p_parent_id uuid, p_athlete_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
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
        'homework_total', d.homework_total,
        'improvement_status', d.improvement_status,
        'readiness_score', d.readiness_score,
        'strengths_summary', d.strengths_summary,
        'gaps_summary', d.gaps_summary,
        'top_priorities', d.top_priorities,
        'consistency_score', d.consistency_score,
        'compliance_score', d.compliance_score
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
      FROM (SELECT * FROM athlete_kpis WHERE user_id = p_athlete_id ORDER BY recorded_at DESC LIMIT 30) k
    ),
    'recent_lessons', (
      SELECT json_agg(json_build_object(
        'id', cl.id,
        'lesson_focus', cl.lesson_focus,
        'strengths_observed', cl.strengths_observed,
        'areas_for_improvement', cl.areas_for_improvement,
        'ai_summary', cl.ai_summary,
        'sport_type', cl.sport_type,
        'created_at', cl.created_at
      ) ORDER BY cl.created_at DESC)
      FROM (
        SELECT * FROM coach_lesson_feedback 
        WHERE athlete_user_id = p_athlete_id 
          AND delivered_to_athlete = true
        ORDER BY created_at DESC LIMIT 15
      ) cl
    ),
    'checkins', (
      SELECT json_agg(json_build_object(
        'checkin_date', c.checkin_date,
        'energy_level', c.energy_level,
        'mood', c.mood,
        'training_completed', c.training_completed,
        'soreness_level', c.soreness_level,
        'sleep_hours', c.sleep_hours
      ) ORDER BY c.checkin_date DESC)
      FROM (SELECT * FROM athlete_checkins WHERE user_id = p_athlete_id ORDER BY checkin_date DESC LIMIT 14) c
    ),
    'recruiting', (
      SELECT json_build_object(
        'commitment_status', r.commitment_status,
        'committed_school', r.committed_school,
        'gpa', r.gpa,
        'division_target', r.division_target,
        'school_interest_list', r.school_interest_list,
        'verified_stats', r.verified_stats,
        'eligibility_checklist', r.eligibility_checklist,
        'shareable_link', r.shareable_link,
        'visibility', r.visibility,
        'sat_act_score', r.sat_act_score,
        'intended_major', r.intended_major
      ) FROM recruiting_profiles r WHERE r.user_id = p_athlete_id AND r.visibility IN ('public', 'coaches_only')
    ),
    'workload', (
      SELECT json_agg(json_build_object(
        'record_date', w.record_date,
        'pitch_count', w.pitch_count,
        'throwing_count', w.throwing_count,
        'training_minutes', w.training_minutes,
        'recovery_status', w.recovery_status,
        'soreness_level', w.soreness_level,
        'readiness_score', w.readiness_score,
        'overuse_flag', w.overuse_flag,
        'overuse_alert', w.overuse_alert,
        'sleep_hours', w.sleep_hours
      ) ORDER BY w.record_date DESC)
      FROM (SELECT * FROM workload_records WHERE athlete_user_id = p_athlete_id ORDER BY record_date DESC LIMIT 14) w
    ),
    'homework', (
      SELECT json_build_object(
        'assigned_this_week', (SELECT COUNT(*) FROM player_homework WHERE athlete_user_id = p_athlete_id AND created_at >= CURRENT_DATE - INTERVAL '7 days'),
        'completed_this_week', (SELECT COUNT(*) FROM player_homework WHERE athlete_user_id = p_athlete_id AND created_at >= CURRENT_DATE - INTERVAL '7 days' AND is_completed = true),
        'lifetime_assigned', (SELECT COUNT(*) FROM player_homework WHERE athlete_user_id = p_athlete_id),
        'lifetime_completed', (SELECT COUNT(*) FROM player_homework WHERE athlete_user_id = p_athlete_id AND is_completed = true)
      )
    ),
    'coach_recommendations', (
      SELECT json_agg(json_build_object(
        'recommendation_text', cr.recommendation_text,
        'written_at', cr.written_at,
        'is_attached_to_profile', cr.is_attached_to_profile
      ) ORDER BY cr.written_at DESC)
      FROM coach_recommendations cr 
      WHERE cr.athlete_user_id = p_athlete_id
      LIMIT 5
    )
  ) INTO result;

  RETURN result;
END;
$$