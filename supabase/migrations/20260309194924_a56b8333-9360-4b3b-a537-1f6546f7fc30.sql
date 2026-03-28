INSERT INTO public.team_whitelist (email, admin_access, full_access)
VALUES 
  ('emejia2291@gmail.com', true, true),
  ('jacki92brown@gmail.com', true, true),
  ('eddie@vaultbaseball.com', true, true),
  ('admin@vaultbaseball.com', true, true)
ON CONFLICT (email) DO UPDATE SET admin_access = true, full_access = true;