import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, differenceInHours } from 'date-fns';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface TrialStatus {
  isTrialUser: boolean;
  isTrialExpired: boolean;
  isFullMember: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  trialStartedAt: Date | null;
  trialExpiresAt: Date | null;
  loading: boolean;
}

export const useTrialStatus = (): TrialStatus => {
  // Reuse the already-loaded subscription state instead of calling check-subscription again
  const { user, isSubscribed, hasTeamAccess, isLoading: subLoading } = useSubscription();

  const { data: trialData, isLoading: trialLoading } = useQuery({
    queryKey: ['trial-status', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Already a full member via subscription or team access — skip trial check
      if (isSubscribed || hasTeamAccess) {
        return { fullMember: true } as const;
      }

      // Check for Founder's Access or vault_trial purchases
      const { data: purchases } = await supabase
        .from('user_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .in('product_key', ['founders_access', 'vault_trial'])
        .limit(1);

      if (purchases && purchases.length > 0) {
        return { fullMember: true } as const;
      }

      // Check for trial
      const { data: trial } = await supabase
        .from('user_trials')
        .select('started_at, expires_at')
        .eq('user_id', user.id)
        .eq('trial_type', 'velocity_baseline')
        .maybeSingle();

      if (trial) {
        return { trial } as const;
      }

      // Fallback: check account age
      return { accountCreatedAt: user.created_at } as const;
    },
    enabled: !!user && !subLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const loading = subLoading || trialLoading;

  if (loading || !trialData) {
    return {
      isTrialUser: false,
      isTrialExpired: false,
      isFullMember: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      trialStartedAt: null,
      trialExpiresAt: null,
      loading,
    };
  }

  if ('fullMember' in trialData) {
    return {
      isTrialUser: false,
      isTrialExpired: false,
      isFullMember: true,
      daysRemaining: 0,
      hoursRemaining: 0,
      trialStartedAt: null,
      trialExpiresAt: null,
      loading: false,
    };
  }

  if ('trial' in trialData) {
    const now = new Date();
    const expiresAt = new Date(trialData.trial.expires_at);
    const startedAt = new Date(trialData.trial.started_at);
    const isExpired = now > expiresAt;

    return {
      isTrialUser: true,
      isTrialExpired: isExpired,
      isFullMember: false,
      daysRemaining: Math.max(0, differenceInDays(expiresAt, now)),
      hoursRemaining: Math.max(0, differenceInHours(expiresAt, now) % 24),
      trialStartedAt: startedAt,
      trialExpiresAt: expiresAt,
      loading: false,
    };
  }

  if ('accountCreatedAt' in trialData && trialData.accountCreatedAt) {
    const accountCreated = new Date(trialData.accountCreatedAt);
    const now = new Date();
    const accountAgeDays = differenceInDays(now, accountCreated);

    if (accountAgeDays > 7) {
      return {
        isTrialUser: true,
        isTrialExpired: true,
        isFullMember: false,
        daysRemaining: 0,
        hoursRemaining: 0,
        trialStartedAt: accountCreated,
        trialExpiresAt: new Date(accountCreated.getTime() + 7 * 24 * 60 * 60 * 1000),
        loading: false,
      };
    }
  }

  return {
    isTrialUser: false,
    isTrialExpired: false,
    isFullMember: false,
    daysRemaining: 0,
    hoursRemaining: 0,
    trialStartedAt: null,
    trialExpiresAt: null,
    loading: false,
  };
};
