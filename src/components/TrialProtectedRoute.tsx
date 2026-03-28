import { useTrialStatus } from "@/hooks/useTrialStatus";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface TrialProtectedRouteProps {
  children: React.ReactNode;
  allowTrialAccess?: boolean; // Some pages (like velocity-baseline) allow trial users
}

const TrialProtectedRoute = ({ 
  children, 
  allowTrialAccess = false 
}: TrialProtectedRouteProps) => {
  const { isTrialUser, isTrialExpired, isFullMember, loading } = useTrialStatus();
  // Re-use the session already fetched by SubscriptionContext to avoid a
  // redundant supabase.auth.getSession() waterfall on every protected page.
  const { user, isLoading: authLoading } = useSubscription();
  const location = useLocation();

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in - redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Full member - always allow access
  if (isFullMember) {
    return <>{children}</>;
  }

  // Trial user with active trial — grant full access to all core features
  if (isTrialUser && !isTrialExpired) {
    return <>{children}</>;
  }

  // Trial expired - redirect to expired page
  if (isTrialUser && isTrialExpired) {
    return <Navigate to="/trial-expired" replace />;
  }

  // Default: allow access (new users who haven't started trial)
  return <>{children}</>;
};

export default TrialProtectedRoute;
