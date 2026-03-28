import { motion } from "framer-motion";
import { Check, Link2, Settings, Shield, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEVICE_CONFIG, type DeviceType, type DeviceIntegration } from "@/types/deviceMetrics";

interface DeviceCardProps {
  deviceType: DeviceType;
  integration?: DeviceIntegration;
  onConnect: (deviceType: DeviceType) => void;
  onManage: (deviceType: DeviceType) => void;
}

function SyncStatusIndicator({ status }: { status: 'live' | 'activating' | 'pending' }) {
  const config = {
    live: {
      label: 'DIRECT SYNC: LIVE',
      className: 'bg-vault-longevity/10 text-longevity border-vault-longevity/30',
      pulse: true
    },
    activating: {
      label: 'DIRECT SYNC: ACTIVATING',
      className: 'bg-vault-utility/10 text-utility border-vault-utility/30',
      pulse: false
    },
    pending: {
      label: 'MANUAL IMPORT',
      className: 'bg-muted text-muted-foreground border-border',
      pulse: false
    }
  };
  
  const { label, className, pulse } = config[status];
  
  return (
    <Badge variant="outline" className={`text-[10px] ${className}`}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vault-longevity opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-vault-longevity" />
        </span>
      )}
      {label}
    </Badge>
  );
}

export function DeviceCard({ deviceType, integration, onConnect, onManage }: DeviceCardProps) {
  const config = DEVICE_CONFIG[deviceType];
  const isConnected = integration?.is_connected;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-card border border-border p-6 group hover:border-primary/50 transition-all"
    >
      {/* Status indicator */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
        {isConnected ? (
          <Badge variant="outline" className="bg-vault-longevity/10 text-longevity border-vault-longevity/30">
            <Check className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            Not Connected
          </Badge>
        )}
        <SyncStatusIndicator status={config.syncStatus} />
      </div>
      
      {/* Device info */}
      <div className="flex items-start gap-4 mb-4">
        <div 
          className="w-12 h-12 flex items-center justify-center text-2xl bg-secondary"
          style={{ borderLeft: `3px solid ${config.color}` }}
        >
          {config.logo}
        </div>
        <div className="flex-1 pr-20">
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-foreground">
            {config.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {config.description}
          </p>
        </div>
      </div>
      
      {/* API Method */}
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Radio className="w-3 h-3" />
        <span>{config.apiMethod}</span>
      </div>
      
      {/* Key Metrics */}
      <div className="flex flex-wrap gap-1 mb-3">
        {config.keyMetrics.map((metric) => (
          <Badge 
            key={metric} 
            variant="secondary" 
            className="text-[10px] uppercase tracking-wider"
          >
            {metric}
          </Badge>
        ))}
      </div>
      
      {/* Capabilities */}
      <div className="flex gap-2 mb-4">
        {config.capabilities.map((cap) => (
          <Badge 
            key={cap} 
            variant="outline" 
            className="text-xs uppercase tracking-wider"
            style={{ borderColor: config.color }}
          >
            {cap}
          </Badge>
        ))}
      </div>
      
      {/* Last sync */}
      {integration?.last_sync_at && (
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          {config.syncStatus === 'live' && <Shield className="w-3 h-3 text-velocity" />}
          Last synced: {new Date(integration.last_sync_at).toLocaleDateString()}
        </p>
      )}
      
      {/* Actions */}
      <div className="flex gap-2">
        {isConnected ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onManage(deviceType)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => onConnect(deviceType)}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Connect
          </Button>
        )}
      </div>
    </motion.div>
  );
}
