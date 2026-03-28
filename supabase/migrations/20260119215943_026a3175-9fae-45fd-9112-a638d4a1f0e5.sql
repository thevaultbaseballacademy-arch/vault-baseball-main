-- Security Fix 1: Create secure view for device_integrations that hides sensitive credentials
-- The view will only show non-sensitive metadata, while credentials remain protected

-- Create a secure view that excludes API credentials
CREATE OR REPLACE VIEW public.device_integrations_safe
WITH (security_invoker=on) AS
  SELECT 
    id,
    user_id,
    device_type,
    is_connected,
    last_sync_at,
    token_expires_at,
    created_at,
    updated_at
    -- Excluded: api_key, api_secret, access_token, refresh_token
  FROM public.device_integrations;

-- Grant access to the safe view
GRANT SELECT ON public.device_integrations_safe TO authenticated;

-- Security Fix 2: Create secure view for profiles that excludes email from public access
-- Only the profile owner and admins should see the email

-- Create a secure profile view that conditionally shows email
CREATE OR REPLACE VIEW public.profiles_public
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
  FROM public.profiles;

-- Grant access to the public profile view
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;

-- Create a function to get profile safely without exposing email to coaches
CREATE OR REPLACE FUNCTION public.get_profile_safe(target_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  display_name TEXT,
  bio TEXT,
  "position" TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  graduation_year INTEGER,
  height_inches INTEGER,
  weight_lbs INTEGER,
  sixty_yard_dash NUMERIC,
  throwing_arm TEXT,
  batting_side TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  hudl_url TEXT,
  target_schools TEXT[],
  bio_privacy TEXT,
  contact_privacy TEXT,
  physical_stats_privacy TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  email TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.bio,
    p."position",
    p.avatar_url,
    p.cover_url,
    p.graduation_year,
    p.height_inches,
    p.weight_lbs,
    p.sixty_yard_dash,
    p.throwing_arm,
    p.batting_side,
    p.twitter_url,
    p.instagram_url,
    p.youtube_url,
    p.hudl_url,
    p.target_schools,
    p.bio_privacy,
    p.contact_privacy,
    p.physical_stats_privacy,
    p.created_at,
    p.updated_at,
    -- Only show email to the owner or admins
    CASE 
      WHEN auth.uid() = p.user_id THEN p.email
      WHEN has_role(auth.uid(), 'admin') THEN p.email
      ELSE NULL
    END AS email
  FROM profiles p
  WHERE p.user_id = target_user_id
    AND (
      -- User can view own profile
      auth.uid() = target_user_id
      -- Admins can view all
      OR has_role(auth.uid(), 'admin')
      -- Coaches can view assigned athletes (but won't see email)
      OR (
        has_role(auth.uid(), 'coach') 
        AND EXISTS (
          SELECT 1 FROM coach_athlete_assignments ca
          WHERE ca.coach_user_id = auth.uid()
          AND ca.athlete_user_id = target_user_id
          AND ca.is_active = true
          AND ca.athlete_approved = true
        )
      )
    );
$$;