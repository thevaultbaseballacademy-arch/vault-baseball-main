-- Fix: Remove overly permissive public profiles policy that exposes email addresses
-- The existing get_public_profile() function already filters out sensitive fields properly

-- Drop the vulnerable policy that exposes ALL columns including email
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- Create a new, safer policy that only allows viewing NON-SENSITIVE fields for public profiles
-- This policy restricts what columns can be returned based on the calling context
-- Since PostgreSQL RLS cannot do column-level restrictions, we use a different approach:
-- Public access is ONLY allowed through the existing SECURITY DEFINER functions that filter columns

-- Instead of allowing direct table access for public profiles, 
-- we'll rely on the existing get_public_profile() and search_public_profiles() functions
-- which properly exclude email and other sensitive fields

-- The remaining policies (own profile, admin, coach) are sufficient and secure:
-- - "Users can view own profile" - allows users to see their own data
-- - "Admins can view all profiles" - admin access
-- - "Coaches can view assigned athlete profiles" - coach access for assigned athletes
-- - "Coaches can view assigned athletes profiles" - alternative coach access

-- Add a comment explaining the security model
COMMENT ON TABLE public.profiles IS 'User profiles - public access is restricted through get_public_profile() and search_public_profiles() functions which filter out email and other sensitive fields. Direct table access for public profiles is disabled to prevent email scraping.';