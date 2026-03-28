
-- Make coach-applications bucket private
UPDATE storage.buckets SET public = false WHERE id = 'coach-applications';
