
-- Fix community-media storage bucket security
-- Make the bucket private
UPDATE storage.buckets SET public = false WHERE id = 'community-media';

-- Drop the public SELECT policy that allows anyone to view
DROP POLICY IF EXISTS "Anyone can view community media" ON storage.objects;

-- Create a new policy that restricts viewing to authenticated users only
CREATE POLICY "Authenticated users can view community media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'community-media');
