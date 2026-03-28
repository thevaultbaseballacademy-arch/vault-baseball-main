
-- Update handle_new_user to also handle 'parent' signup_role (maps to athlete in user_roles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  signup_role text;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    )
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    email = COALESCE(EXCLUDED.email, profiles.email);

  -- Assign role from signup metadata
  signup_role := new.raw_user_meta_data ->> 'signup_role';
  IF signup_role = 'coach' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'coach')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- athlete, parent, or default all map to athlete role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'athlete')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN new;
END;
$function$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
