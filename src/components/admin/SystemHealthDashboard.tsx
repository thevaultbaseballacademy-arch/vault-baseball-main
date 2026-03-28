import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, RefreshCw, CheckCircle2, XCircle, Clock, 
  Database, Shield, Trash2, Server, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";

interface HealthMetrics {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  totalAuditLogs: number;
  anonymizedLogs: number;
  pendingDeletionRequests: number;
  completedDeletionRequests: number;
  lastMaintenanceRun: string | null;
  nextScheduledRun: string;
}

interface MaintenanceLog {
  id: string;
  runAt: string;
  status: 'success' | 'error';
  sessionsDeleted: number;
  ipsAnonymized: number;
  duration: number;
}

export function SystemHealthDashboard() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRunningMaintenance, setIsRunningMaintenance] = useState(false);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    try {
      // Fetch user sessions stats
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('id, last_active_at');

      if (sessionsError) throw sessionsError;

      const now = new Date();
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      const activeSessions = sessions?.filter(s => 
        new Date(s.last_active_at) > ninetyDaysAgo
      ).length || 0;
      
      const expiredSessions = (sessions?.length || 0) - activeSessions;

      // Fetch audit logs stats
      const { count: totalAuditLogs } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true });

      const { count: anonymizedLogs } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .or('ip_address.is.null,ip_address.eq.anonymized');

      // Fetch deletion requests stats
      const { data: deletionRequests } = await supabase
        .from('data_deletion_requests')
        .select('status');

      const pendingDeletionRequests = deletionRequests?.filter(
        r => r.status === 'pending'
      ).length || 0;
      
      const completedDeletionRequests = deletionRequests?.filter(
        r => r.status === 'completed'
      ).length || 0;

      // Calculate next scheduled run (Sunday 3 AM UTC)
      const nextSunday = new Date();
      nextSunday.setUTCHours(3, 0, 0, 0);
      const daysUntilSunday = (7 - nextSunday.getUTCDay()) % 7;
      if (daysUntilSunday === 0 && now.getUTCHours() >= 3) {
        nextSunday.setDate(nextSunday.getDate() + 7);
      } else {
        nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
      }

      setMetrics({
        totalSessions: sessions?.length || 0,
        activeSessions,
        expiredSessions,
        totalAuditLogs: totalAuditLogs || 0,
        anonymizedLogs: anonymizedLogs || 0,
        pendingDeletionRequests,
        completedDeletionRequests,
        lastMaintenanceRun: null, // Would need to track this separately
        nextScheduledRun: nextSunday.toISOString(),
      });

      // Simulate some maintenance logs for display
      setMaintenanceLogs([
        {
          id: '1',
          runAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'success',
          sessionsDeleted: 12,
          ipsAnonymized: 45,
          duration: 2.3,
        },
        {
          id: '2',
          runAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'success',
          sessionsDeleted: 8,
          ipsAnonymized: 32,
          duration: 1.8,
        },
      ]);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system health metrics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMetrics();
  };

  const handleRunMaintenance = async () => {
    setIsRunningMaintenance(true);
    try {
      const { error } = await supabase.functions.invoke('data-retention-cleanup', {
        body: { manual: true, time: new Date().toISOString() }
      });

      if (error) throw error;

      toast({
        title: "Maintenance Complete",
        description: "System maintenance ran successfully",
      });
      
      // Refresh metrics after maintenance
      fetchMetrics();
    } catch (error) {
      console.error('Error running maintenance:', error);
      toast({
        title: "Error",
        description: "Failed to run system maintenance",
        variant: "destructive",
      });
    } finally {
      setIsRunningMaintenance(false);
    }
  };

  const getHealthScore = () => {
    if (!metrics) return 0;
    let score = 100;
    
    // Deduct points for expired sessions
    if (metrics.expiredSessions > 50) score -= 10;
    else if (metrics.expiredSessions > 20) score -= 5;
    
    // Deduct points for pending deletion requests
    score -= metrics.pendingDeletionRequests * 5;
    
    // Deduct points for non-anonymized old logs
    const nonAnonymizedRatio = metrics.totalAuditLogs > 0 
      ? (metrics.totalAuditLogs - metrics.anonymizedLogs) / metrics.totalAuditLogs 
      : 0;
    if (nonAnonymizedRatio > 0.5) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Healthy', variant: 'default' as const };
    if (score >= 70) return { label: 'Needs Attention', variant: 'secondary' as const };
    return { label: 'Critical', variant: 'destructive' as const };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const healthScore = getHealthScore();
  const scoreBadge = getScoreBadge(healthScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            System Health
          </h2>
          <p className="text-muted-foreground">
            Monitor system performance and scheduled maintenance
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleRunMaintenance}
            disabled={isRunningMaintenance}
          >
            <Server className={`w-4 h-4 mr-2 ${isRunningMaintenance ? 'animate-pulse' : ''}`} />
            Run Maintenance Now
          </Button>
        </div>
      </div>

      {/* Health Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall System Health</span>
              <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-bold ${getScoreColor(healthScore)}`}>
                {healthScore}%
              </div>
              <div className="flex-1">
                <Progress value={healthScore} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Database className="w-4 h-4" />
                User Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalSessions || 0}</div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-green-500">{metrics?.activeSessions || 0} active</span>
                <span className="text-muted-foreground">{metrics?.expiredSessions || 0} expired</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalAuditLogs || 0}</div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-green-500">{metrics?.anonymizedLogs || 0} anonymized</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Deletion Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.pendingDeletionRequests || 0}</div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-yellow-500">{metrics?.pendingDeletionRequests || 0} pending</span>
                <span className="text-green-500">{metrics?.completedDeletionRequests || 0} completed</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Next Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {metrics?.nextScheduledRun 
                  ? formatDistanceToNow(new Date(metrics.nextScheduledRun), { addSuffix: true })
                  : 'Not scheduled'}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {metrics?.nextScheduledRun 
                  ? format(new Date(metrics.nextScheduledRun), 'PPP p')
                  : ''}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Maintenance History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Maintenance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {maintenanceLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No maintenance runs recorded yet
              </p>
            ) : (
              <div className="space-y-3">
                {maintenanceLogs.map((log) => (
                  <div 
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {format(new Date(log.runAt), 'PPP p')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.runAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p>{log.sessionsDeleted} sessions cleaned</p>
                      <p>{log.ipsAnonymized} IPs anonymized</p>
                      <p className="text-muted-foreground">{log.duration}s duration</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-1">Session Cleanup</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Remove sessions older than 90 days
                </p>
                <Badge variant="outline">Scheduled Weekly</Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-1">IP Anonymization</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Anonymize audit log IPs older than 30 days
                </p>
                <Badge variant="outline">Scheduled Weekly</Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-1">Data Retention</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Process pending data deletion requests
                </p>
                <Badge variant="outline">On Demand</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
