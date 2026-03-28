
CREATE OR REPLACE FUNCTION public.increment_invite_usage(token_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coach_invite_tokens
  SET used_count = used_count + 1
  WHERE id = token_id;
END;
$$;
