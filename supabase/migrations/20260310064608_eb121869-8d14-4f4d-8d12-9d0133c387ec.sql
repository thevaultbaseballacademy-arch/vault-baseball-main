
-- Function to auto-assign roles when a user signs up, based on team_whitelist
CREATE OR REPLACE FUNCTION public.auto_assign_roles_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  whitelist_record RECORD;
BEGIN
  -- Check if the new user's email is in the team_whitelist
  SELECT full_access, admin_access INTO whitelist_record
  FROM public.team_whitelist
  WHERE email = NEW.email;
  
  IF FOUND THEN
    -- All whitelisted users with full_access get the coach role
    IF whitelist_record.full_access = true THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'coach')
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    -- Users with admin_access get the admin role
    IF whitelist_record.admin_access = true THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert (fires after handle_new_user)
DROP TRIGGER IF EXISTS on_auth_user_created_assign_roles ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_roles
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_roles_on_signup();
