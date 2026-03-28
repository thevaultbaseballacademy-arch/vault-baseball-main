-- Further hardening: do not allow client-side execution of credential decryption/accessor functions
-- Server-side operations should use elevated backend context rather than exposing raw credentials to clients.

BEGIN;

REVOKE EXECUTE ON FUNCTION public.get_device_credentials_secure(uuid, text) FROM authenticated;

COMMIT;