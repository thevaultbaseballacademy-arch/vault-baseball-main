
-- CRITICAL FIX: Auto-create a remote_lesson when a session_booking is confirmed
-- This bridges the gap between the booking flow and the lesson/join system
CREATE OR REPLACE FUNCTION public.create_remote_lesson_from_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  athlete_uid uuid;
  scheduled_timestamp timestamptz;
  time_parts text[];
  hour_val int;
  minute_val int;
BEGIN
  -- Only fire when status is 'confirmed'
  IF NEW.status != 'confirmed' THEN
    RETURN NEW;
  END IF;
  -- Only fire on actual status change
  IF OLD IS NOT NULL AND OLD.status = 'confirmed' THEN
    RETURN NEW;
  END IF;

  -- Look up the athlete user_id by email
  SELECT id INTO athlete_uid
  FROM auth.users
  WHERE email = NEW.email
  LIMIT 1;

  -- If we can't find the user, skip (guest booking)
  IF athlete_uid IS NULL THEN
    RETURN NEW;
  END IF;

  -- Parse session_time like '10:00 AM' or '1:00 PM'
  -- Extract hour and minute
  hour_val := split_part(split_part(NEW.session_time, ':', 1), ' ', 1)::int;
  minute_val := split_part(split_part(NEW.session_time, ':', 2), ' ', 1)::int;
  
  -- Handle AM/PM
  IF NEW.session_time ILIKE '%PM%' AND hour_val != 12 THEN
    hour_val := hour_val + 12;
  ELSIF NEW.session_time ILIKE '%AM%' AND hour_val = 12 THEN
    hour_val := 0;
  END IF;

  scheduled_timestamp := NEW.session_date::date + make_interval(hours => hour_val, mins => minute_val);

  -- Check if a remote_lesson already exists
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
      notes
    ) VALUES (
      NEW.coach_user_id,
      athlete_uid,
      scheduled_timestamp,
      COALESCE(NEW.duration_minutes, 60),
      'confirmed',
      'Booked via ' || COALESCE(replace(NEW.session_type, '_', ' '), 'session') || ' - ' || COALESCE(NEW.athlete_name, '')
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger on session_bookings
DROP TRIGGER IF EXISTS trg_create_remote_lesson ON public.session_bookings;
CREATE TRIGGER trg_create_remote_lesson
  AFTER INSERT OR UPDATE ON public.session_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_remote_lesson_from_booking();

-- Auto-confirm bookings on insert so athletes see lessons immediately
CREATE OR REPLACE FUNCTION public.auto_confirm_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    NEW.status := 'confirmed';
    NEW.confirmation_sent_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_confirm_booking ON public.session_bookings;
CREATE TRIGGER trg_auto_confirm_booking
  BEFORE INSERT ON public.session_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_booking();
