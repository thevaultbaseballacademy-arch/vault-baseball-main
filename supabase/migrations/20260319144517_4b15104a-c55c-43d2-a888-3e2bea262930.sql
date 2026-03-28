
-- Add sport_type to session_bookings
ALTER TABLE public.session_bookings 
ADD COLUMN IF NOT EXISTS sport_type text NOT NULL DEFAULT 'baseball';

-- Add sport_type to remote_lessons
ALTER TABLE public.remote_lessons 
ADD COLUMN IF NOT EXISTS sport_type text NOT NULL DEFAULT 'baseball';

-- Add sport_type to coach_lesson_feedback
ALTER TABLE public.coach_lesson_feedback 
ADD COLUMN IF NOT EXISTS sport_type text NOT NULL DEFAULT 'baseball';

-- Update the create_remote_lesson_from_booking trigger to pass sport_type
CREATE OR REPLACE FUNCTION public.create_remote_lesson_from_booking()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  athlete_uid uuid;
  scheduled_timestamp timestamptz;
  hour_val int;
  minute_val int;
BEGIN
  IF NEW.status != 'confirmed' THEN
    RETURN NEW;
  END IF;
  IF OLD IS NOT NULL AND OLD.status = 'confirmed' THEN
    RETURN NEW;
  END IF;

  SELECT id INTO athlete_uid
  FROM auth.users
  WHERE email = NEW.email
  LIMIT 1;

  IF athlete_uid IS NULL THEN
    RETURN NEW;
  END IF;

  hour_val := split_part(split_part(NEW.session_time, ':', 1), ' ', 1)::int;
  minute_val := split_part(split_part(NEW.session_time, ':', 2), ' ', 1)::int;
  
  IF NEW.session_time ILIKE '%PM%' AND hour_val != 12 THEN
    hour_val := hour_val + 12;
  ELSIF NEW.session_time ILIKE '%AM%' AND hour_val = 12 THEN
    hour_val := 0;
  END IF;

  scheduled_timestamp := NEW.session_date::date + make_interval(hours => hour_val, mins => minute_val);

  IF NOT EXISTS (
    SELECT 1 FROM public.remote_lessons
    WHERE coach_user_id = NEW.coach_user_id
      AND athlete_user_id = athlete_uid
      AND scheduled_at = scheduled_timestamp
  ) THEN
    INSERT INTO public.remote_lessons (
      coach_user_id,
      athlete_user_id,
      scheduled_at,
      duration_minutes,
      status,
      notes,
      sport_type
    ) VALUES (
      NEW.coach_user_id,
      athlete_uid,
      scheduled_timestamp,
      COALESCE(NEW.duration_minutes, 60),
      'confirmed',
      'Booked via ' || COALESCE(replace(NEW.session_type, '_', ' '), 'session') || ' - ' || COALESCE(NEW.athlete_name, ''),
      COALESCE(NEW.sport_type, 'baseball')
    );
  END IF;

  RETURN NEW;
END;
$function$;
