-- Drop the existing public_profiles view 
DROP VIEW IF EXISTS public.public_profiles;

-- Create a secure function to get public profile info for a single user
CREATE OR REPLACE FUNCTION public.get_public_profile(target_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  player_position text,
  graduation_year integer
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
    p.position,
    p.graduation_year
  FROM public.profiles p
  WHERE p.user_id = target_user_id
$$;

-- Create a secure function to search public profiles (for mentions)
CREATE OR REPLACE FUNCTION public.search_public_profiles(search_term text, result_limit integer DEFAULT 10)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  player_position text,
  graduation_year integer
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
    p.position,
    p.graduation_year
  FROM public.profiles p
  WHERE p.display_name ILIKE '%' || search_term || '%'
  LIMIT result_limit
$$;

-- Create a secure function to get multiple public profiles by user IDs
CREATE OR REPLACE FUNCTION public.get_public_profiles_by_ids(user_ids uuid[])
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  player_position text,
  graduation_year integer
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
    p.position,
    p.graduation_year
  FROM public.profiles p
  WHERE p.user_id = ANY(user_ids)
$$;