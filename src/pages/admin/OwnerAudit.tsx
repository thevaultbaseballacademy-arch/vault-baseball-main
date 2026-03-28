import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollText, ShieldAlert } from "lucide-react";
import { useState } from "react";

const OwnerAudit = () => {
  const [tab, setTab] = useState<"audit" | "denied">("audit");

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["owner-audit-logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("id, table_name, record_id, operation, changed_by, changed_at, ip_address")
        .order("changed_at", { ascending: false })
        .limit(200);
      return data || [];
    },
    enabled: tab === "audit",
  });

  const { data: deniedLogs = [] } = useQuery({
    queryKey: ["owner-denied-logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("access_denied_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      return data || [];
    },
    enabled: tab === "denied",
  });

  const { data: profilesMap = {} } = useQuery({
    queryKey: ["owner-profiles-map"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name, email");
      return (data || []).reduce((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {} as Record<string, { display_name: string | null; email: string | null }>);
    },
  });

  const getName = (userId: string | null) => {
    if (!userId) return "System";
    return profilesMap[userId]?.display_name || profilesMap[userId]?.email || userId.slice(0, 8);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display text-foreground">AUDIT LOG</h1>
        <p className="text-sm text-muted-foreground">Read-only record of all platform activity</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("audit")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === "audit" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
        >
          <ScrollText className="w-3.5 h-3.5" /> Audit Trail
        </button>
        <button
          onClick={() => setTab("denied")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === "denied" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Access Denials
        </button>
      </div>

      {tab === "audit" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-foreground">{getName(log.changed_by)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      log.operation === "INSERT" ? "bg-emerald-500/10 text-emerald-400" :
                      log.operation === "UPDATE" ? "bg-blue-500/10 text-blue-400" :
                      log.operation === "DELETE" ? "bg-destructive/10 text-destructive" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {log.operation}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{log.table_name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(log.changed_at).toLocaleString()}
                    {log.ip_address && ` · ${log.ip_address}`}
                  </p>
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">No audit entries</p>
            )}
          </div>
        </div>
      )}

      {tab === "denied" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {deniedLogs.map(log => (
              <div key={log.id} className="p-3 flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-foreground">{getName(log.user_id)}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">403</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Route: <span className="font-mono text-foreground">{log.attempted_route}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Permission: <span className="font-mono text-foreground">{log.attempted_permission}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(log.created_at).toLocaleString()}
                    {log.ip_address && ` · ${log.ip_address}`}
                  </p>
                </div>
              </div>
            ))}
            {deniedLogs.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">No denied access attempts</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerAudit;
