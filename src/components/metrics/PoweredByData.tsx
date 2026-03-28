import { motion } from "framer-motion";
import { Zap, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DEVICE_CONFIG, type DeviceType, type SyncStatus } from "@/types/deviceMetrics";

function SyncStatusBadge({ status }: { status: SyncStatus }) {
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
    <Badge variant="outline" className={`text-xs ${className}`}>
      {pulse && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vault-longevity opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-vault-longevity" />
        </span>
      )}
      {label}
    </Badge>
  );
}

export function PoweredByData() {
  const devices = Object.entries(DEVICE_CONFIG) as [DeviceType, typeof DEVICE_CONFIG[DeviceType]][];
  
  return (
    <section className="py-12 border-t border-b border-border bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-velocity" />
            <h2 className="font-display text-2xl uppercase tracking-wider">
              Powered by Data
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            VAULT™ integrates directly with industry-leading performance tracking systems 
            for real-time, verified athlete metrics.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {devices.map(([deviceType, config], index) => (
            <motion.div
              key={deviceType}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border p-4 text-center group hover:border-primary/30 transition-colors"
            >
              <div 
                className="w-12 h-12 mx-auto mb-3 flex items-center justify-center text-2xl bg-secondary"
                style={{ borderLeft: `3px solid ${config.color}` }}
              >
                {config.logo}
              </div>
              <h3 className="font-display text-sm uppercase tracking-wider mb-2">
                {config.name}
              </h3>
              <SyncStatusBadge status={config.syncStatus} />
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <Radio className="w-4 h-4" />
          <span>All API-synced metrics receive the VAULT™ Verified badge</span>
        </motion.div>
      </div>
    </section>
  );
}
