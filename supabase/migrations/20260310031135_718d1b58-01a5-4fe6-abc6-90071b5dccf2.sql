
-- Table for free evaluation leads (public lead capture)
CREATE TABLE public.evaluation_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  age INTEGER,
  position TEXT,
  current_velocity TEXT,
  video_url TEXT,
  video_type TEXT DEFAULT 'pitching',
  development_score INTEGER,
  ai_feedback JSONB,
  status TEXT DEFAULT 'pending',
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evaluation_leads ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (public lead capture)
CREATE POLICY "Anyone can submit evaluation" ON public.evaluation_leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Users can view their own evaluations
CREATE POLICY "Users can view own evaluations" ON public.evaluation_leads
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Admins can view all
CREATE POLICY "Admins can view all evaluations" ON public.evaluation_leads
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update
CREATE POLICY "Admins can update evaluations" ON public.evaluation_leads
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for evaluation videos (public upload)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('evaluation-videos', 'evaluation-videos', false, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous uploads to evaluation-videos bucket
CREATE POLICY "Anyone can upload evaluation videos" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'evaluation-videos');

-- Allow authenticated reads
CREATE POLICY "Authenticated can read evaluation videos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'evaluation-videos');
