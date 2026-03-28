-- Add privacy_level column to athletic_stats
ALTER TABLE public.athletic_stats 
ADD COLUMN privacy_level text NOT NULL DEFAULT 'public' 
CHECK (privacy_level IN ('public', 'coaches_only', 'private'));

-- Drop existing SELECT policies to recreate with privacy
DROP POLICY IF EXISTS "Users can view own athletic stats" ON public.athletic_stats;
DROP POLICY IF EXISTS "Coaches can view assigned athletes stats" ON public.athletic_stats;
DROP POLICY IF EXISTS "Admins can view all athletic stats" ON public.athletic_stats;

-- Create new RLS policies respecting privacy settings
CREATE POLICY "Users can view own athletic stats" 
ON public.athletic_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public athletic stats" 
ON public.athletic_stats 
FOR SELECT 
USING (privacy_level = 'public');

CREATE POLICY "Coaches can view coaches_only stats of assigned athletes" 
ON public.athletic_stats 
FOR SELECT 
USING (
  privacy_level IN ('public', 'coaches_only') 
  AND EXISTS (
    SELECT 1 FROM public.coach_athlete_assignments 
    WHERE coach_user_id = auth.uid() 
    AND athlete_user_id = athletic_stats.user_id
  )
);

CREATE POLICY "Admins can view all athletic stats" 
ON public.athletic_stats 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));