
-- Give afinn95@optonline.net full access (admin + full_access) in team_whitelist
INSERT INTO public.team_whitelist (email, full_access, admin_access)
VALUES ('afinn95@optonline.net', true, true)
ON CONFLICT (email) DO UPDATE SET full_access = true, admin_access = true;
