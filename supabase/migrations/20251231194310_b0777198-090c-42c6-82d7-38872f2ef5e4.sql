
-- Add is_active column to coach_athlete_assignments
ALTER TABLE public.coach_athlete_assignments 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coach_athlete_active 
ON public.coach_athlete_assignments(coach_user_id, athlete_user_id, is_active);

-- Create security definer function to check active coach assignment
CREATE OR REPLACE FUNCTION public.is_active_coach_for_athlete(_coach_id uuid, _athlete_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.coach_athlete_assignments
    WHERE coach_user_id = _coach_id
      AND athlete_user_id = _athlete_id
      AND is_active = true
  )
$$;

-- Drop old policies
DROP POLICY IF EXISTS "Comprehensive athletic stats access" ON public.athletic_stats;
DROP POLICY IF EXISTS "Comprehensive highlight videos access" ON public.highlight_videos;

-- Create updated athletic_stats policy with is_active check
CREATE POLICY "Comprehensive athletic stats access"
ON public.athletic_stats
FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin')
  OR (privacy_level = 'public' AND auth.role() = 'authenticated')
  OR (
    privacy_level IN ('public', 'coaches_only') 
    AND has_role(auth.uid(), 'coach') 
    AND is_active_coach_for_athlete(auth.uid(), user_id)
  )
);

-- Create updated highlight_videos policy with is_active check
CREATE POLICY "Comprehensive highlight videos access"
ON public.highlight_videos
FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin')
  OR (privacy_level = 'public' AND auth.role() = 'authenticated')
  OR (
    privacy_level IN ('public', 'coaches_only') 
    AND has_role(auth.uid(), 'coach') 
    AND is_active_coach_for_athlete(auth.uid(), user_id)
  )
);

-- Create function to get coach user_id from display name
CREATE OR REPLACE FUNCTION public.get_coach_user_id_by_name(_coach_name text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON ur.user_id = p.user_id
  WHERE p.display_name = _coach_name
    AND ur.role = 'coach'
  LIMIT 1
$$;

-- Add policy for coaches to view sessions they conduct
CREATE POLICY "Coaches can view sessions they conduct"
ON public.coaching_sessions
FOR SELECT
USING (
  auth.uid() = get_coach_user_id_by_name(coach_name)
  OR has_role(auth.uid(), 'admin')
);
