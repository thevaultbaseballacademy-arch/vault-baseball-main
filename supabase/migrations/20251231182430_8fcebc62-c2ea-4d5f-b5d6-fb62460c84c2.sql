-- Create a SECURITY DEFINER function for public certificate verification
-- This safely exposes only the necessary data for verification without exposing the full table
CREATE OR REPLACE FUNCTION public.verify_certificate_public(cert_number text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  cert_record record;
  profile_name text;
BEGIN
  -- Find the certificate
  SELECT 
    uc.certificate_number,
    uc.certification_type,
    uc.status,
    uc.issued_at,
    uc.expires_at,
    uc.score,
    uc.user_id
  INTO cert_record
  FROM public.user_certifications uc
  WHERE uc.certificate_number = upper(trim(cert_number))
  LIMIT 1;

  IF cert_record IS NULL THEN
    RETURN jsonb_build_object(
      'found', false,
      'message', 'Certificate not found'
    );
  END IF;

  -- Get profile display name
  SELECT display_name INTO profile_name
  FROM public.profiles
  WHERE user_id = cert_record.user_id
  LIMIT 1;

  -- Return verification result
  RETURN jsonb_build_object(
    'found', true,
    'certificate_number', cert_record.certificate_number,
    'certification_type', cert_record.certification_type,
    'status', cert_record.status,
    'issued_at', cert_record.issued_at,
    'expires_at', cert_record.expires_at,
    'score', cert_record.score,
    'coach_name', COALESCE(profile_name, 'Coach'),
    'is_valid', cert_record.status = 'active' AND cert_record.expires_at > now()
  );
END;
$$;

-- Drop the old function
DROP FUNCTION IF EXISTS public.verify_certificate(text);