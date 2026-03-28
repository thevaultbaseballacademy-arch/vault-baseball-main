-- Create athlete_checkins table
CREATE TABLE public.athlete_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Training metrics
  training_completed BOOLEAN DEFAULT false,
  training_type TEXT,
  training_duration_minutes INTEGER,
  training_intensity INTEGER CHECK (training_intensity >= 1 AND training_intensity <= 10),
  
  -- Recovery metrics
  sleep_hours NUMERIC(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  soreness_level INTEGER CHECK (soreness_level >= 1 AND soreness_level <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  
  -- Mood/wellness
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- One check-in per user per day
  UNIQUE(user_id, checkin_date)
);

-- Enable Row Level Security
ALTER TABLE public.athlete_checkins ENABLE ROW LEVEL SECURITY;

-- Users can view their own check-ins
CREATE POLICY "Users can view their own checkins"
ON public.athlete_checkins
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own check-ins
CREATE POLICY "Users can create their own checkins"
ON public.athlete_checkins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own check-ins
CREATE POLICY "Users can update their own checkins"
ON public.athlete_checkins
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_athlete_checkins_updated_at
BEFORE UPDATE ON public.athlete_checkins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();