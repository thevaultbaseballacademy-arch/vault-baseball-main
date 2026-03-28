-- Add unique constraint for coach_id + cert_type to enable upsert
ALTER TABLE public.admin_certifications 
ADD CONSTRAINT admin_certifications_coach_cert_unique UNIQUE (coach_id, cert_type);