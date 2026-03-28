
-- Create course certificates table
CREATE TABLE public.course_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE DEFAULT ('VAULT-' || upper(substring(md5(random()::text) from 1 for 8))),
  course_title TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completion_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for user lookups
CREATE INDEX idx_course_certificates_user_id ON public.course_certificates(user_id);
CREATE INDEX idx_course_certificates_course_id ON public.course_certificates(course_id);
CREATE INDEX idx_course_certificates_number ON public.course_certificates(certificate_number);

-- Enable RLS
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view their own certificates"
ON public.course_certificates
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own certificates
CREATE POLICY "Users can create their own certificates"
ON public.course_certificates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to verify certificate publicly
CREATE OR REPLACE FUNCTION public.verify_course_certificate(cert_number TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'valid', true,
    'certificate_number', c.certificate_number,
    'course_title', c.course_title,
    'recipient_name', c.recipient_name,
    'issued_at', c.issued_at,
    'completion_date', c.completion_date
  ) INTO result
  FROM public.course_certificates c
  WHERE c.certificate_number = cert_number;
  
  IF result IS NULL THEN
    RETURN json_build_object('valid', false, 'message', 'Certificate not found');
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
