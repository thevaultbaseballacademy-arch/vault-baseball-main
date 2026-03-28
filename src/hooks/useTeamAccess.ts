import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TeamAccessState {
  hasFullAccess: boolean;
  hasAdminAccess: boolean;
  isLoading: boolean;
  email: string | null;
}

export const useTeamAccess = (userId: string | undefined) => {
  const [state, setState] = useState<TeamAccessState>({
    hasFullAccess: false,
    hasAdminAccess: false,
    isLoading: true,
    email: null,
  });

  useEffect(() => {
    if (!userId) {
      setState({ hasFullAccess: false, hasAdminAccess: false, isLoading: false, email: null });
      return;
    }

    const checkTeamAccess = async () => {
      try {
        // Get user email first
        const { data: { user } } = await supabase.auth.getUser();
        const email = user?.email || null;

        if (!email) {
          setState({ hasFullAccess: false, hasAdminAccess: false, isLoading: false, email: null });
          return;
        }

        // Check whitelist status
        const { data, error } = await supabase
          .from("team_whitelist")
          .select("full_access, admin_access")
          .eq("email", email)
          .maybeSingle();

        if (error) {
          console.error("Error checking team access:", error);
          setState({ hasFullAccess: false, hasAdminAccess: false, isLoading: false, email });
          return;
        }

        setState({
          hasFullAccess: data?.full_access ?? false,
          hasAdminAccess: data?.admin_access ?? false,
          isLoading: false,
          email,
        });
      } catch (error) {
        console.error("Error checking team access:", error);
        setState({ hasFullAccess: false, hasAdminAccess: false, isLoading: false, email: null });
      }
    };

    checkTeamAccess();
  }, [userId]);

  return state;
};
