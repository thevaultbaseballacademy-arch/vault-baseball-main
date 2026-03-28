-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view course videos" ON public.course_videos;

-- Create policy for enrolled users to view course videos
CREATE POLICY "Enrolled users can view course videos"
ON public.course_videos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.course_enrollments ce
    WHERE ce.course_id = course_videos.course_id
      AND ce.user_id = auth.uid()
      AND ce.status = 'active'
  )
);

-- Admins can view all course videos
CREATE POLICY "Admins can view all course videos"
ON public.course_videos
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Coaches can view all course videos (for content review)
CREATE POLICY "Coaches can view all course videos"
ON public.course_videos
FOR SELECT
USING (has_role(auth.uid(), 'coach'::app_role));