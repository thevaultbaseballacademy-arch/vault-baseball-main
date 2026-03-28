-- Remove the overly permissive policy that exposes all profile data
DROP POLICY IF EXISTS "Authenticated users can view public profile basics" ON public.profiles;

-- The remaining policies are:
-- 1. Users can view own profile (for full access to your own data)
-- 2. Admins can view all profiles (for admin functionality)
-- 3. Coaches can view assigned athletes profiles (for coaching features)

-- For community features (mentions, post authors, etc.), the get_public_profile function 
-- should be used which only returns safe public fields (display_name, avatar, position)