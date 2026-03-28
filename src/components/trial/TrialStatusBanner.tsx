import { useState } from "react";
import { Clock, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { use22MTrialStatus } from "@/hooks/use22MTrialStatus";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const TrialStatusBanner = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const { data: trialStatus, isLoading } = use22MTrialStatus(userId || undefined);

  if (isLoading || !trialStatus?.has_trial || dismissed) return null;

  const { trial_active, days_remaining, is_expired, trial_type } = trialStatus;

  // Don't show if converted
  if (trialStatus.converted) return null;

  const isUrgent = (days_remaining ?? 0) <= 2;
  const trialLabel = trial_type === "22m_founding_athlete" 
    ? "22M Founding Athlete Access" 
    : "Trial Access";

  if (is_expired) {
    return (
      <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-destructive" />
            <span className="text-foreground font-medium">
              Your {trialLabel} has expired
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="vault" 
              size="sm"
              onClick={() => navigate("/products/velocity-system")}
            >
              Upgrade to Velocity System — $397
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/products/remote-training")}
            >
              Monthly Membership — $199/mo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!trial_active) return null;

  return (
    <div className={`${isUrgent ? "bg-amber-500/10 border-amber-500/20" : "bg-primary/10 border-primary/20"} border-b px-4 py-3`}>
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Zap className={`w-5 h-5 ${isUrgent ? "text-amber-500" : "text-primary"}`} />
          <span className="text-foreground">
            <span className="font-medium">{trialLabel}</span>
            <span className="text-muted-foreground ml-2">
              {isUrgent ? (
                <span className="text-destructive font-medium">
                  Only {days_remaining} day{days_remaining !== 1 ? "s" : ""} left!
                </span>
              ) : (
                <>Your trial ends in {days_remaining} day{days_remaining !== 1 ? "s" : ""}</>
              )}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={isUrgent ? "vault" : "outline"} 
            size="sm"
            onClick={() => navigate("/products/velocity-system")}
          >
            Upgrade Now
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setDismissed(true)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrialStatusBanner;
