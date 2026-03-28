
-- ============================================================
-- 1. PREVENT DUPLICATE ACCOUNTS: unique constraint on profiles.email
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON public.profiles (email);

-- ============================================================
-- 2. ADD TRACKING COLUMNS TO lesson_credits
-- ============================================================
ALTER TABLE public.lesson_credits
  ADD COLUMN IF NOT EXISTS credit_type text NOT NULL DEFAULT 'purchased',
  ADD COLUMN IF NOT EXISTS granted_by uuid,
  ADD COLUMN IF NOT EXISTS granted_reason text,
  ADD COLUMN IF NOT EXISTS last_used_at timestamptz;

-- ============================================================
-- 3. Create lesson_credit_usage table for audit trail
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lesson_credit_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_id uuid NOT NULL REFERENCES public.lesson_credits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  lesson_id uuid,
  lesson_type text NOT NULL DEFAULT 'remote_lesson',
  used_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lesson_credit_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit usage"
  ON public.lesson_credit_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert credit usage"
  ON public.lesson_credit_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all credit usage"
  ON public.lesson_credit_usage FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 4. Auto-consume lesson credit when a remote_lesson completes
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_consume_lesson_credit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credit_id uuid;
BEGIN
  -- Only fire when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    -- Find the oldest credit with remaining lessons for this athlete
    SELECT id INTO v_credit_id
    FROM public.lesson_credits
    WHERE user_id = NEW.athlete_user_id
      AND used_lessons < total_lessons
      AND (expires_at IS NULL OR expires_at > now())
    ORDER BY 
      -- Use comp credits first, then purchased
      CASE WHEN credit_type = 'comp' THEN 0 ELSE 1 END,
      purchased_at ASC
    LIMIT 1;

    IF v_credit_id IS NOT NULL THEN
      -- Decrement the credit
      UPDATE public.lesson_credits
      SET used_lessons = used_lessons + 1,
          last_used_at = now()
      WHERE id = v_credit_id;

      -- Log the usage
      INSERT INTO public.lesson_credit_usage (credit_id, user_id, lesson_id, lesson_type)
      VALUES (v_credit_id, NEW.athlete_user_id, NEW.id, 'remote_lesson');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_consume_lesson_credit ON public.remote_lessons;
CREATE TRIGGER trg_auto_consume_lesson_credit
  AFTER UPDATE ON public.remote_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_consume_lesson_credit();

-- Also handle session_bookings completing
CREATE OR REPLACE FUNCTION public.auto_consume_booking_credit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credit_id uuid;
  v_athlete_user_id uuid;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    -- Look up the athlete's user_id by email
    SELECT p.user_id INTO v_athlete_user_id
    FROM public.profiles p
    WHERE lower(p.email) = lower(NEW.email)
    LIMIT 1;

    IF v_athlete_user_id IS NULL THEN
      RETURN NEW;
    END IF;

    SELECT id INTO v_credit_id
    FROM public.lesson_credits
    WHERE user_id = v_athlete_user_id
      AND used_lessons < total_lessons
      AND (expires_at IS NULL OR expires_at > now())
    ORDER BY 
      CASE WHEN credit_type = 'comp' THEN 0 ELSE 1 END,
      purchased_at ASC
    LIMIT 1;

    IF v_credit_id IS NOT NULL THEN
      UPDATE public.lesson_credits
      SET used_lessons = used_lessons + 1,
          last_used_at = now()
      WHERE id = v_credit_id;

      INSERT INTO public.lesson_credit_usage (credit_id, user_id, lesson_id, lesson_type)
      VALUES (v_credit_id, v_athlete_user_id, NEW.id, 'session_booking');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_consume_booking_credit ON public.session_bookings;
CREATE TRIGGER trg_auto_consume_booking_credit
  AFTER UPDATE ON public.session_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_consume_booking_credit();
