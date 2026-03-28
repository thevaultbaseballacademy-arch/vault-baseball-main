import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Brain, Target, BookOpen, Smile, Frown, Meh,
  Plus, Check, Loader2, TrendingUp, Calendar, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MentalLog {
  id: string;
  log_date: string;
  confidence_level: number;
  focus_level: number;
  motivation_level: number;
  anxiety_level: number;
  pre_game_routine_completed: boolean;
  visualization_minutes: number;
  notes: string | null;
}

interface MentalGoal {
  id: string;
  goal_type: string;
  title: string;
  description: string | null;
  target_date: string | null;
  is_completed: boolean;
  priority: number;
}

interface JournalEntry {
  id: string;
  entry_date: string;
  title: string | null;
  content: string;
  mood: number | null;
  tags: string[];
}

const MentalPerformance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logs, setLogs] = useState<MentalLog[]>([]);
  const [goals, setGoals] = useState<MentalGoal[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [confidence, setConfidence] = useState([7]);
  const [focus, setFocus] = useState([7]);
  const [motivation, setMotivation] = useState([7]);
  const [anxiety, setAnxiety] = useState([3]);
  const [routineCompleted, setRoutineCompleted] = useState(false);
  const [vizMinutes, setVizMinutes] = useState("");
  const [logNotes, setLogNotes] = useState("");

  const [goalTitle, setGoalTitle] = useState("");
  const [goalType, setGoalType] = useState("performance");
  const [goalDesc, setGoalDesc] = useState("");

  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalMood, setJournalMood] = useState([7]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [logsRes, goalsRes, journalRes] = await Promise.all([
      supabase.from("mental_performance_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(14),
      supabase.from("mental_goals").select("*").eq("user_id", user.id).order("priority").limit(20),
      supabase.from("journal_entries").select("*").eq("user_id", user.id).order("entry_date", { ascending: false }).limit(20),
    ]);
    setLogs((logsRes.data as any[]) || []);
    setGoals((goalsRes.data as any[]) || []);
    setJournal((journalRes.data as any[]) || []);
    setLoading(false);
  };

  const saveLog = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("mental_performance_logs").upsert({
      user_id: user.id,
      log_date: new Date().toISOString().split("T")[0],
      confidence_level: confidence[0],
      focus_level: focus[0],
      motivation_level: motivation[0],
      anxiety_level: anxiety[0],
      pre_game_routine_completed: routineCompleted,
      visualization_minutes: parseInt(vizMinutes) || 0,
      notes: logNotes || null,
    } as any, { onConflict: "user_id,log_date" });
    if (!error) {
      toast({ title: "Mental check-in saved" });
      loadData();
    }
    setSaving(false);
  };

  const addGoal = async () => {
    if (!goalTitle) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("mental_goals").insert({
      user_id: user.id,
      title: goalTitle,
      goal_type: goalType,
      description: goalDesc || null,
      priority: goals.length + 1,
    } as any);
    setGoalTitle(""); setGoalDesc("");
    toast({ title: "Goal added" });
    loadData();
  };

  const toggleGoal = async (id: string, completed: boolean) => {
    await supabase.from("mental_goals").update({
      is_completed: !completed,
      completed_at: !completed ? new Date().toISOString() : null,
    } as any).eq("id", id);
    loadData();
  };

  const saveJournal = async () => {
    if (!journalContent) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("journal_entries").insert({
      user_id: user.id,
      title: journalTitle || null,
      content: journalContent,
      mood: journalMood[0],
      entry_date: new Date().toISOString().split("T")[0],
    } as any);
    setJournalTitle(""); setJournalContent("");
    toast({ title: "Journal entry saved" });
    loadData();
  };

  const moodIcon = (val: number) => {
    if (val >= 7) return <Smile className="w-4 h-4 text-green-600" />;
    if (val >= 4) return <Meh className="w-4 h-4 text-amber-500" />;
    return <Frown className="w-4 h-4 text-destructive" />;
  };

  const avgScore = logs.length > 0
    ? Math.round(logs.slice(0, 7).reduce((s, l) =>
        s + ((l.confidence_level + l.focus_level + l.motivation_level + (10 - l.anxiety_level)) / 4), 0) / Math.min(logs.length, 7))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display text-foreground">MENTAL PERFORMANCE</h1>
              <p className="text-muted-foreground">Confidence · Focus · Goals · Journal</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-card border border-border p-4 text-center">
                <Brain className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-display text-foreground">{avgScore || "—"}</div>
                <div className="text-[10px] text-muted-foreground font-display">MENTAL SCORE</div>
              </div>
              <div className="bg-card border border-border p-4 text-center">
                <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-display text-foreground">{goals.filter(g => g.is_completed).length}/{goals.length}</div>
                <div className="text-[10px] text-muted-foreground font-display">GOALS DONE</div>
              </div>
              <div className="bg-card border border-border p-4 text-center">
                <BookOpen className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-display text-foreground">{journal.length}</div>
                <div className="text-[10px] text-muted-foreground font-display">ENTRIES</div>
              </div>
              <div className="bg-card border border-border p-4 text-center">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-display text-foreground">{logs.length}</div>
                <div className="text-[10px] text-muted-foreground font-display">CHECK-INS</div>
              </div>
            </div>

            <Tabs defaultValue="checkin" className="space-y-4">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="checkin" className="font-display text-xs">CHECK-IN</TabsTrigger>
                <TabsTrigger value="goals" className="font-display text-xs">GOALS</TabsTrigger>
                <TabsTrigger value="journal" className="font-display text-xs">JOURNAL</TabsTrigger>
                <TabsTrigger value="history" className="font-display text-xs">HISTORY</TabsTrigger>
              </TabsList>

              {/* Check-In Tab */}
              <TabsContent value="checkin" className="space-y-4">
                <div className="bg-card border border-border p-6 space-y-5">
                  <h3 className="font-display text-foreground flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" /> Daily Mental Check-In
                  </h3>
                  {[
                    { label: "Confidence", value: confidence, setter: setConfidence, desc: "How confident do you feel today?" },
                    { label: "Focus", value: focus, setter: setFocus, desc: "How well can you lock in?" },
                    { label: "Motivation", value: motivation, setter: setMotivation, desc: "How driven are you right now?" },
                    { label: "Anxiety", value: anxiety, setter: setAnxiety, desc: "Stress/nervousness level (lower is better)" },
                  ].map(({ label, value, setter, desc }) => (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1">
                        <Label className="text-xs text-muted-foreground">{label}</Label>
                        <span className="text-sm font-display text-foreground">{value[0]}/10</span>
                      </div>
                      <Slider value={value} onValueChange={setter} min={1} max={10} step={1} />
                      <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <Switch checked={routineCompleted} onCheckedChange={setRoutineCompleted} />
                    <Label className="text-sm">Pre-game routine completed</Label>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Visualization (minutes)</Label>
                    <Input type="number" value={vizMinutes} onChange={(e) => setVizMinutes(e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <Textarea value={logNotes} onChange={(e) => setLogNotes(e.target.value)} rows={2} placeholder="What's on your mind..." />
                  </div>
                  <Button onClick={saveLog} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    Save Check-In
                  </Button>
                </div>
              </TabsContent>

              {/* Goals Tab */}
              <TabsContent value="goals" className="space-y-4">
                <div className="bg-card border border-border p-6 space-y-4">
                  <h3 className="font-display text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> Performance Goals
                  </h3>
                  <div className="flex gap-2">
                    <Input value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="New goal..." className="flex-1" />
                    <Select value={goalType} onValueChange={setGoalType}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="process">Process</SelectItem>
                        <SelectItem value="outcome">Outcome</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addGoal} size="icon"><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-2">
                    {goals.map(g => (
                      <div key={g.id} className={`flex items-center gap-3 p-3 border border-border ${g.is_completed ? "bg-secondary" : "bg-card"}`}>
                        <button onClick={() => toggleGoal(g.id, g.is_completed)}
                          className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 ${g.is_completed ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                          {g.is_completed && <Check className="w-3 h-3 text-primary-foreground" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-display ${g.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{g.title}</p>
                          {g.description && <p className="text-xs text-muted-foreground">{g.description}</p>}
                        </div>
                        <Badge variant="outline" className="text-[10px] capitalize">{g.goal_type}</Badge>
                      </div>
                    ))}
                    {goals.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No goals yet. Add your first one above.</p>}
                  </div>
                </div>
              </TabsContent>

              {/* Journal Tab */}
              <TabsContent value="journal" className="space-y-4">
                <div className="bg-card border border-border p-6 space-y-4">
                  <h3 className="font-display text-foreground flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" /> Performance Journal
                  </h3>
                  <Input value={journalTitle} onChange={(e) => setJournalTitle(e.target.value)} placeholder="Entry title (optional)" />
                  <div>
                    <div className="flex justify-between mb-1">
                      <Label className="text-xs text-muted-foreground">Mood</Label>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">{moodIcon(journalMood[0])} {journalMood[0]}/10</span>
                    </div>
                    <Slider value={journalMood} onValueChange={setJournalMood} min={1} max={10} step={1} />
                  </div>
                  <Textarea value={journalContent} onChange={(e) => setJournalContent(e.target.value)} rows={5}
                    placeholder="Reflect on today's training, games, or mental state..." />
                  <Button onClick={saveJournal} disabled={!journalContent} className="w-full">
                    <BookOpen className="w-4 h-4 mr-2" /> Save Entry
                  </Button>
                </div>
                <div className="space-y-2">
                  {journal.map(j => (
                    <div key={j.id} className="bg-card border border-border p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{new Date(j.entry_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        {j.mood && moodIcon(j.mood)}
                      </div>
                      {j.title && <h4 className="font-display text-sm text-foreground mb-1">{j.title}</h4>}
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{j.content}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-2">
                {logs.map(l => (
                  <div key={l.id} className="bg-card border border-border p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{new Date(l.log_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                      <span className="text-xs font-display text-foreground">
                        Score: {Math.round((l.confidence_level + l.focus_level + l.motivation_level + (10 - l.anxiety_level)) / 4)}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div><div className="text-foreground font-display">{l.confidence_level}</div><div className="text-muted-foreground">Conf</div></div>
                      <div><div className="text-foreground font-display">{l.focus_level}</div><div className="text-muted-foreground">Focus</div></div>
                      <div><div className="text-foreground font-display">{l.motivation_level}</div><div className="text-muted-foreground">Motiv</div></div>
                      <div><div className="text-foreground font-display">{l.anxiety_level}</div><div className="text-muted-foreground">Anxiety</div></div>
                    </div>
                    {l.notes && <p className="text-xs text-muted-foreground mt-2">{l.notes}</p>}
                  </div>
                ))}
                {logs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No check-ins yet. Start your first one today.</p>}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MentalPerformance;
