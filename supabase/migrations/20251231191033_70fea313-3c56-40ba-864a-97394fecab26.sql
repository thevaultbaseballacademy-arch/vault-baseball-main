-- Add privacy_level column to highlight_videos table
ALTER TABLE public.highlight_videos 
ADD COLUMN privacy_level text NOT NULL DEFAULT 'public';