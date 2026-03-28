-- Create scheduled_broadcasts table
CREATE TABLE public.scheduled_broadcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'cancelled'
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  notified_count INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_scheduled_broadcasts_status ON public.scheduled_broadcasts(status);
CREATE INDEX idx_scheduled_broadcasts_scheduled_at ON public.scheduled_broadcasts(scheduled_at);

-- Enable RLS
ALTER TABLE public.scheduled_broadcasts ENABLE ROW LEVEL SECURITY;

-- Only admins can manage scheduled broadcasts
CREATE POLICY "Admins can view all scheduled broadcasts"
ON public.scheduled_broadcasts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create scheduled broadcasts"
ON public.scheduled_broadcasts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update scheduled broadcasts"
ON public.scheduled_broadcasts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete scheduled broadcasts"
ON public.scheduled_broadcasts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;