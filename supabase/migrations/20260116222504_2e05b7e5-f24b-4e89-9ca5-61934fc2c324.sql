-- Create table for KPI share tokens
CREATE TABLE public.kpi_share_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token VARCHAR(32) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  include_goals BOOLEAN DEFAULT true,
  include_stats BOOLEAN DEFAULT true,
  include_videos BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kpi_share_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own share tokens
CREATE POLICY "Users can view their own share tokens"
ON public.kpi_share_tokens FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own share tokens"
ON public.kpi_share_tokens FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own share tokens"
ON public.kpi_share_tokens FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own share tokens"
ON public.kpi_share_tokens FOR DELETE
USING (auth.uid() = user_id);

-- Public function to get shared profile data (no auth required)
CREATE OR REPLACE FUNCTION public.get_shared_kpi_profile(share_token VARCHAR)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token_record RECORD;
  result JSON;
BEGIN
  -- Get the token record
  SELECT * INTO token_record
  FROM kpi_share_tokens
  WHERE token = share_token
    AND (expires_at IS NULL OR expires_at > now());
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Increment view count
  UPDATE kpi_share_tokens SET view_count = view_count + 1, updated_at = now()
  WHERE id = token_record.id;
  
  -- Build the result
  SELECT json_build_object(
    'profile', (
      SELECT json_build_object(
        'display_name', p.display_name,
        'avatar_url', p.avatar_url,
        'position', p.position,
        'graduation_year', p.graduation_year,
        'height_inches', p.height_inches,
        'weight_lbs', p.weight_lbs,
        'throwing_arm', p.throwing_arm,
        'batting_side', p.batting_side
      )
      FROM profiles p
      WHERE p.user_id = token_record.user_id
    ),
    'kpis', CASE WHEN token_record.include_stats THEN (
      SELECT json_agg(json_build_object(
        'kpi_name', k.kpi_name,
        'kpi_category', k.kpi_category,
        'kpi_value', k.kpi_value,
        'kpi_unit', k.kpi_unit,
        'recorded_at', k.recorded_at
      ) ORDER BY k.recorded_at DESC)
      FROM athlete_kpis k
      WHERE k.user_id = token_record.user_id
    ) ELSE NULL END,
    'goals', CASE WHEN token_record.include_goals THEN (
      SELECT json_agg(json_build_object(
        'kpi_name', g.kpi_name,
        'kpi_category', g.kpi_category,
        'target_value', g.target_value,
        'kpi_unit', g.kpi_unit,
        'is_achieved', g.is_achieved,
        'target_date', g.target_date
      ))
      FROM athlete_kpi_goals g
      WHERE g.user_id = token_record.user_id
    ) ELSE NULL END,
    'videos', CASE WHEN token_record.include_videos THEN (
      SELECT json_agg(json_build_object(
        'title', v.title,
        'video_url', v.video_url,
        'thumbnail_url', v.thumbnail_url,
        'description', v.description
      ))
      FROM highlight_videos v
      WHERE v.user_id = token_record.user_id
        AND v.privacy_level = 'public'
    ) ELSE NULL END,
    'share_settings', json_build_object(
      'include_goals', token_record.include_goals,
      'include_stats', token_record.include_stats,
      'include_videos', token_record.include_videos
    )
  ) INTO result;
  
  RETURN result;
END;
$$;