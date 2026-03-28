import { supabase } from "@/integrations/supabase/client";

type ActivityType = 
  | "velocity_gain"
  | "community_win"
  | "new_drill"
  | "course_complete"
  | "certification"
  | "goal_achieved"
  | "team_join"
  | "pr_set";

interface LogActivityOptions {
  activityType: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export const useActivityFeed = () => {
  const logActivity = async ({
    activityType,
    title,
    description,
    metadata = {},
  }: LogActivityOptions) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('activity_feed')
        .insert({
          user_id: user?.id || null,
          activity_type: activityType,
          title,
          description,
          metadata,
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error logging activity:', error);
      return { success: false, error };
    }
  };

  return { logActivity };
};

export default useActivityFeed;