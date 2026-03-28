
-- 1. Drills library
CREATE TABLE public.drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_type TEXT NOT NULL DEFAULT 'baseball',
  softball_format TEXT,
  title TEXT NOT NULL,
  description TEXT,
  coaching_points TEXT[] DEFAULT '{}',
  skill_category TEXT NOT NULL,
  position TEXT[] DEFAULT '{}',
  age_group TEXT[] DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced','elite')),
  video_url TEXT,
  prerequisites UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  kpi_mapping TEXT[] DEFAULT '{}',
  recommended_use_cases TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','approved','rejected','revision')),
  created_by UUID NOT NULL,
  approved_by UUID,
  rejection_note TEXT,
  revision_note TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drills ENABLE ROW LEVEL SECURITY;

-- Approved drills visible to all authenticated users
CREATE POLICY "Approved drills visible to all" ON public.drills
  FOR SELECT USING (status = 'approved' OR auth.uid() = created_by OR public.is_owner(auth.uid()));
-- Creators manage their own drafts
CREATE POLICY "Creators manage own drills" ON public.drills
  FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
-- Owners manage all drills (approve/reject)
CREATE POLICY "Owners manage all drills" ON public.drills
  FOR ALL USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

CREATE TRIGGER update_drills_updated_at BEFORE UPDATE ON public.drills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Programs
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_type TEXT NOT NULL DEFAULT 'baseball',
  softball_format TEXT,
  name TEXT NOT NULL,
  skill_focus TEXT,
  description TEXT,
  duration_weeks INT DEFAULT 4,
  age_group TEXT[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced','elite')),
  drill_sequence JSONB DEFAULT '[]',
  kpi_targets JSONB DEFAULT '[]',
  is_assignable BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','approved','rejected','revision')),
  created_by UUID NOT NULL,
  approved_by UUID,
  rejection_note TEXT,
  revision_note TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved programs visible to all" ON public.programs
  FOR SELECT USING (status = 'approved' OR auth.uid() = created_by OR public.is_owner(auth.uid()));
CREATE POLICY "Creators manage own programs" ON public.programs
  FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owners manage all programs" ON public.programs
  FOR ALL USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Drill assignments
CREATE TABLE public.drill_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id UUID NOT NULL,
  coach_user_id UUID NOT NULL,
  drill_id UUID NOT NULL REFERENCES public.drills(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned','in_progress','completed','skipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drill_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes view own drill assignments" ON public.drill_assignments
  FOR SELECT USING (auth.uid() = athlete_user_id);
CREATE POLICY "Athletes update own drill assignments" ON public.drill_assignments
  FOR UPDATE USING (auth.uid() = athlete_user_id);
CREATE POLICY "Coaches manage assigned drill assignments" ON public.drill_assignments
  FOR ALL USING (auth.uid() = coach_user_id) WITH CHECK (auth.uid() = coach_user_id);
CREATE POLICY "Owners view all drill assignments" ON public.drill_assignments
  FOR SELECT USING (public.is_owner(auth.uid()));
CREATE POLICY "Parents view linked drill assignments" ON public.drill_assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.parent_athlete_links pal
      WHERE pal.parent_user_id = auth.uid() AND pal.athlete_user_id = drill_assignments.athlete_user_id AND pal.status = 'active')
  );

CREATE TRIGGER update_drill_assignments_updated_at BEFORE UPDATE ON public.drill_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Program assignments
CREATE TABLE public.program_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id UUID NOT NULL,
  coach_user_id UUID NOT NULL,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_week INT DEFAULT 1,
  completion_percent FLOAT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed','abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.program_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes view own program assignments" ON public.program_assignments
  FOR SELECT USING (auth.uid() = athlete_user_id);
CREATE POLICY "Athletes update own program assignments" ON public.program_assignments
  FOR UPDATE USING (auth.uid() = athlete_user_id);
CREATE POLICY "Coaches manage assigned program assignments" ON public.program_assignments
  FOR ALL USING (auth.uid() = coach_user_id) WITH CHECK (auth.uid() = coach_user_id);
CREATE POLICY "Owners view all program assignments" ON public.program_assignments
  FOR SELECT USING (public.is_owner(auth.uid()));
CREATE POLICY "Parents view linked program assignments" ON public.program_assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.parent_athlete_links pal
      WHERE pal.parent_user_id = auth.uid() AND pal.athlete_user_id = program_assignments.athlete_user_id AND pal.status = 'active')
  );

CREATE TRIGGER update_program_assignments_updated_at BEFORE UPDATE ON public.program_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
