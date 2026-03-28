
-- Coach marketplace profiles (extends coaches table with marketplace-specific data)
CREATE TABLE public.coach_marketplace_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  tagline text,
  bio text,
  photo_url text,
  specialties text[] DEFAULT '{}',
  playing_background text,
  coaching_background text,
  hourly_rate_cents integer DEFAULT 10000,
  is_marketplace_active boolean DEFAULT false,
  location text,
  years_experience integer,
  avg_rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  total_sessions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coach services offered
CREATE TABLE public.coach_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  service_type text NOT NULL,
  title text NOT NULL,
  description text,
  duration_minutes integer,
  price_cents integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Marketplace bookings
CREATE TABLE public.marketplace_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id uuid NOT NULL,
  coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES public.coach_services(id) NOT NULL,
  scheduled_at timestamptz,
  status text DEFAULT 'pending',
  amount_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL,
  coach_payout_cents integer NOT NULL,
  notes text,
  video_call_link text,
  recording_url text,
  athlete_notes text,
  coach_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coach reviews
CREATE TABLE public.coach_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.marketplace_bookings(id) ON DELETE CASCADE NOT NULL,
  coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  athlete_user_id uuid NOT NULL,
  rating integer NOT NULL,
  review_text text,
  created_at timestamptz DEFAULT now()
);

-- Marketplace earnings tracking
CREATE TABLE public.marketplace_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  booking_id uuid REFERENCES public.marketplace_bookings(id) ON DELETE CASCADE NOT NULL,
  total_amount_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL,
  coach_amount_cents integer NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.coach_marketplace_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_earnings ENABLE ROW LEVEL SECURITY;

-- Coach marketplace profiles: public read, owner write
CREATE POLICY "Anyone can view active marketplace profiles" ON public.coach_marketplace_profiles
  FOR SELECT USING (is_marketplace_active = true);

CREATE POLICY "Coach can manage own marketplace profile" ON public.coach_marketplace_profiles
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all marketplace profiles" ON public.coach_marketplace_profiles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Coach services: public read for active, owner write
CREATE POLICY "Anyone can view active services" ON public.coach_services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Coach can manage own services" ON public.coach_services
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid())
  );

-- Marketplace bookings: athlete and coach can view their own
CREATE POLICY "Athletes can view own bookings" ON public.marketplace_bookings
  FOR SELECT TO authenticated USING (athlete_user_id = auth.uid());

CREATE POLICY "Coaches can view their bookings" ON public.marketplace_bookings
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Athletes can create bookings" ON public.marketplace_bookings
  FOR INSERT TO authenticated WITH CHECK (athlete_user_id = auth.uid());

CREATE POLICY "Participants can update bookings" ON public.marketplace_bookings
  FOR UPDATE TO authenticated USING (
    athlete_user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all bookings" ON public.marketplace_bookings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Coach reviews: public read, athlete write after booking
CREATE POLICY "Anyone can view reviews" ON public.coach_reviews
  FOR SELECT USING (true);

CREATE POLICY "Athletes can create reviews for their bookings" ON public.coach_reviews
  FOR INSERT TO authenticated WITH CHECK (athlete_user_id = auth.uid());

-- Marketplace earnings: coach can view own, admin can view all
CREATE POLICY "Coaches can view own earnings" ON public.marketplace_earnings
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all earnings" ON public.marketplace_earnings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_coach_marketplace_profiles_updated_at
  BEFORE UPDATE ON public.coach_marketplace_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_services_updated_at
  BEFORE UPDATE ON public.coach_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_bookings_updated_at
  BEFORE UPDATE ON public.marketplace_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update coach avg rating
CREATE OR REPLACE FUNCTION public.update_coach_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.coach_marketplace_profiles
  SET
    avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.coach_reviews WHERE coach_id = NEW.coach_id),
    total_reviews = (SELECT COUNT(*) FROM public.coach_reviews WHERE coach_id = NEW.coach_id),
    updated_at = now()
  WHERE coach_id = NEW.coach_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_coach_rating_on_review
  AFTER INSERT ON public.coach_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_coach_rating();
