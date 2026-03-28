-- Drop existing INSERT policy that only allows athletes
DROP POLICY IF EXISTS "Athletes can book lessons" ON remote_lessons;

-- Create new INSERT policy that allows both athletes and coaches
CREATE POLICY "Athletes and coaches can create lessons"
ON remote_lessons FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = athlete_user_id 
  OR auth.uid() = coach_user_id
);
