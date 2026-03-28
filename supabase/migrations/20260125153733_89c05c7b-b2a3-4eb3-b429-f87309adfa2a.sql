-- Security fixes: lock down profiles_public view and restrict exam explanation RPC

BEGIN;

-- 1) Ensure profiles_public cannot be queried anonymously and cannot bypass RLS
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT
  p.user_id,
  p.display_name,
  p.avatar_url,
  p.cover_url,
  p.position,
  p.graduation_year,

  -- Bio respects bio_privacy
  CASE
    WHEN auth.uid() = p.user_id
      OR public.has_role(auth.uid(), 'admin')
      OR p.bio_privacy = 'public'
      OR (p.bio_privacy = 'coaches_only' AND public.is_active_coach_for_athlete(auth.uid(), p.user_id))
    THEN p.bio
    ELSE NULL
  END AS bio,

  -- Physical stats respect physical_stats_privacy
  CASE
    WHEN auth.uid() = p.user_id
      OR public.has_role(auth.uid(), 'admin')
      OR p.physical_stats_privacy = 'public'
      OR (p.physical_stats_privacy = 'coaches_only' AND public.is_active_coach_for_athlete(auth.uid(), p.user_id))
    THEN p.height_inches
    ELSE NULL
  END AS height_inches,

  CASE
    WHEN auth.uid() = p.user_id
      OR public.has_role(auth.uid(), 'admin')
      OR p.physical_stats_privacy = 'public'
      OR (p.physical_stats_privacy = 'coaches_only' AND public.is_active_coach_for_athlete(auth.uid(), p.user_id))
    THEN p.weight_lbs
    ELSE NULL
  END AS weight_lbs,

  CASE
    WHEN auth.uid() = p.user_id
      OR public.has_role(auth.uid(), 'admin')
      OR p.physical_stats_privacy = 'public'
      OR (p.physical_stats_privacy = 'coaches_only' AND public.is_active_coach_for_athlete(auth.uid(), p.user_id))
    THEN p.sixty_yard_dash
    ELSE NULL
  END AS sixty_yard_dash,

  p.throwing_arm,
  p.batting_side,
  p.target_schools,

  -- Contact/social respects contact_privacy (note: email is never shown except owner/admin)
  CASE
    WHEN auth.uid() = p.user_id
      OR public.has_role(auth.uid(), 'admin')
      OR p.contact_privacy = 'public'
      OR (p.contact_privacy = 'coaches_only' AND public.is_active_coach_for_athlete(auth.uid(), p.user_id))
    THEN p.twitter_url
    ELSE NULL
  END AS twitter_url,

  CASE
    WHEN auth.uid() = p.user_id
      OR public.has_role(auth.uid(), 'admin')
      OR p.contact_privacy = 'public'
      OR (p.contact_privacy = 'coaches_only' AND public.is_active_coach_for_athlete(auth.uid(), p.user_id))
    THEN p.instagram_url
    ELSE NULL
  END AS instagram_url,

  CASE
    WHEN auth.uid() = p.user_id
      OR public.has_role(auth.uid(), 'admin')
      OR p.contact_privacy = 'public'
      OR (p.contact_privacy = 'coaches_only' AND public.is_active_coach_for_athlete(auth.uid(), p.user_id))
    THEN p.youtube_url
    ELSE NULL
  END AS youtube_url,

  CASE
    WHEN auth.uid() = p.user_id
      OR public.has_role(auth.uid(), 'admin')
      OR p.contact_privacy = 'public'
      OR (p.contact_privacy = 'coaches_only' AND public.is_active_coach_for_athlete(auth.uid(), p.user_id))
    THEN p.hudl_url
    ELSE NULL
  END AS hudl_url,

  -- Email only visible to owner/admin
  CASE
    WHEN auth.uid() = p.user_id OR public.has_role(auth.uid(), 'admin')
    THEN p.email
    ELSE NULL
  END AS email,

  p.bio_privacy,
  p.contact_privacy,
  p.physical_stats_privacy,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE auth.uid() IS NOT NULL;

-- Revoke any accidental/public grants and only allow authenticated reads
REVOKE ALL ON public.profiles_public FROM PUBLIC;
REVOKE ALL ON public.profiles_public FROM anon;
REVOKE ALL ON public.profiles_public FROM authenticated;
GRANT SELECT ON public.profiles_public TO authenticated;


-- 2) Prevent exam answer leakage prior to a completed attempt
CREATE OR REPLACE FUNCTION public.get_question_explanation(question_id uuid)
RETURNS TABLE(explanation text, is_correct boolean, correct_answer_index integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;

  -- Allow explanations only after the user has completed an attempt that included this question
  IF NOT EXISTS (
    SELECT 1
    FROM public.certification_attempts ca
    WHERE ca.user_id = auth.uid()
      AND ca.completed_at IS NOT NULL
      AND ca.question_ids @> ARRAY[question_id]
  ) THEN
    RAISE EXCEPTION 'Access denied: Explanation available only after exam completion';
  END IF;

  RETURN QUERY
  SELECT
    cq.explanation,
    false AS is_correct,
    cq.correct_answer_index
  FROM public.certification_questions cq
  WHERE cq.id = question_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_question_explanation(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_question_explanation(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_question_explanation(uuid) TO authenticated;

COMMIT;
