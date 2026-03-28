
-- Fix: Allow authenticated users to create coach-athlete assignments
-- (athletes select their coach, coaches can also initiate)
CREATE POLICY "Authenticated users can create assignments"
ON public.coach_athlete_assignments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = athlete_user_id OR auth.uid() = coach_user_id
);
