-- Create athlete_kpis table for tracking performance metrics, physical measurements, and training progress
CREATE TABLE public.athlete_kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kpi_category TEXT NOT NULL CHECK (kpi_category IN ('performance', 'physical', 'training')),
  kpi_name TEXT NOT NULL,
  kpi_value NUMERIC NOT NULL,
  kpi_unit TEXT,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_athlete_kpis_user_id ON public.athlete_kpis(user_id);
CREATE INDEX idx_athlete_kpis_category ON public.athlete_kpis(kpi_category);
CREATE INDEX idx_athlete_kpis_recorded_at ON public.athlete_kpis(recorded_at);

-- Enable Row Level Security
ALTER TABLE public.athlete_kpis ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own KPIs" 
ON public.athlete_kpis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own KPIs" 
ON public.athlete_kpis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KPIs" 
ON public.athlete_kpis 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own KPIs" 
ON public.athlete_kpis 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_athlete_kpis_updated_at
BEFORE UPDATE ON public.athlete_kpis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();