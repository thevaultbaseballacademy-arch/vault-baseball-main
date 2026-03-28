
-- Activation events tracking table
CREATE TABLE public.activation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_activation_events_user ON public.activation_events(user_id, created_at DESC);
CREATE INDEX idx_activation_events_type ON public.activation_events(event_type, created_at DESC);

ALTER TABLE public.activation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activation events"
  ON public.activation_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activation events"
  ON public.activation_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activation events"
  ON public.activation_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Upsell offers table
CREATE TABLE public.upsell_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  offer_type text NOT NULL,
  offer_key text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  cta_label text NOT NULL DEFAULT 'Learn More',
  cta_route text NOT NULL,
  trigger_reason text NOT NULL,
  priority int NOT NULL DEFAULT 50,
  is_dismissed boolean NOT NULL DEFAULT false,
  is_converted boolean NOT NULL DEFAULT false,
  dismissed_at timestamptz,
  converted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_upsell_offers_user ON public.upsell_offers(user_id, is_dismissed, created_at DESC);

ALTER TABLE public.upsell_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own offers"
  ON public.upsell_offers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own offers"
  ON public.upsell_offers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert offers"
  ON public.upsell_offers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all offers"
  ON public.upsell_offers FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
