
-- Create enums for the new admin certification system
CREATE TYPE coach_role AS ENUM ('Coach', 'Director', 'OrgAdmin', 'VAULTHQ');
CREATE TYPE coach_status AS ENUM ('Active', 'Suspended');
CREATE TYPE admin_cert_type AS ENUM ('Foundations', 'Performance', 'Catcher', 'Infield', 'Outfield');
CREATE TYPE admin_cert_status AS ENUM ('Active', 'Expiring', 'Expired', 'Locked');

-- Coaches table
CREATE TABLE public.coaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  team_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role coach_role NOT NULL DEFAULT 'Coach',
  status coach_status NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Certifications table (admin tracking)
CREATE TABLE public.admin_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  cert_type admin_cert_type NOT NULL,
  status admin_cert_status NOT NULL DEFAULT 'Active',
  issued_date DATE,
  expiration_date DATE,
  last_score INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exam attempts table
CREATE TABLE public.admin_exam_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  cert_type admin_cert_type NOT NULL,
  score INTEGER NOT NULL,
  pass_fail BOOLEAN NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Question results table
CREATE TABLE public.question_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.admin_exam_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exam questions bank
CREATE TABLE public.exam_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cert_type admin_cert_type NOT NULL,
  question_id TEXT NOT NULL UNIQUE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to check admin roles
CREATE OR REPLACE FUNCTION public.has_admin_role(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.coaches 
    WHERE user_id = user_uuid 
    AND role IN ('OrgAdmin', 'Director', 'VAULTHQ')
    AND status = 'Active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

-- Coaches RLS policies
CREATE POLICY "Admin users can view all coaches"
ON public.coaches FOR SELECT
USING (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin users can manage coaches"
ON public.coaches FOR ALL
USING (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Admin certifications RLS policies
CREATE POLICY "Admin users can view all certifications"
ON public.admin_certifications FOR SELECT
USING (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin users can manage certifications"
ON public.admin_certifications FOR ALL
USING (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Exam attempts RLS policies
CREATE POLICY "Admin users can view all exam attempts"
ON public.admin_exam_attempts FOR SELECT
USING (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin users can manage exam attempts"
ON public.admin_exam_attempts FOR ALL
USING (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Question results RLS policies
CREATE POLICY "Admin users can view question results"
ON public.question_results FOR SELECT
USING (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin users can manage question results"
ON public.question_results FOR ALL
USING (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Exam questions RLS policies
CREATE POLICY "Admin users can view exam questions"
ON public.exam_questions FOR SELECT
USING (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin users can manage exam questions"
ON public.exam_questions FOR ALL
USING (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_admin_role(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_coaches_org ON public.coaches(org_id);
CREATE INDEX idx_coaches_status ON public.coaches(status);
CREATE INDEX idx_admin_certs_coach ON public.admin_certifications(coach_id);
CREATE INDEX idx_admin_certs_status ON public.admin_certifications(status);
CREATE INDEX idx_admin_certs_expiration ON public.admin_certifications(expiration_date);
CREATE INDEX idx_exam_attempts_coach ON public.admin_exam_attempts(coach_id);
CREATE INDEX idx_exam_attempts_created ON public.admin_exam_attempts(created_at);
CREATE INDEX idx_question_results_attempt ON public.question_results(attempt_id);
CREATE INDEX idx_exam_questions_cert_type ON public.exam_questions(cert_type);

-- Function to auto-update certification statuses
CREATE OR REPLACE FUNCTION public.update_certification_statuses()
RETURNS void AS $$
BEGIN
  -- Mark as Expired if past expiration
  UPDATE public.admin_certifications
  SET status = 'Expired', updated_at = now()
  WHERE expiration_date < CURRENT_DATE 
  AND status NOT IN ('Expired', 'Locked');
  
  -- Mark as Expiring if within 30 days
  UPDATE public.admin_certifications
  SET status = 'Expiring', updated_at = now()
  WHERE expiration_date <= CURRENT_DATE + INTERVAL '30 days'
  AND expiration_date >= CURRENT_DATE
  AND status = 'Active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
