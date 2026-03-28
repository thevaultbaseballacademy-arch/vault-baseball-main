CREATE POLICY "Admins can insert credits for any user"
ON public.lesson_credits FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_team_admin_access(auth.uid())
  OR public.has_team_access(auth.uid())
);

CREATE POLICY "Admins can view all credits"
ON public.lesson_credits FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_team_admin_access(auth.uid())
  OR public.has_team_access(auth.uid())
);