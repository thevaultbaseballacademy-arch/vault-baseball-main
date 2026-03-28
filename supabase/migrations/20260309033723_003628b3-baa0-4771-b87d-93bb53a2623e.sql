-- Drop the permissive SELECT policy that exposes all active tokens to any authenticated user
DROP POLICY IF EXISTS "Users can validate active 22M invite tokens" ON public.athlete_22m_invite_tokens;
DROP POLICY IF EXISTS "Anyone can validate 22M invite tokens" ON public.athlete_22m_invite_tokens;

-- Add admin-only SELECT policy (admins need to manage tokens)
CREATE POLICY "Only admins can view 22M invite tokens"
  ON public.athlete_22m_invite_tokens
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));