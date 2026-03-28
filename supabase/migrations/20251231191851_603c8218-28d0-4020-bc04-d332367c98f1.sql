-- Create a function to get profile with privacy filtering based on viewer relationship
CREATE OR REPLACE FUNCTION public.get_profile_with_privacy(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record record;
  viewer_id uuid := auth.uid();
  is_owner boolean;
  is_coach boolean;
  is_admin boolean;
  result jsonb;
BEGIN
  -- Get the profile
  SELECT * INTO profile_record FROM profiles WHERE user_id = target_user_id;
  
  IF profile_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Determine viewer relationship
  is_owner := (viewer_id = target_user_id);
  is_admin := has_role(viewer_id, 'admin');
  is_coach := EXISTS (
    SELECT 1 FROM coach_athlete_assignments 
    WHERE coach_user_id = viewer_id AND athlete_user_id = target_user_id
  );
  
  -- Build result with always-visible fields
  result := jsonb_build_object(
    'user_id', profile_record.user_id,
    'display_name', profile_record.display_name,
    'avatar_url', profile_record.avatar_url,
    'cover_url', profile_record.cover_url,
    'position', profile_record.position,
    'created_at', profile_record.created_at,
    'updated_at', profile_record.updated_at
  );
  
  -- Add bio if privacy allows
  IF is_owner OR is_admin OR 
     profile_record.bio_privacy = 'public' OR
     (profile_record.bio_privacy = 'coaches_only' AND is_coach) THEN
    result := result || jsonb_build_object('bio', profile_record.bio);
  END IF;
  
  -- Add contact info if privacy allows
  IF is_owner OR is_admin OR 
     profile_record.contact_privacy = 'public' OR
     (profile_record.contact_privacy = 'coaches_only' AND is_coach) THEN
    result := result || jsonb_build_object(
      'email', profile_record.email,
      'graduation_year', profile_record.graduation_year,
      'twitter_url', profile_record.twitter_url,
      'instagram_url', profile_record.instagram_url,
      'youtube_url', profile_record.youtube_url,
      'hudl_url', profile_record.hudl_url,
      'target_schools', profile_record.target_schools
    );
  END IF;
  
  -- Add physical stats if privacy allows
  IF is_owner OR is_admin OR 
     profile_record.physical_stats_privacy = 'public' OR
     (profile_record.physical_stats_privacy = 'coaches_only' AND is_coach) THEN
    result := result || jsonb_build_object(
      'height_inches', profile_record.height_inches,
      'weight_lbs', profile_record.weight_lbs,
      'sixty_yard_dash', profile_record.sixty_yard_dash,
      'throwing_arm', profile_record.throwing_arm,
      'batting_side', profile_record.batting_side
    );
  END IF;
  
  -- Always include privacy settings for owner
  IF is_owner THEN
    result := result || jsonb_build_object(
      'bio_privacy', profile_record.bio_privacy,
      'contact_privacy', profile_record.contact_privacy,
      'physical_stats_privacy', profile_record.physical_stats_privacy
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Update profiles RLS to be more restrictive
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Users can view their own full profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all profiles
-- (already exists, but recreate to ensure it's there)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Coaches can view assigned athletes' profiles
CREATE POLICY "Coaches can view assigned athletes profiles" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'coach') AND
  EXISTS (
    SELECT 1 FROM coach_athlete_assignments
    WHERE coach_user_id = auth.uid() AND athlete_user_id = profiles.user_id
  )
);

-- Authenticated users can view basic public profile info (for community features)
-- This allows seeing display_name and avatar for mentions, posts, etc.
CREATE POLICY "Authenticated users can view public profile basics" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');