-- Remove the overly permissive public access policy for certificate verification
DROP POLICY IF EXISTS "Anyone can verify certificates" ON public.user_certifications;

-- Create a restricted view for public certificate verification (only returns validity status, no sensitive data)
CREATE OR REPLACE VIEW public.certificate_verification AS
SELECT 
  certificate_number,
  certification_type,
  status,
  expires_at,
  CASE WHEN status = 'active' AND expires_at > now() THEN true ELSE false END as is_valid
FROM public.user_certifications
WHERE certificate_number IS NOT NULL;

-- Grant SELECT on the view to allow public verification without exposing full table
GRANT SELECT ON public.certificate_verification TO anon, authenticated;