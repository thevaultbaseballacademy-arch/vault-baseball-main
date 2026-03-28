
-- 1. Softball pitching sessions
CREATE TABLE public.softball_pitching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id UUID NOT NULL,
  coach_user_id UUID,
  session_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  pitches_thrown JSONB DEFAULT '[]',
  phase_scores JSONB DEFAULT '{}',
  mechanics_flags TEXT[] DEFAULT '{}',
  injury_risk_level TEXT DEFAULT 'low' CHECK (injury_risk_level IN ('low','moderate','high')),
  total_pitch_count INT DEFAULT 0,
  weekly_running_total INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.softball_pitching_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes manage own pitching sessions" ON public.softball_pitching_sessions
  FOR ALL USING (auth.uid() = athlete_user_id) WITH CHECK (auth.uid() = athlete_user_id);
CREATE POLICY "Coaches manage assigned pitching sessions" ON public.softball_pitching_sessions
  FOR ALL USING (auth.uid() = coach_user_id) WITH CHECK (auth.uid() = coach_user_id);
CREATE POLICY "Coaches read assigned athlete sessions" ON public.softball_pitching_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.coach_athlete_assignments ca
      WHERE ca.coach_user_id = auth.uid() AND ca.athlete_user_id = softball_pitching_sessions.athlete_user_id AND ca.is_active = true)
  );
CREATE POLICY "Owners view all pitching sessions" ON public.softball_pitching_sessions
  FOR SELECT USING (public.is_owner(auth.uid()));

-- 2. Softball slap sessions
CREATE TABLE public.softball_slap_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id UUID NOT NULL,
  coach_user_id UUID,
  session_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  slap_type TEXT NOT NULL CHECK (slap_type IN ('slow_slap','hard_slap','fake_slap','crossover')),
  attempts_total INT DEFAULT 0,
  success_rate FLOAT,
  placement_accuracy FLOAT,
  footwork_score FLOAT,
  timing_score FLOAT,
  errors_observed TEXT[] DEFAULT '{}',
  drills_assigned UUID[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.softball_slap_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes manage own slap sessions" ON public.softball_slap_sessions
  FOR ALL USING (auth.uid() = athlete_user_id) WITH CHECK (auth.uid() = athlete_user_id);
CREATE POLICY "Coaches manage assigned slap sessions" ON public.softball_slap_sessions
  FOR ALL USING (auth.uid() = coach_user_id) WITH CHECK (auth.uid() = coach_user_id);
CREATE POLICY "Coaches read assigned athlete slap sessions" ON public.softball_slap_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.coach_athlete_assignments ca
      WHERE ca.coach_user_id = auth.uid() AND ca.athlete_user_id = softball_slap_sessions.athlete_user_id AND ca.is_active = true)
  );
CREATE POLICY "Owners view all slap sessions" ON public.softball_slap_sessions
  FOR SELECT USING (public.is_owner(auth.uid()));

-- 3. Softball positions (reference table)
CREATE TABLE public.softball_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  sport_type TEXT NOT NULL DEFAULT 'softball',
  fastpitch_relevant BOOLEAN DEFAULT true,
  slowpitch_relevant BOOLEAN DEFAULT true
);

ALTER TABLE public.softball_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read softball positions" ON public.softball_positions FOR SELECT USING (true);
CREATE POLICY "Owners manage softball positions" ON public.softball_positions FOR ALL USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

-- Seed positions
INSERT INTO public.softball_positions (name, abbreviation, fastpitch_relevant, slowpitch_relevant) VALUES
  ('Pitcher', 'P', true, true),
  ('Catcher', 'C', true, true),
  ('First Base', '1B', true, true),
  ('Second Base', '2B', true, true),
  ('Shortstop', 'SS', true, true),
  ('Third Base', '3B', true, true),
  ('Left Field', 'LF', true, true),
  ('Center Field', 'CF', true, true),
  ('Right Field', 'RF', true, true),
  ('Designated Player', 'DP', true, false),
  ('Flex', 'FLEX', true, false),
  ('Utility', 'UT', true, true),
  ('Extra Hitter', 'EH', false, true),
  ('Short Fielder', 'SF', false, true);

-- 4. Softball pitch types (reference table)
CREATE TABLE public.softball_pitch_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fastpitch','slowpitch')),
  spin_type TEXT,
  movement_direction TEXT,
  velocity_benchmarks JSONB DEFAULT '{}'
);

ALTER TABLE public.softball_pitch_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read pitch types" ON public.softball_pitch_types FOR SELECT USING (true);
CREATE POLICY "Owners manage pitch types" ON public.softball_pitch_types FOR ALL USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

-- Seed fastpitch pitch types
INSERT INTO public.softball_pitch_types (name, category, spin_type, movement_direction, velocity_benchmarks) VALUES
  ('Fastball', 'fastpitch', 'backspin', 'straight', '{"14U":"50-55","16U":"55-60","18U":"58-64","college":"60-70"}'),
  ('Change-up', 'fastpitch', 'backspin', 'slight fade', '{"14U":"40-45","16U":"45-50","18U":"48-54","college":"50-58"}'),
  ('Drop Ball', 'fastpitch', 'topspin', 'downward', '{"14U":"45-50","16U":"50-55","18U":"52-58","college":"55-62"}'),
  ('Rise Ball', 'fastpitch', 'backspin', 'upward', '{"14U":"48-52","16U":"52-57","18U":"55-60","college":"58-66"}'),
  ('Curve Ball', 'fastpitch', 'sidespin', 'lateral break', '{"14U":"42-48","16U":"48-53","18U":"50-56","college":"52-60"}'),
  ('Screw Ball', 'fastpitch', 'reverse sidespin', 'inside run', '{"14U":"44-48","16U":"48-52","18U":"50-55","college":"52-58"}'),
  ('Drop Curve', 'fastpitch', 'topspin+sidespin', 'down and lateral', '{"14U":"44-48","16U":"48-53","18U":"50-56","college":"53-60"}'),
  ('Knuckle Ball', 'fastpitch', 'none', 'unpredictable', '{"14U":"38-42","16U":"40-45","18U":"42-48","college":"44-50"}'),
  ('Arc Pitch', 'slowpitch', 'backspin', 'arcing trajectory', '{}'),
  ('Backspin Pitch', 'slowpitch', 'backspin', 'floating', '{}'),
  ('Knuckleball', 'slowpitch', 'none', 'unpredictable flutter', '{}');
