-- Create athlete_kpi_goals table for target setting
CREATE TABLE public.athlete_kpi_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kpi_category TEXT NOT NULL CHECK (kpi_category IN ('performance', 'physical', 'training')),
  kpi_name TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  kpi_unit TEXT,
  target_date DATE,
  notes TEXT,
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, kpi_category, kpi_name)
);

-- Enable Row Level Security
ALTER TABLE public.athlete_kpi_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own goals" 
ON public.athlete_kpi_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.athlete_kpi_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.athlete_kpi_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.athlete_kpi_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow coaches to view their athletes' goals
CREATE POLICY "Coaches can view assigned athlete goals"
ON public.athlete_kpi_goals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.coach_athlete_assignments
    WHERE coach_user_id = auth.uid()
    AND athlete_user_id = athlete_kpi_goals.user_id
    AND is_active = true
    AND athlete_approved = true
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_athlete_kpi_goals_updated_at
BEFORE UPDATE ON public.athlete_kpi_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();