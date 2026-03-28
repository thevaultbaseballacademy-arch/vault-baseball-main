import { useSubscription } from "@/contexts/SubscriptionContext";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
  requiredTier?: "basic" | "performance" | "elite";
}

const ProtectedRoute = ({ 
  children, 
  requireSubscription = false,
  requiredTier 
}: ProtectedRouteProps) => {
  const { user, isSubscribed, subscriptionTier, isLoading } = useSubscription();
  const location = useLocation();

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

  if (requireSubscription && !isSubscribed) {
    return <Navigate to="/#pricing" replace />;
  }

  if (requiredTier) {
    const tierLevels = { basic: 1, performance: 2, elite: 3 };
    const userLevel = subscriptionTier ? tierLevels[subscriptionTier] : 0;
    const requiredLevel = tierLevels[requiredTier];
    
    if (userLevel < requiredLevel) {
      return <Navigate to="/#pricing" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
