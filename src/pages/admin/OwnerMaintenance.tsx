import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, Play, Clock, CheckCircle2, XCircle, Loader2, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const OwnerMaintenance = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["maintenance-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(52);
      if (error) throw error;
      return data || [];
    },
  });

  const triggerJob = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("weekly-maintenance");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-reports"] });
      toast({ title: "Maintenance job triggered", description: `Completed in ${Math.round(data.duration_seconds)}s — ${data.successful}/${data.total_steps} steps passed.` });
    },
    onError: (e: any) => toast({ title: "Job failed", description: e.message, variant: "destructive" }),
  });

  const lastRun = reports[0];
  const nextRunning = reports.find((r: any) => r.status === "running");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "completed_with_errors": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "running": return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case "failed": return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const selectedReportData = reports.find((r: any) => r.id === selectedReport);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground">MAINTENANCE</h1>
          <p className="text-sm text-muted-foreground">Automated weekly system maintenance and health checks</p>
        </div>
        <Button
          onClick={() => triggerJob.mutate()}
          disabled={triggerJob.isPending || !!nextRunning}
          className="gap-2"
        >
          {triggerJob.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run Now
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Last Run</p>
          <p className="text-sm font-medium text-foreground">
            {lastRun ? format(new Date(lastRun.run_started_at), "MMM d, yyyy h:mm a") : "Never"}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Last Status</p>
          <div className="flex items-center gap-2">
            {lastRun && getStatusIcon(lastRun.status)}
            <p className="text-sm font-medium text-foreground capitalize">
              {lastRun?.status?.replace(/_/g, " ") || "—"}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Next Scheduled</p>
          <p className="text-sm font-medium text-foreground">Saturday 11:00 PM</p>
        </div>
      </div>

      {/* Report Detail */}
      {selectedReportData && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-foreground">
              Report — {format(new Date(selectedReportData.run_started_at), "MMM d, yyyy h:mm a")}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>Close</Button>
          </div>

          {selectedReportData.report_data && (
            <div className="space-y-3">
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="text-foreground">{Math.round(selectedReportData.duration_seconds || 0)}s</span>
              </div>

              {((selectedReportData.report_data as any)?.steps || []).map((step: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                  {step.status === "success"
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    : <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{step.step.replace(/_/g, " ")}</p>
                    {step.error && <p className="text-xs text-destructive mt-0.5">{step.error}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {Object.entries(step.details || {}).filter(([k]) => k !== "broken_url_list").map(([k, v]) => `${k}: ${v}`).join(" · ")}
                    </p>
                  </div>
                </div>
              ))}

              {(selectedReportData.errors as any[])?.length > 0 && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm font-medium text-destructive mb-1">Errors</p>
                  {(selectedReportData.errors as any[]).map((err, i) => (
                    <p key={i} className="text-xs text-destructive/80">{err}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reports History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-display text-foreground uppercase">Report History (Last 52 Weeks)</h2>
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No maintenance reports yet</div>
        ) : (
          <div className="divide-y divide-border">
            {reports.map((report: any) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id === selectedReport ? null : report.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(report.status)}
                  <div>
                    <p className="text-sm text-foreground">
                      {format(new Date(report.run_started_at), "MMM d, yyyy h:mm a")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {report.trigger_type} · {Math.round(report.duration_seconds || 0)}s
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    report.status === "completed" ? "bg-green-500/10 text-green-500" :
                    report.status === "completed_with_errors" ? "bg-amber-500/10 text-amber-500" :
                    report.status === "running" ? "bg-primary/10 text-primary" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    {report.status.replace(/_/g, " ")}
                  </span>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerMaintenance;
