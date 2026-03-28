
-- Additive fields to video_analyses (phase timestamps & annotation data)
ALTER TABLE public.video_analyses
  ADD COLUMN IF NOT EXISTS phase_timestamps JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS annotation_data JSONB DEFAULT '{}';

-- Additive sport_type to highlight_videos
ALTER TABLE public.highlight_videos
  ADD COLUMN IF NOT EXISTS sport_type TEXT DEFAULT 'baseball';

-- Additive sport_type to course_videos
ALTER TABLE public.course_videos
  ADD COLUMN IF NOT EXISTS sport_type TEXT DEFAULT 'baseball';
