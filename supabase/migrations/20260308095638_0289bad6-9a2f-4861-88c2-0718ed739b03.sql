
-- Storage bucket for analysis videos
INSERT INTO storage.buckets (id, name, public) VALUES ('analysis-videos', 'analysis-videos', false);

-- RLS for analysis-videos bucket
CREATE POLICY "Users upload own analysis videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'analysis-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users view own analysis videos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'analysis-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Coaches view assigned athlete analysis videos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'analysis-videos'
  AND public.is_active_coach_for_athlete(auth.uid(), ((storage.foldername(name))[1])::uuid)
);

-- Video analysis table
CREATE TABLE public.video_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL DEFAULT 'pitching',
  status TEXT NOT NULL DEFAULT 'pending',
  ai_analysis JSONB,
  coach_notes TEXT,
  coach_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.video_analyses ENABLE ROW LEVEL SECURITY;

-- Athletes see own analyses
CREATE POLICY "Users view own analyses"
ON public.video_analyses FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Athletes insert own analyses
CREATE POLICY "Users create own analyses"
ON public.video_analyses FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Athletes update own (for status changes via edge function we use service role)
CREATE POLICY "Users update own analyses"
ON public.video_analyses FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Coaches view assigned athletes' analyses
CREATE POLICY "Coaches view assigned athlete analyses"
ON public.video_analyses FOR SELECT TO authenticated
USING (public.is_active_coach_for_athlete(auth.uid(), user_id));

-- Coaches can add notes
CREATE POLICY "Coaches update assigned athlete analyses"
ON public.video_analyses FOR UPDATE TO authenticated
USING (public.is_active_coach_for_athlete(auth.uid(), user_id));

-- Updated_at trigger
CREATE TRIGGER update_video_analyses_updated_at
  BEFORE UPDATE ON public.video_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
