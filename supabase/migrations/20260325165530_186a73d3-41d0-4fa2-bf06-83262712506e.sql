-- Add new softball hitting cert types to admin_cert_type enum
ALTER TYPE public.admin_cert_type ADD VALUE IF NOT EXISTS 'Softball Hitting Foundations';
ALTER TYPE public.admin_cert_type ADD VALUE IF NOT EXISTS 'Softball Hitting Performance';
ALTER TYPE public.admin_cert_type ADD VALUE IF NOT EXISTS 'Softball Slap Specialist';

-- Add new cert types to certification_type enum  
ALTER TYPE public.certification_type ADD VALUE IF NOT EXISTS 'softball_hitting_foundations';
ALTER TYPE public.certification_type ADD VALUE IF NOT EXISTS 'softball_hitting_performance';
ALTER TYPE public.certification_type ADD VALUE IF NOT EXISTS 'softball_slap_specialist';