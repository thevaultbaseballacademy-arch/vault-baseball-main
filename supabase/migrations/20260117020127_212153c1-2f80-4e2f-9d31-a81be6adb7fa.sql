-- Create data deletion requests table
CREATE TABLE public.data_deletion_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own deletion requests
CREATE POLICY "Users can view own deletion requests" 
ON public.data_deletion_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create deletion requests for themselves
CREATE POLICY "Users can create own deletion requests" 
ON public.data_deletion_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all deletion requests
CREATE POLICY "Admins can view all deletion requests" 
ON public.data_deletion_requests 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update deletion requests
CREATE POLICY "Admins can update deletion requests" 
ON public.data_deletion_requests 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_data_deletion_requests_updated_at
BEFORE UPDATE ON public.data_deletion_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();