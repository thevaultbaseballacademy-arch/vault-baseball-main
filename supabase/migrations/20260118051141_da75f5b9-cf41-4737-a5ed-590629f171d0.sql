-- Create activity_feed table for live activity events
CREATE TABLE public.activity_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Everyone can read activity feed (public social proof)
CREATE POLICY "Activity feed is publicly readable" 
ON public.activity_feed 
FOR SELECT 
USING (true);

-- Authenticated users can create activity entries
CREATE POLICY "Authenticated users can create activities" 
ON public.activity_feed 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime for activity_feed table
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;

-- Create index for faster queries
CREATE INDEX idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX idx_activity_feed_type ON public.activity_feed(activity_type);