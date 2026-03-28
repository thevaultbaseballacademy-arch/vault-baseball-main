
-- Session bookings table for athlete/parent booking with coaches
CREATE TABLE public.session_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id UUID NOT NULL,
  coach_name TEXT,
  
  -- Athlete/Parent info (collected from form, no auth required)
  athlete_name TEXT NOT NULL,
  parent_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  athlete_age INTEGER,
  primary_position TEXT,
  
  -- Session details
  session_type TEXT NOT NULL DEFAULT 'private_lesson',
  session_date DATE NOT NULL,
  session_time TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  meeting_link TEXT,
  location TEXT,
  
  -- Notifications
  coach_notified_at TIMESTAMPTZ,
  confirmation_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.session_bookings ENABLE ROW LEVEL SECURITY;

-- Anyone can create a booking (public-facing form)
CREATE POLICY "Anyone can create bookings"
ON public.session_bookings
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Coaches can view and manage their own bookings
CREATE POLICY "Coaches view own bookings"
ON public.session_bookings
FOR SELECT TO authenticated
USING (coach_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Coaches can update their own bookings
CREATE POLICY "Coaches update own bookings"
ON public.session_bookings
FOR UPDATE TO authenticated
USING (coach_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (coach_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Admins can delete
CREATE POLICY "Admins delete bookings"
ON public.session_bookings
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_session_bookings_updated_at
  BEFORE UPDATE ON public.session_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
