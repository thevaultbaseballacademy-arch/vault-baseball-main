-- Create table for highlight videos
CREATE TABLE public.highlight_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.highlight_videos ENABLE ROW LEVEL SECURITY;

-- Users can view all highlight videos (public for recruiters)
CREATE POLICY "Anyone can view highlight videos"
ON public.highlight_videos FOR SELECT
USING (true);

-- Users can create their own videos
CREATE POLICY "Users can create own highlight videos"
ON public.highlight_videos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own videos
CREATE POLICY "Users can update own highlight videos"
ON public.highlight_videos FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own videos
CREATE POLICY "Users can delete own highlight videos"
ON public.highlight_videos FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_highlight_videos_updated_at
BEFORE UPDATE ON public.highlight_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for highlight videos
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('highlight-videos', 'highlight-videos', true, 104857600)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for highlight videos
CREATE POLICY "Users can upload own highlight videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'highlight-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own highlight videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'highlight-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own highlight videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'highlight-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Highlight videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'highlight-videos');