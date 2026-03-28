-- Recreate the view with SECURITY INVOKER (the default, safer option)
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
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