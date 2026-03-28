/**
 * VAULT™ Product Pricing — Complete Lineup
 *
 * Pricing philosophy:
 * - Memberships: Recurring revenue. Value stacked. Built for retention.
 * - One-time products: Entry points that convert to memberships.
 * - BNPL (Klarna/Affirm): Available on orders $50+. Widens the market significantly.
 * - Coach certification: Annual program. Coaches = distribution.
 * - Org licenses: High-ticket B2B. Biggest LTV in the platform.
 *
 * Honest pricing audit notes:
 * - Basic at $29/mo is underpriced for what it delivers — but it's the right
 *   acquisition price. The goal is to move people to Performance ($59) within 60 days.
 * - Elite at $149/mo is priced correctly — it competes with in-person lessons
 *   ($80-120/lesson) and delivers far more per month.
 * - Remote Training at $199/mo is the right price IF the video quality is elite.
 * - Org licenses at $1,999-$3,500/year are UNDER-priced for what they deliver.
 *   Consider $2,999/$4,999 as you gain case studies.
 * - Founders Access at $499 is a steal and should be time-limited aggressively.
 */

export const PRODUCT_PRICES = {
  // ── MEMBERSHIPS (Subscriptions) ──────────────────────────────────────────

  basic: {
    price_id: 'price_1SjGMKPhXS410TO5XQcZm9fZ',
    product_id: 'prod_TgddaadHxz0mTj',
    name: 'Starter Membership',
    tagline: 'Start your development journey',
    price: 2900,          // $29/mo
    annualPrice: 27900,   // $279/yr (save $69)
    type: 'subscription' as const,
    interval: 'month',
    bnplEligible: false,  // Under $50
    features: [
      'Access to all 36 training courses',
      'KPI tracking & performance dashboard',
      'Daily check-in & recovery system',
      'VAULT™ Game Intelligence monthly reports',
      'Community access',
    ],
    highlight: false,
    badge: null,
  },

  performance: {
    price_id: 'price_1SjGMYPhXS410TO5bGu1kSSZ',
    product_id: 'prod_TgddQA4gp7kWZy',
    name: 'Performance Membership',
    tagline: 'For athletes serious about development',
    price: 5900,          // $59/mo
    annualPrice: 56900,   // $569/yr (save $139)
    type: 'subscription' as const,
    interval: 'month',
    bnplEligible: true,
    features: [
      'Everything in Starter',
      'VAULT™ Prospect Grader™ (unlimited)',
      'AI-powered nutrition coaching',
      'Strength & conditioning planner',
      'Mental performance system',
      'Parent portal access (linked family)',
      'Priority support',
    ],
    highlight: true,
    badge: 'Most Popular',
  },

  elite: {
    price_id: 'price_1SjGMhPhXS410TO59WKiE81b',
    product_id: 'prod_Tgdd8gSJpkk33e',
    name: 'Elite Membership',
    tagline: 'Full-stack development for elite athletes',
    price: 14900,         // $149/mo
    annualPrice: 143900,  // $1,439/yr (save $349)
    type: 'subscription' as const,
    interval: 'month',
    bnplEligible: true,
    features: [
      'Everything in Performance',
      '2 video analysis sessions/month (coach review)',
      'Recruiting profile with shareable link',
      'Weekly AI development report for family',
      'Direct coach messaging',
      'Device data sync (Rapsodo, Blast, HitTrax)',
      'Early access to new features',
    ],
    highlight: false,
    badge: 'Best Value',
  },

  remote_training: {
    price_id: 'price_1T8ckaPhXS410TO57tcuh1nv',
    product_id: 'prod_U6qRK6r5KI4995',
    name: 'Remote Training Membership',
    tagline: 'Live coaching from anywhere in the world',
    price: 19900,         // $199/mo
    annualPrice: 191900,  // $1,919/yr (save $469)
    type: 'subscription' as const,
    interval: 'month',
    bnplEligible: true,
    features: [
      'Everything in Elite',
      '4 live remote coaching sessions/month',
      'Session recordings & highlight clips',
      'Weekly personalized training plan',
      'Direct line to VAULT™ certified coach',
      'Unlimited video analysis submissions',
    ],
    highlight: false,
    badge: 'Full Coaching',
  },

  // ── ONE-TIME PRODUCTS ─────────────────────────────────────────────────────

  velocity_12week: {
    price_id: 'price_1T8ckYPhXS410TO5WkQI2EpC',
    product_id: 'prod_U6qR2KHT4Ahl76',
    name: '12-Week Velocity System',
    tagline: 'The definitive velocity development program',
    price: 39700,         // $397
    type: 'payment' as const,
    bnplEligible: true,
    features: [
      '12 weeks of structured velocity programming',
      'Biomechanical cues for every drill',
      'Weekly KPI tracking templates',
      'Arm care and recovery protocols',
      'Lifetime access',
    ],
    highlight: false,
    badge: 'Bestseller',
  },

  velocity_accelerator: {
    price_id: 'price_1SqEW4PhXS410TO51a1fzsw1',
    product_id: 'prod_TnqCIDACx6f7eJ',
    name: '6-Week Velocity Accelerator',
    tagline: 'Rapid velocity gains — proven protocol',
    price: 19700,         // $197 (repriced down from $599 — too high)
    type: 'payment' as const,
    bnplEligible: true,
    features: [
      '6-week intensive velocity sprint',
      'Hip-shoulder separation mastery',
      'Arm path efficiency program',
      'Daily drill prescriptions',
      'Lifetime access',
    ],
    highlight: false,
    badge: null,
  },

  velo_check: {
    price_id: 'price_1T8ckXPhXS410TO5tYyygmol',
    product_id: 'prod_U6qRFtddsuGgum',
    name: 'Velo-Check Assessment',
    tagline: 'Know exactly where you stand',
    price: 9700,          // $97
    type: 'payment' as const,
    bnplEligible: false,  // Under $100 BNPL threshold
    features: [
      'AI-powered mechanical assessment',
      'Full 20-80 prospect grade report',
      'Position-specific benchmark comparison',
      'Personalized development roadmap',
      'Parent-facing summary included',
    ],
    highlight: false,
    badge: 'Entry Point',
  },

  recruitment_audit: {
    price_id: 'price_1SqEGMPhXS410TO5PNwPNJOe',
    product_id: 'prod_TnpwJeeXHyjrva',
    name: 'Recruiting Audit & Profile',
    tagline: 'Get your recruiting profile ready to send',
    price: 19900,         // $199
    type: 'payment' as const,
    bnplEligible: true,
    features: [
      'Complete recruiting profile build-out',
      'Division standard benchmarking',
      'AI-generated coach outreach templates',
      'School interest list strategy',
      'Shareable verified stats link',
    ],
    highlight: false,
    badge: null,
  },

  showcase_prep: {
    price_id: 'price_1SqMSxPhXS410TO5rYo4echT',
    product_id: 'prod_TnyPDYJ35srlRl',
    name: '30-Day Showcase Prep',
    tagline: 'Get peaked for the biggest event of your year',
    price: 19900,         // $199
    type: 'payment' as const,
    bnplEligible: true,
    features: [
      '30-day periodized showcase prep plan',
      'Peak performance protocols',
      'KPI benchmarking vs. event expectations',
      'Mental performance pre-event program',
      'Recovery and travel protocols',
    ],
    highlight: false,
    badge: null,
  },

  video_analysis_5pack: {
    price_id: 'price_1SqMSzPhXS410TO5VpvnedaW',
    product_id: 'prod_TnyPgLXxZlLWli',
    name: 'Video Analysis 5-Pack',
    tagline: 'Expert eyes on your mechanics',
    price: 19700,         // $197 (was $149 — bumped to reflect value)
    type: 'payment' as const,
    bnplEligible: true,
    features: [
      '5 coach video analysis submissions',
      'Side-by-side comparison tool',
      'Written feedback with timestamps',
      'Drill prescriptions with each review',
      '60-day expiration from purchase',
    ],
    highlight: false,
    badge: null,
  },

  longevity_system: {
    price_id: 'price_1SqEGAPhXS410TO5ZIx2g0RZ',
    product_id: 'prod_TnpwnzycjMTqXu',
    name: 'VAULT™ Longevity System',
    tagline: 'Train for a career, not a season',
    price: 29900,         // $299
    type: 'payment' as const,
    bnplEligible: true,
    features: [
      'Complete arm health protocol library',
      'Workload management framework',
      'Year-round periodization templates',
      'Injury prevention education system',
      'Parent & coach arm health guide',
    ],
    highlight: false,
    badge: null,
  },

  transfer_system: {
    price_id: 'price_1SqEGCPhXS410TO5iCsokNpV',
    product_id: 'prod_Tnpwn4vDbQNQGz',
    name: 'VAULT™ Transfer System',
    tagline: 'Turn training gains into game performance',
    price: 29900,         // $299
    type: 'payment' as const,
    bnplEligible: true,
    features: [
      'Training-to-game transfer protocols',
      'Mental performance integration system',
      'Practice design for maximum transfer',
      'Competition preparation frameworks',
      'Coach implementation guide included',
    ],
    highlight: false,
    badge: null,
  },

  transfer_intensive: {
    price_id: 'price_1SqMSsPhXS410TO5HQjuGUIn',
    product_id: 'prod_TnyPcUaSwW9LEC',
    name: '4-Week Transfer Intensive',
    tagline: 'Live coaching to cement your gains',
    price: 29900,         // $299
    type: 'payment' as const,
    bnplEligible: true,
    features: [
      '4 weeks of live remote coaching',
      'Game film review sessions',
      'In-game application protocols',
      'Weekly accountability check-ins',
      'Post-intensive summary report',
    ],
    highlight: false,
    badge: null,
  },

  // ── BUNDLES ───────────────────────────────────────────────────────────────

  velocity_max_pack: {
    price_id: 'price_1SqEW6PhXS410TO5GbLVm4te',
    product_id: 'prod_TnqCxLCRCWYhFZ',
    name: 'Velocity Max Pack',
    tagline: 'Everything to add 5-8 mph — guaranteed approach',
    price: 59700,         // $597 (12-week + 6-week + arm care = $894 value)
    type: 'payment' as const,
    bnplEligible: true,
    savings: 29700,       // Save $297
    features: [
      '12-Week Velocity System',
      '6-Week Velocity Accelerator',
      'Longevity System (arm health)',
      'Video Analysis 3-Pack',
      'Lifetime access to all programs',
    ],
    highlight: true,
    badge: 'Best Bundle',
  },

  recruiting_edge_pack: {
    price_id: 'price_1SqEW8PhXS410TO5A7WuQgc6',
    product_id: 'prod_TnqCuR9VoYtVC0',
    name: 'Recruiting Edge Pack',
    tagline: 'Stand out in every coach\'s inbox',
    price: 49700,         // $497 ($596 value)
    type: 'payment' as const,
    bnplEligible: true,
    savings: 9900,        // Save $99
    features: [
      'Recruiting Audit & Profile',
      'Showcase Prep Program',
      'Velo-Check Assessment',
      'Video Analysis 3-Pack',
      'VAULT™ Verified metrics link',
    ],
    highlight: false,
    badge: null,
  },

  coach_authority_pack: {
    price_id: 'price_1SqEW9PhXS410TO5detPNFap',
    product_id: 'prod_TnqC7Dgm9yEE3G',
    name: 'Coach Authority Pack',
    tagline: 'Build a coaching business on VAULT™',
    price: 74700,         // $747 ($985 value)
    type: 'payment' as const,
    bnplEligible: true,
    savings: 23800,       // Save $238
    features: [
      'VAULT™ Certified Coach Program',
      'Transfer System',
      'Video Analysis 5-Pack',
      'Coaching tools suite',
      'Coach marketplace listing',
    ],
    highlight: false,
    badge: null,
  },

  // ── HIGH-TICKET & INSTITUTIONAL ───────────────────────────────────────────

  certified_coach: {
    price_id: 'price_1SqEGOPhXS410TO5XtSbPx0v',
    product_id: 'prod_Tnpw5TKR8rgEYy',
    name: 'VAULT™ Certified Coach Program',
    tagline: 'Become a certified VAULT™ development coach',
    price: 50000,         // $500/yr
    type: 'subscription' as const,
    interval: 'year',
    bnplEligible: true,
    features: [
      'Full coach certification curriculum',
      'VAULT™ Certified badge + credential',
      'Coach marketplace listing',
      'Athlete management tools (up to 50)',
      'Revenue sharing on athlete upgrades',
      'Annual continuing education modules',
    ],
    highlight: false,
    badge: 'For Coaches',
  },

  vault_verified_coach: {
    price_id: 'price_1SqMSuPhXS410TO5ymOiyyUa',
    product_id: 'prod_TnyPm39VCsKdTa',
    name: 'VAULT™ Verified Coach Badge',
    tagline: 'The credential that separates elite coaches',
    price: 49900,         // $499 (one-time exam + credential)
    type: 'payment' as const,
    bnplEligible: true,
    features: [
      'VAULT™ certification exam',
      'Verified coach badge on profile',
      'Marketplace preferred placement',
      'VAULT™ coach referral network',
      'Credential never expires (annual renewal: $99)',
    ],
    highlight: false,
    badge: null,
  },

  small_org_license: {
    price_id: 'price_1SqEGEPhXS410TO5DeHOuqVH',
    product_id: 'prod_TnpwCoKTVxah5V',
    name: 'Team License — Travel / HS Program',
    tagline: 'Full VAULT™ OS for your entire program',
    price: 199900,        // $1,999/yr (up to 25 athletes)
    type: 'subscription' as const,
    interval: 'year',
    bnplEligible: false,
    features: [
      'Up to 25 athlete accounts',
      'Team dashboard & analytics',
      'Coach account (1 included)',
      'Parent portal for all families',
      'Practice plan builder',
      'Bulk KPI entry for coaches',
      'Program branding option',
    ],
    highlight: false,
    badge: 'Teams',
  },

  org_quick_start: {
    price_id: 'price_1SqEGIPhXS410TO5JUNSsTCq',
    product_id: 'prod_TnpwMn4AWpnMPK',
    name: 'Organization License — Academy / Club',
    tagline: 'Full platform for high-volume programs',
    price: 350000,        // $3,500/yr (unlimited athletes)
    type: 'subscription' as const,
    interval: 'year',
    bnplEligible: false,
    features: [
      'Unlimited athlete accounts',
      '3 coach accounts included',
      'Custom program branding',
      'Dedicated account manager',
      'Priority support (4hr response)',
      'Quarterly platform training call',
      'Data export + reporting suite',
    ],
    highlight: false,
    badge: 'Academies',
  },

  org_starter_pack: {
    price_id: 'price_1SqNiiPhXS410TO51M25fyJR',
    product_id: 'prod_TnziXW8OZJVCKY',
    name: 'Org Starter Pack (One-Time Setup)',
    tagline: 'Get your program fully onboarded fast',
    price: 250000,        // $2,500 (one-time setup fee)
    type: 'payment' as const,
    bnplEligible: false,
    features: [
      'Dedicated onboarding session',
      'Program data migration',
      'Custom athlete import',
      'Staff training session',
      'First 3 months of Org License included',
    ],
    highlight: false,
    badge: null,
  },

  // ── ENTRY / FLAGSHIP ──────────────────────────────────────────────────────

  performance_blueprint: {
    price_id: 'price_1StVz1PhXS410TO5hktrpoe1',
    product_id: 'prod_TrER8mB9wvHWZy',
    name: 'VAULT™ Performance Blueprint',
    tagline: 'The starter guide to elite development',
    price: 4700,          // $47 — intentional entry point
    type: 'payment' as const,
    bnplEligible: false,
    features: [
      'Complete development framework PDF',
      'Position-specific training templates',
      'KPI benchmark reference guide',
      'Recruiting timeline roadmap',
      '30-day quick-start program',
    ],
    highlight: false,
    badge: 'Entry Point — $47',
  },

  founders_access: {
    price_id: 'price_1SqNikPhXS410TO5rLuqRrBn',
    product_id: 'prod_TnziXPd0kWbybf',
    name: "Founder's Access — Lifetime Suite",
    tagline: 'One payment. Every product. Forever.',
    price: 49900,         // $499 — dramatically underpriced, intentionally
    type: 'payment' as const,
    bnplEligible: true,
    features: [
      'Lifetime Elite Membership access',
      'All current + future one-time programs',
      'Founding member badge + recognition',
      'Locked price forever (never increases)',
      'Priority beta access to new features',
      'Direct founder community access',
    ],
    highlight: true,
    badge: '🔥 Limited — Founders Only',
  },
} as const;

export type ProductKey = keyof typeof PRODUCT_PRICES;

export const formatPrice = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
};

export const getProductByKey = (key: ProductKey) => PRODUCT_PRICES[key];

// ── MEMBERSHIP TIERS (display order) ─────────────────────────────────────────
export const MEMBERSHIP_TIERS: ProductKey[] = ['basic', 'performance', 'elite', 'remote_training'];

// ── BNPL CONFIG ───────────────────────────────────────────────────────────────
// Klarna and Affirm are enabled at the Stripe level on the checkout session.
// The `bnplEligible` flag controls whether we show BNPL messaging on product pages.
// Stripe handles the actual routing to Klarna/Affirm automatically when enabled
// in the Stripe Dashboard under Payment Methods.
export const BNPL_MIN_AMOUNT_CENTS = 5000; // $50 minimum for BNPL display
export const BNPL_PROVIDERS = ['Klarna', 'Affirm'];

export const getBNPLInstallments = (priceCents: number): { provider: string; monthly: string; months: number } | null => {
  if (priceCents < BNPL_MIN_AMOUNT_CENTS) return null;
  // Standard 4-payment Klarna split
  const monthly = Math.ceil(priceCents / 4);
  return { provider: 'Klarna', monthly: formatPrice(monthly), months: 4 };
};

// ── PRICING DISPLAY HELPERS ───────────────────────────────────────────────────
export const getMembershipComparisonValue = (key: ProductKey): string => {
  const comparisons: Partial<Record<ProductKey, string>> = {
    basic: 'vs. $0/mo with zero structure',
    performance: 'vs. one in-person lesson/mo ($120)',
    elite: 'vs. 2 lessons/mo ($240 value)',
    remote_training: 'vs. weekly lessons ($480+ value)',
  };
  return comparisons[key] || '';
};
