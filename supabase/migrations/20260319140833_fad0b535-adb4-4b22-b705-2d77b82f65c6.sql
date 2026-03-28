
-- Add afinn95@optonline.net as a master trainer coach for softball
INSERT INTO public.coaches (name, email, user_id, org_id, role, status, is_certified, is_staff, is_bypass_certified, specialties)
VALUES (
  'afinn95',
  'afinn95@optonline.net',
  '2e8b176f-45a3-456d-8b44-ba646b5018a5',
  '5368f66f-cc85-4493-ae24-f4b1cf7df93e',
  'VAULTHQ',
  'Active',
  true,
  true,
  true,
  ARRAY['Softball', 'Fastpitch Pitching', 'Hitting', 'Fielding']
);

-- Ensure she has admin and coach roles
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('2e8b176f-45a3-456d-8b44-ba646b5018a5', 'admin'),
  ('2e8b176f-45a3-456d-8b44-ba646b5018a5', 'coach')
ON CONFLICT (user_id, role) DO NOTHING;

-- Set her sport type to softball
UPDATE public.profiles 
SET sport_type = 'softball'
WHERE user_id = '2e8b176f-45a3-456d-8b44-ba646b5018a5';
