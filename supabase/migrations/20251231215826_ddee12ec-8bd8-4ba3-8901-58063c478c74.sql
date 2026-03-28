
-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.has_admin_role(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.coaches 
    WHERE user_id = user_uuid 
    AND role IN ('OrgAdmin', 'Director', 'VAULTHQ')
    AND status = 'Active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_certification_statuses()
RETURNS void AS $$
BEGIN
  -- Mark as Expired if past expiration
  UPDATE public.admin_certifications
  SET status = 'Expired', updated_at = now()
  WHERE expiration_date < CURRENT_DATE 
  AND status NOT IN ('Expired', 'Locked');
  
  -- Mark as Expiring if within 30 days
  UPDATE public.admin_certifications
  SET status = 'Expiring', updated_at = now()
  WHERE expiration_date <= CURRENT_DATE + INTERVAL '30 days'
  AND expiration_date >= CURRENT_DATE
  AND status = 'Active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
