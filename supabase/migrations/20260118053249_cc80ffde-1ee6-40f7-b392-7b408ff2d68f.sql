
-- Fix security issues identified in the security scan

-- 1. Restrict activity_feed to only allow users to insert their own activities
DROP POLICY IF EXISTS "Authenticated users can create activities" ON public.activity_feed;
CREATE POLICY "Users can create their own activities"
  ON public.activity_feed
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. Make activity_feed only readable by authenticated users (not completely public)
DROP POLICY IF EXISTS "Activity feed is publicly readable" ON public.activity_feed;
CREATE POLICY "Authenticated users can view activity feed"
  ON public.activity_feed
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 3. Add admin ability to manage activity feed
CREATE POLICY "Admins can manage activity feed"
  ON public.activity_feed
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Tighten athlete_checkins coach access to require athlete approval
DROP POLICY IF EXISTS "Coaches can view assigned athletes checkins" ON public.athlete_checkins;
CREATE POLICY "Coaches can view assigned athletes checkins"
  ON public.athlete_checkins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_athlete_assignments
      WHERE coach_athlete_assignments.coach_user_id = auth.uid()
        AND coach_athlete_assignments.athlete_user_id = athlete_checkins.user_id
        AND coach_athlete_assignments.is_active = true
        AND coach_athlete_assignments.athlete_approved = true
    )
  );

-- 5. Create a function to hash/obfuscate sensitive data in user_sessions for display
-- This doesn't change the data but provides a safe way to display partial IPs
CREATE OR REPLACE FUNCTION public.obfuscate_ip(ip_address text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN ip_address IS NULL THEN NULL
    WHEN ip_address ~ '^\d+\.\d+\.\d+\.\d+$' THEN
      -- IPv4: show first two octets, mask last two
      split_part(ip_address, '.', 1) || '.' || split_part(ip_address, '.', 2) || '.xxx.xxx'
    WHEN ip_address ~ ':' THEN
      -- IPv6: show first group only
      split_part(ip_address, ':', 1) || ':xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx'
    ELSE 'xxx.xxx.xxx.xxx'
  END
$$;

-- 6. Update user_sessions policy to mask IP addresses when viewing (create a view for safe access)
CREATE OR REPLACE VIEW public.user_sessions_safe AS
SELECT 
  id,
  user_id,
  session_token,
  browser,
  os,
  device_info,
  obfuscate_ip(ip_address) as ip_address_masked,
  location,
  user_agent,
  is_current,
  last_active_at,
  created_at
FROM public.user_sessions;

-- 7. Add rate limiting function for activity feed (to be used in app logic)
CREATE OR REPLACE FUNCTION public.can_create_activity(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Check if user has created too many activities in the last hour (max 10)
  SELECT COUNT(*) INTO recent_count
  FROM public.activity_feed
  WHERE user_id = target_user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN recent_count < 10;
END;
$$;

-- 8. Update the activity feed insert policy to use rate limiting
DROP POLICY IF EXISTS "Users can create their own activities" ON public.activity_feed;
CREATE POLICY "Users can create their own activities with rate limit"
  ON public.activity_feed
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND can_create_activity(auth.uid()));
