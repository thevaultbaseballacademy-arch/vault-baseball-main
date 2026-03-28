ALTER TABLE public.exam_questions 
  ADD COLUMN IF NOT EXISTS question_type text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS scenario_id text,
  ADD COLUMN IF NOT EXISTS step_number integer,
  ADD COLUMN IF NOT EXISTS kpi_category text,
  ADD COLUMN IF NOT EXISTS difficulty_level text NOT NULL DEFAULT 'standard';

CREATE INDEX IF NOT EXISTS idx_exam_questions_question_type ON public.exam_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_exam_questions_scenario_id ON public.exam_questions(scenario_id);