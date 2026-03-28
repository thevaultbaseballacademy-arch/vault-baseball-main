-- Add AI recap columns to remote_lessons
ALTER TABLE remote_lessons ADD COLUMN IF NOT EXISTS ai_recap text;
ALTER TABLE remote_lessons ADD COLUMN IF NOT EXISTS ai_homework text;
ALTER TABLE remote_lessons ADD COLUMN IF NOT EXISTS recap_generated_at timestamptz;
