-- Fix the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can validate 22M invite tokens" ON public.athlete_22m_invite_tokens;

-- More restrictive: only allow viewing active tokens
CREATE POLICY "Users can validate active 22M invite tokens"
  ON public.athlete_22m_invite_tokens
  FOR SELECT
  TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));