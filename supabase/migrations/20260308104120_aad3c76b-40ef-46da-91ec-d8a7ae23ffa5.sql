
INSERT INTO storage.buckets (id, name, public)
VALUES ('coach-applications', 'coach-applications', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload to coach-applications"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'coach-applications');

CREATE POLICY "Anyone can read coach-applications"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'coach-applications');
