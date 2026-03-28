-- Fix coach invite token enumeration vulnerability
-- Drop the permissive SELECT policy that exposes all tokens to any authenticated user
DROP POLICY IF EXISTS "Anyone can validate invite tokens" ON public.coach_invite_tokens;

-- Add admin-only SELECT policy (admins need to manage tokens)
CREATE POLICY "Only admins can view coach invite tokens"
  ON public.coach_invite_tokens
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));