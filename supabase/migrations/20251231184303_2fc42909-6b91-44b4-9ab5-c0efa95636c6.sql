-- Create a function for coaches to view assigned athlete profiles WITHOUT email
CREATE OR REPLACE FUNCTION public.get_assigned_athlete_profiles(coach_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  cover_url text,
  bio text,
  player_position text,
  graduation_year integer,
  height_inches integer,
  weight_lbs integer,
  sixty_yard_dash numeric,
  throwing_arm text,
  batting_side text,
  target_schools text[],
  twitter_url text,
  instagram_url text,
  youtube_url text,
  hudl_url text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.cover_url,
    p.bio,
    p.position as player_position,
    p.graduation_year,
    p.height_inches,
    p.weight_lbs,
    p.sixty_yard_dash,
    p.throwing_arm,
    p.batting_side,
    p.target_schools,
    p.twitter_url,
    p.instagram_url,
    p.youtube_url,
    p.hudl_url,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  INNER JOIN public.coach_athlete_assignments caa 
    ON caa.athlete_user_id = p.user_id
  WHERE caa.coach_user_id = coach_id
$$;

-- Create a function for coaches to get a single athlete profile WITHOUT email
CREATE OR REPLACE FUNCTION public.get_athlete_profile_for_coach(
  coach_id uuid,
  athlete_id uuid
)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  cover_url text,
  bio text,
  player_position text,
  graduation_year integer,
  height_inches integer,
  weight_lbs integer,
  sixty_yard_dash numeric,
  throwing_arm text,
  batting_side text,
  target_schools text[],
  twitter_url text,
  instagram_url text,
  youtube_url text,
  hudl_url text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.cover_url,
    p.bio,
    p.position as player_position,
    p.graduation_year,
    p.height_inches,
    p.weight_lbs,
    p.sixty_yard_dash,
    p.throwing_arm,
    p.batting_side,
    p.target_schools,
    p.twitter_url,
    p.instagram_url,
    p.youtube_url,
    p.hudl_url,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  INNER JOIN public.coach_athlete_assignments caa 
    ON caa.athlete_user_id = p.user_id
  WHERE caa.coach_user_id = coach_id
    AND p.user_id = athlete_id
$$;

-- Drop the old coach policy that exposes email
DROP POLICY IF EXISTS "Coaches can view assigned athletes profiles" ON public.profiles;