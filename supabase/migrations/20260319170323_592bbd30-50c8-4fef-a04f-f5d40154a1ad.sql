
-- Mental Performance Module tables
CREATE TABLE public.mental_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 10),
  focus_level INTEGER CHECK (focus_level BETWEEN 1 AND 10),
  motivation_level INTEGER CHECK (motivation_level BETWEEN 1 AND 10),
  anxiety_level INTEGER CHECK (anxiety_level BETWEEN 1 AND 10),
  pre_game_routine_completed BOOLEAN DEFAULT false,
  visualization_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);

CREATE TABLE public.mental_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL DEFAULT 'performance', -- 'performance', 'process', 'outcome'
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT,
  content TEXT NOT NULL,
  mood INTEGER CHECK (mood BETWEEN 1 AND 10),
  tags TEXT[] DEFAULT '{}',
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- S&C Module tables
CREATE TABLE public.sc_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  sport_type TEXT DEFAULT 'baseball',
  age_group TEXT, -- '10U', '12U', '14U', '16U', '18U', 'College'
  program_type TEXT NOT NULL DEFAULT 'strength', -- 'strength', 'conditioning', 'mobility', 'power', 'speed'
  difficulty TEXT NOT NULL DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
  duration_weeks INTEGER DEFAULT 4,
  sessions_per_week INTEGER DEFAULT 3,
  exercises JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.sc_workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  program_id UUID REFERENCES public.sc_programs(id),
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercises_completed JSONB DEFAULT '[]',
  duration_minutes INTEGER,
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10), -- rate of perceived exertion
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Practice Plan Builder
CREATE TABLE public.practice_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  coach_user_id UUID NOT NULL,
  title TEXT NOT NULL,
  practice_date DATE NOT NULL,
  duration_minutes INTEGER DEFAULT 90,
  focus_areas TEXT[] DEFAULT '{}',
  plan_blocks JSONB DEFAULT '[]', -- [{name, duration_min, drills[], notes}]
  sport_type TEXT DEFAULT 'baseball',
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'completed'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DP/Flex lineup tracking (softball)
CREATE TABLE public.dpflex_lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  coach_user_id UUID NOT NULL,
  game_date DATE NOT NULL DEFAULT CURRENT_DATE,
  game_label TEXT,
  dp_player_name TEXT NOT NULL,
  dp_batting_order INTEGER,
  flex_player_name TEXT NOT NULL,
  flex_position TEXT NOT NULL DEFAULT 'Pitcher',
  substitutions JSONB DEFAULT '[]', -- [{inning, action, player_in, player_out, notes}]
  is_dp_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.mental_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mental_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sc_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sc_workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpflex_lineups ENABLE ROW LEVEL SECURITY;

-- Mental perf: users own their data
CREATE POLICY "Users manage own mental logs" ON public.mental_performance_logs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own mental goals" ON public.mental_goals FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own journal" ON public.journal_entries FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- S&C: programs readable by all, logs owned by user
CREATE POLICY "Anyone can view active SC programs" ON public.sc_programs FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins manage SC programs" ON public.sc_programs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users manage own workout logs" ON public.sc_workout_logs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Practice plans: coach owns
CREATE POLICY "Coaches manage own practice plans" ON public.practice_plans FOR ALL TO authenticated USING (coach_user_id = auth.uid()) WITH CHECK (coach_user_id = auth.uid());
CREATE POLICY "Admins view all practice plans" ON public.practice_plans FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- DP/Flex: coach owns
CREATE POLICY "Coaches manage own dpflex lineups" ON public.dpflex_lineups FOR ALL TO authenticated USING (coach_user_id = auth.uid()) WITH CHECK (coach_user_id = auth.uid());
CREATE POLICY "Admins view all dpflex lineups" ON public.dpflex_lineups FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed S&C programs
INSERT INTO public.sc_programs (title, description, sport_type, program_type, difficulty, duration_weeks, sessions_per_week, exercises) VALUES
('In-Season Arm Care', 'Daily arm health routine for pitchers during competition season', 'baseball', 'mobility', 'beginner', 12, 5, '[{"name":"Band Pull-Aparts","sets":3,"reps":15},{"name":"Shoulder External Rotation","sets":3,"reps":12},{"name":"Prone Y-T-W","sets":2,"reps":10},{"name":"Sleeper Stretch","sets":2,"reps":"30sec"}]'),
('Off-Season Power Development', 'Build explosive power for hitting and throwing', 'baseball', 'power', 'intermediate', 8, 3, '[{"name":"Trap Bar Deadlift","sets":4,"reps":5},{"name":"Med Ball Rotational Throw","sets":3,"reps":8},{"name":"Box Jump","sets":3,"reps":5},{"name":"Cable Woodchop","sets":3,"reps":10}]'),
('Speed & Agility Foundation', 'Base-running speed and defensive agility', 'baseball', 'speed', 'beginner', 6, 3, '[{"name":"10-Yard Sprint","sets":6,"reps":1},{"name":"Pro Agility Shuttle","sets":4,"reps":1},{"name":"Lateral Bound","sets":3,"reps":8},{"name":"A-Skip","sets":3,"reps":"20yd"}]'),
('Softball Pitcher Conditioning', 'Windmill-specific conditioning and lower body strength', 'softball', 'conditioning', 'intermediate', 8, 4, '[{"name":"Single-Leg RDL","sets":3,"reps":10},{"name":"Hip Circles","sets":3,"reps":12},{"name":"Plank Shoulder Tap","sets":3,"reps":20},{"name":"Glute Bridge March","sets":3,"reps":12}]'),
('Youth Athlete Foundation', 'Age-appropriate strength basics for 12U-14U', 'baseball', 'strength', 'beginner', 6, 2, '[{"name":"Bodyweight Squat","sets":3,"reps":12},{"name":"Push-Up","sets":3,"reps":10},{"name":"Plank","sets":3,"reps":"30sec"},{"name":"Lunges","sets":2,"reps":10}]'),
('Hitting Power Program', 'Rotational power and core strength for hitters', 'baseball', 'power', 'advanced', 8, 4, '[{"name":"Landmine Rotation","sets":4,"reps":8},{"name":"Cable Anti-Rotation Press","sets":3,"reps":12},{"name":"Hip Thrust","sets":4,"reps":8},{"name":"Med Ball Slam","sets":3,"reps":10}]');
