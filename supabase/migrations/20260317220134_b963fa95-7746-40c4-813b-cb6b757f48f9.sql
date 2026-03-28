
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  signup_role text;
  signup_sport text;
BEGIN
  -- Get sport type from metadata (default to baseball)
  signup_sport := COALESCE(new.raw_user_meta_data ->> 'sport_type', 'baseball');

  -- Create profile with sport_type
  INSERT INTO public.profiles (user_id, email, display_name, sport_type)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    ),
    signup_sport
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    sport_type = COALESCE(EXCLUDED.sport_type, profiles.sport_type);

  -- Assign role from signup metadata
  signup_role := new.raw_user_meta_data ->> 'signup_role';
  IF signup_role = 'coach' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'coach')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'athlete')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN new;
END;
$function$;
