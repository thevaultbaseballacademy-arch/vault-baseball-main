import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Loader2, Flame, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWorkloadHealth } from "@/hooks/useWorkloadHealth";

const ARM_CARE_EXERCISES = [
  "J-Band Warmup", "Shoulder Tube Walks", "External Rotation",
  "Internal Rotation", "Prone Y-T-W", "Scapular Push-ups",
  "Sleeper Stretch", "Cross-Body Stretch", "Wrist Curls",
  "Forearm Roller", "Shoulder CARs", "Thoracic Spine Rotation",
];

const ArmCare = () => {
  const navigate = useNavigate();
  const { armCareLogs, addArmCareLog, armCareStreak } = useWorkloadHealth();
  const [saving, setSaving] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLog = armCareLogs.find((l) => l.log_date === todayStr);

  const [form, setForm] = useState({
    log_date: todayStr,
    exercises_completed: (todayLog?.exercises_completed || []) as string[],
    band_work_minutes: todayLog?.band_work_minutes || 0,
    stretching_minutes: todayLog?.stretching_minutes || 0,
    icing_minutes: todayLog?.icing_minutes || 0,
    arm_feeling: todayLog?.arm_feeling || 3,
    rom_score: todayLog?.rom_score || 3,
    notes: todayLog?.notes || "",
  });

  const toggleExercise = (ex: string) => {
    setForm((prev) => ({
      ...prev,
      exercises_completed: prev.exercises_completed.includes(ex)
        ? prev.exercises_completed.filter((e) => e !== ex)
        : [...prev.exercises_completed, ex],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await addArmCareLog(form as any);
    } finally {
      setSaving(false);
    }
  };

  const RatingDots = ({ value, onChange, labels }: { value: number; onChange: (v: number) => void; labels: string[] }) => (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all text-sm ${
            value === n ? "bg-accent text-accent-foreground scale-110" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}>{n}</button>
      ))}
      <span className="text-xs text-muted-foreground ml-2">{labels[(value || 3) - 1]}</span>
    </div>
  );

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
              <h1 className="text-3xl font-display text-foreground">ARM CARE</h1>
              <p className="text-muted-foreground text-sm">Daily recovery protocol tracking</p>
            </div>
            {armCareStreak > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                <Flame className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">{armCareStreak} day streak</span>
              </div>
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Exercises */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-green-500" /> Exercises Completed
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ARM_CARE_EXERCISES.map((ex) => (
                  <button key={ex} onClick={() => toggleExercise(ex)}
                    className={`px-3 py-2.5 rounded-xl text-sm text-left transition-all flex items-center gap-2 ${
                      form.exercises_completed.includes(ex)
                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}>
                    {form.exercises_completed.includes(ex) && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span className="truncate">{ex}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Tracking */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-foreground mb-4">Recovery Time</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Band Work (min)</Label>
                  <input type="number" min="0" max="60" value={form.band_work_minutes}
                    onChange={(e) => setForm({ ...form, band_work_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-center font-display text-lg" />
                </div>
                <div>
                  <Label className="text-xs">Stretching (min)</Label>
                  <input type="number" min="0" max="60" value={form.stretching_minutes}
                    onChange={(e) => setForm({ ...form, stretching_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-center font-display text-lg" />
                </div>
                <div>
                  <Label className="text-xs">Icing (min)</Label>
                  <input type="number" min="0" max="60" value={form.icing_minutes}
                    onChange={(e) => setForm({ ...form, icing_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-center font-display text-lg" />
                </div>
              </div>
            </div>

            {/* Arm Feeling & ROM */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <div>
                <Label className="text-sm text-muted-foreground mb-3 block">Arm Feeling</Label>
                <RatingDots value={form.arm_feeling || 3}
                  onChange={(v) => setForm({ ...form, arm_feeling: v })}
                  labels={["Dead", "Heavy", "Normal", "Fresh", "Electric"]} />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-3 block">Range of Motion</Label>
                <RatingDots value={form.rom_score || 3}
                  onChange={(v) => setForm({ ...form, rom_score: v })}
                  labels={["Limited", "Tight", "Normal", "Loose", "Full"]} />
              </div>
            </div>

            {/* Notes & Save */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <Label className="text-sm text-muted-foreground mb-2 block">Notes</Label>
              <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2} className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm resize-none"
                placeholder="Any observations about your arm today?" />
            </div>

            <Button variant="vault" size="lg" className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
              {todayLog ? "Update Today's Log" : "Save Arm Care Log"}
            </Button>

            {/* History */}
            {armCareLogs.length > 1 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-display text-foreground mb-4">Recent Logs</h3>
                <div className="space-y-2">
                  {armCareLogs.slice(0, 7).map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                      <span className="text-xs text-muted-foreground w-16">
                        {new Date(log.log_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <div className="flex items-center gap-1.5 flex-1">
                        {log.arm_feeling && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                            Arm: {log.arm_feeling}/5
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {(log.band_work_minutes || 0) + (log.stretching_minutes || 0)} min work
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(log.exercises_completed as any[])?.length || 0} exercises
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArmCare;
