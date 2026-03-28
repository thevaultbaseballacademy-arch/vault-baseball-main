
-- Bug Fix 1: Allow anyone to see active coach names (needed for booking page)
CREATE POLICY "Anyone can view active coaches"
ON public.coaches
FOR SELECT
USING (status = 'Active');

-- Bug Fix 2: Allow athletes to see their own session bookings by email
CREATE POLICY "Users can view own bookings by email"
ON public.session_bookings
FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Bug Fix 3: Allow authenticated users to view their own coaching_sessions
-- Check if coaching_sessions has proper policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'coaching_sessions' AND policyname = 'Users can view own sessions'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own sessions" ON public.coaching_sessions FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END $$;
