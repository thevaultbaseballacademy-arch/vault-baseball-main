-- Expand schedule access for full-access coaching accounts and admins
DROP POLICY IF EXISTS "Coaches can view own schedules" ON public.custom_training_schedules;
DROP POLICY IF EXISTS "Coaches can create schedules" ON public.custom_training_schedules;
DROP POLICY IF EXISTS "Coaches can update own schedules" ON public.custom_training_schedules;
DROP POLICY IF EXISTS "Coaches can delete own schedules" ON public.custom_training_schedules;

CREATE POLICY "Coaches can view own schedules"
ON public.custom_training_schedules
FOR SELECT
TO authenticated
USING (
  auth.uid() = coach_user_id
  AND (
    public.has_role(auth.uid(), 'coach')
    OR public.has_team_access(auth.uid())
    OR public.has_team_admin_access(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Coaches can create schedules"
ON public.custom_training_schedules
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = coach_user_id
  AND (
    public.has_role(auth.uid(), 'coach')
    OR public.has_team_access(auth.uid())
    OR public.has_team_admin_access(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Coaches can update own schedules"
ON public.custom_training_schedules
FOR UPDATE
TO authenticated
USING (
  auth.uid() = coach_user_id
  AND (
    public.has_role(auth.uid(), 'coach')
    OR public.has_team_access(auth.uid())
    OR public.has_team_admin_access(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
)
WITH CHECK (
  auth.uid() = coach_user_id
  AND (
    public.has_role(auth.uid(), 'coach')
    OR public.has_team_access(auth.uid())
    OR public.has_team_admin_access(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Coaches can delete own schedules"
ON public.custom_training_schedules
FOR DELETE
TO authenticated
USING (
  auth.uid() = coach_user_id
  AND (
    public.has_role(auth.uid(), 'coach')
    OR public.has_team_access(auth.uid())
    OR public.has_team_admin_access(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
);

DROP POLICY IF EXISTS "Coaches can view assignments for own schedules" ON public.schedule_assignments;
DROP POLICY IF EXISTS "Coaches can create assignments for own schedules" ON public.schedule_assignments;
DROP POLICY IF EXISTS "Coaches can update assignments for own schedules" ON public.schedule_assignments;
DROP POLICY IF EXISTS "Coaches can delete assignments for own schedules" ON public.schedule_assignments;

CREATE POLICY "Coaches can view assignments for own schedules"
ON public.schedule_assignments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.custom_training_schedules cts
    WHERE cts.id = schedule_assignments.schedule_id
      AND cts.coach_user_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'coach')
    OR public.has_team_access(auth.uid())
    OR public.has_team_admin_access(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Coaches can create assignments for own schedules"
ON public.schedule_assignments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = assigned_by
  AND EXISTS (
    SELECT 1
    FROM public.custom_training_schedules cts
    WHERE cts.id = schedule_assignments.schedule_id
      AND cts.coach_user_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'coach')
    OR public.has_team_access(auth.uid())
    OR public.has_team_admin_access(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Coaches can update assignments for own schedules"
ON public.schedule_assignments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.custom_training_schedules cts
    WHERE cts.id = schedule_assignments.schedule_id
      AND cts.coach_user_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'coach')
    OR public.has_team_access(auth.uid())
    OR public.has_team_admin_access(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.custom_training_schedules cts
    WHERE cts.id = schedule_assignments.schedule_id
      AND cts.coach_user_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'coach')
    OR public.has_team_access(auth.uid())
    OR public.has_team_admin_access(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Coaches can delete assignments for own schedules"
ON public.schedule_assignments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.custom_training_schedules cts
    WHERE cts.id = schedule_assignments.schedule_id
      AND cts.coach_user_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'coach')
    OR public.has_team_access(auth.uid())
    OR public.has_team_admin_access(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- Allow coaches to load their own coach record safely
DROP POLICY IF EXISTS "Coaches can view own coach record" ON public.coaches;
CREATE POLICY "Coaches can view own coach record"
ON public.coaches
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Automated lesson notifications for both coaches and athletes
CREATE OR REPLACE FUNCTION public.notify_lesson_events()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  athlete_user_id uuid;
  actor_user_id uuid;
  scheduled_label text;
BEGIN
  IF TG_TABLE_NAME = 'remote_lessons' THEN
    scheduled_label := to_char(NEW.scheduled_at AT TIME ZONE 'UTC', 'Mon FMDD at FMHH12:MI AM') || ' UTC';

    IF TG_OP = 'INSERT' THEN
      INSERT INTO public.notifications (user_id, type, title, message, actor_id)
      VALUES
        (
          NEW.coach_user_id,
          'lesson_booked',
          'New lesson booked',
          'A new lesson was booked for ' || scheduled_label || '.',
          COALESCE(NEW.athlete_user_id, NEW.coach_user_id)
        ),
        (
          NEW.athlete_user_id,
          'lesson_booked',
          'Lesson booked',
          'Your lesson is scheduled for ' || scheduled_label || '.',
          COALESCE(NEW.coach_user_id, NEW.athlete_user_id)
        );
      RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
      IF NEW.video_call_link IS DISTINCT FROM OLD.video_call_link AND NEW.video_call_link IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, actor_id)
        VALUES (
          NEW.athlete_user_id,
          'lesson_link_added',
          'Lesson link is ready',
          'Your coach added the video link for your upcoming lesson.',
          COALESCE(NEW.coach_user_id, NEW.athlete_user_id)
        );
      END IF;

      IF NEW.status IS DISTINCT FROM OLD.status THEN
        IF NEW.status = 'confirmed' THEN
          INSERT INTO public.notifications (user_id, type, title, message, actor_id)
          VALUES
            (
              NEW.athlete_user_id,
              'lesson_confirmed',
              'Lesson confirmed',
              'Your lesson for ' || scheduled_label || ' was confirmed.',
              COALESCE(NEW.coach_user_id, NEW.athlete_user_id)
            ),
            (
              NEW.coach_user_id,
              'lesson_confirmed',
              'Lesson confirmed',
              'You confirmed a lesson for ' || scheduled_label || '.',
              COALESCE(NEW.coach_user_id, NEW.athlete_user_id)
            );
        ELSIF NEW.status = 'cancelled' THEN
          INSERT INTO public.notifications (user_id, type, title, message, actor_id)
          VALUES
            (
              NEW.athlete_user_id,
              'lesson_cancelled',
              'Lesson cancelled',
              'A lesson scheduled for ' || scheduled_label || ' was cancelled.',
              COALESCE(auth.uid(), NEW.coach_user_id, NEW.athlete_user_id)
            ),
            (
              NEW.coach_user_id,
              'lesson_cancelled',
              'Lesson cancelled',
              'A lesson scheduled for ' || scheduled_label || ' was cancelled.',
              COALESCE(auth.uid(), NEW.coach_user_id, NEW.athlete_user_id)
            );
        ELSIF NEW.status = 'completed' THEN
          INSERT INTO public.notifications (user_id, type, title, message, actor_id)
          VALUES (
            NEW.athlete_user_id,
            'lesson_completed',
            'Lesson completed',
            'Your lesson for ' || scheduled_label || ' was marked complete.',
            COALESCE(NEW.coach_user_id, NEW.athlete_user_id)
          );
        END IF;
      END IF;

      RETURN NEW;
    END IF;
  ELSIF TG_TABLE_NAME = 'session_bookings' THEN
    SELECT p.user_id
    INTO athlete_user_id
    FROM public.profiles p
    WHERE lower(p.email) = lower(NEW.email)
    LIMIT 1;

    actor_user_id := COALESCE(athlete_user_id, NEW.coach_user_id);

    IF TG_OP = 'INSERT' THEN
      INSERT INTO public.notifications (user_id, type, title, message, actor_id)
      VALUES (
        NEW.coach_user_id,
        'lesson_booked',
        'New booking request',
        NEW.athlete_name || ' requested a ' || replace(NEW.session_type, '_', ' ') || ' on ' || to_char(NEW.session_date, 'Mon FMDD') || ' at ' || NEW.session_time || '.',
        actor_user_id
      );

      IF athlete_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, actor_id)
        VALUES (
          athlete_user_id,
          'lesson_booked',
          'Booking received',
          'Your booking request with ' || COALESCE(NEW.coach_name, 'your coach') || ' was received.',
          NEW.coach_user_id
        );
      END IF;

      RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
      IF athlete_user_id IS NOT NULL THEN
        IF NEW.status IS DISTINCT FROM OLD.status THEN
          IF NEW.status = 'confirmed' THEN
            INSERT INTO public.notifications (user_id, type, title, message, actor_id)
            VALUES (
              athlete_user_id,
              'lesson_confirmed',
              'Booking confirmed',
              'Your session on ' || to_char(NEW.session_date, 'Mon FMDD') || ' at ' || NEW.session_time || ' was confirmed.',
              NEW.coach_user_id
            );
          ELSIF NEW.status = 'cancelled' THEN
            INSERT INTO public.notifications (user_id, type, title, message, actor_id)
            VALUES (
              athlete_user_id,
              'lesson_cancelled',
              'Booking cancelled',
              'Your session on ' || to_char(NEW.session_date, 'Mon FMDD') || ' at ' || NEW.session_time || ' was cancelled.',
              NEW.coach_user_id
            );
          END IF;
        END IF;

        IF NEW.meeting_link IS DISTINCT FROM OLD.meeting_link AND NEW.meeting_link IS NOT NULL THEN
          INSERT INTO public.notifications (user_id, type, title, message, actor_id)
          VALUES (
            athlete_user_id,
            'lesson_link_added',
            'Meeting link added',
            'Your coach added a meeting link for your upcoming session.',
            NEW.coach_user_id
          );
        END IF;
      END IF;

      RETURN NEW;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_remote_lessons ON public.remote_lessons;
CREATE TRIGGER trg_notify_remote_lessons
AFTER INSERT OR UPDATE ON public.remote_lessons
FOR EACH ROW
EXECUTE FUNCTION public.notify_lesson_events();

DROP TRIGGER IF EXISTS trg_notify_session_bookings ON public.session_bookings;
CREATE TRIGGER trg_notify_session_bookings
AFTER INSERT OR UPDATE ON public.session_bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_lesson_events();