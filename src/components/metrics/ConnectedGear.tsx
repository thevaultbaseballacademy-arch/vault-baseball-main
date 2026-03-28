import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Settings, Plus, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeviceIntegrations, useAddDeviceIntegration } from "@/hooks/useDeviceMetrics";
import { DEVICE_CONFIG, type DeviceType } from "@/types/deviceMetrics";
import { toast } from "sonner";

interface ConnectedGearProps {
  userId: string;
  compact?: boolean;
}

export function ConnectedGear({ userId, compact = false }: ConnectedGearProps) {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);
  
  const { data: integrations = [], isLoading } = useDeviceIntegrations(userId);
  const addIntegration = useAddDeviceIntegration();
  
  const connectedDevices = integrations.filter(i => i.is_connected);
  const availableDevices = (Object.keys(DEVICE_CONFIG) as DeviceType[])
    .filter(d => !integrations.find(i => i.device_type === d));
  
  const handleConnect = async (deviceType: DeviceType) => {
    try {
      await addIntegration.mutateAsync({ userId, deviceType });
      setSelectedDevice(null);
      setConnectDialogOpen(false);
      toast.success(`${DEVICE_CONFIG[deviceType].name} connected!`);
    } catch (error) {
      toast.error("Failed to connect device");
    }
  };
  
  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-sm uppercase tracking-wider flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Connected Gear
          </h4>
          <Badge variant="secondary">{connectedDevices.length} devices</Badge>
        </div>
        
        {connectedDevices.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {connectedDevices.map((integration) => {
              const config = DEVICE_CONFIG[integration.device_type];
              return (
                <Badge 
                  key={integration.id}
                  variant="outline"
                  className="gap-1"
                  style={{ borderColor: config.color }}
                >
                  <span>{config.logo}</span>
                  {config.name}
                  {config.syncStatus === 'live' && (
                    <Shield className="w-3 h-3 text-velocity ml-1" />
                  )}
                </Badge>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No devices connected yet</p>
        )}
      </div>
    );
  }
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-lg uppercase tracking-wider flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Connected Gear
        </CardTitle>
        <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display uppercase tracking-wider">
                Connect a Device
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 mt-4">
              {availableDevices.map((deviceType) => {
                const config = DEVICE_CONFIG[deviceType];
                return (
                  <button
                    key={deviceType}
                    onClick={() => handleConnect(deviceType)}
                    className="flex items-center gap-4 p-4 bg-secondary hover:bg-secondary/80 border border-border transition-colors text-left"
                    style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
                  >
                    <span className="text-2xl">{config.logo}</span>
                    <div className="flex-1">
                      <h4 className="font-display uppercase tracking-wider">{config.name}</h4>
                      <p className="text-xs text-muted-foreground">{config.apiMethod}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        config.syncStatus === 'live' 
                          ? 'bg-vault-longevity/10 text-longevity border-vault-longevity/30'
                          : config.syncStatus === 'activating'
                          ? 'bg-vault-utility/10 text-utility border-vault-utility/30'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {config.syncStatus === 'live' ? 'LIVE' : config.syncStatus === 'activating' ? 'SOON' : 'CSV'}
                    </Badge>
                  </button>
                );
              })}
              {availableDevices.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  All devices connected!
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : connectedDevices.length > 0 ? (
          <div className="space-y-3">
            {connectedDevices.map((integration) => {
              const config = DEVICE_CONFIG[integration.device_type];
              return (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-3 bg-secondary/50 border border-border"
                  style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
                >
                  <span className="text-xl">{config.logo}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-sm uppercase tracking-wider">
                        {config.name}
                      </h4>
                      {config.syncStatus === 'live' && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-vault-velocity/10 text-velocity border-vault-velocity/30"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {integration.last_sync_at 
                        ? `Last sync: ${new Date(integration.last_sync_at).toLocaleDateString()}`
                        : 'Not synced yet'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {config.capabilities.map(cap => (
                        <Badge key={cap} variant="secondary" className="text-xs uppercase">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Connect your performance tracking devices to unlock verified metrics
            </p>
            <Button onClick={() => setConnectDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Connect Your First Device
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
