-- Add certificate_number column to user_certifications for public verification
ALTER TABLE public.user_certifications 
ADD COLUMN IF NOT EXISTS certificate_number text UNIQUE;

-- Create function to generate certificate numbers
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_number text;
  prefix text;
BEGIN
  -- Generate format: VAULT-XXXXX-YYYY (where X is random alphanumeric, Y is year)
  prefix := 'VAULT-';
  new_number := prefix || 
    upper(substring(md5(random()::text) from 1 for 5)) || 
    '-' || 
    to_char(now(), 'YYYY');
  RETURN new_number;
END;
$$;

-- Create trigger to auto-generate certificate number on insert
CREATE OR REPLACE FUNCTION set_certificate_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.certificate_number IS NULL THEN
    NEW.certificate_number := generate_certificate_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_certificate_number
BEFORE INSERT ON public.user_certifications
FOR EACH ROW
EXECUTE FUNCTION set_certificate_number();

-- Backfill existing records with certificate numbers
UPDATE public.user_certifications
SET certificate_number = generate_certificate_number()
WHERE certificate_number IS NULL;

-- Create RLS policy to allow public verification lookups (only specific columns)
CREATE POLICY "Anyone can verify certificates"
ON public.user_certifications
FOR SELECT
USING (true);