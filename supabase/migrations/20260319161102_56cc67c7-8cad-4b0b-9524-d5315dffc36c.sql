
-- Pitch count tracking per game/session
CREATE TABLE public.pitch_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_type TEXT NOT NULL DEFAULT 'game' CHECK (session_type IN ('game', 'bullpen', 'live_bp', 'warmup')),
  pitch_count INTEGER NOT NULL DEFAULT 0,
  innings_pitched NUMERIC(3,1),
  pitch_types JSONB DEFAULT '{}',
  max_velocity NUMERIC(5,1),
  avg_velocity NUMERIC(5,1),
  pain_reported BOOLEAN DEFAULT false,
  pain_location TEXT,
  pain_level INTEGER CHECK (pain_level BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pitch_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own pitch counts" ON public.pitch_counts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches view assigned athlete pitch counts" ON public.pitch_counts
  FOR SELECT USING (public.is_active_coach_for_athlete(auth.uid(), user_id));

CREATE POLICY "Owners view all pitch counts" ON public.pitch_counts
  FOR SELECT USING (public.is_owner(auth.uid()));

CREATE TRIGGER update_pitch_counts_updated_at
  BEFORE UPDATE ON public.pitch_counts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Arm care / recovery protocol tracking
CREATE TABLE public.arm_care_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercises_completed JSONB DEFAULT '[]',
  band_work_minutes INTEGER DEFAULT 0,
  stretching_minutes INTEGER DEFAULT 0,
  icing_minutes INTEGER DEFAULT 0,
  arm_feeling INTEGER CHECK (arm_feeling BETWEEN 1 AND 5),
  rom_score INTEGER CHECK (rom_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);

ALTER TABLE public.arm_care_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own arm care logs" ON public.arm_care_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches view assigned athlete arm care" ON public.arm_care_logs
  FOR SELECT USING (public.is_active_coach_for_athlete(auth.uid(), user_id));

CREATE POLICY "Owners view all arm care logs" ON public.arm_care_logs
  FOR SELECT USING (public.is_owner(auth.uid()));

CREATE TRIGGER update_arm_care_logs_updated_at
  BEFORE UPDATE ON public.arm_care_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Injury reports for tracking and prevention
CREATE TABLE public.injury_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  injury_date DATE NOT NULL DEFAULT CURRENT_DATE,
  body_part TEXT NOT NULL,
  injury_type TEXT NOT NULL DEFAULT 'soreness' CHECK (injury_type IN ('soreness', 'strain', 'sprain', 'fracture', 'tendinitis', 'other')),
  severity INTEGER NOT NULL DEFAULT 1 CHECK (severity BETWEEN 1 AND 5),
  description TEXT,
  treatment TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_date DATE,
  days_missed INTEGER DEFAULT 0,
  cleared_by_medical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.injury_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own injury reports" ON public.injury_reports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches view assigned athlete injuries" ON public.injury_reports
  FOR SELECT USING (public.is_active_coach_for_athlete(auth.uid(), user_id));

CREATE POLICY "Owners view all injury reports" ON public.injury_reports
  FOR SELECT USING (public.is_owner(auth.uid()));

CREATE TRIGGER update_injury_reports_updated_at
  BEFORE UPDATE ON public.injury_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Age-based workload limits (reference table)
CREATE TABLE public.workload_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age_min INTEGER NOT NULL,
  age_max INTEGER NOT NULL,
  max_pitches_per_game INTEGER NOT NULL,
  max_pitches_per_week INTEGER NOT NULL,
  max_innings_per_week NUMERIC(3,1) NOT NULL,
  required_rest_days_after_high INTEGER NOT NULL DEFAULT 2,
  high_pitch_threshold INTEGER NOT NULL,
  notes TEXT,
  sport_type TEXT NOT NULL DEFAULT 'baseball',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workload_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read workload rules" ON public.workload_rules
  FOR SELECT USING (true);

CREATE POLICY "Owners manage workload rules" ON public.workload_rules
  FOR ALL USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

-- Seed standard pitch count rules (MLB/USA Baseball guidelines)
INSERT INTO public.workload_rules (age_min, age_max, max_pitches_per_game, max_pitches_per_week, max_innings_per_week, required_rest_days_after_high, high_pitch_threshold, notes, sport_type) VALUES
(8, 10, 50, 75, 6, 1, 40, 'USA Baseball Youth guidelines', 'baseball'),
(11, 12, 65, 100, 7, 2, 55, 'USA Baseball Youth guidelines', 'baseball'),
(13, 14, 75, 120, 7, 2, 65, 'USA Baseball guidelines', 'baseball'),
(15, 16, 85, 140, 9, 2, 75, 'USA Baseball guidelines', 'baseball'),
(17, 18, 95, 160, 9, 3, 85, 'USA Baseball guidelines', 'baseball'),
(19, 22, 110, 200, 9, 3, 95, 'College-level guidelines', 'baseball'),
(8, 10, 50, 75, 6, 1, 40, 'Youth softball guidelines', 'softball'),
(11, 14, 65, 120, 7, 2, 55, 'Youth softball guidelines', 'softball'),
(15, 18, 85, 160, 9, 2, 75, 'HS softball guidelines', 'softball');
