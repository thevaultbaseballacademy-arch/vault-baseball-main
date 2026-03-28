import { Award, Shield, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

interface CoachBadgesProps {
  isCertified?: boolean;
  isBypassCertified?: boolean;
  isStaff?: boolean;
  compact?: boolean;
}

const BADGE_CONFIG = {
  staff: {
    label: "Vault Staff",
    description: "This coach is part of the internal Vault coaching team and works directly with the Vault development system.",
    className: "bg-foreground text-background gap-1",
    icon: Shield,
  },
  eddie: {
    label: "Certified by Eddie Mejia",
    description: "This coach has been personally certified in person by Eddie Mejia and is approved to coach within the Vault system.",
    className: "bg-purple-600 text-white gap-1",
    icon: ShieldCheck,
  },
  certified: {
    label: "Vault Certified",
    description: "This coach has completed the official Vault development certification and has been approved to train athletes using the Vault system.",
    className: "bg-accent text-accent-foreground gap-1",
    icon: Award,
  },
};

const CoachBadges = ({ isCertified, isBypassCertified, isStaff, compact = false }: CoachBadgesProps) => {
  const badgeKeys: (keyof typeof BADGE_CONFIG)[] = [];

  if (isStaff) badgeKeys.push("staff");
  if (isBypassCertified) badgeKeys.push("eddie");
  else if (isCertified) badgeKeys.push("certified");

  if (badgeKeys.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1.5">
        {badgeKeys.map((key) => {
          const config = BADGE_CONFIG[key];
          const Icon = config.icon;
          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <Badge className={config.className}>
                  <Icon className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                  {!compact && config.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[260px] text-center">
                <p className="text-xs">{config.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default CoachBadges;
