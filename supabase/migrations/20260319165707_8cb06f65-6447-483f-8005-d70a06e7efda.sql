
-- Device sync log for tracking all data imports
CREATE TABLE public.device_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_type TEXT NOT NULL,
  sync_type TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'api_sync', 'csv_import', 'api_import'
  records_imported INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'in_progress', 'completed', 'failed'
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Device registry: catalog of all supported devices and their integration status
CREATE TABLE public.device_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_key TEXT UNIQUE NOT NULL,
  device_name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  device_category TEXT NOT NULL DEFAULT 'radar', -- 'radar', 'bat_sensor', 'ball_tracker', 'cage_system', 'wearable'
  capabilities TEXT[] NOT NULL DEFAULT '{}', -- 'pitching', 'hitting', 'throwing', 'biometric'
  integration_status TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'csv_import', 'api_ready', 'live'
  api_type TEXT, -- 'rest', 'oauth2', 'webhook', 'csv_only', null
  data_fields JSONB DEFAULT '{}', -- describes what fields this device can provide
  priority_order INTEGER DEFAULT 99,
  logo_emoji TEXT DEFAULT '📊',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.device_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync logs" ON public.device_sync_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own sync logs" ON public.device_sync_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all sync logs" ON public.device_sync_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Device registry is readable by all authenticated users
CREATE POLICY "Anyone can view device registry" ON public.device_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage device registry" ON public.device_registry FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed device registry with all supported devices
INSERT INTO public.device_registry (device_key, device_name, manufacturer, device_category, capabilities, integration_status, api_type, priority_order, logo_emoji, description)
VALUES
  ('pocket_radar', 'Smart Coach', 'Pocket Radar', 'radar', ARRAY['pitching', 'throwing', 'hitting'], 'csv_import', 'rest', 1, '📻', 'Bluetooth radar gun — most common in youth/HS. API available.'),
  ('blast_motion', 'Blast Connect', 'Blast Motion', 'bat_sensor', ARRAY['hitting'], 'api_ready', 'oauth2', 2, '💥', 'Bat sensor measuring swing mechanics, bat speed, and attack angle.'),
  ('rapsodo_pitching', 'Pitching 2.0', 'Rapsodo', 'ball_tracker', ARRAY['pitching'], 'api_ready', 'oauth2', 3, '📊', 'Pitch tracking — velocity, spin rate, spin axis, movement.'),
  ('rapsodo_hitting', 'Hitting 3.0', 'Rapsodo', 'ball_tracker', ARRAY['hitting'], 'api_ready', 'oauth2', 4, '📊', 'Exit velocity, launch angle, distance, spin rate on batted balls.'),
  ('hittrax', 'HitTrax', 'InMotion Systems', 'cage_system', ARRAY['hitting'], 'api_ready', 'rest', 5, '⚾', 'Batting cage system — exit velo, launch angle, distance, game sim.'),
  ('trackman', 'TrackMan', 'TrackMan', 'ball_tracker', ARRAY['pitching', 'hitting'], 'api_ready', 'rest', 6, '📡', 'Stadium/portable radar — pitch & batted ball tracking. College/pro standard.'),
  ('diamond_kinetics', 'SwingTracker', 'Diamond Kinetics', 'bat_sensor', ARRAY['hitting'], 'csv_import', 'rest', 7, '💎', 'Bat sensor — swing metrics, bat speed, power transfer.'),
  ('forcedeck', 'ForceDecks', 'VALD Performance', 'force_plate', ARRAY['biometric'], 'manual', 'rest', 8, '⚡', 'Force plates — jump testing, asymmetry, power output.'),
  ('wearable', 'Wearable Biometrics', 'Various', 'wearable', ARRAY['biometric'], 'manual', null, 9, '⌚', 'Sleep, HRV, recovery — Whoop, OURA, Garmin, Apple Watch.')
ON CONFLICT (device_key) DO NOTHING;
