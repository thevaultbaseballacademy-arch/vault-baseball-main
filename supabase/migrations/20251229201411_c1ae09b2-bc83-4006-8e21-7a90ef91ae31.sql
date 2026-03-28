-- Allow authenticated users to view basic profile info for notifications
CREATE POLICY "Authenticated users can view profiles for notifications" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);