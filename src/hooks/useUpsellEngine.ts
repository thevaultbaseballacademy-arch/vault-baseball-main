import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/contexts/SubscriptionContext';

export interface UpsellOffer {
  id: string;
  offer_type: string;
  offer_key: string;
  title: string;
  description: string;
  cta_label: string;
  cta_route: string;
  trigger_reason: string;
  priority: number;
}

export const useUpsellEngine = (userId: string | undefined) => {
  const [offers, setOffers] = useState<UpsellOffer[]>([]);
  const { subscriptionTier } = useSubscription();

  const fetchOffers = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('upsell_offers')
      .select('*')
      .eq('user_id', userId)
      .eq('is_dismissed', false)
      .eq('is_converted', false)
      .order('priority', { ascending: false })
      .limit(3);
    setOffers((data as UpsellOffer[]) || []);
  }, [userId]);

  const generateOffers = useCallback(async () => {
    if (!userId || subscriptionTier === 'elite') return;

    // Fetch athlete data to generate contextual offers
    const [kpisRes, scoresRes, feedbackRes] = await Promise.all([
      supabase.from('athlete_kpis').select('kpi_name, kpi_category, kpi_value').eq('user_id', userId).order('recorded_at', { ascending: false }).limit(20),
      supabase.from('athlete_development_scores').select('*').eq('user_id', userId).limit(1),
      supabase.from('coach_lesson_feedback').select('areas_for_improvement').eq('athlete_user_id', userId).order('created_at', { ascending: false }).limit(5),
    ]);

    const newOffers: Omit<UpsellOffer, 'id'>[] = [];
    const score = scoresRes.data?.[0];

    // Stalled athlete → coaching upsell
    if (score?.improvement_status === 'stalled' || score?.improvement_status === 'regressing') {
      newOffers.push({
        offer_type: 'coaching',
        offer_key: 'stalled_coaching',
        title: 'Break Through Your Plateau',
        description: 'Your progress has stalled. A 1-on-1 coaching session can identify the exact adjustments needed.',
        cta_label: 'Book a Lesson',
        cta_route: '/book-session',
        trigger_reason: `Development status: ${score.improvement_status}`,
        priority: 90,
      });
    }

    // Low training consistency → program upsell
    if (score && score.training_consistency < 40) {
      newOffers.push({
        offer_type: 'program',
        offer_key: 'low_consistency_program',
        title: 'Get a Structured Plan',
        description: 'Your consistency is below 40%. A structured program keeps you on track with daily assignments.',
        cta_label: 'View Programs',
        cta_route: '/my-programs',
        trigger_reason: `Training consistency: ${score.training_consistency}%`,
        priority: 80,
      });
    }

    // Free tier → subscription upsell
    if (!subscriptionTier) {
      newOffers.push({
        offer_type: 'subscription',
        offer_key: 'free_to_paid',
        title: 'Unlock Full Development Tools',
        description: 'Get full KPI tracking, unlimited drills, programs, and your personalized weekly plan.',
        cta_label: 'View Plans',
        cta_route: '/pricing',
        trigger_reason: 'No active subscription',
        priority: 70,
      });
    }

    // Basic tier → premium coaching
    if (subscriptionTier === 'basic') {
      newOffers.push({
        offer_type: 'upgrade',
        offer_key: 'basic_to_performance',
        title: 'Add Remote Coaching',
        description: 'Upgrade to Performance tier for 1-on-1 remote lessons and personalized coaching plans.',
        cta_label: 'Upgrade Now',
        cta_route: '/pricing',
        trigger_reason: 'Basic tier without coaching',
        priority: 60,
      });
    }

    // Weakness-based upsells from recent feedback
    const weaknesses = (feedbackRes.data || [])
      .map(f => f.areas_for_improvement)
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (weaknesses.includes('bat speed') || weaknesses.includes('exit velo')) {
      newOffers.push({
        offer_type: 'course',
        offer_key: 'hitting_weakness',
        title: 'Improve Your Bat Speed',
        description: 'Coach feedback shows hitting as a development area. Our Hitting Mastery course targets exactly this.',
        cta_label: 'Start Course',
        cta_route: '/courses',
        trigger_reason: 'Repeated hitting weakness in coach feedback',
        priority: 75,
      });
    }

    if (weaknesses.includes('command') || weaknesses.includes('velocity') || weaknesses.includes('mechanics')) {
      newOffers.push({
        offer_type: 'course',
        offer_key: 'pitching_weakness',
        title: 'Fix Your Pitching Mechanics',
        description: 'Your coach flagged pitching as a focus area. The Velocity System addresses this step by step.',
        cta_label: 'Start Course',
        cta_route: '/courses',
        trigger_reason: 'Repeated pitching weakness in coach feedback',
        priority: 75,
      });
    }

    // Deduplicate against existing offers
    if (newOffers.length === 0) return;

    const { data: existing } = await supabase
      .from('upsell_offers')
      .select('offer_key')
      .eq('user_id', userId)
      .in('offer_key', newOffers.map(o => o.offer_key));

    const existingKeys = new Set((existing || []).map((e: any) => e.offer_key));
    const toInsert = newOffers
      .filter(o => !existingKeys.has(o.offer_key))
      .map(o => ({ ...o, user_id: userId }));

    if (toInsert.length > 0) {
      await supabase.from('upsell_offers').insert(toInsert as any);
      fetchOffers();
    }
  }, [userId, subscriptionTier, fetchOffers]);

  const dismissOffer = useCallback(async (offerId: string) => {
    await supabase.from('upsell_offers').update({ is_dismissed: true, dismissed_at: new Date().toISOString() }).eq('id', offerId);
    setOffers(prev => prev.filter(o => o.id !== offerId));
  }, []);

  const convertOffer = useCallback(async (offerId: string) => {
    await supabase.from('upsell_offers').update({ is_converted: true, converted_at: new Date().toISOString() }).eq('id', offerId);
    setOffers(prev => prev.filter(o => o.id !== offerId));
  }, []);

  useEffect(() => {
    fetchOffers();
    generateOffers();
  }, [fetchOffers, generateOffers]);

  return { offers, dismissOffer, convertOffer, refreshOffers: generateOffers };
};
