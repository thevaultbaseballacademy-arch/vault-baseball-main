-- Add policy for coaches to view their assigned athletes' KPIs
CREATE POLICY "Coaches can view assigned athlete KPIs"
ON public.athlete_kpis
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.coach_athlete_assignments
    WHERE coach_user_id = auth.uid()
    AND athlete_user_id = athlete_kpis.user_id
    AND is_active = true
    AND athlete_approved = true
  )
);

-- Create coach_kpi_comments table for coach feedback
CREATE TABLE public.coach_kpi_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_user_id UUID NOT NULL,
  athlete_user_id UUID NOT NULL,
  kpi_category TEXT NOT NULL,
  kpi_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.coach_kpi_comments ENABLE ROW LEVEL SECURITY;

-- Coaches can create comments for their assigned athletes
CREATE POLICY "Coaches can create comments for assigned athletes"
ON public.coach_kpi_comments
FOR INSERT
WITH CHECK (
  auth.uid() = coach_user_id AND
  EXISTS (
    SELECT 1 FROM public.coach_athlete_assignments
    WHERE coach_user_id = auth.uid()
    AND athlete_user_id = coach_kpi_comments.athlete_user_id
    AND is_active = true
    AND athlete_approved = true
  )
);

-- Coaches can view their own comments
CREATE POLICY "Coaches can view their own comments"
ON public.coach_kpi_comments
FOR SELECT
USING (auth.uid() = coach_user_id);

-- Athletes can view comments on their KPIs
CREATE POLICY "Athletes can view comments on their KPIs"
ON public.coach_kpi_comments
FOR SELECT
USING (auth.uid() = athlete_user_id);

-- Coaches can update their own comments
CREATE POLICY "Coaches can update their own comments"
ON public.coach_kpi_comments
FOR UPDATE
USING (auth.uid() = coach_user_id);

-- Coaches can delete their own comments
CREATE POLICY "Coaches can delete their own comments"
ON public.coach_kpi_comments
FOR DELETE
USING (auth.uid() = coach_user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_coach_kpi_comments_updated_at
BEFORE UPDATE ON public.coach_kpi_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();