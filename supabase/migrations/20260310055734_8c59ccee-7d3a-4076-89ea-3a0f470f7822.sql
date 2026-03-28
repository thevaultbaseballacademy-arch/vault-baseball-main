-- Allow coaches to insert comp lesson credits
DROP POLICY IF EXISTS "Admins can insert credits for any user" ON public.lesson_credits;
CREATE POLICY "Admins and coaches can insert credits"
  ON public.lesson_credits FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_team_admin_access(auth.uid())
    OR has_team_access(auth.uid())
    OR has_role(auth.uid(), 'coach'::app_role)
  );

-- Allow coaches to view all credits (needed to verify grants)
DROP POLICY IF EXISTS "Admins can view all credits" ON public.lesson_credits;
CREATE POLICY "Admins and coaches can view all credits"
  ON public.lesson_credits FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_team_admin_access(auth.uid())
    OR has_team_access(auth.uid())
    OR has_role(auth.uid(), 'coach'::app_role)
  );