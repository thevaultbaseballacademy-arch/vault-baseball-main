-- Add stripe_account_id to coaches table for Stripe Connect
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Create coach_payouts table to track all payouts
CREATE TABLE public.coach_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  description TEXT,
  stripe_transfer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on coach_payouts
ALTER TABLE public.coach_payouts ENABLE ROW LEVEL SECURITY;

-- Only admins can view payouts
CREATE POLICY "Admins can view all payouts"
ON public.coach_payouts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert payouts
CREATE POLICY "Admins can create payouts"
ON public.coach_payouts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update payouts
CREATE POLICY "Admins can update payouts"
ON public.coach_payouts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_coach_payouts_updated_at
BEFORE UPDATE ON public.coach_payouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();