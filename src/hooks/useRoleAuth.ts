import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VaultRole, Permission, hasPermission, getPrimaryRole, getDashboardRoute } from "@/lib/permissions";
import { useSubscription } from "@/contexts/SubscriptionContext";

/**
 * Unified hook for role-based auth. Uses React Query for caching.
 */
export const useRoleAuth = () => {
  const { user } = useSubscription();

  const { data, isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user) return { roles: [] as VaultRole[] };

      // Batch all three queries in parallel
      const [rolesResult, whitelistResult, coachResult] = await Promise.all([
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id),
        user.email
          ? supabase
              .from("team_whitelist")
              .select("admin_access, full_access")
              .eq("email", user.email.toLowerCase())
              .maybeSingle()
          : Promise.resolve({ data: null }),
        supabase
          .from("coaches")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "Active")
          .maybeSingle(),
      ]);

      const roles: VaultRole[] = (rolesResult.data || [])
        .map((r) => r.role as string)
        .filter((r): r is VaultRole =>
          ["owner", "admin", "coach", "athlete", "parent"].includes(r)
        );

      const tw = whitelistResult.data;
      if (tw?.admin_access && tw?.full_access && !roles.includes("owner")) {
        roles.push("owner");
      }
      if (tw?.admin_access && !tw?.full_access && !roles.includes("admin")) {
        roles.push("admin");
      }

      if (coachResult.data && !roles.includes("coach")) {
        roles.push("coach");
      }

      return { roles };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const roles = data?.roles ?? [];
  const primaryRole = useMemo(() => getPrimaryRole(roles), [roles]);

  const can = useCallback(
    (permission: Permission) => hasPermission(roles, permission),
    [roles]
  );

  const dashboardRoute = useMemo(
    () => getDashboardRoute(primaryRole),
    [primaryRole]
  );

  return {
    user: user ?? null,
    roles,
    primaryRole,
    isLoading,
    can,
    dashboardRoute,
    isOwner: roles.includes("owner"),
    isAdmin: roles.includes("admin") || roles.includes("owner"),
    isCoach: roles.includes("coach"),
    isAthlete: roles.includes("athlete"),
    isParent: roles.includes("parent"),
  };
};
