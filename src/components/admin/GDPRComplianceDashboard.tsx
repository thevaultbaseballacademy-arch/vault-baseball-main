import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Shield, Users, Download, Trash2, Clock, 
  CheckCircle, AlertTriangle, Database, 
  RefreshCw, Loader2, Eye, FileText, Lock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";

interface ComplianceMetrics {
  // Deletion requests
  totalDeletionRequests: number;
  pendingDeletionRequests: number;
  approvedDeletionRequests: number;
  completedDeletionRequests: number;
  rejectedDeletionRequests: number;
  
  // Data retention
  totalSessions: number;
  expiredSessions: number;
  totalAuditLogs: number;
  anonymizedAuditLogs: number;
  logsWithIps: number;
  
  // Consent
  usersWithAnalyticsConsent: number;
  usersWithoutAnalyticsConsent: number;
  totalUsersWithPreferences: number;
  
  // User data
  totalProfiles: number;
  profilesWithEmail: number;
  
  // Timeframes
  deletionRequestsLast30Days: number;
  avgDeletionProcessingDays: number | null;
}

const GDPRComplianceDashboard = () => {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const SESSION_RETENTION_DAYS = 90;
  const AUDIT_IP_RETENTION_DAYS = 30;

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setRefreshing(true);
    try {
      const cutoff90Days = subDays(new Date(), SESSION_RETENTION_DAYS).toISOString();
      const cutoff30Days = subDays(new Date(), 30).toISOString();

      const [
        deletionRes,
        sessionsRes,
        expiredSessionsRes,
        auditRes,
        anonymizedAuditRes,
        auditWithIpsRes,
        consentRes,
        noConsentRes,
        totalPrefsRes,
        profilesRes,
        profilesWithEmailRes,
        recentDeletionsRes,
        completedDeletionsRes,
      ] = await Promise.all([
        // Deletion requests breakdown
        supabase.from('data_deletion_requests').select('status'),
        // Sessions
        supabase.from('user_sessions').select('id', { count: 'exact', head: true }),
        supabase.from('user_sessions').select('id', { count: 'exact', head: true })
          .lt('last_active_at', cutoff90Days),
        // Audit logs
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true })
          .eq('ip_address', 'anonymized'),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true })
          .not('ip_address', 'is', null)
          .neq('ip_address', 'anonymized'),
        // Consent
        supabase.from('notification_preferences').select('id', { count: 'exact', head: true })
          .eq('analytics_consent', true),
        supabase.from('notification_preferences').select('id', { count: 'exact', head: true })
          .eq('analytics_consent', false),
        supabase.from('notification_preferences').select('id', { count: 'exact', head: true }),
        // Profiles
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
          .not('email', 'is', null),
        // Recent deletions
        supabase.from('data_deletion_requests').select('id', { count: 'exact', head: true })
          .gte('requested_at', cutoff30Days),
        // Completed deletions with processing time
        supabase.from('data_deletion_requests')
          .select('requested_at, processed_at')
          .eq('status', 'completed')
          .not('processed_at', 'is', null),
      ]);

      // Calculate deletion status counts
      const deletionData = deletionRes.data || [];
      const statusCounts = deletionData.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate average processing time
      let avgProcessingDays: number | null = null;
      if (completedDeletionsRes.data && completedDeletionsRes.data.length > 0) {
        const processingTimes = completedDeletionsRes.data.map(d => {
          const requested = new Date(d.requested_at).getTime();
          const processed = new Date(d.processed_at!).getTime();
          return (processed - requested) / (1000 * 60 * 60 * 24);
        });
        avgProcessingDays = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
      }

      setMetrics({
        totalDeletionRequests: deletionData.length,
        pendingDeletionRequests: statusCounts['pending'] || 0,
        approvedDeletionRequests: statusCounts['approved'] || 0,
        completedDeletionRequests: statusCounts['completed'] || 0,
        rejectedDeletionRequests: statusCounts['rejected'] || 0,
        
        totalSessions: sessionsRes.count || 0,
        expiredSessions: expiredSessionsRes.count || 0,
        totalAuditLogs: auditRes.count || 0,
        anonymizedAuditLogs: anonymizedAuditRes.count || 0,
        logsWithIps: auditWithIpsRes.count || 0,
        
        usersWithAnalyticsConsent: consentRes.count || 0,
        usersWithoutAnalyticsConsent: noConsentRes.count || 0,
        totalUsersWithPreferences: totalPrefsRes.count || 0,
        
        totalProfiles: profilesRes.count || 0,
        profilesWithEmail: profilesWithEmailRes.count || 0,
        
        deletionRequestsLast30Days: recentDeletionsRes.count || 0,
        avgDeletionProcessingDays: avgProcessingDays,
      });
    } catch (error) {
      console.error('Error fetching GDPR metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch compliance metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getComplianceScore = () => {
    if (!metrics) return 0;
    
    let score = 100;
    
    // Deduct for pending deletion requests (urgent)
    if (metrics.pendingDeletionRequests > 0) {
      score -= Math.min(metrics.pendingDeletionRequests * 5, 20);
    }
    
    // Deduct for approved but not processed
    if (metrics.approvedDeletionRequests > 0) {
      score -= Math.min(metrics.approvedDeletionRequests * 3, 15);
    }
    
    // Deduct for expired sessions not cleaned
    if (metrics.expiredSessions > 0) {
      score -= Math.min(Math.ceil(metrics.expiredSessions / 10), 10);
    }
    
    // Deduct for non-anonymized IPs
    if (metrics.logsWithIps > 0 && metrics.totalAuditLogs > 0) {
      const ipRatio = metrics.logsWithIps / metrics.totalAuditLogs;
      if (ipRatio > 0.5) score -= 10;
    }
    
    // Bonus for high consent rate
    if (metrics.totalUsersWithPreferences > 0) {
      const consentRate = metrics.usersWithAnalyticsConsent / metrics.totalUsersWithPreferences;
      if (consentRate > 0.8) score = Math.min(score + 5, 100);
    }
    
    return Math.max(score, 0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', variant: 'default' as const, className: 'bg-green-500/10 text-green-600 border-green-500/30' };
    if (score >= 70) return { label: 'Good', variant: 'outline' as const, className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' };
    if (score >= 50) return { label: 'Needs Attention', variant: 'outline' as const, className: 'bg-orange-500/10 text-orange-600 border-orange-500/30' };
    return { label: 'Critical', variant: 'destructive' as const, className: 'bg-red-500/10 text-red-600 border-red-500/30' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const score = getComplianceScore();
  const scoreBadge = getScoreBadge(score);
  const consentRate = metrics?.totalUsersWithPreferences 
    ? Math.round((metrics.usersWithAnalyticsConsent / metrics.totalUsersWithPreferences) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            GDPR Compliance Dashboard
          </h2>
          <p className="text-muted-foreground text-sm">
            Overview of privacy compliance metrics and data protection status
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMetrics}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Compliance Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Compliance Score
              </CardTitle>
              <Badge className={scoreBadge.className}>{scoreBadge.label}</Badge>
            </div>
            <CardDescription>Overall GDPR compliance health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className={`text-5xl font-display ${getScoreColor(score)}`}>
                {score}%
              </div>
              <div className="flex-1">
                <Progress value={score} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  Based on deletion request handling, data retention, and consent management
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                <CardTitle className="text-sm font-medium">Deletion Requests</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display text-foreground">{metrics?.totalDeletionRequests || 0}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {metrics?.pendingDeletionRequests ? (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 text-xs">
                    {metrics.pendingDeletionRequests} pending
                  </Badge>
                ) : null}
                {metrics?.approvedDeletionRequests ? (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 text-xs">
                    {metrics.approvedDeletionRequests} approved
                  </Badge>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display text-foreground">
                {metrics?.avgDeletionProcessingDays !== null 
                  ? `${metrics.avgDeletionProcessingDays.toFixed(1)} days`
                  : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                GDPR requires 30-day max
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-500" />
                <CardTitle className="text-sm font-medium">Analytics Consent</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display text-foreground">{consentRate}%</p>
              <p className="text-xs text-muted-foreground mt-2">
                {metrics?.usersWithAnalyticsConsent || 0} of {metrics?.totalUsersWithPreferences || 0} users
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-medium">User Profiles</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display text-foreground">{metrics?.totalProfiles || 0}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {metrics?.profilesWithEmail || 0} with email stored
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deletion Requests Breakdown */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Right to Erasure Status
              </CardTitle>
              <CardDescription>Data deletion request breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">Pending Review</span>
                  </div>
                  <span className="font-medium">{metrics?.pendingDeletionRequests || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Approved (Awaiting Purge)</span>
                  </div>
                  <span className="font-medium">{metrics?.approvedDeletionRequests || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="font-medium">{metrics?.completedDeletionRequests || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">Rejected</span>
                  </div>
                  <span className="font-medium">{metrics?.rejectedDeletionRequests || 0}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{metrics?.deletionRequestsLast30Days || 0}</span> requests in the last 30 days
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Retention Status */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Retention Status
              </CardTitle>
              <CardDescription>Session and audit log management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Sessions</span>
                  <span className="font-medium">{metrics?.totalSessions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-amber-600">Expired Sessions ({SESSION_RETENTION_DAYS}+ days)</span>
                  <span className="font-medium text-amber-600">{metrics?.expiredSessions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Audit Logs</span>
                  <span className="font-medium">{metrics?.totalAuditLogs || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">Anonymized Logs</span>
                  <span className="font-medium text-green-600">{metrics?.anonymizedAuditLogs || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-amber-600">Logs with IP Addresses</span>
                  <span className="font-medium text-amber-600">{metrics?.logsWithIps || 0}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="flex items-start gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">
                    IPs anonymized after {AUDIT_IP_RETENTION_DAYS} days, sessions deleted after {SESSION_RETENTION_DAYS} days
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alerts Section */}
      {(metrics?.pendingDeletionRequests || 0) > 0 || (metrics?.expiredSessions || 0) > 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {(metrics?.pendingDeletionRequests || 0) > 0 && (
                  <li className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-amber-600" />
                    <span>
                      <span className="font-medium">{metrics?.pendingDeletionRequests}</span> deletion request(s) require review
                    </span>
                  </li>
                )}
                {(metrics?.approvedDeletionRequests || 0) > 0 && (
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>
                      <span className="font-medium">{metrics?.approvedDeletionRequests}</span> approved request(s) awaiting data purge
                    </span>
                  </li>
                )}
                {(metrics?.expiredSessions || 0) > 0 && (
                  <li className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-600" />
                    <span>
                      <span className="font-medium">{metrics?.expiredSessions}</span> expired session(s) should be cleaned up
                    </span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium text-green-600">All Clear</p>
                  <p className="text-sm text-muted-foreground">No immediate compliance actions required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* GDPR Rights Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            GDPR Rights Implementation
          </CardTitle>
          <CardDescription>Status of data subject rights features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-sm">Right to Access</p>
                <p className="text-xs text-muted-foreground">Data export available</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-sm">Right to Erasure</p>
                <p className="text-xs text-muted-foreground">Deletion requests active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-sm">Data Portability</p>
                <p className="text-xs text-muted-foreground">JSON export supported</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-sm">Consent Management</p>
                <p className="text-xs text-muted-foreground">Preferences configurable</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GDPRComplianceDashboard;
