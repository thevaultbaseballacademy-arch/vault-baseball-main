-- Re-add the proper SELECT policies that may not have been created

-- Athletic Stats: Users can view own, coaches can view assigned athletes, admins can view all
CREATE POLICY "Users can view own athletic stats"
ON public.athletic_stats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view assigned athletes stats"
ON public.athletic_stats
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coach_athlete_assignments
    WHERE coach_user_id = auth.uid() 
    AND athlete_user_id = athletic_stats.user_id
  )
);

CREATE POLICY "Admins can view all athletic stats"
ON public.athletic_stats
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Highlight Videos: Users can view own, coaches can view assigned athletes, admins can view all
CREATE POLICY "Users can view own highlight videos"
ON public.highlight_videos
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view assigned athletes videos"
ON public.highlight_videos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coach_athlete_assignments
    WHERE coach_user_id = auth.uid() 
    AND athlete_user_id = highlight_videos.user_id
  )
);

CREATE POLICY "Admins can view all highlight videos"
ON public.highlight_videos
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Course Videos: Authenticated users can view (enrolled check could be added later)
CREATE POLICY "Authenticated users can view course videos"
ON public.course_videos
FOR SELECT
TO authenticated
USING (true);

-- Certification Definitions: Authenticated users can view
CREATE POLICY "Authenticated users can view certification definitions"
ON public.certification_definitions
FOR SELECT
TO authenticated
USING (true);