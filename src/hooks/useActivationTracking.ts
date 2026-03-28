import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ActivationEvent =
  | 'signup_complete'
  | 'onboarding_complete'
  | 'first_checkin'
  | 'first_kpi_recorded'
  | 'first_drill_assigned'
  | 'first_drill_completed'
  | 'first_lesson_booked'
  | 'first_lesson_completed'
  | 'first_course_started'
  | 'first_program_started'
  | 'assessment_complete'
  | 'coach_connected'
  | 'weekly_plan_viewed'
  | 'upsell_clicked'
  | 'upsell_converted';

export const useActivationTracking = () => {
  const track = useCallback(async (eventType: ActivationEvent, eventData: Record<string, unknown> = {}) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      await supabase.from('activation_events').insert([{
        user_id: session.user.id,
        event_type: eventType,
        event_data: eventData as any,
      }]);
    } catch (err) {
      console.error('Activation tracking error:', err);
    }
  }, []);

  return { track };
};
