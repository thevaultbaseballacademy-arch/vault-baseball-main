
-- Coach lesson feedback table
CREATE TABLE public.coach_lesson_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL,
  coach_user_id uuid NOT NULL,
  athlete_user_id uuid NOT NULL,
  strengths_observed text,
  areas_for_improvement text,
  lesson_focus text,
  recommended_drills jsonb DEFAULT '[]'::jsonb,
  next_development_focus text,
  ai_summary text,
  ai_recommended_drills jsonb,
  ai_homework jsonb,
  ai_generated_at timestamptz,
  submitted_at timestamptz DEFAULT now(),
  delivered_to_athlete boolean DEFAULT false,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.coach_lesson_feedback ENABLE ROW LEVEL SECURITY;

-- RLS: coaches can manage their own feedback, athletes can read their own
CREATE POLICY "Coaches manage own feedback" ON public.coach_lesson_feedback
  FOR ALL TO authenticated
  USING (coach_user_id = auth.uid())
  WITH CHECK (coach_user_id = auth.uid());

CREATE POLICY "Athletes read own feedback" ON public.coach_lesson_feedback
  FOR SELECT TO authenticated
  USING (athlete_user_id = auth.uid());

-- Player homework/accountability items
CREATE TABLE public.player_homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL,
  feedback_id uuid REFERENCES public.coach_lesson_feedback(id) ON DELETE CASCADE,
  athlete_user_id uuid NOT NULL,
  coach_user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text DEFAULT 'drill',
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  due_date date,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.player_homework ENABLE ROW LEVEL SECURITY;

-- Athletes can view and update completion, coaches can manage
CREATE POLICY "Athletes manage own homework" ON public.player_homework
  FOR ALL TO authenticated
  USING (athlete_user_id = auth.uid());

CREATE POLICY "Coaches manage assigned homework" ON public.player_homework
  FOR ALL TO authenticated
  USING (coach_user_id = auth.uid())
  WITH CHECK (coach_user_id = auth.uid());

-- Lesson reminders tracking
CREATE TABLE public.lesson_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reminder_type text NOT NULL, -- '24h', '1h', '30min'
  channel text NOT NULL, -- 'in_app', 'email', 'sms'
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.lesson_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own reminders" ON public.lesson_reminders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Index for checking if reminder already sent
CREATE UNIQUE INDEX idx_lesson_reminders_unique 
  ON public.lesson_reminders(lesson_id, user_id, reminder_type, channel);

-- Triggers for updated_at
CREATE TRIGGER update_coach_lesson_feedback_updated_at
  BEFORE UPDATE ON public.coach_lesson_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_homework_updated_at
  BEFORE UPDATE ON public.player_homework
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for homework (athlete sees updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_homework;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_lesson_feedback;
