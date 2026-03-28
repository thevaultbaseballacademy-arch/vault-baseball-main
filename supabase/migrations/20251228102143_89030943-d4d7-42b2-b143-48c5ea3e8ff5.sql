
-- Add profile customization columns
ALTER TABLE public.profiles
ADD COLUMN bio TEXT,
ADD COLUMN position TEXT,
ADD COLUMN graduation_year INTEGER,
ADD COLUMN target_schools TEXT[];
