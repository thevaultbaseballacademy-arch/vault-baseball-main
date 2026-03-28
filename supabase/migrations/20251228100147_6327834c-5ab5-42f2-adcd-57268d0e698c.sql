-- Create coach_alerts table for in-app notifications
CREATE TABLE public.coach_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_user_id UUID NOT NULL,
  athlete_user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_alerts ENABLE ROW LEVEL SECURITY;

-- Coaches can view their own alerts
CREATE POLICY "Coaches can view own alerts"
ON public.coach_alerts
FOR SELECT
USING (auth.uid() = coach_user_id AND has_role(auth.uid(), 'coach'));

-- Coaches can update their own alerts (mark as read)
CREATE POLICY "Coaches can update own alerts"
ON public.coach_alerts
FOR UPDATE
USING (auth.uid() = coach_user_id AND has_role(auth.uid(), 'coach'));

-- Coaches can delete their own alerts
CREATE POLICY "Coaches can delete own alerts"
ON public.coach_alerts
FOR DELETE
USING (auth.uid() = coach_user_id AND has_role(auth.uid(), 'coach'));

-- System can insert alerts (via service role or triggers)
CREATE POLICY "Coaches can insert alerts"
ON public.coach_alerts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'coach'));

-- Create index for faster queries
CREATE INDEX idx_coach_alerts_coach_user_id ON public.coach_alerts(coach_user_id);
CREATE INDEX idx_coach_alerts_created_at ON public.coach_alerts(created_at DESC);