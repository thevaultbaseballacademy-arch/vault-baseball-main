-- Create 22M invite tokens table
CREATE TABLE public.athlete_22m_invite_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  label text,
  max_uses integer DEFAULT 50,
  used_count integer DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create athlete trials table
CREATE TABLE public.athlete_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  trial_type text NOT NULL DEFAULT '22m_founding_athlete',
  trial_start_date timestamptz NOT NULL DEFAULT now(),
  trial_end_date timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  trial_active boolean DEFAULT true,
  invite_token_id uuid REFERENCES public.athlete_22m_invite_tokens(id),
  converted_at timestamptz,
  converted_product text,
  extended_by uuid,
  extended_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.athlete_22m_invite_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_trials ENABLE ROW LEVEL SECURITY;

-- RLS for invite tokens
CREATE POLICY "Admins can manage 22M invite tokens"
  ON public.athlete_22m_invite_tokens
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can validate 22M invite tokens"
  ON public.athlete_22m_invite_tokens
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS for athlete trials
CREATE POLICY "Users can view own trial"
  ON public.athlete_trials
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all trials"
  ON public.athlete_trials
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own trial"
  ON public.athlete_trials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to increment 22M invite usage
CREATE OR REPLACE FUNCTION public.increment_22m_invite_usage(token_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.athlete_22m_invite_tokens
  SET used_count = used_count + 1
  WHERE id = token_id;
END;
$$;

-- Function to check trial status
CREATE OR REPLACE FUNCTION public.get_athlete_trial_status(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  trial_record record;
BEGIN
  SELECT * INTO trial_record
  FROM public.athlete_trials
  WHERE user_id = p_user_id
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('has_trial', false);
  END IF;
  
  RETURN jsonb_build_object(
    'has_trial', true,
    'trial_active', trial_record.trial_active AND trial_record.trial_end_date > now(),
    'trial_type', trial_record.trial_type,
    'trial_start_date', trial_record.trial_start_date,
    'trial_end_date', trial_record.trial_end_date,
    'days_remaining', GREATEST(0, EXTRACT(DAY FROM trial_record.trial_end_date - now())::integer),
    'is_expired', trial_record.trial_end_date <= now(),
    'converted', trial_record.converted_at IS NOT NULL,
    'converted_product', trial_record.converted_product
  );
END;
$$;

-- Add updated_at trigger
CREATE TRIGGER update_athlete_trials_updated_at
  BEFORE UPDATE ON public.athlete_trials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();