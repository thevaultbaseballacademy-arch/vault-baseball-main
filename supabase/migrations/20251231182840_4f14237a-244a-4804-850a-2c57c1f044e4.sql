-- Clean up: Remove all overly permissive policies that still exist

-- Remove "Anyone can view athletic stats" - already replaced with proper policies
DROP POLICY IF EXISTS "Anyone can view athletic stats" ON public.athletic_stats;

-- Remove "Anyone can view highlight videos" - already replaced with proper policies  
DROP POLICY IF EXISTS "Anyone can view highlight videos" ON public.highlight_videos;

-- Remove "Anyone can view course videos" - already replaced with proper policies
DROP POLICY IF EXISTS "Anyone can view course videos" ON public.course_videos;

-- Remove "Anyone can view certification definitions" - already replaced with auth-required policy
DROP POLICY IF EXISTS "Anyone can view certification definitions" ON public.certification_definitions;

-- Remove "Coaches can view all profiles" - coaches should only see assigned athletes
DROP POLICY IF EXISTS "Coaches can view all profiles" ON public.profiles;