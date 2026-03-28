
-- Additive fields to existing lesson_outcomes
ALTER TABLE public.lesson_outcomes
  ADD COLUMN IF NOT EXISTS lesson_type TEXT,
  ADD COLUMN IF NOT EXISTS skills_worked TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS programs_assigned JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS courses_recommended JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS parent_summary TEXT;
