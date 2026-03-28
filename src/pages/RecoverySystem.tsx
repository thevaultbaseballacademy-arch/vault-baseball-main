import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon, Zap, Heart, Activity, Shield, Brain, Droplets,
  Thermometer, Timer, CheckCircle2, AlertTriangle, TrendingUp,
  Calendar, ArrowLeft, Loader2, RefreshCw, ChevronDown,
  ChevronUp, Star, Sun, Wind, Target, Plus, Info, Flame,
  Clock, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ── Recovery Science Data (original, evidence-based) ─────────────────────────
const RECOVERY_SCIENCE = {
  sleep: {
    title: "Sleep Architecture & Athletic Recovery",
    summary: "Sleep is the single most important recovery tool. During deep sleep (N3) and REM, growth hormone peaks — responsible for tissue repair. Research: Athletes averaging <7 hours show 1.7× higher injury rates (Milewski et al., 2014, J Pediatric Orthopaedics).",
    recommendations: {
      youth_12_14: { hours: "9–10 hrs", quality: "Consistent bedtime critical. Screen-off 1 hr before.", wake: "Natural light within 30 min of waking" },
      hs_14_18: { hours: "8–9 hrs", quality: "Pre-sleep routine. Dark, cool room (65–67°F).", wake: "Avoid alarm snoozes — disrupts REM" },
      college_plus: { hours: "8–9 hrs", quality: "Strategic naps (20 min) before afternoon practice.", wake: "Consistent schedule matters more than duration alone" },
    },
  },
  nutrition_recovery: {
    title: "Post-Training Nutrition Window",
    summary: "The post-exercise glycogen replenishment window is 30–120 minutes. Protein synthesis peaks within 2 hours. Target: 20-40g protein + 50-80g carbohydrates within 45 minutes post-training (evidence: Burke et al., 2011, Journal of Sports Sciences).",
    windows: [
      { label: "0–30 min", action: "Chocolate milk, protein shake + banana, or Greek yogurt + fruit", priority: "High" },
      { label: "30–120 min", action: "Full recovery meal: lean protein + complex carbs + vegetables", priority: "High" },
      { label: "2–4 hrs", action: "Secondary meal if 2-a-day or tournament", priority: "Medium" },
    ],
  },
  hydration: {
    title: "Hydration & Performance",
    summary: "2% bodyweight fluid loss = measurable performance and cognitive impairment. Baseball/softball players in heat lose 0.5–2L/hour. Strategy: pre-load before games, replace during, and monitor urine color (pale yellow = adequate).",
    daily: "Body weight (lbs) ÷ 2 = baseline daily oz. Add 16-24 oz per pound of sweat weight lost in training.",
  },
  cold_heat: {
    title: "Cold / Heat Contrast Therapy",
    summary: "Cold water immersion (50-59°F for 10-15 min) reduces muscle soreness markers and perceived fatigue post-competition. Heat therapy (sauna, hot bath) improves recovery when used 24-48 hours post-game. NOT recommended within 4 hrs of competition.",
    protocols: [
      { name: "Cold Shower Protocol", timing: "Within 2 hrs post-competition", duration: "90 sec cold → 30 sec warm × 4", benefit: "Reduce acute inflammation + soreness" },
      { name: "Contrast Therapy", timing: "24-48 hrs post-competition", duration: "2 min cold : 1 min hot × 5 cycles", benefit: "Flush metabolic waste, increase blood flow" },
      { name: "Hot Bath/Sauna", timing: "Rest day recovery", duration: "15-20 min at 160-180°F", benefit: "Parasympathetic activation, muscle relaxation" },
    ],
  },
  soft_tissue: {
    title: "Soft Tissue & Mobility Work",
    summary: "Foam rolling and targeted mobility reduce next-day soreness and restore movement quality. Research supports 60-90 seconds per muscle group for fascial release effect (Macdonald et al., 2013, J Strength & Conditioning Research).",
    priority_areas: {
      pitcher: ["Posterior shoulder (lat, teres, infraspinatus)", "Hip flexors", "Thoracic spine", "Forearm/wrist flexors"],
      catcher: ["Hip flexors/quads (squat position)", "Lower back/glutes", "Posterior shoulder", "Ankle/calf"],
      outfield: ["Hip flexors", "Hamstrings", "IT band", "Calf/achilles"],
      infield: ["Hip flexors", "Groin/adductors", "Shoulder girdle", "Low back"],
      hitter: ["Hip flexors", "Thoracic spine", "Lead forearm/wrist", "Obliques"],
    },
  },
  arm_care_recovery: {
    title: "Post-Throwing Arm Recovery Protocol",
    summary: "Post-game arm care is non-negotiable for throwing athletes. Research shows proper cool-down and band work reduce next-day fatigue by 30-40%. The arm needs 72 hrs minimum between high-intensity efforts.",
    post_game: [
      { name: "Arm Circles", sets: "2×15 each direction", timing: "Within 30 min of last throw" },
      { name: "Band External Rotation", sets: "3×15", timing: "Within 45 min" },
      { name: "Prone Y-T-W", sets: "2×10 each", timing: "Within 1 hr" },
      { name: "Ice (if significant soreness)", sets: "15 min", timing: "30-60 min post-competition" },
    ],
  },
  mental_recovery: {
    title: "Mental Recovery & CNS Restoration",
    summary: "Competition stress activates the sympathetic (fight-or-flight) nervous system. Recovery requires parasympathetic (rest-digest) activation. Techniques: box breathing (4-4-4-4 count), progressive muscle relaxation, and deliberate disconnection from sport (24 hrs post-competition minimum).",
    techniques: [
      { name: "Box Breathing", protocol: "4 sec inhale → 4 hold → 4 exhale → 4 hold. 5-10 min", timing: "Post-competition, pre-sleep" },
      { name: "Body Scan", protocol: "10-min progressive relaxation from feet to head", timing: "Pre-sleep" },
      { name: "Deliberate Play", protocol: "Non-sport activity you enjoy", timing: "24-48 hrs post competition" },
      { name: "Journaling", protocol: "3 things you did well, 1 thing to improve, 1 thing you're grateful for", timing: "Evening" },
    ],
  },
};

// ── Recovery Plan AI System Prompt ───────────────────────────────────────────
const RECOVERY_SYSTEM_PROMPT = `You are VAULT™ Recovery Coach — a specialized AI sports recovery advisor for baseball and softball athletes.

You create personalized, evidence-based recovery protocols based on:
- Athlete's self-reported metrics (sleep, soreness, energy, stress, mood)
- Their position, age, and recent training load
- The science of sports recovery (sleep, nutrition timing, cold/heat therapy, soft tissue work, mental recovery)

RULES:
1. Your recommendations are educational information, not medical advice
2. For injuries or significant pain (6+/10), always recommend consulting a sports medicine professional
3. Be specific and actionable — give exact protocols, not vague suggestions
4. Acknowledge what the athlete reported — don't ignore their inputs
5. Prioritize the highest-leverage recovery interventions for their situation
6. Youth athletes (under 16): emphasize sleep and fun/play recovery over tools
7. Tournament weekends: give compressed recovery protocols for quick turnaround

Output ONLY valid JSON with this exact structure:
{
  "recovery_score": number (0-100, overall recovery readiness),
  "readiness_label": "string (e.g. 'High Readiness', 'Moderate', 'Rest Recommended')",
  "readiness_color": "green|yellow|red",
  "top_priority": "string (single most important thing right now)",
  "immediate_actions": ["array of 2-3 things to do TODAY"],
  "tonight_protocol": ["array of 2-3 bedtime/recovery protocols for tonight"],
  "tomorrow_guidance": "string (one sentence: what tomorrow training should look like)",
  "nutrition_now": "string (specific food/drink recommendation based on timing)",
  "sleep_target": "string (specific hours + time to target for tonight)",
  "arm_care": ["array of 2-3 arm care items IF throwing athlete, otherwise empty"],
  "mental_reset": "string (specific mental recovery technique based on stress level)",
  "full_protocol": "string (2-3 paragraph narrative of complete recovery plan)",
  "warning_flags": ["array of any concerning signals from their data"],
  "return_to_train": "string (when they'll be at full readiness: 'Tonight', 'Tomorrow', '48 hrs', etc.)"
}`;

// ── Recovery Score Gauge ──────────────────────────────────────────────────────
function RecoveryGauge({ score, color }: { score: number; color: string }) {
  const hex = { green: "#22c55e", yellow: "#f59e0b", red: "#ef4444" }[color] || "#22c55e";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none" stroke={hex} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - score / 100) }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display" style={{ color: hex }}>{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const RecoverySystem = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("checkin");
  const [history, setHistory] = useState<any[]>([]);

  // Check-in state
  const [checkin, setCheckin] = useState({
    sleep_hours: [8],
    sleep_quality: [3],
    soreness: [2],
    energy: [3],
    stress: [2],
    mood: [3],
    training_today: "",
    throwing_today: "",
    last_game: "",
    notes: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const [profRes, checkinsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("athlete_checkins" as any).select("*")
          .eq("user_id", user.id)
          .order("checkin_date", { ascending: false })
          .limit(14),
      ]);

      setProfile(profRes.data);
      setHistory((checkinsRes.data as any[]) || []);
      setLoading(false);
    });
  }, []);

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const pos = profile?.position || "utility";
      const age = profile?.age || null;
      const sport = profile?.sport_type || "baseball";
      const isThrower = ["pitcher", "catcher", "outfield", "shortstop", "third_base", "infield"].includes(pos.toLowerCase());

      const prompt = `Athlete Recovery Assessment:

Sport: ${sport} | Position: ${pos} | Age: ${age || "Unknown"}
Date/Time of Report: ${new Date().toLocaleString()}

Self-Reported Metrics:
- Sleep Last Night: ${checkin.sleep_hours[0]} hours (quality ${checkin.sleep_quality[0]}/5)
- Soreness Level: ${checkin.soreness[0]}/5 ${checkin.soreness[0] >= 4 ? "⚠️ HIGH SORENESS" : ""}
- Energy Level: ${checkin.energy[0]}/5
- Stress Level: ${checkin.stress[0]}/5
- Mood: ${checkin.mood[0]}/5
- Training Today: ${checkin.training_today || "None reported"}
- Throwing Today: ${checkin.throwing_today || "None reported"}
- Last Game: ${checkin.last_game || "Not specified"}
- Notes: ${checkin.notes || "None"}

Recent History (${history.length} days tracked):
${history.slice(0, 5).map(h => `  ${h.checkin_date}: sleep ${h.sleep_hours}hrs, soreness ${h.soreness_level}/5, energy ${h.energy_level}/5`).join("\n") || "  No history"}

Is throwing athlete: ${isThrower ? "Yes" : "No"}

Generate a complete, specific recovery protocol for this athlete RIGHT NOW.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: RECOVERY_SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((c: any) => c.text || "").join("") || "{}";
      const clean = text.replace(/```json|```/g, "").trim();

      try {
        const parsed = JSON.parse(clean);
        setPlan(parsed);

        // Save check-in to DB
        if (userId) {
          await supabase.from("athlete_checkins" as any).upsert({
            user_id: userId,
            checkin_date: new Date().toISOString().split("T")[0],
            sleep_hours: checkin.sleep_hours[0],
            sleep_quality: checkin.sleep_quality[0],
            soreness_level: checkin.soreness[0],
            energy_level: checkin.energy[0],
            mood: checkin.mood[0],
            stress_level: checkin.stress[0],
            training_completed: checkin.training_today !== "none" && !!checkin.training_today,
            training_type: checkin.training_today || null,
            notes: checkin.notes || null,
          });
        }

        setActiveTab("plan");
        toast.success("Recovery plan generated!");
      } catch {
        toast.error("Could not parse recovery plan. Please try again.");
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const Metric = ({ label, value, max = 5, icon: Icon }: { label: string; value: number[]; max?: number; icon: React.ElementType }) => {
    const pct = (value[0] / max) * 100;
    const color = pct >= 60 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground"><Icon className="w-3.5 h-3.5" />{label}</span>
          <span className="font-display text-sm" style={{ color }}>{value[0]}/{max}</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: color, width: `${pct}%` }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-background"><Navbar />
      <div className="flex items-center justify-center pt-40"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="pt-4 mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <h1 className="text-2xl font-display text-foreground">RECOVERY SYSTEM™</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Body Recovery · Athlete-Specific Protocols</p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="checkin" className="text-xs">Daily Check-in</TabsTrigger>
              <TabsTrigger value="plan" className="text-xs" disabled={!plan}>My Plan</TabsTrigger>
              <TabsTrigger value="science" className="text-xs">Recovery Science</TabsTrigger>
              <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
            </TabsList>

            {/* ── DAILY CHECK-IN ── */}
            <TabsContent value="checkin" className="space-y-5">
              {/* Current status summary if we have history */}
              {history.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Avg Sleep", value: (history.slice(0,7).reduce((s, h) => s + (h.sleep_hours||0), 0) / Math.min(7, history.length)).toFixed(1) + "hrs", icon: Moon, color: "text-indigo-500" },
                    { label: "Avg Soreness", value: (history.slice(0,7).reduce((s, h) => s + (h.soreness_level||0), 0) / Math.min(7, history.length)).toFixed(1) + "/5", icon: Activity, color: "text-amber-500" },
                    { label: "Check-in Streak", value: history.length + " days", icon: Flame, color: "text-green-500" },
                  ].map(s => (
                    <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
                      <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                      <p className="text-lg font-display text-foreground">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
                <h3 className="font-display text-foreground">How are you feeling right now?</h3>

                {/* Sleep */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5"><Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-2"><Label>Hours slept</Label><span className="font-display text-foreground">{checkin.sleep_hours[0]} hrs</span></div>
                      <Slider value={checkin.sleep_hours} onValueChange={v => setCheckin(c => ({...c, sleep_hours: v}))} min={4} max={12} step={0.5} />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>4hrs</span><span>8hrs</span><span>12hrs</span></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2"><Label>Sleep quality</Label><span className="font-display text-foreground">{["", "Poor", "Below Avg", "Average", "Good", "Excellent"][checkin.sleep_quality[0]]}</span></div>
                      <Slider value={checkin.sleep_quality} onValueChange={v => setCheckin(c => ({...c, sleep_quality: v}))} min={1} max={5} step={1} />
                    </div>
                  </div>
                </div>

                {/* Body Status */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-amber-500" /> Body Status</h4>
                  {[
                    { key: "soreness", label: "Soreness", labels: ["", "None", "Mild", "Moderate", "Significant", "Severe"] },
                    { key: "energy", label: "Energy Level", labels: ["", "Depleted", "Low", "Moderate", "High", "Peak"] },
                    { key: "stress", label: "Mental Stress", labels: ["", "None", "Low", "Moderate", "High", "Very High"] },
                    { key: "mood", label: "Mood", labels: ["", "Poor", "Below Avg", "Neutral", "Good", "Excellent"] },
                  ].map(metric => (
                    <div key={metric.key}>
                      <div className="flex justify-between text-xs mb-2">
                        <Label>{metric.label}</Label>
                        <span className="font-display text-foreground">{metric.labels[(checkin as any)[metric.key][0]]}</span>
                      </div>
                      <Slider
                        value={(checkin as any)[metric.key]}
                        onValueChange={v => setCheckin(c => ({...c, [metric.key]: v}))}
                        min={1} max={5} step={1}
                      />
                    </div>
                  ))}
                </div>

                {/* Training Context */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-green-500" /> Training Context</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1.5 block">Training today</Label>
                      <Select value={checkin.training_today} onValueChange={v => setCheckin(c => ({...c, training_today: v}))}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Rest day</SelectItem>
                          <SelectItem value="light">Light / Skill work</SelectItem>
                          <SelectItem value="moderate">Moderate practice</SelectItem>
                          <SelectItem value="heavy">Heavy / Intense</SelectItem>
                          <SelectItem value="game">Game</SelectItem>
                          <SelectItem value="tournament">Tournament day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Throwing volume</Label>
                      <Select value={checkin.throwing_today} onValueChange={v => setCheckin(c => ({...c, throwing_today: v}))}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="light">Light (catch, flat)</SelectItem>
                          <SelectItem value="moderate">Moderate (BP, drills)</SelectItem>
                          <SelectItem value="heavy">Heavy / Bullpen</SelectItem>
                          <SelectItem value="max">Max (started game)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Last game (how long ago?)</Label>
                    <Select value={checkin.last_game} onValueChange={v => setCheckin(c => ({...c, last_game: v}))}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="2days">2 days ago</SelectItem>
                        <SelectItem value="3plus">3+ days ago</SelectItem>
                        <SelectItem value="no_recent">No recent game</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-xs mb-1.5 block">Anything specific? (pain location, tight areas, mental state)</Label>
                  <Textarea
                    value={checkin.notes}
                    onChange={e => setCheckin(c => ({...c, notes: e.target.value}))}
                    placeholder="E.g., 'Right shoulder tight since yesterday's bullpen. Legs feel heavy. Mentally drained from 3-game weekend...'"
                    rows={3}
                    className="text-sm resize-none"
                  />
                  {checkin.soreness[0] >= 4 && (
                    <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> High soreness noted. If pain is sharp, localized, or 7+/10, see a sports medicine professional.
                    </p>
                  )}
                </div>

                <Button variant="vault" size="lg" className="w-full h-12" onClick={generatePlan} disabled={generating}>
                  {generating ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating Recovery Plan…</>
                  ) : (
                    <><Heart className="w-4 h-4 mr-2" /> Generate My Recovery Plan</>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* ── RECOVERY PLAN ── */}
            <TabsContent value="plan">
              {plan && (
                <div className="space-y-5">
                  {/* Recovery Score */}
                  <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6">
                    <RecoveryGauge score={plan.recovery_score} color={plan.readiness_color} />
                    <div className="flex-1">
                      <h2 className="text-xl font-display text-foreground">{plan.readiness_label}</h2>
                      <p className="text-sm text-muted-foreground mt-1">Recovery Score: {plan.recovery_score}/100</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Full readiness: <span className="font-medium text-foreground">{plan.return_to_train}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Warning Flags */}
                  {plan.warning_flags?.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-1">
                      <p className="text-xs font-medium text-amber-600 mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Flags to Watch</p>
                      {plan.warning_flags.map((flag: string, i: number) => (
                        <p key={i} className="text-xs text-amber-600">• {flag}</p>
                      ))}
                    </div>
                  )}

                  {/* Top Priority */}
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                    <p className="text-xs font-medium text-primary mb-1 uppercase tracking-wide">Top Priority Right Now</p>
                    <p className="text-sm text-foreground font-medium">{plan.top_priority}</p>
                  </div>

                  {/* Immediate + Tonight */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-2xl p-4">
                      <h3 className="font-display text-sm text-foreground mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" /> Do Now
                      </h3>
                      {plan.immediate_actions?.map((action: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground">{action}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-4">
                      <h3 className="font-display text-sm text-foreground mb-3 flex items-center gap-2">
                        <Moon className="w-4 h-4 text-indigo-500" /> Tonight
                      </h3>
                      {plan.tonight_protocol?.map((action: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground">{action}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nutrition + Sleep + Mental */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Nutrition", value: plan.nutrition_now, icon: Flame, color: "text-orange-500" },
                      { label: "Sleep Target", value: plan.sleep_target, icon: Moon, color: "text-indigo-500" },
                      { label: "Mental Reset", value: plan.mental_reset, icon: Brain, color: "text-purple-500" },
                    ].map(item => (
                      <div key={item.label} className="bg-card border border-border rounded-xl p-3">
                        <item.icon className={`w-4 h-4 ${item.color} mb-1.5`} />
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{item.label}</p>
                        <p className="text-xs text-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Arm Care if applicable */}
                  {plan.arm_care?.length > 0 && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
                      <h3 className="font-display text-sm text-foreground mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" /> Arm Care Protocol
                      </h3>
                      {plan.arm_care.map((item: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 text-xs text-blue-600 font-bold">{i + 1}</div>
                          <p className="text-xs text-muted-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tomorrow */}
                  <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                    <p className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1.5"><Sun className="w-3.5 h-3.5" /> Tomorrow's Training</p>
                    <p className="text-sm text-foreground">{plan.tomorrow_guidance}</p>
                  </div>

                  {/* Full Protocol */}
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-display text-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" /> Complete Recovery Protocol
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{plan.full_protocol}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setPlan(null); setActiveTab("checkin"); }}>
                      <RefreshCw className="w-4 h-4 mr-2" /> New Check-in
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── RECOVERY SCIENCE ── */}
            <TabsContent value="science" className="space-y-4">
              <p className="text-sm text-muted-foreground">Evidence-based recovery science every athlete should understand.</p>
              {Object.entries(RECOVERY_SCIENCE).map(([key, section]) => (
                <div key={key} className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-display text-foreground mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{section.summary}</p>
                  {"protocols" in section && (section as any).protocols && (
                    <div className="space-y-2">
                      {(section as any).protocols.map((p: any, i: number) => (
                        <div key={i} className="bg-secondary rounded-xl p-3">
                          <p className="text-xs font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.duration || p.protocol} · {p.timing || p.benefit}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {"techniques" in section && (section as any).techniques && (
                    <div className="space-y-2">
                      {(section as any).techniques.map((t: any, i: number) => (
                        <div key={i} className="bg-secondary rounded-xl p-3">
                          <p className="text-xs font-medium text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.protocol} · {t.timing}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {"post_game" in section && (section as any).post_game && (
                    <div className="space-y-2">
                      {(section as any).post_game.map((p: any, i: number) => (
                        <div key={i} className="bg-secondary rounded-xl p-3 flex justify-between items-center">
                          <div><p className="text-xs font-medium text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{p.sets}</p></div>
                          <Badge variant="outline" className="text-xs">{p.timing}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>

            {/* ── HISTORY ── */}
            <TabsContent value="history" className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-12"><Heart className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" /><p className="text-muted-foreground">No check-in history yet. Start your first check-in!</p></div>
              ) : (
                <>
                  {/* Trend Summary */}
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <h3 className="font-display text-foreground mb-3">7-Day Trends</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Avg Sleep", vals: history.slice(0,7).map(h => h.sleep_hours || 0), max: 12, unit: "hrs" },
                        { label: "Avg Soreness", vals: history.slice(0,7).map(h => h.soreness_level || 0), max: 5, unit: "/5" },
                        { label: "Avg Energy", vals: history.slice(0,7).map(h => h.energy_level || 0), max: 5, unit: "/5" },
                      ].map(metric => {
                        const avg = metric.vals.length ? (metric.vals.reduce((s, v) => s + v, 0) / metric.vals.length) : 0;
                        return (
                          <div key={metric.label} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-24 shrink-0">{metric.label}</span>
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${(avg / metric.max) * 100}%` }} />
                            </div>
                            <span className="text-xs font-display text-foreground w-16 text-right">{avg.toFixed(1)}{metric.unit}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {history.map((h, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 text-center shrink-0">
                        <p className="text-xs text-muted-foreground">{new Date(h.checkin_date).toLocaleDateString("en", { month: "short" })}</p>
                        <p className="text-lg font-display text-foreground">{new Date(h.checkin_date).getDate()}</p>
                      </div>
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        {[
                          { label: "Sleep", value: h.sleep_hours ? h.sleep_hours + "h" : "—", icon: Moon },
                          { label: "Soreness", value: h.soreness_level ? h.soreness_level + "/5" : "—", icon: Activity },
                          { label: "Energy", value: h.energy_level ? h.energy_level + "/5" : "—", icon: Zap },
                          { label: "Mood", value: h.mood ? h.mood + "/5" : "—", icon: Heart },
                        ].map(s => (
                          <div key={s.label} className="text-center">
                            <s.icon className="w-3 h-3 mx-auto text-muted-foreground mb-0.5" />
                            <p className="text-xs font-medium text-foreground">{s.value}</p>
                            <p className="text-[9px] text-muted-foreground">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};



export default RecoverySystem;
