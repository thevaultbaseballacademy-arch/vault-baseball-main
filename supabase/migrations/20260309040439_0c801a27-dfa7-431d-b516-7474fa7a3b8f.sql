-- Fix coach-applications storage exposure
-- Drop the residual public-read policy that allows unauthenticated access
DROP POLICY IF EXISTS "Anyone can read coach-applications" ON storage.objects;

-- Only the applying coach can read their own files
CREATE POLICY "Coaches can read own application files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'coach-applications'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can read all coach application files
CREATE POLICY "Admins can read all coach application files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'coach-applications'
    AND public.has_role(auth.uid(), 'admin')
  );