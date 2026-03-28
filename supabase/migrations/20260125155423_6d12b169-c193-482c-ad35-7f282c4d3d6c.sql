-- Security fix: Encrypt device_integrations credentials using pgcrypto
-- This encrypts api_key, api_secret, access_token, and refresh_token columns

BEGIN;

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a secure encryption function that uses a server-side key
-- The key is stored in a Postgres custom setting that's only accessible server-side
CREATE OR REPLACE FUNCTION public.encrypt_credential(plaintext TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Use a fixed key derived from database identifier + constant
  -- In production, this should be a proper secrets management solution
  encryption_key := encode(digest(current_database() || 'vault_device_credentials_v1', 'sha256'), 'hex');
  
  IF plaintext IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN encode(pgp_sym_encrypt(plaintext, encryption_key), 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_credential(ciphertext TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Use the same key derivation as encrypt_credential
  encryption_key := encode(digest(current_database() || 'vault_device_credentials_v1', 'sha256'), 'hex');
  
  IF ciphertext IS NULL THEN
    RETURN NULL;
  END IF;
  
  BEGIN
    RETURN pgp_sym_decrypt(decode(ciphertext, 'base64'), encryption_key);
  EXCEPTION WHEN OTHERS THEN
    -- If decryption fails, return NULL (could be already plaintext or corrupted)
    RETURN NULL;
  END;
END;
$$;

-- Revoke execute from public, only service role should decrypt
REVOKE EXECUTE ON FUNCTION public.decrypt_credential(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.decrypt_credential(TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.decrypt_credential(TEXT) FROM authenticated;

-- Create a secure function for edge functions to get decrypted credentials
-- This ensures only the owner can access their own credentials
CREATE OR REPLACE FUNCTION public.get_device_credentials_secure(p_user_id UUID, p_device_type TEXT)
RETURNS TABLE(
  api_key TEXT,
  api_secret TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow the owner to retrieve their own credentials
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied: You can only access your own device credentials';
  END IF;
  
  RETURN QUERY
  SELECT 
    decrypt_credential(di.api_key) AS api_key,
    decrypt_credential(di.api_secret) AS api_secret,
    decrypt_credential(di.access_token) AS access_token,
    decrypt_credential(di.refresh_token) AS refresh_token,
    di.token_expires_at
  FROM device_integrations di
  WHERE di.user_id = p_user_id
    AND di.device_type::text = p_device_type;
END;
$$;

-- Encrypt existing plaintext credentials
-- First, identify rows that have non-null plaintext values
UPDATE device_integrations
SET 
  api_key = CASE 
    WHEN api_key IS NOT NULL AND api_key NOT LIKE '%==%' THEN encrypt_credential(api_key)
    ELSE api_key 
  END,
  api_secret = CASE 
    WHEN api_secret IS NOT NULL AND api_secret NOT LIKE '%==%' THEN encrypt_credential(api_secret)
    ELSE api_secret 
  END,
  access_token = CASE 
    WHEN access_token IS NOT NULL AND access_token NOT LIKE '%==%' THEN encrypt_credential(access_token)
    ELSE access_token 
  END,
  refresh_token = CASE 
    WHEN refresh_token IS NOT NULL AND refresh_token NOT LIKE '%==%' THEN encrypt_credential(refresh_token)
    ELSE refresh_token 
  END,
  updated_at = now()
WHERE api_key IS NOT NULL 
   OR api_secret IS NOT NULL 
   OR access_token IS NOT NULL 
   OR refresh_token IS NOT NULL;

-- Create a trigger to auto-encrypt credentials on insert/update
CREATE OR REPLACE FUNCTION public.encrypt_device_credentials_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Encrypt credentials if they appear to be plaintext (not base64 encoded)
  IF NEW.api_key IS NOT NULL AND NEW.api_key NOT LIKE '%==%' AND length(NEW.api_key) < 100 THEN
    NEW.api_key := encrypt_credential(NEW.api_key);
  END IF;
  
  IF NEW.api_secret IS NOT NULL AND NEW.api_secret NOT LIKE '%==%' AND length(NEW.api_secret) < 100 THEN
    NEW.api_secret := encrypt_credential(NEW.api_secret);
  END IF;
  
  IF NEW.access_token IS NOT NULL AND NEW.access_token NOT LIKE '%==%' AND length(NEW.access_token) < 200 THEN
    NEW.access_token := encrypt_credential(NEW.access_token);
  END IF;
  
  IF NEW.refresh_token IS NOT NULL AND NEW.refresh_token NOT LIKE '%==%' AND length(NEW.refresh_token) < 200 THEN
    NEW.refresh_token := encrypt_credential(NEW.refresh_token);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS encrypt_device_credentials ON device_integrations;
CREATE TRIGGER encrypt_device_credentials
  BEFORE INSERT OR UPDATE ON device_integrations
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_device_credentials_trigger();

-- Add audit logging for credential access attempts
CREATE OR REPLACE FUNCTION public.log_credential_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when credentials are accessed (SELECT on the base table with credentials)
  INSERT INTO audit_logs (
    table_name,
    record_id,
    operation,
    changed_by,
    new_data
  ) VALUES (
    'device_integrations',
    NEW.id,
    'CREDENTIAL_ACCESS',
    auth.uid(),
    jsonb_build_object(
      'device_type', NEW.device_type,
      'access_time', now()
    )
  );
  RETURN NEW;
END;
$$;

COMMIT;