-- Consolidate athletic_stats SELECT policies into one comprehensive policy
DROP POLICY IF EXISTS "Admins can view all athletic stats" ON public.athletic_stats;
DROP POLICY IF EXISTS "Coaches can view coaches_only stats of assigned athletes" ON public.athletic_stats;
DROP POLICY IF EXISTS "Privacy-aware athletic stats access" ON public.athletic_stats;

CREATE POLICY "Comprehensive athletic stats access" 
ON public.athletic_stats 
FOR SELECT 
USING (
  -- Owner can always view their own stats
  auth.uid() = user_id
  OR
  -- Admins can view all stats
  has_role(auth.uid(), 'admin')
  OR
  -- Public stats visible to all authenticated users
  (privacy_level = 'public' AND auth.role() = 'authenticated')
  OR
  -- Coaches can view public/coaches_only stats of assigned athletes only
  (privacy_level IN ('public', 'coaches_only') 
   AND has_role(auth.uid(), 'coach')
   AND EXISTS (
     SELECT 1 FROM coach_athlete_assignments
     WHERE coach_user_id = auth.uid() AND athlete_user_id = athletic_stats.user_id
   ))
);

-- Consolidate highlight_videos SELECT policies into one comprehensive policy
DROP POLICY IF EXISTS "Admins can view all highlight videos" ON public.highlight_videos;
DROP POLICY IF EXISTS "Coaches can view assigned athletes videos" ON public.highlight_videos;
DROP POLICY IF EXISTS "Privacy-aware highlight video access" ON public.highlight_videos;
DROP POLICY IF EXISTS "Users can view own highlight videos" ON public.highlight_videos;

CREATE POLICY "Comprehensive highlight videos access" 
ON public.highlight_videos 
FOR SELECT 
USING (
  -- Owner can always view their own videos
  auth.uid() = user_id
  OR
  -- Admins can view all videos
  has_role(auth.uid(), 'admin')
  OR
  -- Public videos visible to all authenticated users
  (privacy_level = 'public' AND auth.role() = 'authenticated')
  OR
  -- Coaches can view public/coaches_only videos of assigned athletes only
  (privacy_level IN ('public', 'coaches_only') 
   AND has_role(auth.uid(), 'coach')
   AND EXISTS (
     SELECT 1 FROM coach_athlete_assignments
     WHERE coach_user_id = auth.uid() AND athlete_user_id = highlight_videos.user_id
   ))
);