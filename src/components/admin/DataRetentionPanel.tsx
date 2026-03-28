import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Database, Clock, Trash2, Shield, RefreshCw, 
  Loader2, Play, AlertTriangle, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

interface RetentionStats {
  totalSessions: number;
  oldSessions: number;
  totalAuditLogs: number;
  logsWithIps: number;
  oldLogsWithIps: number;
}

interface CleanupHistory {
  id: string;
  timestamp: string;
  sessionsDeleted: number;
  ipsAnonymized: number;
  status: 'success' | 'error';
}

const DataRetentionPanel = () => {
  const [stats, setStats] = useState<RetentionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<CleanupHistory | null>(null);
  const { toast } = useToast();

  const SESSION_RETENTION_DAYS = 90;
  const AUDIT_IP_RETENTION_DAYS = 30;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const cutoffDate90 = new Date();
      cutoffDate90.setDate(cutoffDate90.getDate() - SESSION_RETENTION_DAYS);
      
      const cutoffDate30 = new Date();
      cutoffDate30.setDate(cutoffDate30.getDate() - AUDIT_IP_RETENTION_DAYS);

      const [sessionsRes, oldSessionsRes, auditRes, auditWithIpsRes, oldAuditWithIpsRes] = await Promise.all([
        supabase.from('user_sessions').select('id', { count: 'exact', head: true }),
        supabase.from('user_sessions').select('id', { count: 'exact', head: true })
          .lt('last_active_at', cutoffDate90.toISOString()),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true })
          .not('ip_address', 'is', null)
          .neq('ip_address', 'anonymized'),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true })
          .not('ip_address', 'is', null)
          .neq('ip_address', 'anonymized')
          .lt('changed_at', cutoffDate30.toISOString()),
      ]);

      setStats({
        totalSessions: sessionsRes.count || 0,
        oldSessions: oldSessionsRes.count || 0,
        totalAuditLogs: auditRes.count || 0,
        logsWithIps: auditWithIpsRes.count || 0,
        oldLogsWithIps: oldAuditWithIpsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching retention stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch retention statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runCleanupNow = async () => {
    setRunning(true);
    try {
      const response = await supabase.functions.invoke('data-retention-cleanup');
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      setLastRun({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        sessionsDeleted: result.sessions_deleted || 0,
        ipsAnonymized: result.ips_anonymized || 0,
        status: 'success',
      });

      toast({
        title: "Cleanup completed",
        description: `Deleted ${result.sessions_deleted} sessions, anonymized ${result.ips_anonymized} IPs`,
      });

      // Refresh stats after cleanup
      await fetchStats();
    } catch (error: any) {
      console.error('Error running cleanup:', error);
      
      setLastRun({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        sessionsDeleted: 0,
        ipsAnonymized: 0,
        status: 'error',
      });

      toast({
        title: "Cleanup failed",
        description: error.message || "Failed to run data retention cleanup",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display text-foreground">Data Retention</h2>
          <p className="text-muted-foreground text-sm">
            Manage session data and audit log retention for compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="vault"
            size="sm"
            onClick={runCleanupNow}
            disabled={running}
          >
            {running ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Run Cleanup Now
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display text-foreground">{stats?.totalSessions || 0}</p>
              <p className="text-xs text-muted-foreground">Active session records</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={stats?.oldSessions ? "border-amber-500/30" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <CardTitle className="text-sm font-medium">Old Sessions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display text-foreground">{stats?.oldSessions || 0}</p>
              <p className="text-xs text-muted-foreground">Older than {SESSION_RETENTION_DAYS} days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display text-foreground">{stats?.totalAuditLogs || 0}</p>
              <p className="text-xs text-muted-foreground">{stats?.logsWithIps || 0} with IP addresses</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={stats?.oldLogsWithIps ? "border-amber-500/30" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                <CardTitle className="text-sm font-medium">IPs to Anonymize</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display text-foreground">{stats?.oldLogsWithIps || 0}</p>
              <p className="text-xs text-muted-foreground">Older than {AUDIT_IP_RETENTION_DAYS} days</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Retention Policy Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Retention Policies</CardTitle>
          <CardDescription>Automated data cleanup runs daily at 3:00 AM UTC</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
              <Database className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">User Sessions</p>
                <p className="text-sm text-muted-foreground">
                  Sessions inactive for more than <span className="font-semibold">{SESSION_RETENTION_DAYS} days</span> are automatically deleted.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Audit Log IPs</p>
                <p className="text-sm text-muted-foreground">
                  IP addresses in audit logs older than <span className="font-semibold">{AUDIT_IP_RETENTION_DAYS} days</span> are anonymized.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Run Status */}
      {lastRun && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={lastRun.status === 'success' ? 'border-green-500/30' : 'border-red-500/30'}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {lastRun.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
                <CardTitle className="text-sm font-medium">
                  Last Manual Cleanup - {lastRun.status === 'success' ? 'Success' : 'Failed'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(lastRun.timestamp), { addSuffix: true })}
                </span>
                {lastRun.status === 'success' && (
                  <>
                    <span>
                      <span className="font-medium text-foreground">{lastRun.sessionsDeleted}</span>{' '}
                      <span className="text-muted-foreground">sessions deleted</span>
                    </span>
                    <span>
                      <span className="font-medium text-foreground">{lastRun.ipsAnonymized}</span>{' '}
                      <span className="text-muted-foreground">IPs anonymized</span>
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Compliance Note */}
      <div className="bg-secondary/30 rounded-xl p-4 text-sm text-muted-foreground border border-border">
        <p className="font-medium text-foreground mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Data Retention Compliance
        </p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Session data is retained for {SESSION_RETENTION_DAYS} days for security monitoring</li>
          <li>IP addresses are anonymized after {AUDIT_IP_RETENTION_DAYS} days per GDPR requirements</li>
          <li>Audit logs are preserved indefinitely for compliance (with anonymized IPs)</li>
          <li>Users can request data deletion via their account settings</li>
        </ul>
      </div>
    </div>
  );
};

export default DataRetentionPanel;
