ALTER TABLE public.athlete_onboarding
  ADD COLUMN IF NOT EXISTS athlete_name text,
  ADD COLUMN IF NOT EXISTS parent_name text,
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS biggest_struggle text,
  ADD COLUMN IF NOT EXISTS training_history text;