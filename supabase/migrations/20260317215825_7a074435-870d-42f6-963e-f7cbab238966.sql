
-- Add sport_type column to profiles table (default 'baseball' to preserve existing users)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sport_type text NOT NULL DEFAULT 'baseball';

-- Create an index for fast sport_type filtering
CREATE INDEX IF NOT EXISTS idx_profiles_sport_type ON public.profiles(sport_type);
