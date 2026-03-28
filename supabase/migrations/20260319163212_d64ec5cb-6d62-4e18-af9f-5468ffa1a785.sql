
-- 1. Workload records — daily athlete workload tracking
CREATE TABLE public.workload_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id UUID NOT NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sport_type TEXT NOT NULL DEFAULT 'baseball',
  throwing_count INT DEFAULT 0,
  pitch_count INT DEFAULT 0,
  training_minutes INT DEFAULT 0,
  lesson_minutes INT DEFAULT 0,
  drill_sets_completed INT DEFAULT 0,
  recovery_status TEXT DEFAULT 'full' CHECK (recovery_status IN ('full','limited','rest_day')),
  soreness_level INT CHECK (soreness_level BETWEEN 1 AND 5),
  sleep_hours NUMERIC(3,1),
  readiness_score NUMERIC(4,1),
  overuse_flag BOOLEAN DEFAULT false,
  overuse_alert TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (athlete_user_id, record_date)
);

CREATE TRIGGER update_workload_records_updated_at
  BEFORE UPDATE ON public.workload_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.workload_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes manage own workload records" ON public.workload_records
  FOR ALL USING (auth.uid() = athlete_user_id) WITH CHECK (auth.uid() = athlete_user_id);
CREATE POLICY "Coaches read assigned athlete workload" ON public.workload_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.coach_athlete_assignments ca
      WHERE ca.coach_user_id = auth.uid() AND ca.athlete_user_id = workload_records.athlete_user_id AND ca.is_active = true)
  );
CREATE POLICY "Parents read linked athlete workload" ON public.workload_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.parent_athlete_links pal
      WHERE pal.parent_user_id = auth.uid() AND pal.athlete_user_id = workload_records.athlete_user_id AND pal.status = 'active')
  );
CREATE POLICY "Owners view all workload records" ON public.workload_records
  FOR SELECT USING (public.is_owner(auth.uid()));

-- 2. Workload thresholds — configurable limits per sport/age/position
CREATE TABLE public.workload_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_type TEXT NOT NULL DEFAULT 'baseball',
  age_group TEXT NOT NULL,
  position TEXT,
  max_pitches_per_day INT,
  max_pitches_per_week INT,
  required_rest_days_after JSONB DEFAULT '[]',
  max_training_minutes_per_week INT,
  owner_configurable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_workload_thresholds_updated_at
  BEFORE UPDATE ON public.workload_thresholds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.workload_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read workload thresholds" ON public.workload_thresholds
  FOR SELECT USING (true);
CREATE POLICY "Owners manage workload thresholds" ON public.workload_thresholds
  FOR ALL USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

-- 3. Seed default baseball thresholds (USA Baseball guidelines)
INSERT INTO public.workload_thresholds (sport_type, age_group, position, max_pitches_per_day, max_pitches_per_week, required_rest_days_after, max_training_minutes_per_week) VALUES
  ('baseball', '9-10',   'pitcher', 75,  125, '[{"pitchCount":50,"restDays":2},{"pitchCount":65,"restDays":3}]', 600),
  ('baseball', '11-12',  'pitcher', 85,  140, '[{"pitchCount":60,"restDays":2},{"pitchCount":75,"restDays":3}]', 720),
  ('baseball', '13-14',  'pitcher', 95,  160, '[{"pitchCount":70,"restDays":2},{"pitchCount":85,"restDays":3}]', 840),
  ('baseball', '15-16',  'pitcher', 95,  180, '[{"pitchCount":75,"restDays":2},{"pitchCount":90,"restDays":3}]', 900),
  ('baseball', '17-18',  'pitcher', 105, 200, '[{"pitchCount":80,"restDays":2},{"pitchCount":95,"restDays":3}]', 960),
  ('baseball', '19+',    'pitcher', 120, 250, '[{"pitchCount":90,"restDays":2},{"pitchCount":110,"restDays":3}]', 1080);

-- 4. Seed default softball (fastpitch) thresholds
INSERT INTO public.workload_thresholds (sport_type, age_group, position, max_pitches_per_day, max_pitches_per_week, required_rest_days_after, max_training_minutes_per_week) VALUES
  ('softball', '10U',    'pitcher', 80,  200, '[{"pitchCount":60,"restDays":1},{"pitchCount":80,"restDays":2}]', 600),
  ('softball', '12U',    'pitcher', 100, 250, '[{"pitchCount":75,"restDays":1},{"pitchCount":100,"restDays":2}]', 720),
  ('softball', '14U',    'pitcher', 115, 300, '[{"pitchCount":90,"restDays":1},{"pitchCount":115,"restDays":2}]', 840),
  ('softball', '16U',    'pitcher', 125, 350, '[{"pitchCount":100,"restDays":1},{"pitchCount":125,"restDays":2}]', 900),
  ('softball', '18U',    'pitcher', 140, 400, '[{"pitchCount":110,"restDays":1},{"pitchCount":140,"restDays":2}]', 960),
  ('softball', 'college','pitcher', 150, 450, '[{"pitchCount":120,"restDays":1},{"pitchCount":150,"restDays":2}]', 1080);
