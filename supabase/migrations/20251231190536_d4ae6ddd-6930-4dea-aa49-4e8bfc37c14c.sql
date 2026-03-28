-- Add privacy columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN bio_privacy text NOT NULL DEFAULT 'public' 
CHECK (bio_privacy IN ('public', 'coaches_only', 'private'));

ALTER TABLE public.profiles 
ADD COLUMN contact_privacy text NOT NULL DEFAULT 'public' 
CHECK (contact_privacy IN ('public', 'coaches_only', 'private'));

ALTER TABLE public.profiles 
ADD COLUMN physical_stats_privacy text NOT NULL DEFAULT 'public' 
CHECK (physical_stats_privacy IN ('public', 'coaches_only', 'private'));

-- Drop existing SELECT policies and recreate with privacy awareness
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Coaches can view assigned athletes profiles" ON public.profiles;

-- Users can always view their own full profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can view basic public profile info (name, avatar, position)
-- Full details are controlled by the application layer based on privacy settings
CREATE POLICY "Anyone can view public profile basics" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Note: Privacy filtering for bio, contact, physical stats is handled in application layer
-- since we need granular field-level privacy, not row-level