import { Award, Shield, ShieldCheck, Star, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { type BadgeLevel, BADGE_COLORS } from "@/hooks/useCoachBadge";

interface CertificationBadgeProps {
  badgeLevel: BadgeLevel | null;
  badgeName?: string | null;
  compact?: boolean;
  showLabel?: boolean;
  expiresAt?: string | null;
}

const BADGE_ICONS: Record<BadgeLevel, typeof Award> = {
  foundations: Shield,
  performance: Award,
  specialist: ShieldCheck,
  pro: Star,
  director: Crown,
};

const CertificationBadge = ({ badgeLevel, badgeName, compact = false, showLabel = true, expiresAt }: CertificationBadgeProps) => {
  if (!badgeLevel) return null;

  const config = BADGE_COLORS[badgeLevel];
  const Icon = BADGE_ICONS[badgeLevel];
  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={`gap-1.5 ${isExpired ? "bg-muted text-muted-foreground opacity-60" : config.bg + " " + config.text} ${compact ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"}`}
          >
            <Icon className={compact ? "w-3 h-3" : "w-4 h-4"} />
            {showLabel && (badgeName || config.label)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[280px] text-center">
          <p className="text-xs font-medium">{badgeName || config.label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isExpired ? "Expired — renewal required" : "Certified • Verified • Performance Validated"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CertificationBadge;
