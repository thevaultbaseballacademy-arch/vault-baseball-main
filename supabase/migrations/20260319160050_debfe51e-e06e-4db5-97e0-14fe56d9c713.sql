
-- Recruiting profiles: extended recruiting data for athletes
CREATE TABLE public.recruiting_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_type TEXT NOT NULL DEFAULT 'baseball',
  gpa NUMERIC(3,2),
  sat_score INTEGER,
  act_score INTEGER,
  ncaa_id TEXT,
  ncaa_eligibility_center BOOLEAN DEFAULT false,
  commitment_status TEXT NOT NULL DEFAULT 'uncommitted' CHECK (commitment_status IN ('uncommitted', 'verbal_commit', 'signed', 'enrolled')),
  committed_school TEXT,
  committed_at TIMESTAMPTZ,
  division_target TEXT[] DEFAULT '{}',
  highlight_video_url TEXT,
  skills_video_url TEXT,
  academic_interests TEXT,
  extracurriculars TEXT,
  references_contacts JSONB DEFAULT '[]',
  recruiting_notes TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'coaches_only', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Showcase events tracking
CREATE TABLE public.showcase_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'showcase' CHECK (event_type IN ('showcase', 'camp', 'combine', 'tournament', 'tryout', 'visit')),
  organization TEXT,
  location TEXT,
  event_date DATE,
  event_end_date DATE,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'registered', 'attended', 'cancelled')),
  results TEXT,
  notes TEXT,
  cost_cents INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- College coach contacts
CREATE TABLE public.recruiting_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  division TEXT,
  coach_name TEXT,
  coach_title TEXT,
  coach_email TEXT,
  coach_phone TEXT,
  contact_status TEXT NOT NULL DEFAULT 'researched' CHECK (contact_status IN ('researched', 'emailed', 'replied', 'called', 'visited', 'offered', 'declined')),
  interest_level TEXT DEFAULT 'unknown' CHECK (interest_level IN ('unknown', 'low', 'medium', 'high', 'mutual')),
  last_contact_date DATE,
  next_follow_up DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recruiting readiness checklist items
CREATE TABLE public.recruiting_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  item_label TEXT NOT NULL,
  category TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_key)
);

-- Enable RLS
ALTER TABLE public.recruiting_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiting_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiting_checklist ENABLE ROW LEVEL SECURITY;

-- RLS: recruiting_profiles
CREATE POLICY "Users can view own recruiting profile" ON public.recruiting_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recruiting profile" ON public.recruiting_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recruiting profile" ON public.recruiting_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can view all recruiting profiles" ON public.recruiting_profiles FOR SELECT USING (public.is_owner(auth.uid()));
CREATE POLICY "Coaches can view assigned athlete recruiting profiles" ON public.recruiting_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.coach_athlete_assignments WHERE coach_user_id = auth.uid() AND athlete_user_id = recruiting_profiles.user_id AND is_active = true)
);

-- RLS: showcase_events
CREATE POLICY "Users manage own showcase events" ON public.showcase_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owners can view all showcase events" ON public.showcase_events FOR SELECT USING (public.is_owner(auth.uid()));
CREATE POLICY "Coaches can view assigned athlete showcase events" ON public.showcase_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.coach_athlete_assignments WHERE coach_user_id = auth.uid() AND athlete_user_id = showcase_events.user_id AND is_active = true)
);

-- RLS: recruiting_contacts
CREATE POLICY "Users manage own recruiting contacts" ON public.recruiting_contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owners can view all recruiting contacts" ON public.recruiting_contacts FOR SELECT USING (public.is_owner(auth.uid()));

-- RLS: recruiting_checklist
CREATE POLICY "Users manage own checklist" ON public.recruiting_checklist FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owners can view all checklists" ON public.recruiting_checklist FOR SELECT USING (public.is_owner(auth.uid()));
CREATE POLICY "Coaches can view assigned athlete checklists" ON public.recruiting_checklist FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.coach_athlete_assignments WHERE coach_user_id = auth.uid() AND athlete_user_id = recruiting_checklist.user_id AND is_active = true)
);

-- Updated_at triggers
CREATE TRIGGER update_recruiting_profiles_updated_at BEFORE UPDATE ON public.recruiting_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_showcase_events_updated_at BEFORE UPDATE ON public.showcase_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recruiting_contacts_updated_at BEFORE UPDATE ON public.recruiting_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
