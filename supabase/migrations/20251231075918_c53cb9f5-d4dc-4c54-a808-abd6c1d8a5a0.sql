-- Create custom training schedules table for coaches
CREATE TABLE public.custom_training_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  position TEXT,
  training_phase TEXT,
  schedule_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedule assignments table
CREATE TABLE public.schedule_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.custom_training_schedules(id) ON DELETE CASCADE,
  athlete_user_id UUID NOT NULL,
  assigned_by UUID NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(schedule_id, athlete_user_id)
);

-- Enable RLS
ALTER TABLE public.custom_training_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_training_schedules
CREATE POLICY "Coaches can create schedules"
ON public.custom_training_schedules
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'coach') AND auth.uid() = coach_user_id);

CREATE POLICY "Coaches can view own schedules"
ON public.custom_training_schedules
FOR SELECT
USING (auth.uid() = coach_user_id AND has_role(auth.uid(), 'coach'));

CREATE POLICY "Coaches can update own schedules"
ON public.custom_training_schedules
FOR UPDATE
USING (auth.uid() = coach_user_id AND has_role(auth.uid(), 'coach'));

CREATE POLICY "Coaches can delete own schedules"
ON public.custom_training_schedules
FOR DELETE
USING (auth.uid() = coach_user_id AND has_role(auth.uid(), 'coach'));

CREATE POLICY "Athletes can view assigned schedules"
ON public.custom_training_schedules
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.schedule_assignments sa
  WHERE sa.schedule_id = id
  AND sa.athlete_user_id = auth.uid()
  AND sa.is_active = true
));

-- RLS policies for schedule_assignments
CREATE POLICY "Coaches can create assignments for own schedules"
ON public.schedule_assignments
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'coach') 
  AND auth.uid() = assigned_by
  AND EXISTS (
    SELECT 1 FROM public.custom_training_schedules cts
    WHERE cts.id = schedule_id AND cts.coach_user_id = auth.uid()
  )
);

CREATE POLICY "Coaches can view assignments for own schedules"
ON public.schedule_assignments
FOR SELECT
USING (
  has_role(auth.uid(), 'coach')
  AND EXISTS (
    SELECT 1 FROM public.custom_training_schedules cts
    WHERE cts.id = schedule_id AND cts.coach_user_id = auth.uid()
  )
);

CREATE POLICY "Coaches can update assignments for own schedules"
ON public.schedule_assignments
FOR UPDATE
USING (
  has_role(auth.uid(), 'coach')
  AND EXISTS (
    SELECT 1 FROM public.custom_training_schedules cts
    WHERE cts.id = schedule_id AND cts.coach_user_id = auth.uid()
  )
);

CREATE POLICY "Coaches can delete assignments for own schedules"
ON public.schedule_assignments
FOR DELETE
USING (
  has_role(auth.uid(), 'coach')
  AND EXISTS (
    SELECT 1 FROM public.custom_training_schedules cts
    WHERE cts.id = schedule_id AND cts.coach_user_id = auth.uid()
  )
);

CREATE POLICY "Athletes can view own assignments"
ON public.schedule_assignments
FOR SELECT
USING (auth.uid() = athlete_user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_custom_training_schedules_updated_at
BEFORE UPDATE ON public.custom_training_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedule_assignments_updated_at
BEFORE UPDATE ON public.schedule_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();