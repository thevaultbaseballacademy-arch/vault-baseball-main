-- Create a table to track trial subscriptions
CREATE TABLE public.user_trials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  trial_type TEXT NOT NULL DEFAULT 'velocity_baseline',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_trials ENABLE ROW LEVEL SECURITY;

-- Create policies for trial access
CREATE POLICY "Users can view their own trial" 
ON public.user_trials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trial" 
ON public.user_trials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_trials_updated_at
BEFORE UPDATE ON public.user_trials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();