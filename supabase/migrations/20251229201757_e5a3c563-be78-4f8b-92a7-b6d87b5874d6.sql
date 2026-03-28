-- Create notification_analytics table to track engagement
CREATE TABLE public.notification_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'delivered', 'opened', 'clicked', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for efficient querying
CREATE INDEX idx_notification_analytics_notification_id ON public.notification_analytics(notification_id);
CREATE INDEX idx_notification_analytics_user_id ON public.notification_analytics(user_id);
CREATE INDEX idx_notification_analytics_event_type ON public.notification_analytics(event_type);
CREATE INDEX idx_notification_analytics_created_at ON public.notification_analytics(created_at);

-- Enable RLS
ALTER TABLE public.notification_analytics ENABLE ROW LEVEL SECURITY;

-- Policies: users can insert their own analytics, admins can view all
CREATE POLICY "Users can insert own analytics"
ON public.notification_analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics"
ON public.notification_analytics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));