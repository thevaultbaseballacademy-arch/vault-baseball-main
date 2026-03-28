
-- Fix check_exam_answer RPC: remove correct_answer from return, add completion guard
-- Drop both overloads first
DROP FUNCTION IF EXISTS public.check_exam_answer(uuid, uuid, integer);

CREATE OR REPLACE FUNCTION public.check_exam_answer(p_attempt_id uuid, p_question_id uuid, p_selected_answer integer)
RETURNS TABLE(is_correct boolean, explanation text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_completed_at timestamptz;
BEGIN
  -- Verify the attempt belongs to the current user
  SELECT user_id, completed_at INTO v_user_id, v_completed_at
  FROM public.certification_attempts
  WHERE id = p_attempt_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Attempt not found';
  END IF;
  
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You can only check answers for your own attempts';
  END IF;

  -- Block checking answers on already-completed attempts
  IF v_completed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Attempt is already completed';
  END IF;
  
  -- Return only is_correct and explanation (NO correct_answer_index)
  RETURN QUERY
  SELECT 
    cq.correct_answer_index = p_selected_answer AS is_correct,
    cq.explanation
  FROM public.certification_questions cq
  WHERE cq.id = p_question_id;
END;
$function$;

-- Revoke public execute, grant only to authenticated
REVOKE ALL ON FUNCTION public.check_exam_answer(uuid, uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_exam_answer(uuid, uuid, integer) TO authenticated;
