import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Target, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWorkloadHealth } from "@/hooks/useWorkloadHealth";

const SESSION_TYPES = ["game", "bullpen", "live_bp", "warmup"] as const;
const SESSION_LABELS: Record<string, string> = {
  game: "Game", bullpen: "Bullpen", live_bp: "Live BP", warmup: "Warmup",
};

const PitchLog = () => {
  const navigate = useNavigate();
  const { pitchCounts, addPitchCount, loading } = useWorkloadHealth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    session_date: new Date().toISOString().split("T")[0],
    session_type: "game" as string,
    pitch_count: 0,
    innings_pitched: null as number | null,
    max_velocity: null as number | null,
    avg_velocity: null as number | null,
    pain_reported: false,
    pain_location: "",
    pain_level: null as number | null,
    notes: "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await addPitchCount({
        session_date: form.session_date,
        session_type: form.session_type,
        pitch_count: form.pitch_count,
        innings_pitched: form.innings_pitched,
        pitch_types: {},
        max_velocity: form.max_velocity,
        avg_velocity: form.avg_velocity,
        pain_reported: form.pain_reported,
        pain_location: form.pain_reported ? form.pain_location : null,
        pain_level: form.pain_reported ? form.pain_level : null,
        notes: form.notes || null,
      });
      setOpen(false);
      setForm({
        session_date: new Date().toISOString().split("T")[0],
        session_type: "game", pitch_count: 0, innings_pitched: null,
        max_velocity: null, avg_velocity: null, pain_reported: false,
        pain_location: "", pain_level: null, notes: "",
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
              <h1 className="text-3xl font-display text-foreground">PITCH LOG</h1>
              <p className="text-muted-foreground text-sm">Track every pitch to prevent overuse</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Log Session</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Log Pitch Session</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Date</Label>
                      <Input type="date" value={form.session_date}
                        onChange={(e) => setForm({ ...form, session_date: e.target.value })} />
                    </div>
                    <div>
                      <Label>Session Type</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {SESSION_TYPES.map((t) => (
                          <button key={t} onClick={() => setForm({ ...form, session_type: t })}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                              form.session_type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                            }`}>{SESSION_LABELS[t]}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Pitch Count *</Label>
                      <Input type="number" min="0" max="200" value={form.pitch_count || ""}
                        onChange={(e) => setForm({ ...form, pitch_count: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label>Innings</Label>
                      <Input type="number" step="0.1" min="0" value={form.innings_pitched ?? ""}
                        onChange={(e) => setForm({ ...form, innings_pitched: parseFloat(e.target.value) || null })} />
                    </div>
                    <div>
                      <Label>Peak Velo</Label>
                      <Input type="number" step="0.1" value={form.max_velocity ?? ""}
                        onChange={(e) => setForm({ ...form, max_velocity: parseFloat(e.target.value) || null })} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-4 h-4 ${form.pain_reported ? "text-red-500" : "text-muted-foreground"}`} />
                      <span className="text-sm text-foreground">Any pain or discomfort?</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={form.pain_reported ? "destructive" : "outline"}
                        onClick={() => setForm({ ...form, pain_reported: true })}>Yes</Button>
                      <Button size="sm" variant={!form.pain_reported ? "default" : "outline"}
                        onClick={() => setForm({ ...form, pain_reported: false })}>No</Button>
                    </div>
                  </div>

                  {form.pain_reported && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                      <div>
                        <Label>Pain Location</Label>
                        <Input value={form.pain_location}
                          onChange={(e) => setForm({ ...form, pain_location: e.target.value })}
                          placeholder="e.g. Elbow, Shoulder, Forearm" />
                      </div>
                      <div>
                        <Label>Pain Level (1-10)</Label>
                        <input type="range" min="1" max="10" value={form.pain_level || 3}
                          onChange={(e) => setForm({ ...form, pain_level: parseInt(e.target.value) })}
                          className="w-full accent-destructive" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Mild</span>
                          <span className="font-medium text-destructive">{form.pain_level || 3}</span>
                          <span>Severe</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <Label>Notes</Label>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={2} className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm resize-none"
                      placeholder="How did the session feel?" />
                  </div>

                  <Button onClick={handleSave} disabled={saving || form.pitch_count <= 0} className="w-full">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Session
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Sessions list */}
          <div className="space-y-3">
            {pitchCounts.length > 0 ? pitchCounts.map((pc, i) => (
              <motion.div key={pc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="font-display text-foreground">
                      {new Date(pc.session_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                      {pc.session_type.replace("_", " ")}
                    </span>
                  </div>
                  {pc.pain_reported && (
                    <span className="text-xs px-2 py-1 bg-red-500/10 text-red-500 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Pain ({pc.pain_level}/10)
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  <div className="bg-secondary rounded-xl p-3 text-center">
                    <p className="text-xl font-display text-foreground">{pc.pitch_count}</p>
                    <p className="text-xs text-muted-foreground">Pitches</p>
                  </div>
                  {pc.innings_pitched && (
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <p className="text-xl font-display text-foreground">{pc.innings_pitched}</p>
                      <p className="text-xs text-muted-foreground">Innings</p>
                    </div>
                  )}
                  {pc.max_velocity && (
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <p className="text-xl font-display text-foreground">{pc.max_velocity}</p>
                      <p className="text-xs text-muted-foreground">Peak Velo</p>
                    </div>
                  )}
                </div>
                {pc.notes && <p className="text-sm text-muted-foreground mt-3">{pc.notes}</p>}
              </motion.div>
            )) : (
              <div className="text-center py-16 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No pitch sessions logged yet.</p>
                <Button className="mt-4" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Log First Session</Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PitchLog;
