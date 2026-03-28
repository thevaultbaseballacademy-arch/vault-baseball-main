-- Security Fix: Remove anonymous access to profiles_public view
-- Only authenticated users should be able to access profile information

-- Revoke anonymous access to profiles_public view
REVOKE SELECT ON public.profiles_public FROM anon;

-- Update the view to add an additional WHERE clause for authenticated users only
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    user_id,
    display_name,
    bio,
    "position",
    avatar_url,
    cover_url,
    graduation_year,
    height_inches,
    weight_lbs,
    sixty_yard_dash,
    throwing_arm,
    batting_side,
    twitter_url,
    instagram_url,
    youtube_url,
    hudl_url,
    target_schools,
    bio_privacy,
    contact_privacy,
    physical_stats_privacy,
    created_at,
    updated_at,
    -- Email is only visible to the profile owner or admins
    CASE 
      WHEN auth.uid() = user_id THEN email
      WHEN public.has_role(auth.uid(), 'admin') THEN email
      ELSE NULL
    END AS email
  FROM public.profiles
  WHERE auth.uid() IS NOT NULL;  -- Ensures only authenticated users can query

-- Grant access ONLY to authenticated users
GRANT SELECT ON public.profiles_public TO authenticated;

-- Security Fix: Ensure user_sessions_safe view is properly restricted
-- Drop and recreate with explicit owner-only access embedded in the view

DROP VIEW IF EXISTS public.user_sessions_safe;

CREATE VIEW public.user_sessions_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  session_token,
  device_info,
  -- Mask last octet of IP for privacy
  CASE 
    WHEN ip_address IS NOT NULL 
    THEN regexp_replace(ip_address::text, '\d+$', 'xxx')
    ELSE NULL
  END AS ip_address_masked,
  user_agent,
  browser,
  os,
  location,
  last_active_at,
  created_at,
  is_current
FROM public.user_sessions
WHERE auth.uid() = user_id;  -- Users can only see their own sessions

-- Grant access only to authenticated users (not anon)
GRANT SELECT ON public.user_sessions_safe TO authenticated;