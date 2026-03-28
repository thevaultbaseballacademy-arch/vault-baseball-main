import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BadgeLevel = "foundations" | "performance" | "specialist" | "pro" | "director";

export interface CoachBadgeInfo {
  badge_level: BadgeLevel | null;
  badge_name: string | null;
  certifications: string[];
  has_video_cert: boolean;
}

export const BADGE_COLORS: Record<BadgeLevel, { bg: string; text: string; border: string; label: string }> = {
  foundations: { bg: "bg-blue-600", text: "text-white", border: "border-blue-500", label: "VAULT™ Certified Coach" },
  performance: { bg: "bg-amber-500", text: "text-black", border: "border-amber-400", label: "VAULT™ Performance Coach" },
  specialist: { bg: "bg-emerald-600", text: "text-white", border: "border-emerald-500", label: "VAULT™ Specialist" },
  pro: { bg: "bg-red-600", text: "text-white", border: "border-red-500", label: "VAULT™ PRO Coach" },
  director: { bg: "bg-purple-600", text: "text-white", border: "border-purple-500", label: "VAULT™ Certified Director" },
};

export const useCoachBadge = (userId: string | null) => {
  return useQuery({
    queryKey: ["coach-badge", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase.rpc("get_coach_badge_level", { _user_id: userId });
      if (error) throw error;
      return data as unknown as CoachBadgeInfo;
    },
    enabled: !!userId,
  });
};

export const useMyBadge = () => {
  return useQuery({
    queryKey: ["my-coach-badge"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.rpc("get_coach_badge_level", { _user_id: user.id });
      if (error) throw error;
      return data as unknown as CoachBadgeInfo;
    },
  });
};
