import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Loader2, TrendingUp, Target, BarChart3, Calendar } from "lucide-react";
import { useSoftballProfile } from "@/hooks/useSoftballProfile";

interface KpiEntry {
  kpi_name: string;
  kpi_category: string;
  kpi_value: number;
  kpi_unit: string | null;
  recorded_at: string;
}

interface LessonOutcome {
  id: string;
  skill_category: string;
  strengths_noted: string[];
  weaknesses_noted: string[];
  created_at: string;
}

// KPI categories differ by format
const fastpitchKpiCategories = [
  { key: "pitching", label: "Pitching", metrics: ["Pitch Speed", "Spin Rate", "Rise Ball Velo", "Command %"] },
  { key: "hitting", label: "Hitting", metrics: ["Exit Velocity", "Bat Speed", "Slap Speed", "Contact Rate"] },
  { key: "fielding", label: "Fielding", metrics: ["Throw Velocity", "Reaction Time", "Range Factor", "Fielding %"] },
  { key: "baserunning", label: "Baserunning", metrics: ["Home to First", "Stolen Base Rate", "Secondary Lead"] },
];

const slowpitchKpiCategories = [
  { key: "hitting", label: "Hitting", metrics: ["Exit Velocity", "Bat Speed", "Launch Angle", "Home Runs"] },
  { key: "fielding", label: "Fielding", metrics: ["Throw Velocity", "Reaction Time", "Range Factor", "Fielding %"] },
];

const SoftballAnalytics = () => {
  const navigate = useNavigate();
  const { user, format, ageGroup, visibility, loading: profileLoading } = useSoftballProfile();
  const [kpis, setKpis] = useState<KpiEntry[]>([]);
  const [outcomes, setOutcomes] = useState<LessonOutcome[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const kpiRes = await supabase.from("athlete_kpis").select("kpi_name, kpi_category, kpi_value, kpi_unit, recorded_at")
        .eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(50);
      const outcomeRes = await (supabase as any).from("lesson_outcomes").select("id, skill_category, strengths_noted, weaknesses_noted, created_at")
        .eq("athlete_user_id", user.id).eq("sport_type", "softball").order("created_at", { ascending: false }).limit(20);
      const skillRes = await (supabase as any).from("skill_progression").select("*")
        .eq("user_id", user.id).eq("sport_type", "softball");

      if (kpiRes.data) setKpis(kpiRes.data as KpiEntry[]);
      if (outcomeRes.data) setOutcomes(outcomeRes.data as LessonOutcome[]);
      if (skillRes.data) setSkills(skillRes.data);
      setLoading(false);
    };
    load();
  }, [user]);

  // Select KPI categories based on format
  const kpiCategories = format === "slowpitch" ? slowpitchKpiCategories : fastpitchKpiCategories;

  // Filter skills by format visibility
  const visibleSkills = skills.filter((s: any) => {
    if (format === "slowpitch" && s.skill_category === "pitching") return false;
    if (format === "slowpitch" && s.skill_category === "baserunning") return false;
    return true;
  });

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/softball")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Softball
          </Button>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <p className="text-xs font-display tracking-[0.3em] text-muted-foreground mb-2">VAULT SOFTBALL</p>
            <h1 className="text-3xl md:text-4xl font-display tracking-tight text-foreground">
              ANALYTICS & PROGRESS
            </h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xl">
              Track your {format} softball development across {format === "slowpitch" ? "hitting and fielding" : "pitching, hitting, fielding, and baserunning"}.
            </p>
          </motion.div>

          <div className="flex gap-2 mb-6">
            <Badge variant="outline" className="text-[10px] font-display capitalize">{format}</Badge>
            {ageGroup && <Badge variant="secondary" className="text-[10px] font-display">{ageGroup}</Badge>}
          </div>

          {/* Skill Progression Overview */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {visibleSkills.length > 0 ? visibleSkills.map((skill: any) => (
              <Card key={skill.skill_category} className="border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-sm tracking-wider uppercase text-foreground">{skill.skill_category}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-display text-foreground">{skill.current_score}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                      {skill.trend === "improving" && <TrendingUp className="w-3 h-3 text-primary ml-1" />}
                    </div>
                  </div>
                  <Progress value={skill.current_score} className="h-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">{skill.sessions_count} sessions · Last: {new Date(skill.last_session_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            )) : (
              <Card className="border-border md:col-span-2">
                <CardContent className="py-10 text-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No skill data yet. Complete lessons or assessments to start tracking.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Tabs defaultValue="kpis" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="kpis" className="font-display text-xs tracking-wider">KPI METRICS</TabsTrigger>
              <TabsTrigger value="sessions" className="font-display text-xs tracking-wider">SESSION HISTORY</TabsTrigger>
            </TabsList>

            <TabsContent value="kpis" className="mt-6">
              {kpiCategories.map(cat => {
                const catKpis = kpis.filter(k => k.kpi_category.toLowerCase() === cat.key);
                if (catKpis.length === 0) return null;
                return (
                  <Card key={cat.key} className="border-border mb-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-sm tracking-wider">{cat.label.toUpperCase()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {catKpis.slice(0, 5).map((kpi, i) => (
                          <div key={i} className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0">
                            <span className="text-foreground">{kpi.kpi_name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-display text-foreground">{kpi.kpi_value}</span>
                              {kpi.kpi_unit && <span className="text-xs text-muted-foreground">{kpi.kpi_unit}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {kpis.length === 0 && (
                <Card className="border-border">
                  <CardContent className="py-10 text-center">
                    <Target className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No KPI data recorded yet. Log metrics from your lessons and assessments.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sessions" className="mt-6">
              {outcomes.length > 0 ? (
                <div className="space-y-3">
                  {outcomes.map((outcome) => (
                    <Card key={outcome.id} className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-[10px] font-display capitalize">{outcome.skill_category}</Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(outcome.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {outcome.strengths_noted?.length > 0 && (
                          <div className="mb-2">
                            <span className="text-[10px] text-primary font-display">STRENGTHS: </span>
                            <span className="text-xs text-muted-foreground">{outcome.strengths_noted.join(", ")}</span>
                          </div>
                        )}
                        {outcome.weaknesses_noted?.length > 0 && (
                          <div>
                            <span className="text-[10px] text-accent-foreground font-display">WORK ON: </span>
                            <span className="text-xs text-muted-foreground">{outcome.weaknesses_noted.join(", ")}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-border">
                  <CardContent className="py-10 text-center">
                    <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No session history yet. Book a lesson to get started.</p>
                    <Button size="sm" className="mt-3 font-display tracking-wider text-xs" onClick={() => navigate("/softball/lessons/booking")}>
                      BOOK A LESSON
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default SoftballAnalytics;
