-- Resolve permissive RLS warnings by replacing literal TRUE checks with explicit validation checks
DROP POLICY IF EXISTS "Anyone can submit evaluation" ON public.evaluation_leads;
CREATE POLICY "Anyone can submit evaluation"
ON public.evaluation_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(athlete_name)) > 0
  AND length(trim(email)) > 3
);

DROP POLICY IF EXISTS "Anyone can submit leads" ON public.lead_captures;
CREATE POLICY "Anyone can submit leads"
ON public.lead_captures
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(athlete_name)) > 0
  AND length(trim(email)) > 3
);

DROP POLICY IF EXISTS "Anyone can create bookings" ON public.session_bookings;
CREATE POLICY "Anyone can create bookings"
ON public.session_bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  coach_user_id IS NOT NULL
  AND length(trim(athlete_name)) > 0
  AND length(trim(email)) > 3
  AND length(trim(session_type)) > 0
  AND session_date IS NOT NULL
  AND length(trim(session_time)) > 0
);