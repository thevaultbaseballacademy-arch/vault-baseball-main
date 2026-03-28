import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell, Zap, Flame, Clock, ChevronRight, ChevronDown,
  ChevronUp, Play, Check, Loader2, ArrowLeft, Target,
  BarChart3, Calendar, Star, Shield, Trophy, Wind,
  Activity, Plus, X, Info, BookOpen, TrendingUp,
  Timer, RefreshCw, Filter, Users, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/contexts/SportContext";
import { toast } from "sonner";
import {
  PROGRAMS, EXERCISES, POSITION_PROFILES, SOFTBALL_POSITION_PROFILES,
  getPrograms, PHASE_LABELS, DIFFICULTY_COLORS,
  type TrainingProgram, type WorkoutSession, type Exercise,
  type TrainingPhase, type Difficulty, type Position
} from "@/lib/strengthData";

// ── Category Icon Map ─────────────────────────────────────────────────────────
const CAT_ICONS: Record<string, React.ElementType> = {
  strength: Dumbbell,
  power: Zap,
  speed: Wind,
  agility: Activity,
  conditioning: Flame,
  mobility: RefreshCw,
  arm_care: Shield,
};

const CAT_COLORS: Record<string, string> = {
  strength: "text-blue-500 bg-blue-500/10",
  power: "text-red-500 bg-red-500/10",
  speed: "text-amber-500 bg-amber-500/10",
  agility: "text-cyan-500 bg-cyan-500/10",
  conditioning: "text-orange-500 bg-orange-500/10",
  mobility: "text-green-500 bg-green-500/10",
  arm_care: "text-purple-500 bg-purple-500/10",
};

// ── Active Workout Timer ──────────────────────────────────────────────────────
function WorkoutTimer({ seconds, running }: { seconds: number; running: boolean }) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return (
    <div className={`font-mono text-2xl font-bold transition-colors ${running ? "text-green-500" : "text-muted-foreground"}`}>
      {m}:{s}
    </div>
  );
}

// ── Exercise Card ─────────────────────────────────────────────────────────────
function ExerciseCard({ exercise, showDetail }: { exercise: Exercise; showDetail?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = CAT_ICONS[exercise.category] || Dumbbell;
  const colors = CAT_COLORS[exercise.category] || "text-muted-foreground bg-secondary";

  return (
    <div className="bg-secondary border border-border/50 rounded-xl overflow-hidden">
      <div
        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-secondary/80 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colors}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{exercise.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-muted-foreground">{exercise.sets} sets × {exercise.reps}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">Rest: {exercise.rest}</span>
            {exercise.tempo && <>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">Tempo: {exercise.tempo}</span>
            </>}
          </div>
        </div>
        {showDetail && (
          <button className="text-muted-foreground hover:text-foreground ml-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && showDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              {exercise.cues.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1.5 uppercase tracking-wide">Coaching Cues</p>
                  <div className="space-y-1">
                    {exercise.cues.map((cue, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <p className="text-xs text-muted-foreground">{cue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-card rounded-lg p-2.5">
                <p className="text-xs font-medium text-foreground mb-1">Sport Carryover</p>
                <p className="text-xs text-muted-foreground">{exercise.sportCarryover}</p>
              </div>
              {exercise.ageNote && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                  <p className="text-xs text-amber-600">{exercise.ageNote}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {exercise.equipment.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">Equipment</p>
                    <p className="text-xs text-muted-foreground">{exercise.equipment.join(", ")}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Primary Muscles</p>
                  <p className="text-xs text-muted-foreground">{exercise.primaryMuscles.join(", ")}</p>
                </div>
              </div>
              {exercise.progressions.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium text-green-600 mb-1">↑ Progressions</p>
                    {exercise.progressions.map((p, i) => (
                      <p key={i} className="text-xs text-muted-foreground">• {p}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-600 mb-1">↓ Regressions</p>
                    {exercise.regressions.map((r, i) => (
                      <p key={i} className="text-xs text-muted-foreground">• {r}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Active Workout Mode ───────────────────────────────────────────────────────
function ActiveWorkout({
  session, onComplete, onClose
}: {
  session: WorkoutSession;
  onComplete: (rpe: number, notes: string, duration: number) => void;
  onClose: () => void;
}) {
  const [blockIdx, setBlockIdx] = useState(0);
  const [exIdx, setExIdx] = useState(0);
  const [setNum, setSetNum] = useState(1);
  const [timerSec, setTimerSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [restActive, setRestActive] = useState(false);
  const [restSec, setRestSec] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [rpe, setRpe] = useState([7]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimerSec(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  useEffect(() => {
    if (!restActive || restSec <= 0) return;
    const id = setInterval(() => setRestSec(s => {
      if (s <= 1) { setRestActive(false); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [restActive, restSec]);

  const allBlocks = session.blocks.filter(b => b.exercises.length > 0);
  const currentBlock = allBlocks[blockIdx];
  const currentEx = currentBlock?.exercises[exIdx];
  const totalExercises = allBlocks.reduce((s, b) => s + b.exercises.length, 0);
  let exCounter = 0;
  for (let b = 0; b < blockIdx; b++) exCounter += allBlocks[b]?.exercises.length || 0;
  exCounter += exIdx;
  const overallProgress = Math.round((exCounter / Math.max(1, totalExercises)) * 100);

  const nextExercise = () => {
    const totalSets = parseInt(currentEx?.sets || "1");
    if (setNum < totalSets) {
      setSetNum(s => s + 1);
      const restMatch = currentEx?.rest?.match(/(\d+)/);
      const restSeconds = restMatch ? parseInt(restMatch[1]) : 90;
      setRestSec(restSeconds < 10 ? restSeconds * 60 : restSeconds);
      setRestActive(true);
    } else {
      setSetNum(1);
      if (exIdx < (currentBlock?.exercises.length || 1) - 1) {
        setExIdx(i => i + 1);
      } else if (blockIdx < allBlocks.length - 1) {
        setBlockIdx(b => b + 1);
        setExIdx(0);
      } else {
        setShowComplete(true);
      }
    }
  };

  if (showComplete) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm w-full space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-display text-foreground">WORKOUT COMPLETE</h2>
            <p className="text-muted-foreground mt-1">{session.theme}</p>
            <p className="text-sm text-muted-foreground mt-1">{Math.floor(timerSec / 60)} minutes</p>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1.5">
                <Label className="text-xs">RPE (Rate of Perceived Exertion)</Label>
                <span className="text-xs font-display text-foreground">{rpe[0]}/10</span>
              </div>
              <Slider value={rpe} onValueChange={setRpe} min={1} max={10} step={1} />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Easy</span><span>Moderate</span><span>Max</span>
              </div>
            </div>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="text-sm" />
          </div>
          <Button variant="vault" size="lg" className="w-full" onClick={() => onComplete(rpe[0], notes, timerSec)}>
            <Check className="w-4 h-4 mr-2" /> Save Workout
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border safe-top">
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{session.theme}</p>
          <WorkoutTimer seconds={timerSec} running={timerRunning} />
        </div>
        <button onClick={() => setTimerRunning(r => !r)} className="text-muted-foreground hover:text-foreground">
          {timerRunning ? <Timer className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <Progress value={overallProgress} className="h-1" />
        <p className="text-xs text-muted-foreground mt-1">{exCounter}/{totalExercises} exercises</p>
      </div>

      {/* Current Exercise */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Block label */}
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{currentBlock?.name}</p>

        {currentEx && (
          <motion.div key={`${blockIdx}-${exIdx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-display text-foreground">{currentEx.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Set {setNum} of {currentEx.sets} · {currentEx.reps} reps
                </p>
              </div>
              <Badge className={CAT_COLORS[currentEx.category]}>{currentEx.category}</Badge>
            </div>

            {restActive && restSec > 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground mb-2">REST</p>
                <div className="text-5xl font-display text-amber-500">{restSec}</div>
                <p className="text-xs text-muted-foreground mt-1">seconds</p>
                <button onClick={() => { setRestActive(false); setRestSec(0); }} className="mt-4 text-xs text-primary underline">Skip Rest</button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-foreground mb-1.5 uppercase tracking-wide">Coaching Cues</p>
                  {currentEx.cues.map((cue, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p className="text-sm text-muted-foreground">{cue}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-primary/5 rounded-xl p-3">
                  <p className="text-xs font-medium text-foreground">Why This Matters</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentEx.sportCarryover}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Coach cue */}
        <div className="bg-secondary rounded-xl p-3">
          <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1.5">
            <Brain className="w-3 h-3 text-primary" /> Coach Says
          </p>
          <p className="text-xs text-muted-foreground italic">"{session.coachingCue}"</p>
        </div>

        {/* Upcoming */}
        {currentBlock?.exercises.slice(exIdx + 1, exIdx + 3).map((ex, i) => (
          <div key={i} className="opacity-40">
            <ExerciseCard exercise={ex} />
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="px-4 py-4 border-t border-border safe-bottom">
        <Button variant="vault" size="lg" className="w-full h-14 text-base" onClick={nextExercise} disabled={restActive && restSec > 5}>
          {restActive && restSec > 5 ? (
            <><Timer className="w-4 h-4 mr-2" /> Resting {restSec}s</>
          ) : parseInt(currentEx?.sets || "1") > setNum ? (
            <><RefreshCw className="w-4 h-4 mr-2" /> Next Set ({setNum + 1}/{currentEx?.sets})</>
          ) : (
            <><ChevronRight className="w-4 h-4 mr-2" /> Next Exercise</>
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const StrengthConditioning = () => {
  const navigate = useNavigate();
  const { sport } = useSport();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("programs");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
      if (user?.id) loadLogs(user.id);
    });
  }, []);

  const loadLogs = async (uid: string) => {
    const { data } = await supabase
      .from("sc_workout_logs" as any)
      .select("*")
      .eq("user_id", uid)
      .order("workout_date", { ascending: false })
      .limit(30);
    setLogs((data as any[]) || []);
  };

  const saveWorkout = async (rpe: number, notes: string, durationSec: number) => {
    if (!userId || !activeSession) return;
    setSaving(true);
    try {
      await supabase.from("sc_workout_logs" as any).insert({
        user_id: userId,
        program_id: selectedProgram?.id || null,
        workout_date: new Date().toISOString().split("T")[0],
        duration_minutes: Math.round(durationSec / 60),
        rpe,
        notes: notes || null,
        exercises_completed: activeSession.blocks.flatMap(b => b.exercises.map(e => ({ name: e.name, sets: e.sets, reps: e.reps }))),
      });
      toast.success("Workout saved!");
      setActiveSession(null);
      setSelectedProgram(null);
      if (userId) loadLogs(userId);
    } finally {
      setSaving(false);
    }
  };

  // Filter programs
  const filteredPrograms = PROGRAMS.filter(p => {
    if (sport && p.sport !== "both" && p.sport !== sport) return false;
    if (phaseFilter !== "all" && p.phase !== phaseFilter) return false;
    if (difficultyFilter !== "all" && p.difficulty !== difficultyFilter) return false;
    if (positionFilter !== "all" && !p.positions.includes(positionFilter as any) && !p.positions.includes("all" as any)) return false;
    return true;
  });

  const totalMinutes = logs.reduce((s, l) => s + (l.duration_minutes || 0), 0);
  const avgRpe = logs.length > 0 ? (logs.reduce((s, l) => s + (l.rpe || 0), 0) / logs.length).toFixed(1) : "—";

  const profiles = sport === "softball" ? SOFTBALL_POSITION_PROFILES : POSITION_PROFILES;

  if (activeSession) {
    return (
      <ActiveWorkout
        session={activeSession}
        onComplete={saveWorkout}
        onClose={() => setActiveSession(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6 pt-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-display text-foreground">STRENGTH & CONDITIONING</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Position-specific training programs for {sport === "softball" ? "softball" : "baseball"} athletes
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "WORKOUTS", value: logs.length.toString(), icon: Dumbbell },
                { label: "TOTAL MIN", value: totalMinutes.toString(), icon: Clock },
                { label: "AVG RPE", value: avgRpe.toString(), icon: Flame },
              ].map(stat => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
                  <stat.icon className="w-4 h-4 mx-auto mb-1.5 text-primary" />
                  <div className="text-2xl font-display text-foreground">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground font-medium tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="programs" className="text-xs">Programs</TabsTrigger>
                <TabsTrigger value="positions" className="text-xs">By Position</TabsTrigger>
                <TabsTrigger value="library" className="text-xs">Exercise Library</TabsTrigger>
                <TabsTrigger value="log" className="text-xs">My Log</TabsTrigger>
              </TabsList>

              {/* ── PROGRAMS TAB ── */}
              <TabsContent value="programs" className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-3 gap-2">
                  <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Phase" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Phases</SelectItem>
                      <SelectItem value="off_season">Off-Season</SelectItem>
                      <SelectItem value="pre_season">Pre-Season</SelectItem>
                      <SelectItem value="in_season">In-Season</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Position" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      <SelectItem value="pitcher">Pitcher</SelectItem>
                      <SelectItem value="catcher">Catcher</SelectItem>
                      <SelectItem value="shortstop">Shortstop</SelectItem>
                      <SelectItem value="outfield">Outfield</SelectItem>
                      <SelectItem value="utility">Utility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Program Cards */}
                <div className="space-y-4">
                  {filteredPrograms.map(program => (
                    <motion.div
                      key={program.id}
                      layout
                      className="bg-card border border-border rounded-2xl overflow-hidden"
                    >
                      {/* Program Header */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-display text-lg text-foreground">{program.name}</h3>
                              <Badge className={`text-[10px] ${DIFFICULTY_COLORS[program.difficulty]}`}>{program.difficulty}</Badge>
                              <Badge variant="outline" className="text-[10px]">{PHASE_LABELS[program.phase]}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{program.subtitle}</p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{program.description}</p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{program.durationWeeks} weeks</span>
                          <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{program.sessionsPerWeek}×/week</span>
                          <span className="flex items-center gap-1"><Target className="w-3 h-3" />{program.primaryGoal}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="vault"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedProgram(program);
                              setExpandedProgram(program.id);
                            }}
                          >
                            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> View Program
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProgram(program);
                              setActiveSession(program.weeklyStructure[0]);
                            }}
                          >
                            <Play className="w-3.5 h-3.5 mr-1.5" /> Start Day 1
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Program Detail */}
                      <AnimatePresence>
                        {expandedProgram === program.id && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-border p-5 space-y-5">
                              {/* Key Metrics */}
                              <div>
                                <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-2">Key Tracking Metrics</p>
                                <div className="flex flex-wrap gap-2">
                                  {program.keyMetrics.map((m, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{m}</Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Weekly Structure */}
                              <div>
                                <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-3">Weekly Structure</p>
                                <div className="space-y-3">
                                  {program.weeklyStructure.map((session, si) => (
                                    <div key={session.id} className="bg-secondary rounded-xl p-3">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <p className="text-sm font-medium text-foreground">{session.day}</p>
                                          <p className="text-xs text-muted-foreground">{session.theme}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground">{session.totalTime}</span>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs"
                                            onClick={() => {
                                              setSelectedProgram(program);
                                              setActiveSession(session);
                                            }}
                                          >
                                            <Play className="w-3 h-3 mr-1" /> Start
                                          </Button>
                                        </div>
                                      </div>
                                      {session.blocks.map((block, bi) => (
                                        block.exercises.length > 0 && (
                                          <div key={bi} className="mt-2">
                                            <p className="text-xs text-muted-foreground font-medium mb-1">{block.name} · {block.duration}</p>
                                            <div className="space-y-1.5">
                                              {block.exercises.map((ex, ei) => (
                                                <ExerciseCard key={ei} exercise={ex} showDetail />
                                              ))}
                                            </div>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Notes */}
                              {program.progressionNotes && (
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                                  <p className="text-xs font-medium text-blue-600 mb-1">Progression Notes</p>
                                  <p className="text-xs text-muted-foreground">{program.progressionNotes}</p>
                                </div>
                              )}
                              {program.warningNotes && (
                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                                  <p className="text-xs font-medium text-amber-600 mb-1">⚠ Coach Notes</p>
                                  <p className="text-xs text-muted-foreground">{program.warningNotes}</p>
                                </div>
                              )}

                              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setExpandedProgram(null)}>
                                Collapse <ChevronUp className="w-3 h-3 ml-1" />
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}

                  {filteredPrograms.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Dumbbell className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p>No programs match your filters</p>
                      <button onClick={() => { setPhaseFilter("all"); setDifficultyFilter("all"); setPositionFilter("all"); }} className="text-xs text-primary mt-2 underline">Clear filters</button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ── POSITION PROFILES TAB ── */}
              <TabsContent value="positions" className="space-y-4">
                <p className="text-sm text-muted-foreground">Position-specific training priorities, key metrics, and recruiting benchmarks.</p>
                {Object.entries(profiles).map(([posKey, profile]) => (
                  <div key={posKey} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{profile.icon}</span>
                      <div>
                        <h3 className="font-display text-foreground">{profile.displayName}</h3>
                        <p className="text-xs text-muted-foreground">{profile.trainingPriority}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-2">Primary Demands</p>
                        <div className="space-y-1">
                          {profile.primaryDemands.map((d, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <span className="text-xs text-muted-foreground">{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-2">Recruiting Metrics</p>
                        <div className="space-y-1">
                          {profile.recruitingMetrics.map((m, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <TrendingUp className="w-3 h-3 text-green-500 shrink-0" />
                              <span className="text-xs text-muted-foreground">{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-2">Key Strength Exercises</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.keyStrengths.map((s, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-2">Key Speed Work</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.keySpeed.map((s, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 bg-secondary rounded-xl p-3">
                      <p className="text-xs font-medium text-foreground mb-1">Mobility Priorities</p>
                      <p className="text-xs text-muted-foreground">{profile.keyMobility.join(" · ")}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* ── EXERCISE LIBRARY TAB ── */}
              <TabsContent value="library" className="space-y-4">
                <p className="text-sm text-muted-foreground">Full exercise library with coaching cues, sport carryover context, and progressions/regressions.</p>
                {(["strength", "power", "speed", "agility", "conditioning", "mobility", "arm_care"] as const).map(cat => {
                  const catExercises = Object.values(EXERCISES).filter(e => e.category === cat);
                  if (!catExercises.length) return null;
                  const Icon = CAT_ICONS[cat];
                  const colors = CAT_COLORS[cat];
                  return (
                    <div key={cat}>
                      <div className={`flex items-center gap-2 mb-3`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-display text-foreground capitalize">{cat.replace("_", " ")}</h3>
                        <Badge variant="outline" className="text-xs">{catExercises.length} exercises</Badge>
                      </div>
                      <div className="space-y-2 mb-5">
                        {catExercises.map(ex => (
                          <ExerciseCard key={ex.id} exercise={ex} showDetail />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              {/* ── WORKOUT LOG TAB ── */}
              <TabsContent value="log" className="space-y-3">
                {logs.length === 0 ? (
                  <div className="text-center py-12">
                    <Dumbbell className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground">No workouts logged yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Start a program above to begin tracking.</p>
                  </div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex flex-col items-center justify-center shrink-0">
                        <p className="text-xs font-medium text-foreground">{new Date(log.workout_date).toLocaleDateString("en-US", { month: "short" })}</p>
                        <p className="text-lg font-display text-foreground leading-none">{new Date(log.workout_date).getDate()}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {log.duration_minutes && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {log.duration_minutes} min
                            </span>
                          )}
                          {log.rpe && <Badge variant="outline" className="text-xs">RPE {log.rpe}</Badge>}
                        </div>
                        {log.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{log.notes}</p>}
                        {log.exercises_completed?.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">{log.exercises_completed.length} exercises completed</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StrengthConditioning;
