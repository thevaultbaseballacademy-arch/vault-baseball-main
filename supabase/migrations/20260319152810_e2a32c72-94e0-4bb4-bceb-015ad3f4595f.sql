
-- Trigger function: prevent owner+coach on same user (uses text comparison, not enum literal)
CREATE OR REPLACE FUNCTION public.enforce_role_exclusivity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role::text = 'owner' AND EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = NEW.user_id AND role::text = 'coach'
  ) THEN
    RAISE EXCEPTION 'A user cannot hold both owner and coach roles. Use separate accounts.';
  END IF;

  IF NEW.role::text = 'coach' AND EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = NEW.user_id AND role::text = 'owner'
  ) THEN
    RAISE EXCEPTION 'A user cannot hold both owner and coach roles. Use separate accounts.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_role_exclusivity ON public.user_roles;
CREATE TRIGGER trg_enforce_role_exclusivity
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_role_exclusivity();

-- is_owner: check both user_roles and team_whitelist (uses text cast to avoid enum commit issue)
CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = 'owner'
  )
  OR EXISTS (
    SELECT 1 FROM public.team_whitelist tw
    JOIN auth.users u ON u.email = tw.email
    WHERE u.id = _user_id
      AND tw.admin_access = true
      AND tw.full_access = true
  );
END;
$$;

-- RLS: only owners can manage roles
DROP POLICY IF EXISTS "Owners can manage user roles" ON public.user_roles;
CREATE POLICY "Owners can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_owner(auth.uid()))
WITH CHECK (public.is_owner(auth.uid()));

-- Users can read their own roles; owners/admins read all
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
