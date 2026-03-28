import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActivationTracking } from './useActivationTracking';
import { analyzeAthlete, buildIntelligenceInput, IntelligenceOutput } from '@/lib/intelligence/engine';

/**
 * Hook that runs after onboarding to generate an instant assessment,
 * seed KPI baselines, and create the first weekly plan.
 */
export const useOnboardingActivation = (userId: string | undefined) => {
  const { track } = useActivationTracking();
  const triggered = useRef(false);

  useEffect(() => {
    if (!userId || triggered.current) return;
    triggered.current = true;

    const activate = async () => {
      try {
        // Check if already activated
        const { data: existing } = await supabase
          .from('activation_events')
          .select('id')
          .eq('user_id', userId)
          .eq('event_type', 'onboarding_complete')
          .limit(1);

        if (existing && existing.length > 0) return;

        // Fetch onboarding data
        const { data: onboarding } = await supabase
          .from('athlete_onboarding')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!onboarding || onboarding.length === 0) return;

        const ob = onboarding[0];
        const { data: profile } = await supabase
          .from('profiles')
          .select('sport_type')
          .eq('user_id', userId)
          .single();

        const sportType = (profile?.sport_type as 'baseball' | 'softball') || 'baseball';

        // Seed baseline KPIs from onboarding data
        const kpiInserts: any[] = [];
        if (ob.current_velocity) {
          kpiInserts.push({
            user_id: userId,
            kpi_name: sportType === 'softball' ? 'pitch_speed' : 'pitch_velocity',
            kpi_category: 'pitching',
            kpi_value: parseFloat(ob.current_velocity),
            kpi_unit: 'mph',
            source: 'onboarding',
          });
        }
        if (ob.exit_velo) {
          kpiInserts.push({
            user_id: userId,
            kpi_name: 'exit_velocity',
            kpi_category: 'hitting',
            kpi_value: parseFloat(ob.exit_velo),
            kpi_unit: 'mph',
            source: 'onboarding',
          });
        }
        if (ob.sixty_time) {
          kpiInserts.push({
            user_id: userId,
            kpi_name: sportType === 'softball' ? 'home_to_first' : 'sixty_yard',
            kpi_category: 'speed',
            kpi_value: parseFloat(ob.sixty_time),
            kpi_unit: 'sec',
            source: 'onboarding',
          });
        }

        if (kpiInserts.length > 0) {
          await supabase.from('athlete_kpis').insert(kpiInserts);
        }

        // Run intelligence engine with baseline data
        const levelMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
          youth: 'beginner',
          middle_school: 'beginner',
          high_school_jv: 'intermediate',
          high_school_varsity: 'intermediate',
          travel: 'intermediate',
          college: 'advanced',
        };

        const input = buildIntelligenceInput(
          sportType,
          [], // no checkins yet
          kpiInserts.map(k => ({ ...k, recorded_at: new Date().toISOString() })),
          [], // no assessments yet
          undefined,
          undefined,
          [], // no feedback yet
          [], // no workload yet
          [], [], [],
          undefined,
        );

        // Override profile with onboarding data
        input.profile.experienceLevel = levelMap[ob.current_level || ''] || 'beginner';
        input.profile.position = ob.position || undefined;
        if (ob.age) input.profile.age = ob.age;

        const output = analyzeAthlete(input);

        // Save development score snapshot
        await supabase.from('athlete_development_scores').upsert({
          user_id: userId,
          overall_score: output.overallScore,
          improvement_status: output.status,
          strengths_summary: output.strengths.slice(0, 5).map(s => s.area),
          gaps_summary: output.gaps.slice(0, 5).map(g => g.area),
          top_priorities: output.priorities.slice(0, 3),
          weekly_focus: output.weeklyPlan.focusAreas[0] || 'General Development',
          sport_type: sportType,
          period_start: new Date().toISOString().split('T')[0],
          period_end: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        }, { onConflict: 'user_id' });

        // Track activation
        await track('onboarding_complete', {
          sport: sportType,
          position: ob.position,
          level: ob.current_level,
          kpis_seeded: kpiInserts.length,
          gaps_found: output.gaps.length,
          drills_recommended: output.recommendedDrills.length,
        });
      } catch (err) {
        console.error('Onboarding activation error:', err);
      }
    };

    activate();
  }, [userId, track]);
};
