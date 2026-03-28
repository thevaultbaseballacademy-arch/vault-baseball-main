
-- Drop the failed partial state first
DROP TABLE IF EXISTS public.team_events CASCADE;
DROP TABLE IF EXISTS public.team_announcements CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

-- Create tables WITHOUT policies first
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sport_type TEXT NOT NULL DEFAULT 'baseball',
  age_group TEXT,
  season TEXT,
  description TEXT,
  logo_url TEXT,
  head_coach_user_id UUID NOT NULL,
  max_roster_size INTEGER DEFAULT 25,
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'assistant_coach', 'manager', 'captain')),
  jersey_number TEXT,
  position TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'injured', 'pending')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE public.team_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.team_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'practice' CHECK (event_type IN ('practice', 'game', 'scrimmage', 'tournament', 'meeting', 'other')),
  event_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  opponent TEXT,
  notes TEXT,
  is_cancelled BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_events ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Head coach manages own teams" ON public.teams
  FOR ALL USING (auth.uid() = head_coach_user_id) WITH CHECK (auth.uid() = head_coach_user_id);
CREATE POLICY "Members view their teams" ON public.teams
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = teams.id AND tm.user_id = auth.uid() AND tm.status = 'active')
  );
CREATE POLICY "Owners view all teams" ON public.teams
  FOR SELECT USING (public.is_owner(auth.uid()));

-- Team members policies
CREATE POLICY "Members view team roster" ON public.team_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.team_members tm2 WHERE tm2.team_id = team_members.team_id AND tm2.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_members.team_id AND t.head_coach_user_id = auth.uid())
  );
CREATE POLICY "Head coach manages roster" ON public.team_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_members.team_id AND t.head_coach_user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_members.team_id AND t.head_coach_user_id = auth.uid())
  );
CREATE POLICY "Players join teams" ON public.team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners view all members" ON public.team_members
  FOR SELECT USING (public.is_owner(auth.uid()));

-- Announcements policies
CREATE POLICY "Members read announcements" ON public.team_announcements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_announcements.team_id AND tm.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_announcements.team_id AND t.head_coach_user_id = auth.uid())
  );
CREATE POLICY "Head coach manages announcements" ON public.team_announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_announcements.team_id AND t.head_coach_user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_announcements.team_id AND t.head_coach_user_id = auth.uid())
  );
CREATE POLICY "Owners view all announcements" ON public.team_announcements
  FOR SELECT USING (public.is_owner(auth.uid()));

-- Events policies
CREATE POLICY "Members view team events" ON public.team_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_events.team_id AND tm.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_events.team_id AND t.head_coach_user_id = auth.uid())
  );
CREATE POLICY "Head coach manages events" ON public.team_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_events.team_id AND t.head_coach_user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_events.team_id AND t.head_coach_user_id = auth.uid())
  );
CREATE POLICY "Owners view all events" ON public.team_events
  FOR SELECT USING (public.is_owner(auth.uid()));

-- Triggers
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_announcements_updated_at BEFORE UPDATE ON public.team_announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_events_updated_at BEFORE UPDATE ON public.team_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
