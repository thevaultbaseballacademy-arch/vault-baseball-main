-- Add physical stats and social links to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS height_inches INTEGER,
ADD COLUMN IF NOT EXISTS weight_lbs INTEGER,
ADD COLUMN IF NOT EXISTS throwing_arm TEXT,
ADD COLUMN IF NOT EXISTS batting_side TEXT,
ADD COLUMN IF NOT EXISTS sixty_yard_dash DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS hudl_url TEXT;

-- Create table for athletic achievements/stats
CREATE TABLE public.athletic_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stat_type TEXT NOT NULL,
  stat_name TEXT NOT NULL,
  stat_value TEXT NOT NULL,
  season TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.athletic_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can view stats (for recruiters)
CREATE POLICY "Anyone can view athletic stats"
ON public.athletic_stats FOR SELECT
USING (true);

-- Users can manage their own stats
CREATE POLICY "Users can create own stats"
ON public.athletic_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
ON public.athletic_stats FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stats"
ON public.athletic_stats FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_athletic_stats_updated_at
BEFORE UPDATE ON public.athletic_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();