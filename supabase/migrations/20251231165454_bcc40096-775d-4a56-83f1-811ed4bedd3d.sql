-- VAULT™ Coach Certification System

-- Certification types enum
CREATE TYPE public.certification_type AS ENUM ('foundations', 'performance', 'catcher_specialist', 'infield_specialist', 'outfield_specialist');

-- Certification status enum
CREATE TYPE public.certification_status AS ENUM ('active', 'expired', 'revoked');

-- Certification types/definitions table
CREATE TABLE public.certification_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_type certification_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 85,
  question_count INTEGER NOT NULL DEFAULT 40,
  validity_months INTEGER NOT NULL DEFAULT 12,
  price_cents INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT false,
  prerequisites certification_type[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exam questions table
CREATE TABLE public.certification_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_type certification_type NOT NULL,
  section TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer_index INTEGER NOT NULL,
  explanation TEXT,
  is_scenario BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User certifications table
CREATE TABLE public.user_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  certification_type certification_type NOT NULL,
  status certification_status NOT NULL DEFAULT 'active',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  score INTEGER NOT NULL,
  attempt_id UUID,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, certification_type)
);

-- Exam attempts table
CREATE TABLE public.certification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  certification_type certification_type NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER,
  passed BOOLEAN,
  question_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_cert_questions_type ON public.certification_questions(certification_type);
CREATE INDEX idx_cert_questions_active ON public.certification_questions(is_active);
CREATE INDEX idx_user_certs_user ON public.user_certifications(user_id);
CREATE INDEX idx_user_certs_status ON public.user_certifications(status);
CREATE INDEX idx_cert_attempts_user ON public.certification_attempts(user_id);

-- Enable RLS
ALTER TABLE public.certification_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_attempts ENABLE ROW LEVEL SECURITY;

-- Certification definitions policies (public read, admin write)
CREATE POLICY "Anyone can view certification definitions"
  ON public.certification_definitions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage certification definitions"
  ON public.certification_definitions FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Questions policies (admins/coaches can view, admins can write)
CREATE POLICY "Admins and coaches can view questions"
  ON public.certification_questions FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coach'));

CREATE POLICY "Admins can insert questions"
  ON public.certification_questions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update questions"
  ON public.certification_questions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete questions"
  ON public.certification_questions FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- User certifications policies
CREATE POLICY "Users can view own certifications"
  ON public.user_certifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all certifications"
  ON public.user_certifications FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own certifications"
  ON public.user_certifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all certifications"
  ON public.user_certifications FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Attempts policies
CREATE POLICY "Users can view own attempts"
  ON public.certification_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attempts"
  ON public.certification_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts"
  ON public.certification_attempts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts"
  ON public.certification_attempts FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Insert certification definitions
INSERT INTO public.certification_definitions (certification_type, name, description, passing_score, question_count, validity_months, price_cents, is_required, prerequisites) VALUES
  ('foundations', 'VAULT™ Foundations Certification', 'Required for all coaches. Ensures understanding of VAULT™ philosophy, 5 Pillars, and long-term development priorities.', 85, 40, 12, 0, true, '{}'),
  ('performance', 'VAULT™ Performance Certification', 'Required for Performance License organizations. Covers strength & power, arm health, workload management, and KPIs.', 88, 50, 12, 250000, false, '{foundations}'),
  ('catcher_specialist', 'VAULT™ Catcher Specialist', 'Position-specific certification for catcher development and training.', 90, 30, 24, 150000, false, '{foundations}'),
  ('infield_specialist', 'VAULT™ Infield Specialist', 'Position-specific certification for infield development and training.', 90, 30, 24, 150000, false, '{foundations}'),
  ('outfield_specialist', 'VAULT™ Outfield Specialist', 'Position-specific certification for outfield development and training.', 90, 30, 24, 150000, false, '{foundations}');

-- Insert sample questions for Foundations
INSERT INTO public.certification_questions (certification_type, section, question_text, options, correct_answer_index, explanation, is_scenario, display_order) VALUES
  ('foundations', 'VAULT™ Philosophy', 'The primary purpose of VAULT™ is to:', '["Maximize short-term wins", "Standardize long-term athlete development", "Replace coach creativity", "Increase training volume"]', 1, 'VAULT™ focuses on standardizing long-term athlete development while allowing coaches to maintain creativity within the system.', false, 1),
  ('foundations', 'The 5 Pillars', 'Which pillar directly prioritizes availability as a performance metric?', '["Velocity", "Athleticism", "Utility", "Longevity"]', 3, 'Longevity is the pillar that prioritizes availability, ensuring athletes can perform consistently over time.', false, 7),
  ('foundations', 'Development Pathways', 'At the Youth stage, which is the primary focus?', '["Radar velocity", "Early specialization", "Movement quality and coordination", "Max-intent throwing"]', 2, 'Youth development prioritizes movement quality and coordination as the foundation for future athletic development.', false, 12),
  ('foundations', 'System Integrity', 'Coaches may customize which of the following?', '["VAULT™ pillars", "Required metrics", "Drill selection", "Workload rules"]', 2, 'Coaches have flexibility in drill selection while maintaining the core VAULT™ pillars, metrics, and workload rules.', false, 18),
  ('foundations', 'Scenario-Based', 'A coach wants to add extra max-intent throwing days before a tournament. What is the correct VAULT™ response?', '["Allow it for competition", "Allow it if athlete feels good", "Deny it due to workload rules", "Leave decision to athlete"]', 2, 'VAULT™ workload rules are non-negotiable to protect athlete health, regardless of competitive pressure.', true, 25);

-- Insert sample questions for Performance
INSERT INTO public.certification_questions (certification_type, section, question_text, options, correct_answer_index, explanation, is_scenario, display_order) VALUES
  ('performance', 'Strength & Power', 'VAULT™ strength training prioritizes which outcome?', '["1RM increases", "Muscle soreness", "Transferable force", "Volume accumulation"]', 2, 'VAULT™ strength training focuses on transferable force that applies directly to athletic performance.', false, 6),
  ('performance', 'Arm Health & Workload', 'Which variable increases arm stress exponentially?', '["Throw count", "Throw distance", "Throw intent", "Throw frequency"]', 2, 'Throw intent (effort level) has an exponential effect on arm stress compared to other variables.', false, 14),
  ('performance', 'In-Season Decisions', 'During in-season play, strength training should primarily focus on:', '["Max force development", "Maintenance and availability", "Hypertrophy", "New skill acquisition"]', 1, 'In-season training prioritizes maintenance and keeping athletes available for competition.', false, 21),
  ('performance', 'KPIs', 'Which KPI is most important to organizational leadership?', '["Max velocity", "Personal records", "Availability percentage", "Lift totals"]', 2, 'Availability percentage is the most critical KPI as it directly impacts team performance and player investment.', false, 33),
  ('performance', 'Scenario', 'An athlete shows declining recovery markers but stable velocity. What is the correct VAULT™ action?', '["Continue workload", "Increase recovery and reduce stress", "Ignore unless pain appears", "Increase throwing to maintain velocity"]', 1, 'Declining recovery markers require intervention before injury occurs, even if performance metrics remain stable.', true, 41);

-- Insert sample questions for Catcher Specialist
INSERT INTO public.certification_questions (certification_type, section, question_text, options, correct_answer_index, explanation, is_scenario, display_order) VALUES
  ('catcher_specialist', 'Workload Management', 'What is the primary risk of catcher overuse?', '["Leg fatigue", "Arm stress accumulation", "Reduced blocking speed", "Grip strength loss"]', 1, 'Catchers face significant arm stress accumulation due to the volume of throws required in games and practice.', false, 8);

-- Insert sample questions for Infield Specialist
INSERT INTO public.certification_questions (certification_type, section, question_text, options, correct_answer_index, explanation, is_scenario, display_order) VALUES
  ('infield_specialist', 'Arm Development', 'In VAULT™, infield arm strength should prioritize:', '["Max velocity", "Long throws", "Accuracy and efficiency", "Distance"]', 2, 'Infielders need accurate, efficient throws rather than maximum velocity due to shorter throw distances.', false, 11);

-- Insert sample questions for Outfield Specialist
INSERT INTO public.certification_questions (certification_type, section, question_text, options, correct_answer_index, explanation, is_scenario, display_order) VALUES
  ('outfield_specialist', 'Game Decision Making', 'When should an outfielder prioritize a cutoff over a throw?', '["When crowd is loud", "When arm strength is low", "When damage prevention outweighs outs", "Never"]', 2, 'Outfielders should use the cutoff when preventing additional bases is more valuable than attempting an out.', false, 9);

-- Function to check if user has valid certification
CREATE OR REPLACE FUNCTION public.has_valid_certification(
  _user_id UUID,
  _cert_type certification_type
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_certifications
    WHERE user_id = _user_id
      AND certification_type = _cert_type
      AND status = 'active'
      AND expires_at > now()
  )
$$;

-- Updated at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers
CREATE TRIGGER update_certification_definitions_updated_at
  BEFORE UPDATE ON public.certification_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certification_questions_updated_at
  BEFORE UPDATE ON public.certification_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_certifications_updated_at
  BEFORE UPDATE ON public.user_certifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();