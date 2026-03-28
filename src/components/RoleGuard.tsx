import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Permission, VaultRole } from "@/lib/permissions";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RoleGuardProps {
  children: React.ReactNode;
  /** Permission required to access this route */
  requires?: Permission;
  /** Alternative: require any of these roles */
  requiresRole?: VaultRole[];
  /** Optional: redirect to a custom path on denial (default: /dashboard) */
  fallback?: string;
}

/**
 * Route guard that enforces permission-based access.
 * Logs 403 denials to access_denied_logs for owner audit visibility.
 */
const RoleGuard = ({ children, requires, requiresRole, fallback }: RoleGuardProps) => {
  const { user, can, roles, isLoading } = useRoleAuth();
  const location = useLocation();
  const logged = useRef(false);

  const isAuthorized = (() => {
    if (!user) return false;
    if (requires && !can(requires)) return false;
    if (requiresRole && !requiresRole.some((r) => roles.includes(r))) return false;
    return true;
  })();

  // Log 403 denials to the audit table
  useEffect(() => {
    if (isLoading || !user || isAuthorized || logged.current) return;
    logged.current = true;

    supabase
      .from("access_denied_logs")
      .insert({
        user_id: user.id,
        attempted_route: location.pathname,
        attempted_permission: requires || requiresRole?.join(",") || "unknown",
      })
      .then(({ error }) => {
        if (error) console.error("Failed to log access denial:", error);
      });
  }, [isLoading, user, isAuthorized, location.pathname, requires, requiresRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    return <Navigate to={fallback || "/dashboard"} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
