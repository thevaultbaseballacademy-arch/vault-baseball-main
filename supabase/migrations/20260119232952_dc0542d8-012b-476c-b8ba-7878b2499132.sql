-- Drop and recreate get_exam_questions with matching return type
DROP FUNCTION IF EXISTS public.get_exam_questions(public.certification_type, integer);

-- Recreate with proper authorization check
CREATE OR REPLACE FUNCTION public.get_exam_questions(p_certification_type public.certification_type, p_limit integer DEFAULT 25)
RETURNS TABLE(id uuid, question_text text, options jsonb, section text, is_scenario boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Require authenticated user
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;
  
  -- Return random selection of active questions
  RETURN QUERY
  SELECT 
    cq.id,
    cq.question_text,
    cq.options,
    cq.section,
    cq.is_scenario
  FROM public.certification_questions cq
  WHERE cq.certification_type = p_certification_type
  AND cq.is_active = true
  ORDER BY RANDOM()
  LIMIT p_limit;
END;
$$;

-- Drop and recreate check_exam_answer with ownership verification
DROP FUNCTION IF EXISTS public.check_exam_answer(uuid, uuid, integer);

CREATE OR REPLACE FUNCTION public.check_exam_answer(p_attempt_id uuid, p_question_id uuid, p_selected_answer integer)
RETURNS TABLE(is_correct boolean, correct_answer integer, explanation text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Verify the attempt belongs to the current user
  SELECT user_id INTO v_user_id
  FROM public.certification_attempts
  WHERE id = p_attempt_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Attempt not found';
  END IF;
  
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You can only check answers for your own attempts';
  END IF;
  
  -- Return the answer check result
  RETURN QUERY
  SELECT 
    cq.correct_answer_index = p_selected_answer AS is_correct,
    cq.correct_answer_index AS correct_answer,
    cq.explanation
  FROM public.certification_questions cq
  WHERE cq.id = p_question_id;
END;
$$;

-- Add admin authorization checks to audit log functions
CREATE OR REPLACE FUNCTION public.purge_old_audit_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
  retention_days integer;
BEGIN
  -- Require admin role for this operation
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Get retention period from config
  SELECT COALESCE((config_value->>'retention_days')::integer, 90)
  INTO retention_days
  FROM public.data_retention_config
  WHERE config_key = 'audit_logs';
  
  -- Delete old audit logs
  DELETE FROM public.audit_logs
  WHERE changed_at < NOW() - (retention_days || ' days')::interval;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Update anonymize_old_audit_ips to require admin role
CREATE OR REPLACE FUNCTION public.anonymize_old_audit_ips()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
  anonymize_after_days integer;
BEGIN
  -- Require admin role for this operation
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Get anonymization period from config (default 30 days)
  SELECT COALESCE((config_value->>'anonymize_after_days')::integer, 30)
  INTO anonymize_after_days
  FROM public.data_retention_config
  WHERE config_key = 'ip_anonymization';
  
  -- Anonymize old IP addresses
  UPDATE public.audit_logs
  SET ip_address = 'xxx.xxx.xxx.xxx'
  WHERE changed_at < NOW() - (anonymize_after_days || ' days')::interval
  AND ip_address IS NOT NULL
  AND ip_address != 'xxx.xxx.xxx.xxx';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;