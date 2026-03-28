
-- Tournament tracking table
CREATE TABLE public.tournament_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id UUID NOT NULL,
  tournament_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  sport_type TEXT NOT NULL DEFAULT 'baseball',
  is_active BOOLEAN DEFAULT true,
  total_pitches_thrown INTEGER DEFAULT 0,
  total_games_played INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tournament game entries
CREATE TABLE public.tournament_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournament_events(id) ON DELETE CASCADE NOT NULL,
  athlete_user_id UUID NOT NULL,
  game_number INTEGER NOT NULL DEFAULT 1,
  game_date DATE NOT NULL,
  game_time TIMESTAMPTZ,
  pitches_thrown INTEGER DEFAULT 0,
  innings_pitched NUMERIC(3,1),
  pitch_types JSONB DEFAULT '{}',
  max_velocity NUMERIC(5,1),
  rest_hours_since_last NUMERIC(5,1),
  safe_to_pitch BOOLEAN DEFAULT true,
  safe_to_pitch_reason TEXT,
  pain_reported BOOLEAN DEFAULT false,
  pain_location TEXT,
  pain_level INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pitch type breakdown per session (detailed tracking)
CREATE TABLE public.pitch_type_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_id UUID, -- links to pitch_counts or tournament_games
  session_source TEXT NOT NULL DEFAULT 'practice', -- 'practice', 'game', 'tournament', 'bullpen'
  pitch_type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  sport_type TEXT NOT NULL DEFAULT 'baseball',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tournament_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_type_counts ENABLE ROW LEVEL SECURITY;

-- RLS policies for tournament_events
CREATE POLICY "Users can view own tournament events"
  ON public.tournament_events FOR SELECT
  TO authenticated
  USING (athlete_user_id = auth.uid());

CREATE POLICY "Users can insert own tournament events"
  ON public.tournament_events FOR INSERT
  TO authenticated
  WITH CHECK (athlete_user_id = auth.uid());

CREATE POLICY "Users can update own tournament events"
  ON public.tournament_events FOR UPDATE
  TO authenticated
  USING (athlete_user_id = auth.uid());

-- Coaches can view assigned athletes' tournaments
CREATE POLICY "Coaches can view assigned athlete tournaments"
  ON public.tournament_events FOR SELECT
  TO authenticated
  USING (public.is_active_coach_for_athlete(auth.uid(), athlete_user_id));

-- RLS policies for tournament_games
CREATE POLICY "Users can view own tournament games"
  ON public.tournament_games FOR SELECT
  TO authenticated
  USING (athlete_user_id = auth.uid());

CREATE POLICY "Users can insert own tournament games"
  ON public.tournament_games FOR INSERT
  TO authenticated
  WITH CHECK (athlete_user_id = auth.uid());

CREATE POLICY "Users can update own tournament games"
  ON public.tournament_games FOR UPDATE
  TO authenticated
  USING (athlete_user_id = auth.uid());

CREATE POLICY "Coaches can view assigned athlete tournament games"
  ON public.tournament_games FOR SELECT
  TO authenticated
  USING (public.is_active_coach_for_athlete(auth.uid(), athlete_user_id));

-- RLS policies for pitch_type_counts
CREATE POLICY "Users can manage own pitch type counts"
  ON public.pitch_type_counts FOR ALL
  TO authenticated
  USING (athlete_user_id = auth.uid());

CREATE POLICY "Coaches can view assigned athlete pitch types"
  ON public.pitch_type_counts FOR SELECT
  TO authenticated
  USING (public.is_active_coach_for_athlete(auth.uid(), athlete_user_id));

-- Admins can view all workload data
CREATE POLICY "Admins can view all tournament events"
  ON public.tournament_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all tournament games"
  ON public.tournament_games FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all pitch type counts"
  ON public.pitch_type_counts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at triggers
CREATE TRIGGER update_tournament_events_updated_at
  BEFORE UPDATE ON public.tournament_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed comprehensive workload thresholds (USA Baseball + USA Softball guidelines)
INSERT INTO public.workload_thresholds (age_group, sport_type, max_pitches_per_day, max_pitches_per_week, max_training_minutes_per_week, required_rest_days_after, position, owner_configurable)
VALUES
  ('10U', 'baseball', 50, 75, 300, '{"50": 1, "65": 2}', 'pitcher', true),
  ('12U', 'baseball', 65, 100, 360, '{"65": 1, "85": 2}', 'pitcher', true),
  ('14U', 'baseball', 75, 125, 420, '{"75": 1, "100": 2, "115": 3}', 'pitcher', true),
  ('16U', 'baseball', 90, 150, 480, '{"90": 1, "105": 3}', 'pitcher', true),
  ('18U', 'baseball', 105, 175, 540, '{"105": 1, "120": 3}', 'pitcher', true),
  ('College', 'baseball', 120, 200, 600, '{"110": 1, "130": 3}', 'pitcher', true),
  ('10U', 'softball', 50, 150, 300, '{"75": 1}', 'pitcher', true),
  ('12U', 'softball', 50, 150, 300, '{"75": 1}', 'pitcher', true),
  ('14U', 'softball', 75, 200, 420, '{"100": 1}', 'pitcher', true),
  ('16U', 'softball', 100, 250, 480, '{"125": 1}', 'pitcher', true),
  ('18U', 'softball', 100, 250, 540, '{"125": 1}', 'pitcher', true),
  ('College', 'softball', 120, 300, 600, '{"150": 1}', 'pitcher', true)
ON CONFLICT DO NOTHING;
