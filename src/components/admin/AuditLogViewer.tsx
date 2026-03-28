import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  FileText, Search, Filter, ChevronDown, ChevronUp, 
  User, Calendar, Database, Loader2, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  operation: string;
  old_data: any;
  new_data: any;
  changed_by: string | null;
  changed_at: string;
  changer_name?: string;
}

const TABLES = [
  { value: 'all', label: 'All Tables' },
  { value: 'user_roles', label: 'User Roles' },
  { value: 'profiles', label: 'Profiles' },
  { value: 'user_certifications', label: 'Certifications' },
  { value: 'coach_athlete_assignments', label: 'Coach Assignments' },
  { value: 'scheduled_broadcasts', label: 'Broadcasts' },
];

const OPERATIONS = [
  { value: 'all', label: 'All Operations' },
  { value: 'INSERT', label: 'Insert' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
];

const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableFilter, setTableFilter] = useState("all");
  const [operationFilter, setOperationFilter] = useState("all");
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLogs();
  }, [tableFilter, operationFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(100);

      if (tableFilter !== 'all') {
        query = query.eq('table_name', tableFilter);
      }

      if (operationFilter !== 'all') {
        query = query.eq('operation', operationFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user names for changed_by
      const userIds = [...new Set((data || []).filter(l => l.changed_by).map(l => l.changed_by))];
      
      let profileMap = new Map<string, string>();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);
        
        profiles?.forEach(p => {
          profileMap.set(p.user_id, p.display_name || 'Unknown');
        });
      }

      const enrichedLogs = (data || []).map(log => ({
        ...log,
        changer_name: log.changed_by ? profileMap.get(log.changed_by) || 'Unknown' : 'System',
      }));

      setLogs(enrichedLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (logId: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  const getOperationBadge = (operation: string) => {
    switch (operation) {
      case 'INSERT':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">INSERT</Badge>;
      case 'UPDATE':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">UPDATE</Badge>;
      case 'DELETE':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/30">DELETE</Badge>;
      default:
        return <Badge variant="secondary">{operation}</Badge>;
    }
  };

  const getTableBadge = (tableName: string) => {
    const colors: Record<string, string> = {
      user_roles: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
      profiles: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
      user_certifications: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
      coach_athlete_assignments: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
      scheduled_broadcasts: 'bg-pink-500/10 text-pink-600 border-pink-500/30',
    };
    return (
      <Badge className={colors[tableName] || 'bg-secondary text-muted-foreground'}>
        {tableName.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const renderDataDiff = (oldData: Record<string, any> | null, newData: Record<string, any> | null) => {
    if (!oldData && !newData) return null;

    const allKeys = new Set([
      ...Object.keys(oldData || {}),
      ...Object.keys(newData || {}),
    ]);

    // Filter out noisy fields
    const excludeFields = ['updated_at', 'created_at'];
    const relevantKeys = Array.from(allKeys).filter(k => !excludeFields.includes(k));

    return (
      <div className="mt-3 space-y-2 text-sm">
        {relevantKeys.map(key => {
          const oldVal = oldData?.[key];
          const newVal = newData?.[key];
          const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);

          if (!changed && oldData && newData) return null;

          return (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-muted-foreground font-medium">{key}:</span>
              <div className="pl-3 flex flex-col gap-1">
                {oldData && oldVal !== undefined && (
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-mono text-xs">-</span>
                    <code className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded text-xs break-all">
                      {typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal)}
                    </code>
                  </div>
                )}
                {newData && newVal !== undefined && (
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-mono text-xs">+</span>
                    <code className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-xs break-all">
                      {typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal)}
                    </code>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.table_name.toLowerCase().includes(term) ||
      log.record_id.toLowerCase().includes(term) ||
      log.changer_name?.toLowerCase().includes(term) ||
      JSON.stringify(log.new_data).toLowerCase().includes(term) ||
      JSON.stringify(log.old_data).toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Audit Logs
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track all changes to sensitive data
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select value={tableFilter} onValueChange={setTableFilter}>
            <SelectTrigger className="w-[180px]">
              <Database className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABLES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={operationFilter} onValueChange={setOperationFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPERATIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No audit logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {filteredLogs.map(log => (
              <Collapsible
                key={log.id}
                open={expandedLogs.has(log.id)}
                onOpenChange={() => toggleExpanded(log.id)}
              >
                <CollapsibleTrigger className="w-full p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-3 flex-wrap">
                      {getOperationBadge(log.operation)}
                      {getTableBadge(log.table_name)}
                      <span className="text-xs text-muted-foreground font-mono">
                        {log.record_id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.changer_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(log.changed_at), 'MMM d, yyyy h:mm a')}
                      </span>
                      {expandedLogs.has(log.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 pt-0">
                    <div className="bg-secondary/50 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-2">
                        Record ID: <code className="text-foreground">{log.record_id}</code>
                      </p>
                      {renderDataDiff(log.old_data, log.new_data)}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-display text-green-600">
            {logs.filter(l => l.operation === 'INSERT').length}
          </p>
          <p className="text-sm text-muted-foreground">Inserts</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-display text-blue-600">
            {logs.filter(l => l.operation === 'UPDATE').length}
          </p>
          <p className="text-sm text-muted-foreground">Updates</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-display text-red-600">
            {logs.filter(l => l.operation === 'DELETE').length}
          </p>
          <p className="text-sm text-muted-foreground">Deletes</p>
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;
