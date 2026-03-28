import { Shield, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface VerifiedBadgeProps {
  source: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function VerifiedBadge({ source, size = 'sm', showLabel = false }: VerifiedBadgeProps) {
  const isApiVerified = source === 'api';
  
  if (!isApiVerified) {
    return showLabel ? (
      <Badge variant="secondary" className="text-xs gap-1">
        {source}
      </Badge>
    ) : null;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`gap-1 bg-vault-velocity/10 text-velocity border-vault-velocity/30 ${
              size === 'sm' ? 'text-xs py-0' : 'text-sm py-0.5'
            }`}
          >
            <Shield className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
            {showLabel && 'VAULT™ Verified'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="bg-card border-border">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-velocity" />
            <div>
              <p className="font-display text-sm uppercase tracking-wider">VAULT™ Verified</p>
              <p className="text-xs text-muted-foreground">
                Data synced directly via official API
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
