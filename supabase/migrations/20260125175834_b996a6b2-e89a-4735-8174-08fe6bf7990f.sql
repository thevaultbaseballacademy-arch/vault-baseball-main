-- Restrict access to credential helper functions
-- These functions are SECURITY DEFINER and should not be executable by anonymous users.

BEGIN;

-- Remove public execution rights
REVOKE EXECUTE ON FUNCTION public.get_device_credentials_secure(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.encrypt_credential(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.decrypt_credential(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.encrypt_device_credentials_trigger() FROM PUBLIC;

-- Allow authenticated users to execute only the secure accessor (it enforces owner checks)
GRANT EXECUTE ON FUNCTION public.get_device_credentials_secure(uuid, text) TO authenticated;

COMMIT;