-- Create enum for device types
CREATE TYPE public.device_type AS ENUM ('rapsodo', 'hittrax', 'blast_motion', 'trackman', 'pocket_radar');

-- Create device integrations table for API credentials
CREATE TABLE public.device_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_type public.device_type NOT NULL,
  api_key TEXT,
  api_secret TEXT,
  refresh_token TEXT,
  access_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_type)
);

-- Create device metrics table to store all tracked data
CREATE TABLE public.device_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_type public.device_type NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT,
  
  -- Common metrics
  metric_category TEXT NOT NULL, -- 'pitching', 'hitting', 'throwing'
  
  -- Pitching metrics (Rapsodo, Trackman)
  pitch_type TEXT,
  velocity_mph DECIMAL(5,2),
  spin_rate_rpm INTEGER,
  spin_axis DECIMAL(5,1),
  spin_efficiency DECIMAL(5,2),
  horizontal_break DECIMAL(5,2),
  vertical_break DECIMAL(5,2),
  release_height DECIMAL(5,2),
  release_extension DECIMAL(5,2),
  
  -- Hitting metrics (HitTrax, Blast Motion, Trackman)
  exit_velocity_mph DECIMAL(5,2),
  launch_angle DECIMAL(5,2),
  distance_ft DECIMAL(6,2),
  bat_speed_mph DECIMAL(5,2),
  attack_angle DECIMAL(5,2),
  time_to_contact DECIMAL(5,3),
  on_plane_efficiency DECIMAL(5,2),
  peak_hand_speed DECIMAL(5,2),
  connection_score INTEGER,
  rotation_score INTEGER,
  
  -- Blast Motion specific
  power_index DECIMAL(5,2),
  body_rotation DECIMAL(5,2),
  
  -- General velocity (Pocket Radar)
  measured_velocity_mph DECIMAL(5,2),
  velocity_type TEXT, -- 'arm', 'bat', 'thrown', 'exit'
  
  -- Metadata
  notes TEXT,
  import_source TEXT, -- 'manual', 'csv', 'api'
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create metric share tokens for recruiting
CREATE TABLE public.metric_share_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  label TEXT,
  is_public BOOLEAN DEFAULT false, -- true for public link, false for recruiter code
  expires_at TIMESTAMP WITH TIME ZONE,
  recipient_email TEXT, -- optional: for recruiter-specific access
  recipient_name TEXT,
  include_pitching BOOLEAN DEFAULT true,
  include_hitting BOOLEAN DEFAULT true,
  include_throwing BOOLEAN DEFAULT true,
  include_trends BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.device_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_share_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for device_integrations
CREATE POLICY "Users can view their own device integrations"
  ON public.device_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own device integrations"
  ON public.device_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device integrations"
  ON public.device_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device integrations"
  ON public.device_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for device_metrics
CREATE POLICY "Users can view their own metrics"
  ON public.device_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own metrics"
  ON public.device_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
  ON public.device_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metrics"
  ON public.device_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for metric_share_tokens
CREATE POLICY "Users can view their own share tokens"
  ON public.metric_share_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create share tokens"
  ON public.metric_share_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own share tokens"
  ON public.metric_share_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own share tokens"
  ON public.metric_share_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Function to get shared metrics by token (public access)
CREATE OR REPLACE FUNCTION public.get_shared_metrics(share_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token_record metric_share_tokens%ROWTYPE;
  result JSON;
BEGIN
  -- Get the token record
  SELECT * INTO token_record
  FROM metric_share_tokens
  WHERE token = share_token
    AND (expires_at IS NULL OR expires_at > NOW());
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Invalid or expired token');
  END IF;
  
  -- Update view count
  UPDATE metric_share_tokens
  SET view_count = view_count + 1,
      last_viewed_at = NOW()
  WHERE id = token_record.id;
  
  -- Build result with profile and metrics
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
    'pitching_metrics', CASE WHEN token_record.include_pitching THEN (
      SELECT json_agg(m.*)
      FROM device_metrics m
      WHERE m.user_id = token_record.user_id
        AND m.metric_category = 'pitching'
      ORDER BY m.recorded_at DESC
      LIMIT 100
    ) ELSE NULL END,
    'hitting_metrics', CASE WHEN token_record.include_hitting THEN (
      SELECT json_agg(m.*)
      FROM device_metrics m
      WHERE m.user_id = token_record.user_id
        AND m.metric_category = 'hitting'
      ORDER BY m.recorded_at DESC
      LIMIT 100
    ) ELSE NULL END,
    'throwing_metrics', CASE WHEN token_record.include_throwing THEN (
      SELECT json_agg(m.*)
      FROM device_metrics m
      WHERE m.user_id = token_record.user_id
        AND m.metric_category = 'throwing'
      ORDER BY m.recorded_at DESC
      LIMIT 100
    ) ELSE NULL END,
    'is_public', token_record.is_public,
    'include_trends', token_record.include_trends
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_device_metrics_user_id ON public.device_metrics(user_id);
CREATE INDEX idx_device_metrics_device_type ON public.device_metrics(device_type);
CREATE INDEX idx_device_metrics_recorded_at ON public.device_metrics(recorded_at DESC);
CREATE INDEX idx_device_metrics_category ON public.device_metrics(metric_category);
CREATE INDEX idx_metric_share_tokens_token ON public.metric_share_tokens(token);

-- Triggers for updated_at
CREATE TRIGGER update_device_integrations_updated_at
  BEFORE UPDATE ON public.device_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_metrics_updated_at
  BEFORE UPDATE ON public.device_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metric_share_tokens_updated_at
  BEFORE UPDATE ON public.metric_share_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();