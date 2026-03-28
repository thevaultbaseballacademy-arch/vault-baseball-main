-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles for notifications" ON public.profiles;

-- Create a public profile view with limited columns for community features
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id,
  display_name,
  avatar_url,
  position,
  graduation_year
FROM public.profiles;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.public_profiles IS 'Limited profile data for community features like mentions and notifications. Excludes sensitive fields like email, social URLs, etc.';