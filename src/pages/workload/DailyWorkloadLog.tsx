import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Loader2, Target, Dumbbell,
  Moon, Activity, Brain, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWorkloadManagement } from "@/hooks/useWorkloadManagement";

const DailyWorkloadLog = () => {
  const navigate = useNavigate();
  const { logDailyEntry, entries } = useWorkloadManagement();
  const [saving, setSaving] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayEntry = entries.find(e => e.record_date === todayStr);

  const [form, setForm] = useState({
    record_date: todayStr,
    pitch_count: todayEntry?.pitch_count || 0,
    throwing_count: todayEntry?.throwing_count || 0,
    training_minutes: todayEntry?.training_minutes || 0,
    lesson_minutes: todayEntry?.lesson_minutes || 0,
    drill_sets_completed: todayEntry?.drill_sets_completed || 0,
    soreness_level: todayEntry?.soreness_level || 1,
    sleep_hours: todayEntry?.sleep_hours || 8,
    readiness_score: todayEntry?.readiness_score || 7,
    sport_type: "baseball",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await logDailyEntry(form);
      navigate("/workload");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const sorenessLabels = ["None", "Mild", "Moderate", "Significant", "Severe"];
  const readinessLabels = ["", "Exhausted", "", "Fatigued", "", "Neutral", "", "Good", "", "Great", "Peak"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/workload")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-3xl font-display text-foreground mb-1">DAILY LOG</h1>
              <p className="text-muted-foreground">Log today's training, recovery, and body status</p>
            </div>

            <div className="bg-card border border-border p-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Date</Label>
              <Input
                type="date"
                value={form.record_date}
                onChange={(e) => setForm(f => ({ ...f, record_date: e.target.value }))}
                className="mt-1"
              />
            </div>

            {/* Activity Section */}
            <div className="bg-card border border-border p-6 space-y-5">
              <h3 className="font-display text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Activity
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Pitches Thrown</Label>
                  <Input
                    type="number" min={0}
                    value={form.pitch_count}
                    onChange={(e) => setForm(f => ({ ...f, pitch_count: +e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Throwing Sessions (non-pitch)</Label>
                  <Input
                    type="number" min={0}
                    value={form.throwing_count}
                    onChange={(e) => setForm(f => ({ ...f, throwing_count: +e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Training (min)</Label>
                  <Input
                    type="number" min={0}
                    value={form.training_minutes}
                    onChange={(e) => setForm(f => ({ ...f, training_minutes: +e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Lesson (min)</Label>
                  <Input
                    type="number" min={0}
                    value={form.lesson_minutes}
                    onChange={(e) => setForm(f => ({ ...f, lesson_minutes: +e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Drill Sets</Label>
                  <Input
                    type="number" min={0}
                    value={form.drill_sets_completed}
                    onChange={(e) => setForm(f => ({ ...f, drill_sets_completed: +e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Body Status Section */}
            <div className="bg-card border border-border p-6 space-y-6">
              <h3 className="font-display text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" /> Body Status
              </h3>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs text-muted-foreground">Soreness Level</Label>
                  <span className={`text-sm font-display ${form.soreness_level >= 4 ? "text-destructive" : form.soreness_level >= 3 ? "text-amber-500" : "text-green-500"}`}>
                    {form.soreness_level}/5 — {sorenessLabels[form.soreness_level - 1]}
                  </span>
                </div>
                <Slider
                  value={[form.soreness_level]}
                  onValueChange={(v) => setForm(f => ({ ...f, soreness_level: v[0] }))}
                  min={1} max={5} step={1}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5" /> Sleep Hours
                  </Label>
                  <span className={`text-sm font-display ${form.sleep_hours < 6 ? "text-destructive" : form.sleep_hours >= 8 ? "text-green-500" : "text-foreground"}`}>
                    {form.sleep_hours}h
                  </span>
                </div>
                <Slider
                  value={[form.sleep_hours]}
                  onValueChange={(v) => setForm(f => ({ ...f, sleep_hours: v[0] }))}
                  min={3} max={12} step={0.5}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5" /> Subjective Readiness
                  </Label>
                  <span className={`text-sm font-display ${form.readiness_score <= 3 ? "text-destructive" : form.readiness_score >= 8 ? "text-green-500" : "text-foreground"}`}>
                    {form.readiness_score}/10 {readinessLabels[form.readiness_score] && `— ${readinessLabels[form.readiness_score]}`}
                  </span>
                </div>
                <Slider
                  value={[form.readiness_score]}
                  onValueChange={(v) => setForm(f => ({ ...f, readiness_score: v[0] }))}
                  min={1} max={10} step={1}
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 font-display text-lg"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              {todayEntry ? "UPDATE TODAY'S LOG" : "SAVE LOG"}
            </Button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DailyWorkloadLog;
