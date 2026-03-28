import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NotificationPreferences {
  course_updates: boolean;
  community_mentions: boolean;
  community_likes: boolean;
  community_comments: boolean;
  coach_messages: boolean;
}

const defaultPreferences: NotificationPreferences = {
  course_updates: true,
  community_mentions: true,
  community_likes: true,
  community_comments: true,
  coach_messages: true,
};

export const useNotificationPreferences = (userId: string | undefined) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          setPreferences({
            course_updates: data.course_updates,
            community_mentions: data.community_mentions,
            community_likes: data.community_likes,
            community_comments: data.community_comments,
            coach_messages: data.coach_messages,
          });
        } else {
          // Create default preferences for new user
          await supabase
            .from("notification_preferences")
            .insert({ user_id: userId, ...defaultPreferences });
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [userId]);

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!userId) return;

    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({ user_id: userId, ...newPreferences }, { onConflict: "user_id" });

      if (error) throw error;

      toast({
        title: "Preferences Updated",
        description: "Your notification settings have been saved.",
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      // Revert on error
      setPreferences(preferences);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    preferences,
    loading,
    updatePreference,
  };
};
