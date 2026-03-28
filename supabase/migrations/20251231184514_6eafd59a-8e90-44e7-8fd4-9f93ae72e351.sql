-- Add is_preview column to mark free preview videos
ALTER TABLE public.course_videos 
ADD COLUMN is_preview boolean NOT NULL DEFAULT false;

-- Update the enrolled users policy to also allow viewing preview videos
DROP POLICY IF EXISTS "Enrolled users can view course videos" ON public.course_videos;

-- Enrolled users can view all videos for their courses
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

-- Anyone authenticated can view preview videos
CREATE POLICY "Anyone can view preview videos"
ON public.course_videos
FOR SELECT
USING (is_preview = true);