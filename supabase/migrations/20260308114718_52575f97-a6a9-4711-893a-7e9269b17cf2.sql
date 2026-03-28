
-- Store a proper encryption key in Supabase Vault
SELECT vault.create_secret(
  encode(gen_random_bytes(32), 'hex'),
  'device_cred_key',
  'Encryption key for device integration credentials'
);

-- Update encrypt_credential to use Vault key
CREATE OR REPLACE FUNCTION public.encrypt_credential(plaintext text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  encryption_key TEXT;
BEGIN
  IF plaintext IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Retrieve the encryption key from Supabase Vault
  SELECT decrypted_secret INTO encryption_key
  FROM vault.decrypted_secrets
  WHERE name = 'device_cred_key'
  LIMIT 1;
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found in vault';
  END IF;
  
  RETURN encode(pgp_sym_encrypt(plaintext, encryption_key), 'base64');
END;
$function$;

-- Update decrypt_credential to use Vault key
CREATE OR REPLACE FUNCTION public.decrypt_credential(ciphertext text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  encryption_key TEXT;
BEGIN
  IF ciphertext IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Retrieve the encryption key from Supabase Vault
  SELECT decrypted_secret INTO encryption_key
  FROM vault.decrypted_secrets
  WHERE name = 'device_cred_key'
  LIMIT 1;
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found in vault';
  END IF;
  
  BEGIN
    RETURN pgp_sym_decrypt(decode(ciphertext, 'base64'), encryption_key);
  EXCEPTION WHEN OTHERS THEN
    -- If decryption fails, return NULL (could be already plaintext or encrypted with old key)
    RETURN NULL;
  END;
END;
$function$;
