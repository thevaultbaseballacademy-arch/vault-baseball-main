
-- Lesson packages (purchasable bundles)
CREATE TABLE public.lesson_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  lesson_count INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_price_id TEXT,
  package_type TEXT NOT NULL DEFAULT 'individual', -- 'individual' or 'group'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User lesson credits (purchased packages)
CREATE TABLE public.lesson_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  package_id UUID REFERENCES public.lesson_packages(id),
  total_lessons INTEGER NOT NULL,
  used_lessons INTEGER NOT NULL DEFAULT 0,
  stripe_session_id TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Coach availability slots
CREATE TABLE public.coach_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Remote lesson sessions (1-on-1)
CREATE TABLE public.remote_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_user_id UUID NOT NULL,
  athlete_user_id UUID NOT NULL,
  credit_id UUID REFERENCES public.lesson_credits(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  video_call_link TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled
  notes TEXT,
  coach_notes TEXT,
  athlete_rating INTEGER CHECK (athlete_rating >= 1 AND athlete_rating <= 5),
  athlete_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Group sessions
CREATE TABLE public.group_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 90,
  max_participants INTEGER NOT NULL DEFAULT 10,
  video_call_link TEXT,
  focus_area TEXT, -- 'pitching', 'hitting', 'fielding', 'general'
  skill_level TEXT DEFAULT 'all', -- 'beginner', 'intermediate', 'advanced', 'all'
  status TEXT NOT NULL DEFAULT 'open', -- open, full, in_progress, completed, cancelled
  price_credits INTEGER NOT NULL DEFAULT 1, -- how many credits to join
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Group session enrollments
CREATE TABLE public.group_session_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.group_sessions(id) ON DELETE CASCADE,
  athlete_user_id UUID NOT NULL,
  credit_id UUID REFERENCES public.lesson_credits(id),
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'enrolled', -- enrolled, attended, no_show, cancelled
  UNIQUE(session_id, athlete_user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.lesson_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remote_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_session_enrollments ENABLE ROW LEVEL SECURITY;

-- Lesson packages: everyone can read active ones
CREATE POLICY "Anyone can view active packages" ON public.lesson_packages
  FOR SELECT USING (is_active = true);

-- Lesson credits: users see their own
CREATE POLICY "Users can view own credits" ON public.lesson_credits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credits" ON public.lesson_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Coach availability: coaches manage their own, athletes can read all active
CREATE POLICY "Anyone can view active availability" ON public.coach_availability
  FOR SELECT USING (is_active = true);
CREATE POLICY "Coaches can manage own availability" ON public.coach_availability
  FOR INSERT WITH CHECK (auth.uid() = coach_user_id);
CREATE POLICY "Coaches can update own availability" ON public.coach_availability
  FOR UPDATE USING (auth.uid() = coach_user_id);
CREATE POLICY "Coaches can delete own availability" ON public.coach_availability
  FOR DELETE USING (auth.uid() = coach_user_id);

-- Remote lessons: both coach and athlete can see their lessons
CREATE POLICY "Users can view own lessons" ON public.remote_lessons
  FOR SELECT USING (auth.uid() = coach_user_id OR auth.uid() = athlete_user_id);
CREATE POLICY "Athletes can book lessons" ON public.remote_lessons
  FOR INSERT WITH CHECK (auth.uid() = athlete_user_id);
CREATE POLICY "Participants can update lessons" ON public.remote_lessons
  FOR UPDATE USING (auth.uid() = coach_user_id OR auth.uid() = athlete_user_id);

-- Group sessions: everyone can view, coaches manage their own
CREATE POLICY "Anyone can view group sessions" ON public.group_sessions
  FOR SELECT USING (true);
CREATE POLICY "Coaches can create sessions" ON public.group_sessions
  FOR INSERT WITH CHECK (auth.uid() = coach_user_id);
CREATE POLICY "Coaches can update own sessions" ON public.group_sessions
  FOR UPDATE USING (auth.uid() = coach_user_id);

-- Group enrollments: athletes manage their own
CREATE POLICY "Users can view enrollments" ON public.group_session_enrollments
  FOR SELECT USING (auth.uid() = athlete_user_id OR EXISTS (
    SELECT 1 FROM public.group_sessions gs WHERE gs.id = session_id AND gs.coach_user_id = auth.uid()
  ));
CREATE POLICY "Athletes can enroll" ON public.group_session_enrollments
  FOR INSERT WITH CHECK (auth.uid() = athlete_user_id);
CREATE POLICY "Athletes can update own enrollment" ON public.group_session_enrollments
  FOR UPDATE USING (auth.uid() = athlete_user_id);

-- Seed default lesson packages
INSERT INTO public.lesson_packages (name, description, lesson_count, price_cents, package_type) VALUES
  ('4-Lesson Pack', '4 one-on-one remote coaching sessions with a VAULT™ certified coach', 4, 19900, 'individual'),
  ('8-Lesson Pack', '8 one-on-one remote coaching sessions with a VAULT™ certified coach — Best Value', 8, 34900, 'individual');
