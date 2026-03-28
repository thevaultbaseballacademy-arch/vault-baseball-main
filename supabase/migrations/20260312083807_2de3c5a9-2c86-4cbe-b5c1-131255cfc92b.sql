-- Enhanced handle_new_user: also assign role from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  ON CONFLICT (user_id) DO NOTHING;

  -- Assign role from signup metadata
  signup_role := new.raw_user_meta_data ->> 'signup_role';
  IF signup_role = 'coach' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'coach')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF signup_role = 'athlete' OR signup_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'athlete')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Default to athlete if no role specified
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'athlete')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;