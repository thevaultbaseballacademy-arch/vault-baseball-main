-- Create a function to get certification questions for exam (without correct answers)
CREATE OR REPLACE FUNCTION public.get_exam_questions(
  cert_type certification_type,
  question_limit integer DEFAULT 40
)
RETURNS TABLE (
  id uuid,
  question_text text,
  options jsonb,
  section text,
  is_scenario boolean,
  display_order integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cq.id,
    cq.question_text,
    cq.options,
    cq.section,
    cq.is_scenario,
    cq.display_order
  FROM public.certification_questions cq
  WHERE cq.certification_type = cert_type
    AND cq.is_active = true
  ORDER BY random()
  LIMIT question_limit
$$;

-- Create a function to grade an exam (only returns if answer is correct, not the correct answer itself)
CREATE OR REPLACE FUNCTION public.check_exam_answer(
  question_id uuid,
  selected_answer integer
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cq.correct_answer_index = selected_answer
  FROM public.certification_questions cq
  WHERE cq.id = question_id
$$;

-- Create a function to get question explanation after answering (for learning)
CREATE OR REPLACE FUNCTION public.get_question_explanation(
  question_id uuid
)
RETURNS TABLE (
  explanation text,
  is_correct boolean,
  correct_answer_index integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cq.explanation,
    false as is_correct,
    cq.correct_answer_index
  FROM public.certification_questions cq
  WHERE cq.id = question_id
$$;

-- Drop the permissive coach policy and replace with admin-only
DROP POLICY IF EXISTS "Admins and coaches can view questions" ON public.certification_questions;

-- Only admins can directly view questions (with answers) via table
CREATE POLICY "Admins can view questions with answers"
ON public.certification_questions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));