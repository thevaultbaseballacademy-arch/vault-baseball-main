-- Fix the logic error in "Athletes can view assigned schedules" policy
-- The bug: sa.schedule_id = sa.id (comparing same table's columns)
-- Should be: sa.schedule_id = custom_training_schedules.id

DROP POLICY IF EXISTS "Athletes can view assigned schedules" ON public.custom_training_schedules;

CREATE POLICY "Athletes can view assigned schedules"
ON public.custom_training_schedules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schedule_assignments sa
    WHERE sa.schedule_id = custom_training_schedules.id
    AND sa.athlete_user_id = auth.uid()
    AND sa.is_active = true
  )
);