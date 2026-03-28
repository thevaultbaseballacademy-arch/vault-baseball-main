
-- Add video_url column to exam_questions for video-based certification questions
ALTER TABLE public.exam_questions ADD COLUMN IF NOT EXISTS video_url text;

-- Add comment for documentation
COMMENT ON COLUMN public.exam_questions.video_url IS 'URL to video clip for video-based certification questions';
