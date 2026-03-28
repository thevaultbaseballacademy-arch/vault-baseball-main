-- Fix get_athlete_trial_status: Add ownership/admin guard to prevent IDOR
DROP FUNCTION IF EXISTS public.get_athlete_trial_status(uuid);

CREATE OR REPLACE FUNCTION public.get_athlete_trial_status(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  trial_record record;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Only allow viewing own trial status or admin access
  IF auth.uid() != p_user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: you may only view your own trial status';
  END IF;

  SELECT * INTO trial_record
  FROM public.athlete_trials
  WHERE user_id = p_user_id
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('has_trial', false);
  END IF;
  
  RETURN jsonb_build_object(
    'has_trial', true,
    'trial_active', trial_record.trial_active AND trial_record.trial_end_date > now(),
    'trial_type', trial_record.trial_type,
    'trial_start_date', trial_record.trial_start_date,
    'trial_end_date', trial_record.trial_end_date,
    'days_remaining', GREATEST(0, EXTRACT(DAY FROM trial_record.trial_end_date - now())::integer),
    'is_expired', trial_record.trial_end_date <= now(),
    'converted', trial_record.converted_at IS NOT NULL,
    'converted_product', trial_record.converted_product
  );
END;
$function$;

-- Revoke public execution, grant only to authenticated
REVOKE ALL ON FUNCTION public.get_athlete_trial_status(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_athlete_trial_status(uuid) TO authenticated;


-- Fix increment_22m_invite_usage: Add validation to prevent token exhaustion DoS
DROP FUNCTION IF EXISTS public.increment_22m_invite_usage(uuid);

CREATE OR REPLACE FUNCTION public.increment_22m_invite_usage(token_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_token_record RECORD;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Lock the token row and validate it exists and is usable
  SELECT * INTO v_token_record
  FROM public.athlete_22m_invite_tokens
  WHERE id = token_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Token not found';
  END IF;
  
  -- Check if token is active
  IF v_token_record.is_active = false THEN
    RAISE EXCEPTION 'Token is no longer active';
  END IF;
  
  -- Check if token is expired
  IF v_token_record.expires_at IS NOT NULL AND v_token_record.expires_at < now() THEN
    RAISE EXCEPTION 'Token has expired';
  END IF;
  
  -- Check if max uses exceeded
  IF v_token_record.max_uses IS NOT NULL AND v_token_record.used_count >= v_token_record.max_uses THEN
    RAISE EXCEPTION 'Token has reached maximum uses';
  END IF;
  
  -- Check if user already has a trial (prevent duplicate redemptions)
  IF EXISTS (
    SELECT 1 FROM public.athlete_trials
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You have already activated a trial';
  END IF;
  
  -- Increment usage
  UPDATE public.athlete_22m_invite_tokens
  SET used_count = used_count + 1
  WHERE id = token_id;
END;
$function$;

-- Revoke public execution, grant only to authenticated
REVOKE ALL ON FUNCTION public.increment_22m_invite_usage(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_22m_invite_usage(uuid) TO authenticated;