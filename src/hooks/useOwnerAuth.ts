import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface OwnerAuthState {
  user: User | null;
  isOwner: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  profile: {
    id: string;
    display_name: string;
    email: string;
  } | null;
}

export const useOwnerAuth = () => {
  const [state, setState] = useState<OwnerAuthState>({
    user: null,
    isOwner: false,
    isAdmin: false,
    isLoading: true,
    profile: null,
  });

  useEffect(() => {
    const checkOwnerAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setState({ user: null, isOwner: false, isAdmin: false, isLoading: false, profile: null });
          return;
        }

        // Check if user has admin role in user_roles table
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const hasAdminRole = userRoles?.some((r) => r.role === "admin");

        // Check team whitelist for owner/admin access (server-side source of truth)
        let hasTeamOwnerAccess = false;
        let hasTeamAdminAccess = false;
        if (user.email) {
          const { data: teamData } = await supabase
            .from("team_whitelist")
            .select("admin_access, full_access")
            .eq("email", user.email.toLowerCase())
            .maybeSingle();
          
          // Owner access requires both admin_access and full_access
          hasTeamOwnerAccess = (teamData?.admin_access && teamData?.full_access) ?? false;
          hasTeamAdminAccess = teamData?.admin_access ?? false;
        }

        // Get profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, display_name, email")
          .eq("user_id", user.id)
          .single();

        const isOwner = hasTeamOwnerAccess;
        const isAdmin = hasAdminRole || isOwner || hasTeamAdminAccess;

        setState({
          user,
          isOwner,
          isAdmin,
          isLoading: false,
          profile: profileData ? {
            id: profileData.user_id,
            display_name: profileData.display_name || "Owner",
            email: profileData.email || user.email || "",
          } : null,
        });
      } catch (error) {
        console.error("Error checking owner access:", error);
        setState({ user: null, isOwner: false, isAdmin: false, isLoading: false, profile: null });
      }
    };

    checkOwnerAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkOwnerAccess();
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
};
