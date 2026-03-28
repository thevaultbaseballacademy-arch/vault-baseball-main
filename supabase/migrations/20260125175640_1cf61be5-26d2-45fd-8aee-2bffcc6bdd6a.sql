-- Restore minimal SELECT access on user_sessions for authenticated users
-- (RLS still restricts rows to the owner; IP/location columns have been removed)

BEGIN;

GRANT SELECT ON TABLE public.user_sessions TO authenticated;

COMMIT;