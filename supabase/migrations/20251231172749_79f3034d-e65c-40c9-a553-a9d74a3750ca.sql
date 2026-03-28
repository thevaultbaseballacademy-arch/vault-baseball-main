-- Add column to track if expiration reminder was sent
ALTER TABLE public.user_certifications 
ADD COLUMN IF NOT EXISTS expiration_reminder_sent BOOLEAN DEFAULT false;

-- Add column to track when reminder was sent
ALTER TABLE public.user_certifications 
ADD COLUMN IF NOT EXISTS expiration_reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient querying of expiring certifications
CREATE INDEX IF NOT EXISTS idx_user_certifications_expires_at 
ON public.user_certifications(expires_at) 
WHERE status = 'active' AND expiration_reminder_sent = false;