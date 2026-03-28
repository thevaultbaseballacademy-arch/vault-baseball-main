
ALTER TABLE public.coaches
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS specialties text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS years_experience integer;
