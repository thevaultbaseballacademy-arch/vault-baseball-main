import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ClipboardList, Plus, Trash2, Clock,
  Check, Loader2, GripVertical, Play, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSport } from "@/contexts/SportContext";
import { useTeamManagement } from "@/hooks/useTeamManagement";

interface PlanBlock {
  name: string;
  duration_min: number;
  drills: string[];
  notes: string;
}

interface PracticePlan {
  id: string;
  title: string;
  practice_date: string;
  duration_minutes: number;
  focus_areas: string[];
  plan_blocks: PlanBlock[];
  status: string;
  notes: string | null;
}

const DEFAULT_BLOCKS: PlanBlock[] = [
  { name: "Warm-Up", duration_min: 10, drills: ["Dynamic stretching", "Light toss"], notes: "" },
  { name: "Skill Work", duration_min: 25, drills: [], notes: "" },
  { name: "Team Drills", duration_min: 25, drills: [], notes: "" },
  { name: "Live Reps", duration_min: 20, drills: [], notes: "" },
  { name: "Cool Down", duration_min: 10, drills: ["Static stretching", "Team talk"], notes: "" },
];

const PracticePlanBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sport } = useSport();
  const { teams } = useTeamManagement();
  const [plans, setPlans] = useState<PracticePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [practiceDate, setPracticeDate] = useState(new Date().toISOString().split("T")[0]);
  const [totalDuration, setTotalDuration] = useState("90");
  const [blocks, setBlocks] = useState<PlanBlock[]>(DEFAULT_BLOCKS);
  const [planNotes, setPlanNotes] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [focusAreas, setFocusAreas] = useState("");

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("practice_plans").select("*").eq("coach_user_id", user.id).order("practice_date", { ascending: false }).limit(20);
    setPlans((data as any[]) || []);
    setLoading(false);
  };

  const addBlock = () => {
    setBlocks([...blocks, { name: "New Block", duration_min: 15, drills: [], notes: "" }]);
  };

  const removeBlock = (idx: number) => {
    setBlocks(blocks.filter((_, i) => i !== idx));
  };

  const updateBlock = (idx: number, field: keyof PlanBlock, value: any) => {
    const updated = [...blocks];
    (updated[idx] as any)[field] = value;
    setBlocks(updated);
  };

  const addDrill = (blockIdx: number, drill: string) => {
    if (!drill) return;
    const updated = [...blocks];
    updated[blockIdx].drills.push(drill);
    setBlocks(updated);
  };

  const removeDrill = (blockIdx: number, drillIdx: number) => {
    const updated = [...blocks];
    updated[blockIdx].drills.splice(drillIdx, 1);
    setBlocks(updated);
  };

  const savePlan = async () => {
    if (!title) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("practice_plans").insert({
      coach_user_id: user.id,
      team_id: selectedTeamId || null,
      title,
      practice_date: practiceDate,
      duration_minutes: parseInt(totalDuration) || 90,
      focus_areas: focusAreas ? focusAreas.split(",").map(s => s.trim()) : [],
      plan_blocks: blocks as any,
      sport_type: sport,
      notes: planNotes || null,
      status: "draft",
    } as any);
    if (!error) {
      toast({ title: "Practice plan saved" });
      setTitle(""); setPlanNotes(""); setFocusAreas("");
      setBlocks(DEFAULT_BLOCKS);
      loadPlans();
    }
    setSaving(false);
  };

  const blockTotal = blocks.reduce((s, b) => s + b.duration_min, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/team")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Team Hub
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display text-foreground">PRACTICE PLAN BUILDER</h1>
              <p className="text-muted-foreground">Design structured practice sessions</p>
            </div>

            <div className="bg-card border border-border p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Practice Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pre-Game Day Practice" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <Input type="date" value={practiceDate} onChange={(e) => setPracticeDate(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total Duration (min)</Label>
                  <Input type="number" value={totalDuration} onChange={(e) => setTotalDuration(e.target.value)} />
                </div>
                {teams.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Team</Label>
                    <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                      <SelectTrigger><SelectValue placeholder="Select team..." /></SelectTrigger>
                      <SelectContent>
                        {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Focus Areas (comma separated)</Label>
                <Input value={focusAreas} onChange={(e) => setFocusAreas(e.target.value)} placeholder="Hitting, Base Running, Situational Defense" />
              </div>

              {/* Plan Blocks */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-foreground text-sm flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" /> PLAN BLOCKS
                    <span className="text-xs text-muted-foreground">({blockTotal} min total)</span>
                  </h3>
                  <Button size="sm" variant="outline" onClick={addBlock}>
                    <Plus className="w-3 h-3 mr-1" /> Add Block
                  </Button>
                </div>

                {blocks.map((block, idx) => (
                  <div key={idx} className="bg-secondary p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Input value={block.name} onChange={(e) => updateBlock(idx, "name", e.target.value)}
                        className="flex-1 font-display text-sm h-8" />
                      <div className="flex items-center gap-1 shrink-0">
                        <Input type="number" value={block.duration_min}
                          onChange={(e) => updateBlock(idx, "duration_min", parseInt(e.target.value) || 0)}
                          className="w-16 h-8 text-center text-xs" />
                        <span className="text-[10px] text-muted-foreground">min</span>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeBlock(idx)}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                    <div className="ml-6 space-y-1">
                      {block.drills.map((drill, di) => (
                        <div key={di} className="flex items-center gap-2 text-xs">
                          <Play className="w-3 h-3 text-muted-foreground" />
                          <span className="text-foreground flex-1">{drill}</span>
                          <button onClick={() => removeDrill(idx, di)} className="text-destructive hover:underline text-[10px]">×</button>
                        </div>
                      ))}
                      <div className="flex gap-1">
                        <Input placeholder="Add drill..." className="h-7 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addDrill(idx, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Coach Notes</Label>
                <Textarea value={planNotes} onChange={(e) => setPlanNotes(e.target.value)} rows={2} placeholder="Additional notes for this practice..." />
              </div>

              <Button onClick={savePlan} disabled={saving || !title} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Practice Plan
              </Button>
            </div>

            {/* Saved Plans */}
            {plans.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display text-foreground text-sm">SAVED PLANS</h3>
                {plans.map(plan => (
                  <div key={plan.id} className="bg-card border border-border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-display text-foreground text-sm">{plan.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(plan.practice_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          {" · "}{plan.duration_minutes} min
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-display capitalize">{plan.status}</Badge>
                    </div>
                    {plan.focus_areas.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {plan.focus_areas.map((a, i) => <Badge key={i} variant="secondary" className="text-[10px]">{a}</Badge>)}
                      </div>
                    )}
                    {plan.plan_blocks && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {(plan.plan_blocks as any[]).map((b: any, i: number) => (
                          <span key={i}>{b.name} ({b.duration_min}m){i < plan.plan_blocks.length - 1 ? " → " : ""}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PracticePlanBuilder;
