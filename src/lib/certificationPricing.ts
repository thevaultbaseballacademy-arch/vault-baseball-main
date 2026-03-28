// Stripe price IDs for certification purchases
export const CERTIFICATION_PRICES: Record<string, string | null> = {
  // Baseball certifications
  foundations: null, // Free - included
  performance: 'price_1SkSfyPhXS410TO5oO4XZv3P',
  catcher_specialist: 'price_1SkSg0PhXS410TO5cbeWFnRu',
  infield_specialist: 'price_1SkSg1PhXS410TO5BpfCyUhH',
  outfield_specialist: 'price_1SkSg2PhXS410TO5KaFDaZpo',
  // Softball certifications (Stripe price IDs to be configured)
  softball_foundations: null, // Free - included
  softball_performance: null, // Will be configured when Stripe product is created
  softball_pitching_specialist: null,
  softball_hitting_specialist: null,
  softball_defense_specialist: null,
  // Softball Hitting & Slap certifications
  softball_hitting_foundations: null, // Free - included
  softball_hitting_performance: null, // Will be configured when Stripe product is created
  softball_slap_specialist: null, // Will be configured when Stripe product is created
} as const;

export const CERTIFICATION_PRODUCT_IDS = {
  performance: 'prod_ThsQA8sfGtmgdp',
  catcher_specialist: 'prod_ThsQ3pzuenDuKI',
  infield_specialist: 'prod_ThsQmvP5ZbTYEM',
  outfield_specialist: 'prod_ThsQi0ZOt2xxPJ',
} as const;

export type CertificationType = 
  | 'foundations' 
  | 'performance' 
  | 'catcher_specialist' 
  | 'infield_specialist' 
  | 'outfield_specialist'
  | 'softball_foundations'
  | 'softball_performance'
  | 'softball_pitching_specialist'
  | 'softball_hitting_specialist'
  | 'softball_defense_specialist'
  | 'softball_hitting_foundations'
  | 'softball_hitting_performance'
  | 'softball_slap_specialist';

export const getCertificationDisplayName = (type: CertificationType): string => {
  const names: Record<CertificationType, string> = {
    foundations: 'VAULT™ Foundations',
    performance: 'VAULT™ Performance',
    catcher_specialist: 'Catcher Specialist',
    infield_specialist: 'Infield Specialist',
    outfield_specialist: 'Outfield Specialist',
    softball_foundations: 'VAULT™ Softball Foundations',
    softball_performance: 'VAULT™ Softball Performance',
    softball_pitching_specialist: 'Softball Pitching Specialist',
    softball_hitting_specialist: 'Softball Hitting Specialist',
    softball_defense_specialist: 'Softball Defense Specialist',
    softball_hitting_foundations: 'Softball Hitting Foundations',
    softball_hitting_performance: 'Softball Hitting Performance',
    softball_slap_specialist: 'Softball Slap Specialist',
  };
  return names[type];
};

export const getCertificationPrice = (type: CertificationType): number => {
  const prices: Record<CertificationType, number> = {
    foundations: 0,
    performance: 2500,
    catcher_specialist: 1500,
    infield_specialist: 1500,
    outfield_specialist: 1500,
    softball_foundations: 0,
    softball_performance: 2500,
    softball_pitching_specialist: 2500,  // HIGH VALUE - most coaches don't understand windmill
    softball_hitting_specialist: 1500,
    softball_defense_specialist: 1500,
    softball_hitting_foundations: 0, // Free - required for all coaches
    softball_hitting_performance: 2500,
    softball_slap_specialist: 2500, // HIGH VALUE - premium slap certification
  };
  return prices[type];
};

// Helper to determine if a certification is softball-specific
export const isSoftballCertification = (type: CertificationType): boolean => {
  return type.startsWith('softball_');
};

// Helper to determine if a certification is baseball-specific
export const isBaseballCertification = (type: CertificationType): boolean => {
  return !type.startsWith('softball_');
};
