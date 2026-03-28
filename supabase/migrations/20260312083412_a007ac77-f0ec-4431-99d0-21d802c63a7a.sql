-- Issue #4: Prevent double-booking with unique constraint on session_bookings
CREATE UNIQUE INDEX IF NOT EXISTS idx_session_bookings_no_double 
ON public.session_bookings (coach_user_id, session_date, session_time) 
WHERE status != 'cancelled';