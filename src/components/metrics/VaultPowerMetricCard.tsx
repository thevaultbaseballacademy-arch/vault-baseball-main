import { motion } from "framer-motion";
import { Zap, Target, Flame, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  type DeviceMetric, 
  calculateVaultPowerIndex, 
  calculateVaultArmStrength 
} from "@/types/deviceMetrics";

interface VaultPowerMetricCardProps {
  metrics: DeviceMetric[];
}

function MetricRing({ 
  value, 
  label, 
  icon: Icon, 
  color 
}: { 
  value: number; 
  label: string; 
  icon: typeof Zap;
  color: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-20 h-20 mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke={color}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(value / 100) * 226.2} 226.2`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-xl">{value}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon className="w-3 h-3" style={{ color }} />
              <span className="uppercase tracking-wider">{label}</span>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="bg-card border-border">
          <p className="font-display text-sm uppercase">{label} Score</p>
          <p className="text-xs text-muted-foreground">Normalized 0-100 scale</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function VaultPowerMetricCard({ metrics }: VaultPowerMetricCardProps) {
  const powerIndex = calculateVaultPowerIndex(metrics);
  const armStrength = calculateVaultArmStrength(metrics);
  
  // Calculate consistency score (inverse of variance)
  const velocities = metrics.filter(m => m.velocity_mph).map(m => m.velocity_mph!);
  const consistencyScore = velocities.length > 1 
    ? Math.max(0, 100 - (Math.sqrt(velocities.reduce((sum, v) => {
        const avg = velocities.reduce((a, b) => a + b, 0) / velocities.length;
        return sum + Math.pow(v - avg, 2);
      }, 0) / velocities.length) * 2))
    : 0;
  
  const overallScore = Math.round(
    (powerIndex * 0.35 + armStrength * 0.35 + consistencyScore * 0.3)
  );
  
  if (!metrics.length) return null;
  
  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="bg-gradient-accent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-foreground" />
            <h3 className="font-display text-lg uppercase tracking-wider text-primary-foreground">
              VAULT™ Power Metrics
            </h3>
          </div>
          <Badge className="bg-primary-foreground text-primary">
            Unified Score: {overallScore}
          </Badge>
        </div>
      </div>
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <MetricRing 
            value={powerIndex} 
            label="Power" 
            icon={Flame}
            color="hsl(var(--vault-velocity))"
          />
          <MetricRing 
            value={armStrength} 
            label="Arm" 
            icon={Target}
            color="hsl(var(--vault-athleticism))"
          />
          <MetricRing 
            value={Math.round(consistencyScore)} 
            label="Consistency" 
            icon={Activity}
            color="hsl(var(--vault-longevity))"
          />
        </div>
        
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground uppercase tracking-wider">Power Index</span>
            <span className="font-mono">Exit Velo + Bat Speed normalized</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground uppercase tracking-wider">Arm Strength</span>
            <span className="font-mono">Velocity + Spin Efficiency</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground uppercase tracking-wider">Consistency</span>
            <span className="font-mono">Session-to-session variance</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
