import { useState } from "react";
import { 
  Award, Calendar, Clock, AlertTriangle, Send, 
  Loader2, Mail, RefreshCw, CheckCircle, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays, addDays } from "date-fns";

interface ExpiringCertification {
  id: string;
  user_id: string;
  certification_type: string;
  expires_at: string;
  certificate_number: string | null;
  expiration_reminder_sent: boolean;
  expiration_reminder_sent_at: string | null;
  final_warning_sent: boolean;
  final_warning_sent_at: string | null;
  score: number;
  profile?: {
    display_name: string | null;
    email: string | null;
  };
}

const certificationNames: Record<string, string> = {
  foundations: "Foundations",
  performance: "Performance",
  catcher_specialist: "Catcher Specialist",
  infield_specialist: "Infield Specialist",
  outfield_specialist: "Outfield Specialist",
};

const CertificationExpirationManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  // Fetch certifications expiring in the next 60 days
  const { data: expiringCerts, isLoading, refetch } = useQuery({
    queryKey: ['expiring-certifications'],
    queryFn: async () => {
      const sixtyDaysFromNow = addDays(new Date(), 60);
      
      const { data, error } = await supabase
        .from('user_certifications')
        .select(`
          id,
          user_id,
          certification_type,
          expires_at,
          certificate_number,
          expiration_reminder_sent,
          expiration_reminder_sent_at,
          final_warning_sent,
          final_warning_sent_at,
          score
        `)
        .eq('status', 'active')
        .lte('expires_at', sixtyDaysFromNow.toISOString())
        .order('expires_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles for each certification
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return data.map(cert => ({
        ...cert,
        profile: profileMap.get(cert.user_id)
      })) as ExpiringCertification[];
    }
  });

  const sendManualReminder = useMutation({
    mutationFn: async ({ certId, userId, daysUntilExpiry }: { certId: string; userId: string; daysUntilExpiry: number }) => {
      setSendingReminder(certId);
      
      const { data, error } = await supabase.functions.invoke('send-manual-reminder', {
        body: { certificationId: certId, userId, daysUntilExpiry }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Reminder sent",
        description: "The reminder email has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['expiring-certifications'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send reminder",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setSendingReminder(null);
    }
  });

  const getDaysUntilExpiry = (expiresAt: string) => {
    return differenceInDays(new Date(expiresAt), new Date());
  };

  const getUrgencyBadge = (daysLeft: number) => {
    if (daysLeft <= 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysLeft <= 7) {
      return <Badge variant="destructive">Expires in {daysLeft} days</Badge>;
    } else if (daysLeft <= 14) {
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30">Expires in {daysLeft} days</Badge>;
    } else if (daysLeft <= 30) {
      return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Expires in {daysLeft} days</Badge>;
    } else {
      return <Badge variant="secondary">Expires in {daysLeft} days</Badge>;
    }
  };

  const getReminderStatus = (cert: ExpiringCertification) => {
    const statuses = [];
    
    if (cert.expiration_reminder_sent) {
      statuses.push({
        label: "30-day reminder sent",
        date: cert.expiration_reminder_sent_at,
        color: "text-green-600"
      });
    }
    
    if (cert.final_warning_sent) {
      statuses.push({
        label: "7-day warning sent",
        date: cert.final_warning_sent_at,
        color: "text-orange-600"
      });
    }
    
    return statuses;
  };

  // Group certifications by urgency
  const groupedCerts = {
    critical: expiringCerts?.filter(c => getDaysUntilExpiry(c.expires_at) <= 7) || [],
    warning: expiringCerts?.filter(c => {
      const days = getDaysUntilExpiry(c.expires_at);
      return days > 7 && days <= 30;
    }) || [],
    upcoming: expiringCerts?.filter(c => getDaysUntilExpiry(c.expires_at) > 30) || [],
  };

  const stats = {
    total: expiringCerts?.length || 0,
    critical: groupedCerts.critical.length,
    warning: groupedCerts.warning.length,
    remindersSent: expiringCerts?.filter(c => c.expiration_reminder_sent || c.final_warning_sent).length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Expiring (60 days)</span>
            </div>
            <p className="text-2xl font-display text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Critical (≤7 days)</span>
            </div>
            <p className="text-2xl font-display text-destructive">{stats.critical}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-muted-foreground">Warning (≤30 days)</span>
            </div>
            <p className="text-2xl font-display text-yellow-600">{stats.warning}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Reminders Sent</span>
            </div>
            <p className="text-2xl font-display text-green-600">{stats.remindersSent}</p>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Critical Expirations */}
      {groupedCerts.critical.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader className="bg-destructive/5">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Critical — Expires Within 7 Days ({groupedCerts.critical.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {groupedCerts.critical.map(cert => (
                <CertificationRow 
                  key={cert.id} 
                  cert={cert} 
                  onSendReminder={(daysUntilExpiry) => sendManualReminder.mutate({ 
                    certId: cert.id, 
                    userId: cert.user_id,
                    daysUntilExpiry 
                  })}
                  isSending={sendingReminder === cert.id}
                  getDaysUntilExpiry={getDaysUntilExpiry}
                  getUrgencyBadge={getUrgencyBadge}
                  getReminderStatus={getReminderStatus}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Expirations */}
      {groupedCerts.warning.length > 0 && (
        <Card className="border-yellow-500/30">
          <CardHeader className="bg-yellow-500/5">
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Clock className="w-5 h-5" />
              Warning — Expires Within 30 Days ({groupedCerts.warning.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {groupedCerts.warning.map(cert => (
                <CertificationRow 
                  key={cert.id} 
                  cert={cert} 
                  onSendReminder={(daysUntilExpiry) => sendManualReminder.mutate({ 
                    certId: cert.id, 
                    userId: cert.user_id,
                    daysUntilExpiry 
                  })}
                  isSending={sendingReminder === cert.id}
                  getDaysUntilExpiry={getDaysUntilExpiry}
                  getUrgencyBadge={getUrgencyBadge}
                  getReminderStatus={getReminderStatus}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Expirations */}
      {groupedCerts.upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              Upcoming — Expires Within 60 Days ({groupedCerts.upcoming.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {groupedCerts.upcoming.map(cert => (
                <CertificationRow 
                  key={cert.id} 
                  cert={cert} 
                  onSendReminder={(daysUntilExpiry) => sendManualReminder.mutate({ 
                    certId: cert.id, 
                    userId: cert.user_id,
                    daysUntilExpiry 
                  })}
                  isSending={sendingReminder === cert.id}
                  getDaysUntilExpiry={getDaysUntilExpiry}
                  getUrgencyBadge={getUrgencyBadge}
                  getReminderStatus={getReminderStatus}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {stats.total === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-display text-foreground mb-2">All Clear!</h3>
            <p className="text-muted-foreground">
              No certifications expiring in the next 60 days.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface CertificationRowProps {
  cert: ExpiringCertification;
  onSendReminder: (daysUntilExpiry: number) => void;
  isSending: boolean;
  getDaysUntilExpiry: (expiresAt: string) => number;
  getUrgencyBadge: (daysLeft: number) => JSX.Element;
  getReminderStatus: (cert: ExpiringCertification) => { label: string; date: string | null; color: string }[];
}

const CertificationRow = ({ 
  cert, 
  onSendReminder, 
  isSending, 
  getDaysUntilExpiry, 
  getUrgencyBadge,
  getReminderStatus
}: CertificationRowProps) => {
  const daysLeft = getDaysUntilExpiry(cert.expires_at);
  const reminderStatuses = getReminderStatus(cert);

  return (
    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-foreground truncate">
              {cert.profile?.display_name || 'Unknown User'}
            </p>
            {getUrgencyBadge(daysLeft)}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {cert.profile?.email}
          </p>
          <div className="flex items-center gap-4 mt-1 text-sm">
            <span className="flex items-center gap-1 text-accent">
              <Award className="w-3 h-3" />
              {certificationNames[cert.certification_type] || cert.certification_type}
            </span>
            <span className="text-muted-foreground">
              Score: {cert.score}%
            </span>
            {cert.certificate_number && (
              <span className="text-muted-foreground">
                #{cert.certificate_number}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Expires: {format(new Date(cert.expires_at), 'PPP')}
          </p>
          
          {/* Reminder Status */}
          {reminderStatuses.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {reminderStatuses.map((status, idx) => (
                <span key={idx} className={`text-xs flex items-center gap-1 ${status.color}`}>
                  <CheckCircle className="w-3 h-3" />
                  {status.label}
                  {status.date && (
                    <span className="text-muted-foreground">
                      ({format(new Date(status.date), 'MMM d')})
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSendReminder(daysLeft)}
        disabled={isSending}
        className="gap-2 flex-shrink-0"
      >
        {isSending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        Send Reminder
      </Button>
    </div>
  );
};

export default CertificationExpirationManager;
