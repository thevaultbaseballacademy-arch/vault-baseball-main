import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, AlertTriangle, Plus, Loader2, CheckCircle2, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWorkloadHealth } from "@/hooks/useWorkloadHealth";

const BODY_PARTS = ["Shoulder", "Elbow", "Wrist", "Forearm", "Upper Back", "Lower Back", "Hip", "Knee", "Ankle", "Hamstring", "Quad", "Other"];
const INJURY_TYPES = ["soreness", "strain", "sprain", "fracture", "tendinitis", "other"];
const SEVERITY_LABELS = ["Minor", "Mild", "Moderate", "Severe", "Critical"];

const InjuryLog = () => {
  const navigate = useNavigate();
  const { injuries, addInjuryReport, resolveInjury, activeInjuries } = useWorkloadHealth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    injury_date: new Date().toISOString().split("T")[0],
    body_part: "",
    injury_type: "soreness",
    severity: 2,
    description: "",
    treatment: "",
    is_resolved: false,
    resolved_date: null as string | null,
    days_missed: 0,
    cleared_by_medical: false,
  });

  const handleSave = async () => {
    if (!form.body_part) return;
    setSaving(true);
    try {
      await addInjuryReport(form as any);
      setOpen(false);
      setForm({
        injury_date: new Date().toISOString().split("T")[0],
        body_part: "", injury_type: "soreness", severity: 2,
        description: "", treatment: "", is_resolved: false,
        resolved_date: null, days_missed: 0, cleared_by_medical: false,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/workload")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Workload
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display text-foreground">INJURY LOG</h1>
              <p className="text-muted-foreground text-sm">Track and manage injuries for safe return to play</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive"><Plus className="w-4 h-4 mr-2" /> Report Injury</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Report an Injury</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Date</Label>
                      <Input type="date" value={form.injury_date}
                        onChange={(e) => setForm({ ...form, injury_date: e.target.value })} />
                    </div>
                    <div>
                      <Label>Injury Type</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {INJURY_TYPES.map((t) => (
                          <button key={t} onClick={() => setForm({ ...form, injury_type: t })}
                            className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-all ${
                              form.injury_type === t ? "bg-destructive text-destructive-foreground" : "bg-secondary text-foreground"
                            }`}>{t}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Body Part *</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {BODY_PARTS.map((bp) => (
                        <button key={bp} onClick={() => setForm({ ...form, body_part: bp })}
                          className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                            form.body_part === bp ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-secondary text-foreground"
                          }`}>{bp}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Severity (1-5)</Label>
                    <div className="flex gap-2 mt-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setForm({ ...form, severity: n })}
                          className={`flex-1 py-2 rounded-lg text-center text-xs transition-all ${
                            form.severity === n
                              ? n <= 2 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : "bg-red-500/10 text-red-500 border border-red-500/20"
                              : "bg-secondary text-muted-foreground"
                          }`}>
                          <span className="font-display text-lg block">{n}</span>
                          <span>{SEVERITY_LABELS[n - 1]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={2} className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm resize-none"
                      placeholder="What happened? When did it start?" />
                  </div>
                  <div>
                    <Label>Treatment</Label>
                    <textarea value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                      rows={2} className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm resize-none"
                      placeholder="Ice, rest, PT, etc." />
                  </div>

                  <Button onClick={handleSave} disabled={saving || !form.body_part} className="w-full" variant="destructive">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Injury Report
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Active Injuries */}
          {activeInjuries.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Active Injuries ({activeInjuries.length})
              </h3>
              <div className="space-y-3">
                {activeInjuries.map((inj) => (
                  <motion.div key={inj.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-card border border-red-500/20 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-display text-foreground">{inj.body_part}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {inj.injury_type} • Severity {inj.severity}/5 • {new Date(inj.injury_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => resolveInjury(inj.id)}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolve
                      </Button>
                    </div>
                    {inj.description && <p className="text-sm text-muted-foreground">{inj.description}</p>}
                    {inj.treatment && (
                      <p className="text-sm text-foreground mt-1">
                        <span className="text-muted-foreground">Treatment:</span> {inj.treatment}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Resolved / History */}
          {injuries.filter((i) => i.is_resolved).length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Resolved
              </h3>
              <div className="space-y-2">
                {injuries.filter((i) => i.is_resolved).map((inj) => (
                  <div key={inj.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-sm text-foreground">{inj.body_part}</span>
                    <span className="text-xs text-muted-foreground capitalize">{inj.injury_type}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(inj.injury_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {injuries.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-display text-foreground text-lg mb-1">No Injuries Reported</p>
              <p className="text-sm">Stay healthy and keep training smart!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InjuryLog;
