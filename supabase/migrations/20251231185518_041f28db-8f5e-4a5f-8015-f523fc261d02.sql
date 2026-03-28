-- Drop the conflicting admin policy and recreate
DROP POLICY IF EXISTS "Admins can view all highlight videos" ON public.highlight_videos;