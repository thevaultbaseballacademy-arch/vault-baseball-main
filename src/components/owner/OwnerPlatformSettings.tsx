import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Globe, Bell, Shield, Database, Save, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const OwnerPlatformSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data retention config
  const { data: retentionConfig } = useQuery({
    queryKey: ["owner-retention-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_retention_config")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Team whitelist stats
  const { data: teamStats } = useQuery({
    queryKey: ["owner-team-stats"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("team_whitelist")
        .select("*", { count: "exact" });
      if (error) throw error;
      
      const admins = data?.filter((t) => t.admin_access).length || 0;
      const fullAccess = data?.filter((t) => t.full_access).length || 0;
      
      return { total: count || 0, admins, fullAccess };
    },
  });

  // Storage buckets info
  const { data: storageInfo } = useQuery({
    queryKey: ["owner-storage-info"],
    queryFn: async () => {
      // Just return static bucket info since we can't query bucket sizes easily
      return {
        buckets: [
          { name: "profile-images", isPublic: true },
          { name: "highlight-videos", isPublic: false },
          { name: "community-media", isPublic: false },
          { name: "analysis-videos", isPublic: false },
          { name: "coach-applications", isPublic: false },
        ],
      };
    },
  });

  const getConfigValue = (key: string) => {
    const config = retentionConfig?.find((c) => c.config_key === key);
    return config?.config_value as any;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display text-foreground mb-1">PLATFORM SETTINGS</h1>
        <p className="text-sm text-muted-foreground">Configure platform-wide settings and policies</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Retention */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-foreground">Data Retention</h3>
              <p className="text-xs text-muted-foreground">Automatic data cleanup policies</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm text-foreground">Audit Log Retention</span>
              <span className="text-sm font-medium text-primary">
                {getConfigValue("audit_logs")?.retention_days || 90} days
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm text-foreground">IP Anonymization</span>
              <span className="text-sm font-medium text-primary">
                {getConfigValue("ip_anonymization")?.anonymize_after_days || 30} days
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm text-foreground">Session Cleanup</span>
              <span className="text-sm font-medium text-primary">30 days</span>
            </div>
          </div>
        </div>

        {/* Team Access */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-foreground">Team Access</h3>
              <p className="text-xs text-muted-foreground">Whitelisted team members</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm text-foreground">Total Whitelisted</span>
              <span className="text-sm font-medium text-foreground">{teamStats?.total || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm text-foreground">Admin Access</span>
              <span className="text-sm font-medium text-destructive">{teamStats?.admins || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm text-foreground">Full Platform Access</span>
              <span className="text-sm font-medium text-green-500">{teamStats?.fullAccess || 0}</span>
            </div>
          </div>
        </div>

        {/* Storage Buckets */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-display text-foreground">Storage Buckets</h3>
              <p className="text-xs text-muted-foreground">File storage configuration</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {storageInfo?.buckets.map((bucket) => (
              <div key={bucket.name} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-sm text-foreground">{bucket.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  bucket.isPublic 
                    ? "bg-green-500/10 text-green-500" 
                    : "bg-yellow-500/10 text-yellow-500"
                }`}>
                  {bucket.isPublic ? "Public" : "Private"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-display text-foreground">Security Features</h3>
              <p className="text-xs text-muted-foreground">Active security measures</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {[
              { name: "Row Level Security (RLS)", status: true },
              { name: "MFA Support", status: true },
              { name: "Session Management", status: true },
              { name: "Audit Logging", status: true },
              { name: "IP Rate Limiting", status: true },
              { name: "Credential Encryption", status: true },
            ].map((feature) => (
              <div key={feature.name} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-sm text-foreground">{feature.name}</span>
                <Check className={`w-4 h-4 ${feature.status ? "text-green-500" : "text-muted-foreground"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-foreground mb-4">QUICK ACTIONS</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" size="sm" className="justify-start" onClick={() => window.open("/admin/certification-analytics", "_blank")}>
            View Cert Analytics
          </Button>
          <Button variant="outline" size="sm" className="justify-start" onClick={() => window.open("/admin/payouts", "_blank")}>
            Manage Payouts
          </Button>
          <Button variant="outline" size="sm" className="justify-start" onClick={() => window.open("/admin/coaches", "_blank")}>
            Coach Directory
          </Button>
          <Button variant="outline" size="sm" className="justify-start" onClick={() => window.open("/admin/exams", "_blank")}>
            Exam Management
          </Button>
        </div>
      </div>
    </div>
  );
};
