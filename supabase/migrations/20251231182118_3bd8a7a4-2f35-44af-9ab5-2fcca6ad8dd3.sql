-- Drop the overly permissive policy that exposes all profile data
DROP POLICY IF EXISTS "Authenticated users can view public profile data" ON public.profiles;

-- Add policy for coaches to view their assigned athletes' profiles
CREATE POLICY "Coaches can view assigned athletes profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coach_athlete_assignments
    WHERE coach_user_id = auth.uid() 
    AND athlete_user_id = profiles.user_id
  )
);