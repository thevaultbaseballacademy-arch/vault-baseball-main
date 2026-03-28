import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TimeFilter = 'week' | 'month' | 'year' | 'all';

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  certificate_count: number;
  latest_certificate_date: string;
  courses_completed: string[];
}

export const useCertificateLeaderboard = (limit: number = 50, timeFilter: TimeFilter = 'all') => {
  return useQuery({
    queryKey: ["certificate-leaderboard", limit, timeFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_certificate_leaderboard", { 
          result_limit: limit,
          time_filter: timeFilter 
        });
      
      if (error) throw error;
      return (data || []) as LeaderboardEntry[];
    },
  });
};
