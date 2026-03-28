export type DeviceType = 'rapsodo' | 'hittrax' | 'blast_motion' | 'trackman' | 'pocket_radar' | 'rapsodo_pitching' | 'rapsodo_hitting' | 'diamond_kinetics' | 'forcedeck' | 'wearable';

export type DataSource = 
  | 'manual' 
  | 'pocket_radar' 
  | 'blast_motion' 
  | 'rapsodo_pitching' 
  | 'rapsodo_hitting' 
  | 'hittrax' 
  | 'trackman' 
  | 'diamond_kinetics' 
  | 'forcedeck' 
  | 'wearable' 
  | 'api_import'
  | 'csv_import';

export interface DeviceIntegration {
  id: string;
  user_id: string;
  device_type: DeviceType;
  api_key?: string;
  is_connected: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceMetric {
  id: string;
  user_id: string;
  device_type: DeviceType;
  recorded_at: string;
  session_id?: string;
  metric_category: 'pitching' | 'hitting' | 'throwing';
  
  // Pitching metrics
  pitch_type?: string;
  velocity_mph?: number;
  spin_rate_rpm?: number;
  spin_axis?: number;
  spin_efficiency?: number;
  horizontal_break?: number;
  vertical_break?: number;
  release_height?: number;
  release_extension?: number;
  
  // Hitting metrics
  exit_velocity_mph?: number;
  launch_angle?: number;
  distance_ft?: number;
  bat_speed_mph?: number;
  attack_angle?: number;
  time_to_contact?: number;
  on_plane_efficiency?: number;
  peak_hand_speed?: number;
  connection_score?: number;
  rotation_score?: number;
  
  // Blast Motion specific
  power_index?: number;
  body_rotation?: number;
  
  // General velocity
  measured_velocity_mph?: number;
  velocity_type?: string;
  
  notes?: string;
  import_source: string;
  raw_data?: Record<string, unknown> | null;
  created_at: string;
}

export interface MetricShareToken {
  id: string;
  user_id: string;
  token: string;
  label?: string;
  is_public: boolean;
  expires_at?: string;
  recipient_email?: string;
  recipient_name?: string;
  include_pitching: boolean;
  include_hitting: boolean;
  include_throwing: boolean;
  include_trends: boolean;
  view_count: number;
  last_viewed_at?: string;
  created_at: string;
}

export interface DeviceRegistryEntry {
  id: string;
  device_key: string;
  device_name: string;
  manufacturer: string;
  device_category: string;
  capabilities: string[];
  integration_status: string;
  api_type: string | null;
  data_fields: Record<string, unknown>;
  priority_order: number;
  logo_emoji: string;
  description: string | null;
  is_active: boolean;
}

export interface DeviceSyncLog {
  id: string;
  user_id: string;
  device_type: string;
  sync_type: string;
  records_imported: number;
  records_failed: number;
  sync_status: string;
  error_message: string | null;
  metadata: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
}

export type SyncStatus = 'live' | 'activating' | 'pending';

export const DEVICE_CONFIG: Record<string, {
  name: string;
  logo: string;
  color: string;
  description: string;
  capabilities: string[];
  syncStatus: SyncStatus;
  apiMethod: string;
  keyMetrics: string[];
}> = {
  trackman: {
    name: 'TrackMan',
    logo: '📡',
    color: 'hsl(var(--vault-velocity))',
    description: 'Stadium V3 / Portable B1 - Real-time ball tracking',
    capabilities: ['pitching', 'hitting'],
    syncStatus: 'activating',
    apiMethod: 'REST API & WebSockets',
    keyMetrics: ['Pitch Speed', 'Spin Rate', 'Exit Velo', 'Launch Angle']
  },
  rapsodo: {
    name: 'Rapsodo',
    logo: '📊',
    color: 'hsl(var(--vault-athleticism))',
    description: 'Cloud-to-Cloud sync with OAuth 2.0',
    capabilities: ['pitching', 'hitting'],
    syncStatus: 'live',
    apiMethod: 'Cloud API (OAuth 2.0)',
    keyMetrics: ['Velocity', 'Spin Rate', 'Spin Axis', 'Break']
  },
  rapsodo_pitching: {
    name: 'Rapsodo Pitching 2.0',
    logo: '📊',
    color: 'hsl(var(--vault-athleticism))',
    description: 'Pitch tracking — velocity, spin rate, spin axis, movement',
    capabilities: ['pitching'],
    syncStatus: 'live',
    apiMethod: 'Cloud API (OAuth 2.0)',
    keyMetrics: ['Velocity', 'Spin Rate', 'Spin Axis', 'Break']
  },
  rapsodo_hitting: {
    name: 'Rapsodo Hitting 3.0',
    logo: '📊',
    color: 'hsl(var(--vault-athleticism))',
    description: 'Exit velocity, launch angle, distance, spin rate on batted balls',
    capabilities: ['hitting'],
    syncStatus: 'live',
    apiMethod: 'Cloud API (OAuth 2.0)',
    keyMetrics: ['Exit Velocity', 'Launch Angle', 'Distance', 'Spin Rate']
  },
  blast_motion: {
    name: 'Blast Motion',
    logo: '💥',
    color: 'hsl(var(--vault-utility))',
    description: 'Blast Connect API - Swing mechanics',
    capabilities: ['hitting'],
    syncStatus: 'live',
    apiMethod: 'Blast Connect API',
    keyMetrics: ['Bat Speed', 'Attack Angle', 'Plane Score', 'Rotation']
  },
  hittrax: {
    name: 'HitTrax',
    logo: '⚾',
    color: 'hsl(var(--vault-longevity))',
    description: 'StatsCenter V3 API with REV™ AI analytics',
    capabilities: ['hitting'],
    syncStatus: 'live',
    apiMethod: 'StatsCenter API',
    keyMetrics: ['Exit Velocity', 'Launch Angle', 'Distance', 'Hard Hit %']
  },
  pocket_radar: {
    name: 'Pocket Radar',
    logo: '📻',
    color: 'hsl(var(--vault-transfer))',
    description: 'Smart Coach — Bluetooth radar, most common in youth/HS',
    capabilities: ['pitching', 'throwing', 'hitting'],
    syncStatus: 'pending',
    apiMethod: 'API / CSV Import',
    keyMetrics: ['Velocity', 'Peak Speed', 'Average Speed']
  },
  diamond_kinetics: {
    name: 'Diamond Kinetics',
    logo: '💎',
    color: 'hsl(var(--vault-velocity))',
    description: 'SwingTracker — bat sensor for swing metrics',
    capabilities: ['hitting'],
    syncStatus: 'pending',
    apiMethod: 'REST API / CSV Import',
    keyMetrics: ['Bat Speed', 'Power', 'Attack Angle', 'Hand Speed']
  },
  forcedeck: {
    name: 'ForceDecks',
    logo: '⚡',
    color: 'hsl(var(--vault-athleticism))',
    description: 'Force plates — jump testing, asymmetry, power output',
    capabilities: ['biometric'],
    syncStatus: 'pending',
    apiMethod: 'REST API',
    keyMetrics: ['Peak Force', 'RSI', 'Asymmetry', 'Jump Height']
  },
  wearable: {
    name: 'Wearable',
    logo: '⌚',
    color: 'hsl(var(--vault-longevity))',
    description: 'Sleep, HRV, recovery — Whoop, OURA, Garmin, Apple Watch',
    capabilities: ['biometric'],
    syncStatus: 'pending',
    apiMethod: 'Manual Entry',
    keyMetrics: ['Sleep', 'HRV', 'Recovery', 'Strain']
  }
};

// VAULT Power Metrics - Normalized calculations from multiple sources
export interface VaultPowerMetrics {
  vaultPowerIndex: number;
  vaultArmStrength: number;
  vaultExplosiveness: number;
  vaultConsistency: number;
}

export function calculateVaultPowerIndex(metrics: DeviceMetric[]): number {
  const hittingMetrics = metrics.filter(m => m.metric_category === 'hitting');
  if (!hittingMetrics.length) return 0;
  
  const avgExitVelo = hittingMetrics.filter(m => m.exit_velocity_mph)
    .reduce((sum, m) => sum + (m.exit_velocity_mph || 0), 0) / 
    (hittingMetrics.filter(m => m.exit_velocity_mph).length || 1);
  
  const avgBatSpeed = hittingMetrics.filter(m => m.bat_speed_mph)
    .reduce((sum, m) => sum + (m.bat_speed_mph || 0), 0) / 
    (hittingMetrics.filter(m => m.bat_speed_mph).length || 1);
  
  const exitVeloScore = Math.min(100, Math.max(0, ((avgExitVelo - 60) / 50) * 100));
  const batSpeedScore = Math.min(100, Math.max(0, ((avgBatSpeed - 50) / 40) * 100));
  
  return avgExitVelo && avgBatSpeed 
    ? Math.round((exitVeloScore * 0.6 + batSpeedScore * 0.4))
    : avgExitVelo ? Math.round(exitVeloScore) : Math.round(batSpeedScore);
}

export function calculateVaultArmStrength(metrics: DeviceMetric[]): number {
  const pitchingMetrics = metrics.filter(m => m.metric_category === 'pitching');
  if (!pitchingMetrics.length) return 0;
  
  const avgVelo = pitchingMetrics.filter(m => m.velocity_mph)
    .reduce((sum, m) => sum + (m.velocity_mph || 0), 0) / 
    (pitchingMetrics.filter(m => m.velocity_mph).length || 1);
  
  const avgSpinEff = pitchingMetrics.filter(m => m.spin_efficiency)
    .reduce((sum, m) => sum + (m.spin_efficiency || 0), 0) / 
    (pitchingMetrics.filter(m => m.spin_efficiency).length || 1);
  
  const veloScore = Math.min(100, Math.max(0, ((avgVelo - 60) / 40) * 100));
  
  return avgSpinEff 
    ? Math.round((veloScore * 0.7 + avgSpinEff * 0.3))
    : Math.round(veloScore);
}

// KPI Source labels for display
export const SOURCE_LABELS: Record<DataSource, string> = {
  manual: "Manual Entry",
  pocket_radar: "Pocket Radar",
  blast_motion: "Blast Motion",
  rapsodo_pitching: "Rapsodo Pitching",
  rapsodo_hitting: "Rapsodo Hitting",
  hittrax: "HitTrax",
  trackman: "TrackMan",
  diamond_kinetics: "Diamond Kinetics",
  forcedeck: "ForceDecks",
  wearable: "Wearable",
  api_import: "API Import",
  csv_import: "CSV Import",
};
