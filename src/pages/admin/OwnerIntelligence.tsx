import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Brain, Plus, Power, Trash2, Loader2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CONDITIONS = [
  { value: "kpi_score", label: "KPI Score" },
  { value: "kpi_drop", label: "KPI Score Drop" },
  { value: "weakness_streak", label: "Weakness Streak (consecutive lessons)" },
  { value: "drill_inactive", label: "Drill Not Completed (days)" },
  { value: "no_lesson", label: "No Lesson (days)" },
  { value: "age_group", label: "Age Group" },
  { value: "sport", label: "Sport" },
  { value: "position", label: "Position" },
  { value: "pitch_count", label: "Pitch Count (weekly)" },
];

const OPERATORS = ["<", ">", "<=", ">=", "=", "!=", "IN", "NOT_IN", "DROPS_BY"];

const ACTIONS = [
  { value: "assign_drill_playlist", label: "Assign Drill Playlist" },
  { value: "assign_program", label: "Assign Program" },
  { value: "recommend_course", label: "Recommend Course" },
  { value: "notify_athlete", label: "Send Notification to Athlete" },
  { value: "alert_coach", label: "Send Alert to Coach" },
  { value: "flag_review", label: "Flag for Coach Review" },
  { value: "update_focus", label: "Update Dashboard Focus Area" },
  { value: "alert_parent", label: "Send Alert to Parent" },
];

const OwnerIntelligence = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", sport_type: "", condition_type: "", condition_field: "",
    condition_operator: "<", condition_value: "", condition_window_days: "",
    action_type: "", action_target: "", priority: "100",
  });
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["intelligence-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intelligence_rules")
        .select("*")
        .order("priority", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const createRule = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("intelligence_rules").insert({
        name: form.name,
        description: form.description || null,
        sport_type: form.sport_type || null,
        condition_type: form.condition_type,
        condition_field: form.condition_field,
        condition_operator: form.condition_operator,
        condition_value: form.condition_value,
        condition_window_days: form.condition_window_days ? parseInt(form.condition_window_days) : null,
        action_type: form.action_type,
        action_target: form.action_target,
        priority: parseInt(form.priority) || 100,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Rule created" });
      qc.invalidateQueries({ queryKey: ["intelligence-rules"] });
      setShowCreate(false);
      setForm({ name: "", description: "", sport_type: "", condition_type: "", condition_field: "", condition_operator: "<", condition_value: "", condition_window_days: "", action_type: "", action_target: "", priority: "100" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("intelligence_rules").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intelligence-rules"] }),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("intelligence_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Rule deleted" });
      qc.invalidateQueries({ queryKey: ["intelligence-rules"] });
    },
  });

  const inputClass = "px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground w-full";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground">INTELLIGENCE ENGINE</h1>
          <p className="text-sm text-muted-foreground">No-code automation rules</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" /> New Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xl font-display text-foreground">{rules.length}</p>
          <p className="text-xs text-muted-foreground">Total Rules</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xl font-display text-emerald-400">{rules.filter(r => r.is_active).length}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xl font-display text-foreground">{rules.reduce((s, r) => s + r.trigger_count, 0)}</p>
          <p className="text-xs text-muted-foreground">Total Triggers</p>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-card border border-primary/30 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-display text-foreground">CREATE RULE</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input placeholder="Rule name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
            <select value={form.sport_type} onChange={e => setForm({ ...form, sport_type: e.target.value })} className={inputClass}>
              <option value="">Any sport</option>
              <option value="baseball">Baseball</option>
              <option value="softball">Softball</option>
            </select>
          </div>
          <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputClass} />

          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">IF condition</p>
            <div className="grid md:grid-cols-4 gap-3">
              <select value={form.condition_type} onChange={e => setForm({ ...form, condition_type: e.target.value })} className={inputClass}>
                <option value="">Condition type *</option>
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <input placeholder="Field (e.g., bat_speed)" value={form.condition_field} onChange={e => setForm({ ...form, condition_field: e.target.value })} className={inputClass} />
              <select value={form.condition_operator} onChange={e => setForm({ ...form, condition_operator: e.target.value })} className={inputClass}>
                {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <input placeholder="Value *" value={form.condition_value} onChange={e => setForm({ ...form, condition_value: e.target.value })} className={inputClass} />
            </div>
            <input placeholder="Window (days, optional)" value={form.condition_window_days} onChange={e => setForm({ ...form, condition_window_days: e.target.value })} className={`${inputClass} mt-2 max-w-[200px]`} type="number" />
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">THEN action</p>
            <div className="grid md:grid-cols-3 gap-3">
              <select value={form.action_type} onChange={e => setForm({ ...form, action_type: e.target.value })} className={inputClass}>
                <option value="">Action type *</option>
                {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              <input placeholder="Target (program name, course ID)" value={form.action_target} onChange={e => setForm({ ...form, action_target: e.target.value })} className={inputClass} />
              <input placeholder="Priority (1=highest)" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={inputClass} type="number" />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => createRule.mutate()}
              disabled={!form.name || !form.condition_type || !form.condition_field || !form.condition_value || !form.action_type || !form.action_target}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50"
            >
              Create Rule
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      )}

      {/* Rules list */}
      <div className="space-y-3">
        {isLoading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}

        {rules.map(rule => (
          <div key={rule.id} className={`bg-card border rounded-xl p-4 transition-colors ${rule.is_active ? "border-border" : "border-border opacity-60"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className={`w-3.5 h-3.5 ${rule.is_active ? "text-amber-400" : "text-muted-foreground"}`} />
                  <h3 className="text-sm font-medium text-foreground">{rule.name}</h3>
                  {rule.sport_type && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{rule.sport_type}</span>
                  )}
                  <span className="text-[10px] text-muted-foreground">P{rule.priority}</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  IF {rule.condition_field} {rule.condition_operator} {rule.condition_value}
                  {rule.condition_window_days ? ` (${rule.condition_window_days}d window)` : ""}
                  {" → "}{rule.action_type}: {rule.action_target}
                </p>
                {rule.description && <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">
                  Triggered {rule.trigger_count}x
                  {rule.last_triggered_at && ` · Last: ${new Date(rule.last_triggered_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => toggleRule.mutate({ id: rule.id, is_active: !rule.is_active })}
                  className={`p-2 rounded-lg transition-colors ${rule.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-secondary text-muted-foreground"}`}
                  title={rule.is_active ? "Disable" : "Enable"}
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (confirm("Delete this rule?")) deleteRule.mutate(rule.id); }}
                  className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && rules.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No intelligence rules yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first IF/THEN rule above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerIntelligence;
