
-- Lead captures table for free guide and funnel leads
CREATE TABLE public.lead_captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_name TEXT NOT NULL,
  parent_name TEXT,
  email TEXT NOT NULL,
  athlete_age INTEGER,
  primary_position TEXT,
  lead_source TEXT DEFAULT 'free_guide',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_captures ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (public form)
CREATE POLICY "Anyone can submit leads" ON public.lead_captures
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only admins can view leads
CREATE POLICY "Admins can view leads" ON public.lead_captures
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Post-purchase athlete onboarding submissions
CREATE TABLE public.athlete_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  athlete_goals TEXT,
  current_level TEXT,
  position TEXT,
  current_velocity TEXT,
  exit_velo TEXT,
  sixty_time TEXT,
  social_handle TEXT,
  product_purchased TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.athlete_onboarding ENABLE ROW LEVEL SECURITY;

-- Users can insert their own onboarding
CREATE POLICY "Users can insert own onboarding" ON public.athlete_onboarding
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can view own onboarding
CREATE POLICY "Users can view own onboarding" ON public.athlete_onboarding
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Admins can view all onboarding
CREATE POLICY "Admins can view all onboarding" ON public.athlete_onboarding
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
