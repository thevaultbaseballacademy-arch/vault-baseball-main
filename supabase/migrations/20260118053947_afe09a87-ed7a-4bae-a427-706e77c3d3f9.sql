-- Fix profile visibility to respect privacy settings and prevent mass scraping
-- Drop ALL existing profile policies to start fresh
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Coaches can view assigned athlete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- Create a function to check profile visibility
CREATE OR REPLACE FUNCTION public.can_view_profile(_viewer_id uuid, _profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- User can always view their own profile
    _viewer_id = _profile_user_id
    OR
    -- Admins can view all profiles
    public.has_role(_viewer_id, 'admin')
    OR
    -- Coaches can view profiles of athletes they are assigned to
    public.is_active_coach_for_athlete(_profile_user_id, _viewer_id)
    OR
    -- Check if profile has public contact privacy
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = _profile_user_id
      AND p.contact_privacy = 'public'
    )
$$;

-- RLS policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy: Coaches can view assigned athletes' profiles
CREATE POLICY "Coaches can view assigned athlete profiles"
ON public.profiles
FOR SELECT
USING (public.is_active_coach_for_athlete(user_id, auth.uid()));

-- RLS policy: Users can view public profiles (but email is filtered at app level)
CREATE POLICY "Users can view public profiles"
ON public.profiles
FOR SELECT
USING (contact_privacy = 'public');

-- RLS policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Drop the existing user_sessions_safe view and recreate with proper security
DROP VIEW IF EXISTS public.user_sessions_safe;

-- Recreate the view with security_invoker to respect RLS of underlying table
CREATE VIEW public.user_sessions_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  session_token,
  device_info,
  browser,
  os,
  user_agent,
  -- Mask the last octet of IP addresses for privacy
  CASE 
    WHEN ip_address IS NOT NULL AND ip_address LIKE '%.%.%.%' THEN
      regexp_replace(ip_address, '\.[0-9]+$', '.xxx')
    ELSE ip_address
  END AS ip_address_masked,
  location,
  is_current,
  last_active_at,
  created_at
FROM public.user_sessions
WHERE auth.uid() = user_id;