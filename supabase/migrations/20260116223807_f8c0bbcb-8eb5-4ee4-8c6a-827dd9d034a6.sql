-- Create user_purchases table to track what users have bought
CREATE TABLE public.user_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_key TEXT NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view their own purchases" 
ON public.user_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

-- Only edge functions can insert purchases (using service role)
-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
ON public.user_purchases
FOR SELECT
USING (public.has_admin_role(auth.uid()));

-- Create index for faster lookups
CREATE INDEX idx_user_purchases_user_id ON public.user_purchases(user_id);
CREATE INDEX idx_user_purchases_product_key ON public.user_purchases(product_key);
CREATE UNIQUE INDEX idx_user_purchases_stripe_session ON public.user_purchases(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_user_purchases_updated_at
BEFORE UPDATE ON public.user_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();