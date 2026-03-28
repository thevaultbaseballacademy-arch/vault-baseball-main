-- Create coach-athlete assignments table
CREATE TABLE public.coach_athlete_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id uuid NOT NULL,
  athlete_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (coach_user_id, athlete_user_id)
);

-- Enable RLS
ALTER TABLE public.coach_athlete_assignments ENABLE ROW LEVEL SECURITY;

-- Coaches can view their own assignments
CREATE POLICY "Coaches can view own assignments"
ON public.coach_athlete_assignments
FOR SELECT
USING (auth.uid() = coach_user_id AND has_role(auth.uid(), 'coach'::app_role));

-- Athletes can view who coaches them
CREATE POLICY "Athletes can view their coaches"
ON public.coach_athlete_assignments
FOR SELECT
USING (auth.uid() = athlete_user_id);

-- Admins can manage all assignments
CREATE POLICY "Admins can manage assignments"
ON public.coach_athlete_assignments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Drop the old overly permissive coach policy on athlete_checkins
DROP POLICY IF EXISTS "Coaches can view all checkins" ON public.athlete_checkins;

-- Create new policy: coaches can only view checkins for their assigned athletes
CREATE POLICY "Coaches can view assigned athletes checkins"
ON public.athlete_checkins
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.coach_athlete_assignments
    WHERE coach_athlete_assignments.coach_user_id = auth.uid()
    AND coach_athlete_assignments.athlete_user_id = athlete_checkins.user_id
  )
);