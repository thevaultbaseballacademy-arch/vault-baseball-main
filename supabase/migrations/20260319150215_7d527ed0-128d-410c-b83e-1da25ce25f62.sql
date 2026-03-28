
-- 1. remote_lessons: add format field for softball (fastpitch/slowpitch)
ALTER TABLE public.remote_lessons
  ADD COLUMN IF NOT EXISTS format text DEFAULT NULL;
COMMENT ON COLUMN public.remote_lessons.format IS 'Softball format: fastpitch | slowpitch. NULL for baseball.';

-- 2. video_analyses: add sport and tagging fields
ALTER TABLE public.video_analyses
  ADD COLUMN IF NOT EXISTS sport_type text NOT NULL DEFAULT 'baseball',
  ADD COLUMN IF NOT EXISTS skill_category text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS age_group text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pitch_type text DEFAULT NULL;
COMMENT ON COLUMN public.video_analyses.sport_type IS 'baseball | softball';
COMMENT ON COLUMN public.video_analyses.skill_category IS 'e.g. pitching, hitting, fielding, baserunning';
COMMENT ON COLUMN public.video_analyses.age_group IS 'e.g. 10U, 12U, 14U, HS, College';
COMMENT ON COLUMN public.video_analyses.pitch_type IS 'e.g. fastball, curveball, riseball, dropball';

-- 3. profiles: add softball_format field
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS softball_format text DEFAULT NULL;
COMMENT ON COLUMN public.profiles.softball_format IS 'fastpitch | slowpitch | both. NULL if sport_type is baseball.';

-- 4. session_bookings: add format field
ALTER TABLE public.session_bookings
  ADD COLUMN IF NOT EXISTS format text DEFAULT NULL;
COMMENT ON COLUMN public.session_bookings.format IS 'Softball format: fastpitch | slowpitch. NULL for baseball.';
