// Multi-sport type definitions
// This file defines the sport architecture for the platform

export type SportType = 'baseball' | 'softball';

export interface SportConfig {
  id: SportType;
  name: string;
  displayName: string;
  icon: string; // emoji for simple rendering
  description: string;
  color: string; // HSL CSS variable name
  positions: string[];
  kpiCategories: SportKPICategory[];
}

export interface SportKPICategory {
  id: string;
  name: string;
  kpis: SportKPI[];
}

export interface SportKPI {
  id: string;
  name: string;
  unit: string;
  description: string;
}

// Baseball KPI definitions
const baseballKPIs: SportKPICategory[] = [
  {
    id: 'pitching',
    name: 'Pitching',
    kpis: [
      { id: 'pitch_velocity', name: 'Pitch Velocity', unit: 'mph', description: 'Peak fastball velocity' },
      { id: 'spin_rate', name: 'Spin Rate', unit: 'rpm', description: 'Average spin rate' },
      { id: 'command_pct', name: 'Command %', unit: '%', description: 'Strike zone command percentage' },
    ],
  },
  {
    id: 'hitting',
    name: 'Hitting',
    kpis: [
      { id: 'exit_velocity', name: 'Exit Velocity', unit: 'mph', description: 'Peak exit velocity off bat' },
      { id: 'bat_speed', name: 'Bat Speed', unit: 'mph', description: 'Peak bat speed' },
      { id: 'launch_angle', name: 'Launch Angle', unit: '°', description: 'Average launch angle' },
    ],
  },
  {
    id: 'speed',
    name: 'Speed & Agility',
    kpis: [
      { id: 'sixty_yard', name: '60-Yard Dash', unit: 'sec', description: '60-yard dash time' },
      { id: 'sprint_speed', name: 'Sprint Speed', unit: 'mph', description: 'Top sprint speed' },
      { id: 'pop_time', name: 'Pop Time', unit: 'sec', description: 'Catcher pop time' },
    ],
  },
];

// Softball KPI definitions
const softballKPIs: SportKPICategory[] = [
  {
    id: 'pitching',
    name: 'Pitching',
    kpis: [
      { id: 'pitch_speed', name: 'Pitch Speed', unit: 'mph', description: 'Peak pitch speed (fastpitch)' },
      { id: 'spin_rate', name: 'Spin Rate', unit: 'rpm', description: 'Average spin rate' },
      { id: 'rise_ball_velo', name: 'Rise Ball Velocity', unit: 'mph', description: 'Rise ball speed' },
      { id: 'drop_ball_velo', name: 'Drop Ball Velocity', unit: 'mph', description: 'Drop ball speed' },
    ],
  },
  {
    id: 'hitting',
    name: 'Hitting',
    kpis: [
      { id: 'exit_velocity', name: 'Exit Velocity', unit: 'mph', description: 'Peak exit velocity off bat' },
      { id: 'bat_speed', name: 'Bat Speed', unit: 'mph', description: 'Peak bat speed' },
      { id: 'slap_speed', name: 'Slap Speed', unit: 'mph', description: 'Slap hitting speed' },
    ],
  },
  {
    id: 'speed',
    name: 'Speed & Agility',
    kpis: [
      { id: 'home_to_first', name: 'Home to 1st', unit: 'sec', description: 'Home to first base time' },
      { id: 'sprint_speed', name: 'Sprint Speed', unit: 'mph', description: 'Top sprint speed' },
      { id: 'steal_time', name: 'Steal Time', unit: 'sec', description: 'Base steal time' },
    ],
  },
  {
    id: 'fielding',
    name: 'Fielding',
    kpis: [
      { id: 'throw_velocity', name: 'Throw Velocity', unit: 'mph', description: 'Throwing velocity from position' },
      { id: 'reaction_time', name: 'Reaction Time', unit: 'sec', description: 'First step reaction time' },
    ],
  },
];

export const sportConfigs: Record<SportType, SportConfig> = {
  baseball: {
    id: 'baseball',
    name: 'baseball',
    displayName: 'Baseball',
    icon: '⚾',
    description: 'Train like a pro with baseball-specific development systems',
    color: '--vault-velocity',
    positions: ['Pitcher', 'Catcher', 'First Base', 'Second Base', 'Shortstop', 'Third Base', 'Left Field', 'Center Field', 'Right Field', 'DH'],
    kpiCategories: baseballKPIs,
  },
  softball: {
    id: 'softball',
    name: 'softball',
    displayName: 'Softball',
    icon: '🥎',
    description: 'Fastpitch-specific training and development systems',
    color: '--vault-utility',
    positions: ['Pitcher', 'Catcher', 'First Base', 'Second Base', 'Shortstop', 'Third Base', 'Left Field', 'Center Field', 'Right Field', 'DP/Flex'],
    kpiCategories: softballKPIs,
  },
};

export const getSportConfig = (sportType: SportType): SportConfig => {
  return sportConfigs[sportType] || sportConfigs.baseball;
};

export const allSportTypes: SportType[] = ['baseball', 'softball'];
