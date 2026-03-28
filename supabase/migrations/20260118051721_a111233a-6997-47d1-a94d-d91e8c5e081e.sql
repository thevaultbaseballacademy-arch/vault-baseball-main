-- Create weekly_tips table for admin-managed tips
CREATE TABLE public.weekly_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.weekly_tips ENABLE ROW LEVEL SECURITY;

-- Everyone can read active tips
CREATE POLICY "Anyone can read active tips"
ON public.weekly_tips
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Only admins can manage tips
CREATE POLICY "Admins can manage tips"
ON public.weekly_tips
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_tips;

-- Add updated_at trigger
CREATE TRIGGER update_weekly_tips_updated_at
BEFORE UPDATE ON public.weekly_tips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();