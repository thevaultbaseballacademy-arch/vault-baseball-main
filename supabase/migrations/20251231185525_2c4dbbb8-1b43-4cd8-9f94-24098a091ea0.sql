-- Recreate admin policy
CREATE POLICY "Admins can view all highlight videos" 
ON public.highlight_videos 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));