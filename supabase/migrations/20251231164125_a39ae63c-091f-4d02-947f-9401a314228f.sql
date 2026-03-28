-- Create table for storing course video URLs
CREATE TABLE public.course_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL UNIQUE,
  video_url TEXT NOT NULL,
  video_platform TEXT DEFAULT 'youtube',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read video URLs (for course content)
CREATE POLICY "Anyone can view course videos"
ON public.course_videos
FOR SELECT
USING (true);

-- Only admins and coaches can manage videos
CREATE POLICY "Admins and coaches can insert videos"
ON public.course_videos
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'coach')
);

CREATE POLICY "Admins and coaches can update videos"
ON public.course_videos
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'coach')
);

CREATE POLICY "Admins and coaches can delete videos"
ON public.course_videos
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'coach')
);

-- Add trigger for updated_at
CREATE TRIGGER update_course_videos_updated_at
BEFORE UPDATE ON public.course_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for fast lookups
CREATE INDEX idx_course_videos_lesson_id ON public.course_videos(lesson_id);
CREATE INDEX idx_course_videos_course_id ON public.course_videos(course_id);