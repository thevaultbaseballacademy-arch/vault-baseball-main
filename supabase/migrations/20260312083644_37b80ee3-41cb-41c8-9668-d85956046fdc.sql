-- Auto-generate meeting link for remote sessions upon booking confirmation
CREATE OR REPLACE FUNCTION public.auto_generate_meeting_link()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only for remote/virtual sessions that don't already have a link
  IF NEW.session_type IN ('remote_session', 'remote_training') AND NEW.meeting_link IS NULL THEN
    NEW.meeting_link := 'https://vault-baseball.lovable.app/remote-lessons?session=' || NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop if exists and recreate trigger
DROP TRIGGER IF EXISTS trg_auto_meeting_link ON public.session_bookings;
CREATE TRIGGER trg_auto_meeting_link
  BEFORE INSERT ON public.session_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_meeting_link();

-- Also ensure remote_lessons get a video_call_link when created from bookings
CREATE OR REPLACE FUNCTION public.ensure_remote_lesson_link()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.video_call_link IS NULL THEN
    NEW.video_call_link := 'https://vault-baseball.lovable.app/remote-lessons?lesson=' || NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_lesson_link ON public.remote_lessons;
CREATE TRIGGER trg_ensure_lesson_link
  BEFORE INSERT ON public.remote_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_remote_lesson_link();