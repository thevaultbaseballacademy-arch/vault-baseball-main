-- Add a limited access policy for authenticated users viewing public profile data
-- This is needed because the public_profiles view uses security_invoker
-- The view restricts columns, this policy allows row access
CREATE POLICY "Authenticated users can view public profile data"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);