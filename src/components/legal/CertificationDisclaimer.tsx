import { AlertTriangle, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CertificationDisclaimerProps {
  variant?: "full" | "compact";
  className?: string;
}

/**
 * Legal disclaimer about VAULT™ certification requirements.
 * Displayed during onboarding and on dashboard for uncertified users.
 */
const CertificationDisclaimer = ({ variant = "full", className = "" }: CertificationDisclaimerProps) => {
  if (variant === "compact") {
    return (
      <div className={`border border-destructive/30 bg-destructive/5 rounded p-3 text-xs text-muted-foreground ${className}`}>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-3.5 h-3.5 text-destructive" />
          <span className="font-semibold text-foreground text-xs uppercase tracking-wide">
            Certification Required
          </span>
        </div>
        <p>
          Using VAULT™ courses without certification may reduce athlete development outcomes.
          Unauthorized distribution of content may result in legal action.
        </p>
      </div>
    );
  }

  return (
    <Alert variant="destructive" className={`border-destructive/40 bg-destructive/5 ${className}`}>
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-sm font-bold uppercase tracking-wide">
        VAULT™ Certification & Content Protection Notice
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">
        <p>
          Using VAULT™ courses without proper certification may result in:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Reduced athlete development outcomes</li>
          <li>Improper system execution</li>
          <li>Increased injury risk</li>
        </ul>
        <p>
          Certified coaches are trained to develop athletes to elite levels using VAULT™ systems.
        </p>
        <p className="font-semibold text-destructive">
          Unauthorized distribution, resale, or sharing of VAULT™ content without consent
          may result in legal action.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default CertificationDisclaimer;
