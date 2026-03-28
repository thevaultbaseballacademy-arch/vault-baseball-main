-- Update RLS policies for privacy-aware access

-- Fix 1: Profiles - require authentication for viewing
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Fix 2: Athletic stats - privacy-aware access
CREATE POLICY "Privacy-aware athletic stats access" 
ON public.athletic_stats 
FOR SELECT 
USING (
  auth.uid() = user_id
  OR privacy_level = 'public'
  OR (privacy_level = 'coaches_only' AND public.has_role(auth.uid(), 'coach'))
);

-- Fix 3: Highlight videos - privacy-aware access
CREATE POLICY "Privacy-aware highlight video access" 
ON public.highlight_videos 
FOR SELECT 
USING (
  auth.uid() = user_id
  OR privacy_level = 'public'
  OR (privacy_level = 'coaches_only' AND public.has_role(auth.uid(), 'coach'))
);

-- Fix 4: Certification questions - admin only direct access
CREATE POLICY "Only admins can directly access certification questions" 
ON public.certification_questions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));