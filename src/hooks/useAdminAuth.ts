import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  coachProfile: {
    id: string;
    org_id: string;
    role: string;
    name: string;
  } | null;
}

export const useAdminAuth = () => {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    isLoading: true,
    coachProfile: null,
  });

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setState({ user: null, isAdmin: false, isLoading: false, coachProfile: null });
          return;
        }

        // Check if user has admin role in user_roles table (existing system)
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const hasSystemAdmin = userRoles?.some((r) => r.role === "admin");

        // Check if user is in coaches table with admin role
        const { data: coachData } = await supabase
          .from("coaches")
          .select("id, org_id, role, name")
          .eq("user_id", user.id)
          .eq("status", "Active")
          .single();

        const hasCoachAdminRole = coachData && 
          ["OrgAdmin", "Director", "VAULTHQ"].includes(coachData.role);

        // Check team whitelist for admin access
        let hasTeamAdminAccess = false;
        if (user.email) {
          const { data: teamData } = await supabase
            .from("team_whitelist")
            .select("admin_access")
            .eq("email", user.email.toLowerCase())
            .maybeSingle();
          
          hasTeamAdminAccess = teamData?.admin_access ?? false;
        }

        setState({
          user,
          isAdmin: hasSystemAdmin || hasCoachAdminRole || hasTeamAdminAccess,
          isLoading: false,
          coachProfile: coachData as AdminAuthState["coachProfile"],
        });
      } catch (error) {
        console.error("Error checking admin access:", error);
        setState({ user: null, isAdmin: false, isLoading: false, coachProfile: null });
      }
    };

    checkAdminAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminAccess();
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
};
