-- Fix the certificate_verification view to use SECURITY INVOKER instead of SECURITY DEFINER
-- This ensures the view uses the querying user's permissions, not the view creator's

DROP VIEW IF EXISTS public.certificate_verification;

CREATE VIEW public.certificate_verification 
WITH (security_invoker = true)
AS
SELECT 
  certificate_number,
  certification_type,
  status,
  expires_at,
  CASE WHEN status = 'active' AND expires_at > now() THEN true ELSE false END as is_valid
FROM public.user_certifications
WHERE certificate_number IS NOT NULL;

-- Grant SELECT on the view to allow public verification
GRANT SELECT ON public.certificate_verification TO anon, authenticated;

-- Since the view now uses SECURITY INVOKER and needs anon access for public verification,
-- we need a limited policy that allows anyone to read the minimal verification data
-- But this would defeat the purpose - instead, create a function for verification

-- Drop the view approach and use a secure function instead
DROP VIEW IF EXISTS public.certificate_verification;

-- Create a secure function that only returns verification status
CREATE OR REPLACE FUNCTION public.verify_certificate(cert_number text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'certificate_number', certificate_number,
    'certification_type', certification_type,
    'is_valid', CASE WHEN status = 'active' AND expires_at > now() THEN true ELSE false END,
    'expires_at', expires_at
  )
  FROM public.user_certifications
  WHERE certificate_number = cert_number
  LIMIT 1
$$;