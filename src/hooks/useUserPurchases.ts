import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserPurchase {
  id: string;
  user_id: string;
  product_key: string;
  stripe_session_id: string | null;
  amount_cents: number;
  status: string;
  purchased_at: string;
  expires_at: string | null;
}

// Map product keys to course IDs they grant access to
// IMPORTANT: Keep this in sync with supabase/functions/verify-purchase/index.ts
// Complete list of all course IDs available in the platform
const ALL_COURSES = [
  'velocity-system', 'hitting-velocity-12week', 'pitching-velocity-8week', 'elite-pitching-12week',
  'elite-speed-agility-12week', 'youth-vertical-6week', 'elite-vertical-12week',
  'strength-conditioning-12week', 'youth-catcher-8week', 'elite-catcher-12week',
  'vault-catcher-complete', 'arm-health-workload', 'arm-care-complete',
  'pitcher-catcher-overlap', 'mobility-durability', 'transfer-system',
  'competitive-execution', 'elite-mindset-10week', 'winning-mindset-10week',
  'organizational-development', 'strength-power-system', 'annual-development-calendar',
  'infield-development', 'outfield-development',
];

// Map product keys to course IDs they grant access to
// IMPORTANT: Keep this in sync with supabase/functions/verify-purchase/index.ts
const PRODUCT_TO_COURSES: Record<string, string[]> = {
  // Subscriptions — tiered access
  'basic': [
    'elite-speed-agility-12week', 'youth-vertical-6week', 'elite-mindset-10week', 'winning-mindset-10week',
    'arm-care-complete', 'mobility-durability',
  ],
  'performance': [
    'velocity-system', 'hitting-velocity-12week', 'pitching-velocity-8week',
    'strength-conditioning-12week', 'elite-speed-agility-12week', 'youth-vertical-6week',
    'elite-vertical-12week', 'arm-health-workload', 'arm-care-complete', 'mobility-durability',
    'elite-mindset-10week', 'winning-mindset-10week', 'competitive-execution',
  ],
  'remote_training': ALL_COURSES,
  'elite': ALL_COURSES,
  'vault_trial': ALL_COURSES,

  // Org licenses — full access
  'small_org_license': ALL_COURSES,
  'org_quick_start': ALL_COURSES,
  'org_starter_pack': ALL_COURSES,

  // Stand-alone products
  'velocity_12week': ['velocity-system', 'hitting-velocity-12week', 'pitching-velocity-8week', 'elite-pitching-12week'],
  'velocity_accelerator': ['velocity-system', 'hitting-velocity-12week'],
  'longevity_system': ['arm-health-workload', 'arm-care-complete', 'mobility-durability', 'pitcher-catcher-overlap'],
  'longevity_beta': ['arm-health-workload', 'arm-care-complete', 'mobility-durability', 'pitcher-catcher-overlap'],
  'transfer_system': ['transfer-system', 'competitive-execution'],
  'transfer_beta': ['transfer-system', 'competitive-execution'],
  'transfer_intensive': ['transfer-system', 'competitive-execution'],

  // Bundles
  'velocity_max_pack': [
    'velocity-system', 'hitting-velocity-12week', 'pitching-velocity-8week',
    'elite-speed-agility-12week', 'strength-conditioning-12week',
  ],
  'recruiting_edge_pack': ['velocity-system', 'hitting-velocity-12week', 'elite-mindset-10week'],
  'coach_authority_pack': ALL_COURSES,

  // Founder's Access — EVERYTHING, lifetime
  'founders_access': ALL_COURSES,

  // Services (no course access but still tracked as purchases)
  'velo_check': [],
  'recruitment_audit': [],
  'certified_coach': [],
  'vault_verified_coach': [],
  'showcase_prep': [],
  'video_analysis_5pack': [],
  'performance_blueprint': [],
};

export function useUserPurchases(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-purchases", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_purchases")
        .select("*")
        .eq("user_id", userId)
        .order("purchased_at", { ascending: false });
      
      if (error) throw error;
      return data as UserPurchase[];
    },
    enabled: !!userId,
  });
}

export function useHasProductAccess(userId: string | undefined, productKey: string) {
  const { data: purchases, isLoading } = useUserPurchases(userId);
  
  const hasAccess = purchases?.some(p => 
    p.product_key === productKey && 
    p.status === 'completed' &&
    (!p.expires_at || new Date(p.expires_at) > new Date())
  ) ?? false;
  
  return { hasAccess, isLoading };
}

export function useHasCourseAccess(userId: string | undefined, courseId: string) {
  const { data: purchases, isLoading } = useUserPurchases(userId);
  
  const hasAccess = purchases?.some(purchase => {
    if (purchase.status !== 'completed') return false;
    if (purchase.expires_at && new Date(purchase.expires_at) < new Date()) return false;
    
    const grantedCourses = PRODUCT_TO_COURSES[purchase.product_key] || [];
    return grantedCourses.includes(courseId);
  }) ?? false;
  
  return { hasAccess, isLoading };
}

export function useUnlockedCourses(userId: string | undefined) {
  const { data: purchases, isLoading } = useUserPurchases(userId);
  
  const unlockedCourses = new Set<string>();
  
  purchases?.forEach(purchase => {
    if (purchase.status !== 'completed') return;
    if (purchase.expires_at && new Date(purchase.expires_at) < new Date()) return;
    
    const grantedCourses = PRODUCT_TO_COURSES[purchase.product_key] || [];
    grantedCourses.forEach(c => unlockedCourses.add(c));
  });
  
  return { unlockedCourses: Array.from(unlockedCourses), isLoading };
}