-- Add column to track if 7-day final warning was sent
ALTER TABLE public.user_certifications 
ADD COLUMN IF NOT EXISTS final_warning_sent BOOLEAN DEFAULT false;

-- Add column to track when final warning was sent
ALTER TABLE public.user_certifications 
ADD COLUMN IF NOT EXISTS final_warning_sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient querying of certifications needing final warning
CREATE INDEX IF NOT EXISTS idx_user_certifications_final_warning 
ON public.user_certifications(expires_at) 
WHERE status = 'active' AND final_warning_sent = false;