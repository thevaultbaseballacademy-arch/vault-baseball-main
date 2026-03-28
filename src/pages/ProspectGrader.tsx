import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, TrendingUp, Target, Zap, Trophy, Brain,
  ChevronRight, Loader2, Download, Share2, AlertTriangle,
  CheckCircle2, BarChart3, Calendar, Users, BookOpen,
  ArrowRight, Sparkles, Shield, Activity, Wind,
  Dumbbell, RefreshCw, Info, Lock, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/contexts/SportContext";
import { toast } from "sonner";
import {
  gradeKPI, computeOverallGrade, classifyLevel, computeYouthProjection,
  generateRoadmap, scaleLabel, BIOMECHANICAL_NOTES,
  type KPIGrade, type ProspectGradeReport, type SportType as GradeSportType,
} from "@/lib/prospectGrading";

const SYSTEM_PROMPT = `You are VAULT™ Prospect Analyst — an elite baseball and softball development intelligence system. 
You analyze athlete KPI data, coach notes, and biomechanical context to produce professional-grade prospect reports.

Your output must:
1. Be data-driven and honest — do not inflate grades to please families
2. Be age-appropriate — youth athletes need encouragement AND honesty
3. Reference specific KPI values and what they mean in context
4. Give actionable development recommendations tied to specific tools
5. Include biomechanical reasoning when discussing velocity or speed
6. Distinguish between PRESENT grade and FUTURE/CEILING projection
7. For youth athletes: explain "freshman/JV/varsity potential" in clear language families understand
8. For HS athletes: give D1/D2/D3/JUCO/pro probability assessments
9. Never make guarantees — always frame as projections with development dependencies

Always structure output as JSON with these exact keys:
{
  "executive_summary": "3-4 sentence professional summary",
  "strengths_narrative": "2-3 sentences on best tools",
  "gaps_narrative": "2-3 sentences on development areas",
  "parent_summary": "Plain language 3-4 sentence summary for parents/families",
  "biomechanical_insight": "2-3 sentences on what the data suggests mechanically",
  "comparable_type": "One sentence: athlete type comparison (not a specific player name)",
  "ceiling_statement": "One sentence on realistic ceiling with work",
  "timeline_assessment": "2-3 sentences on realistic development timeline",
  "d1_probability": number (0-100),
  "pro_probability": number (0-100),
  "primary_recommendation": "Most important next action",
  "coach_message": "Brief direct message to the athlete's coach"
}`;

// ── Gauge Component ───────────────────────────────────────────────────────────
function GradeGauge({ grade, size = 120 }: { grade: number; size?: number }) {
  const { color, label } = scaleLabel(grade);
  const pct = ((grade - 20) / 60) * 100;
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ * 0.75;
  const strokeLen = circ * 0.75;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size * 0.7 }}>
      <svg width={size} height={size * 0.7} className="overflow-visible">
        <defs>
          <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"
          strokeDasharray={strokeLen} strokeDashoffset={0}
          strokeLinecap="round" transform={`rotate(135 ${size/2} ${size/2})`} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={strokeLen} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(135 ${size/2} ${size/2})`}
          initial={{ strokeDashoffset: strokeLen }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
        <motion.span
          className="font-display leading-none"
          style={{ fontSize: size * 0.28, color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {grade}
        </motion.span>
        <span className="text-xs text-muted-foreground mt-0.5" style={{ fontSize: size * 0.095 }}>{label}</span>
      </div>
    </div>
  );
}

// ── Tool Bar ──────────────────────────────────────────────────────────────────
function ToolBar({ tool }: { tool: KPIGrade }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground font-medium">{tool.kpiName}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{tool.rawValue} {tool.unit}</span>
          <span className="font-display text-sm" style={{ color: tool.color }}>{tool.grade}</span>
          <Badge className="text-[10px] px-1.5 py-0" style={{ backgroundColor: tool.color + "20", color: tool.color, border: "none" }}>
            {tool.label}
          </Badge>
        </div>
      </div>
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: tool.color }}
          initial={{ width: 0 }}
          animate={{ width: `${((tool.grade - 20) / 60) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>vs D1: {tool.vsD1Standard}%</span>
        {tool.improvementNeededD1 !== null && (
          <span className="text-amber-600">+{tool.improvementNeededD1} {tool.unit} to D1</span>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const ProspectGrader = () => {
  const { sport } = useSport();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [coachNotes, setCoachNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<ProspectGradeReport | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Manual override inputs
  const [manualKPIs, setManualKPIs] = useState({
    exit_velocity: "", bat_speed: "", pitch_velocity: "",
    sixty_yard: "", pop_time: "", throw_velocity: "",
  });
  const [manualPosition, setManualPosition] = useState("");
  const [manualAge, setManualAge] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualGradYear, setManualGradYear] = useState("");
  const [useManual, setUseManual] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const [profileRes, kpiRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("athlete_kpis" as any).select("*")
          .eq("user_id", user.id)
          .order("recorded_at", { ascending: false })
          .limit(200),
      ]);

      setProfile(profileRes.data);
      setKpiData((kpiRes.data as any[]) || []);
      setLoading(false);
    });
  }, []);

  const buildReport = async () => {
    setAnalyzing(true);
    try {
      // Resolve KPI values — prefer manual if provided, else use DB
      const getVal = (key: string) => {
        if (useManual) return parseFloat((manualKPIs as any)[key]) || null;
        const entry = kpiData.find(k =>
          k.kpi_name.toLowerCase().replace(/[^a-z0-9]/g, "_").includes(key) ||
          k.kpi_name.toLowerCase().includes(key.replace("_", " "))
        );
        return entry?.kpi_value || null;
      };

      const pos = (useManual ? manualPosition : profile?.position) || "utility";
      const age = parseInt(useManual ? manualAge : String(profile?.age || "")) || null;
      const name = (useManual ? manualName : profile?.display_name) || "Athlete";
      const gradYear = parseInt(useManual ? manualGradYear : String(profile?.graduation_year || "")) || undefined;
      const ageGroup = age ? (age <= 12 ? "youth_12" : age <= 14 ? "youth_14" : age <= 16 ? "hs_jv" : "hs_var") : "hs_var";

      const kpiInputs: { name: string; key: string; unit: string }[] = [
        { name: "Exit Velocity", key: "exit_velocity", unit: "mph" },
        { name: "Bat Speed", key: "bat_speed", unit: "mph" },
        { name: "Pitch Velocity", key: "pitch_velocity", unit: "mph" },
        { name: "60-Yard Dash", key: "sixty_yard", unit: "sec" },
        { name: "Pop Time", key: "pop_time", unit: "sec" },
        { name: "Throw Velocity", key: "throw_velocity", unit: "mph" },
      ];

      const toolGrades: KPIGrade[] = [];
      for (const kpi of kpiInputs) {
        const val = getVal(kpi.key);
        if (val !== null && !isNaN(val)) {
          toolGrades.push(gradeKPI({
            name: kpi.name, value: val, unit: kpi.unit,
            age: age ?? undefined, position: pos,
            sport: sport as GradeSportType,
          }));
        }
      }

      if (toolGrades.length === 0) {
        toast.error("No KPI data found. Please enter metrics manually.");
        setUseManual(true);
        setAnalyzing(false);
        return;
      }

      const overallGrade = computeOverallGrade(toolGrades, pos);
      const levels = classifyLevel(overallGrade, age, sport as GradeSportType);
      const roadmap = generateRoadmap(toolGrades, overallGrade, pos);
      const { label, color } = scaleLabel(overallGrade);
      const percentile = Math.round(((overallGrade - 20) / 60) * 95) + 5;

      const youthProjection = age !== null && age <= 17
        ? computeYouthProjection(overallGrade, age, toolGrades)
        : undefined;

      const futureGrade = Math.min(80, overallGrade + (age !== null && age < 18 ? 8 : 4));
      const ofpGrade = Math.round((overallGrade * 0.4 + futureGrade * 0.6));

      const presentLevel: any = {
        level: levels.current, timeframe: "Now",
        probability: 85, requirements: [],
        isCurrentLevel: true,
      };
      const nextLevel: any = {
        level: levels.nextStep, timeframe: "6–18 months with development",
        probability: toolGrades.length >= 3 ? 65 : 50,
        requirements: roadmap.slice(0, 2).map(r => r.title),
        isCurrentLevel: false,
      };
      const ceilingLevel: any = {
        level: levels.ceiling, timeframe: age !== null && age < 17 ? "2–4 years" : "1–2 years",
        probability: 35, requirements: ["Consistent training", "Physical development"],
        isCurrentLevel: false,
      };

      // Build report skeleton (AI will fill narratives)
      const reportData: ProspectGradeReport = {
        athleteName: name, position: pos,
        age: age ?? null, ageGroup, sport: sport as GradeSportType,
        gradYear, reportDate: new Date().toLocaleDateString(),
        overallGrade, overallLabel: label, overallColor: color,
        overallPercentile: percentile,
        toolGrades, presentGrade: overallGrade, futureGrade, ofpGrade,
        currentLevel: presentLevel, nextLevelProjection: nextLevel,
        ceilingProjection: ceilingLevel, youthProjection,
        primaryGap: toolGrades.sort((a, b) => a.grade - b.grade)[0]?.kpiName || "General Development",
        secondaryGap: toolGrades.sort((a, b) => a.grade - b.grade)[1]?.kpiName || "Athleticism",
        primaryStrength: toolGrades.sort((a, b) => b.grade - a.grade)[0]?.kpiName || "Work Ethic",
        timelineMonths: roadmap[0]?.timeframe.includes("6") ? 6 : 12,
        timelineDescription: roadmap[0]?.timeframe || "6–12 months",
        developmentRoadmap: roadmap,
        executiveSummary: "",
        strengthsNarrative: "",
        gapsNarrative: "",
        parentFacingSummary: "",
        comparableType: "",
        coachNotesSummary: coachNotes,
      };

      setReport(reportData);

      // Now call AI for narratives
      const kpiSummary = toolGrades.map(t =>
        `${t.kpiName}: ${t.rawValue} ${t.unit} (Grade: ${t.grade}/80, ${t.label}, ${t.vsD1Standard}% of D1 standard)`
      ).join("\n");

      const prompt = `Analyze this ${sport} athlete prospect:

Name: ${name}
Age: ${age ?? "Unknown"} | Position: ${pos} | Grad Year: ${gradYear ?? "Unknown"}
Overall Grade: ${overallGrade}/80 (${label})
OFP (Overall Future Potential): ${ofpGrade}/80
Present Level: ${levels.current}
Ceiling Projection: ${levels.ceiling}
${youthProjection ? `School Level: Currently ${youthProjection.currentSchoolLevel} → Next: ${youthProjection.nextSchoolLevel}` : ""}

KPI DATA (20-80 scouting scale):
${kpiSummary}

Primary Strength: ${reportData.primaryStrength}
Primary Gap: ${reportData.primaryGap}
Secondary Gap: ${reportData.secondaryGap}

Coach Notes: ${coachNotes || "None provided"}

Development Roadmap:
${roadmap.map(r => `- ${r.title}: ${r.kpiTarget} (${r.timeframe})`).join("\n")}

Produce a professional prospect report in JSON format as specified.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((c: any) => c.text || "").join("") || "{}";
      const clean = text.replace(/```json|```/g, "").trim();

      try {
        const ai = JSON.parse(clean);
        setAiAnalysis(ai);
        setReport(prev => prev ? {
          ...prev,
          executiveSummary: ai.executive_summary || "",
          strengthsNarrative: ai.strengths_narrative || "",
          gapsNarrative: ai.gaps_narrative || "",
          parentFacingSummary: ai.parent_summary || "",
          comparableType: ai.comparable_type || "",
        } : prev);
      } catch {
        setAiAnalysis({ executive_summary: "Analysis complete. See grades above." });
      }

      setActiveTab("report");
      toast.success("Prospect report generated!");
    } catch (err: any) {
      toast.error("Analysis failed: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const POSITIONS_BB = ["Pitcher", "Catcher", "First Base", "Second Base", "Shortstop", "Third Base", "Outfield", "Utility"];
  const POSITIONS_SB = ["Pitcher", "Catcher", "Infield", "Outfield", "DP/Flex", "Utility"];
  const positions = sport === "softball" ? POSITIONS_SB : POSITIONS_BB;

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="flex items-center justify-center pt-40"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="pt-4 mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h1 className="text-2xl font-display text-foreground">PROSPECT GRADER™</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Development Intelligence · 20-80 Scouting Scale</p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="overview" className="text-xs">Setup</TabsTrigger>
              <TabsTrigger value="report" className="text-xs" disabled={!report}>Report</TabsTrigger>
              <TabsTrigger value="tools" className="text-xs" disabled={!report}>Tool Grades</TabsTrigger>
              <TabsTrigger value="roadmap" className="text-xs" disabled={!report}>Roadmap</TabsTrigger>
            </TabsList>

            {/* ── SETUP TAB ── */}
            <TabsContent value="overview" className="space-y-5">
              {/* Data Source Toggle */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-display text-foreground mb-3">Data Source</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setUseManual(false)}
                    className={`rounded-xl p-3 border text-left transition-all ${!useManual ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <p className="text-sm font-medium text-foreground">My VAULT™ Data</p>
                    <p className="text-xs text-muted-foreground">{kpiData.length} KPI records found</p>
                  </button>
                  <button
                    onClick={() => setUseManual(true)}
                    className={`rounded-xl p-3 border text-left transition-all ${useManual ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <p className="text-sm font-medium text-foreground">Enter Manually</p>
                    <p className="text-xs text-muted-foreground">Input metrics directly</p>
                  </button>
                </div>

                {useManual && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs mb-1 block">Athlete Name</Label>
                        <Input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Jake Morrison" className="h-9 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Age</Label>
                        <Input type="number" value={manualAge} onChange={e => setManualAge(e.target.value)} placeholder="16" className="h-9 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Position</Label>
                        <Select value={manualPosition} onValueChange={setManualPosition}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Position" /></SelectTrigger>
                          <SelectContent>{positions.map(p => <SelectItem key={p} value={p.toLowerCase().replace(" ", "_")}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Grad Year</Label>
                        <Input type="number" value={manualGradYear} onChange={e => setManualGradYear(e.target.value)} placeholder="2026" className="h-9 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "exit_velocity", label: "Exit Velocity", unit: "mph" },
                        { key: "bat_speed", label: "Bat Speed", unit: "mph" },
                        { key: "pitch_velocity", label: "Pitch Velocity", unit: "mph" },
                        { key: "sixty_yard", label: "60-Yard Dash", unit: "sec" },
                        { key: "pop_time", label: "Pop Time", unit: "sec" },
                        { key: "throw_velocity", label: "Throw Velocity", unit: "mph" },
                      ].map(kpi => (
                        <div key={kpi.key}>
                          <Label className="text-xs mb-1 block">{kpi.label} ({kpi.unit})</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={(manualKPIs as any)[kpi.key]}
                            onChange={e => setManualKPIs(prev => ({ ...prev, [kpi.key]: e.target.value }))}
                            placeholder="—"
                            className="h-9 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {!useManual && kpiData.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-foreground mb-2">Detected KPIs</p>
                    {kpiData.slice(0, 6).map((k, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 border-b border-border/50">
                        <span className="text-muted-foreground">{k.kpi_name}</span>
                        <span className="font-medium text-foreground">{k.kpi_value} {k.kpi_unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Coach Notes */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-display text-foreground mb-2">Coach Notes (Optional)</h3>
                <p className="text-xs text-muted-foreground mb-3">Add coach observations, mechanical notes, or context. AI will incorporate these into the analysis.</p>
                <Textarea
                  value={coachNotes}
                  onChange={e => setCoachNotes(e.target.value)}
                  placeholder="E.g., 'Hip-shoulder separation improving. Back foot rotation still inconsistent. Elite hands but struggles with off-speed recognition. Showed 88 mph at Oct showcase but mechanics broke down under fatigue...'"
                  rows={4}
                  className="text-sm resize-none"
                />
              </div>

              {/* Disclaimer */}
              <div className="bg-secondary border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Important: </span>
                  VAULT™ Prospect Grades are data-driven development projections, not recruiting guarantees. Grades reflect current metrics vs. published benchmarks.
                  Athletic development depends on many factors. Use this report as one tool in a complete development picture.
                </p>
              </div>

              <Button
                variant="vault" size="lg" className="w-full h-14 text-base"
                onClick={buildReport} disabled={analyzing}
              >
                {analyzing ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Analyzing Prospect Data…</>
                ) : (
                  <><Sparkles className="w-5 h-5 mr-2" /> Generate AI Prospect Report</>
                )}
              </Button>
            </TabsContent>

            {/* ── REPORT TAB ── */}
            <TabsContent value="report">
              {report && (
                <div className="space-y-5">
                  {/* Header Card */}
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-display text-foreground">{report.athleteName}</h2>
                        <p className="text-sm text-muted-foreground capitalize">
                          {report.position.replace("_", " ")} · {report.age ? `Age ${report.age}` : ""} {report.gradYear ? `· Class of ${report.gradYear}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{report.sport === "softball" ? "Softball" : "Baseball"} · Generated {report.reportDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">OFP Grade</p>
                        <GradeGauge grade={report.ofpGrade} size={100} />
                      </div>
                    </div>

                    {/* Grade Summary Row */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: "Present", value: report.presentGrade, sub: "Current Level" },
                        { label: "OFP", value: report.ofpGrade, sub: "Future Potential" },
                        { label: "Ceiling", value: report.futureGrade, sub: "With Development" },
                      ].map(g => {
                        const { label, color } = scaleLabel(g.value);
                        return (
                          <div key={g.label} className="bg-secondary rounded-xl p-3 text-center">
                            <p className="text-xs text-muted-foreground">{g.label}</p>
                            <p className="text-2xl font-display mt-0.5" style={{ color }}>{g.value}</p>
                            <p className="text-[10px] text-muted-foreground">{label}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Level Path */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {[report.currentLevel, report.nextLevelProjection, report.ceilingProjection].map((lv, i) => (
                        <div key={i} className="flex items-center gap-2 shrink-0">
                          <div className={`rounded-xl px-3 py-2 text-center min-w-[100px] ${lv.isCurrentLevel ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                            <p className="text-xs font-medium">{lv.level}</p>
                            <p className="text-[10px] opacity-70">{lv.timeframe}</p>
                            <p className="text-[10px] opacity-70">{lv.probability}% prob.</p>
                          </div>
                          {i < 2 && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Youth School Level */}
                  {report.youthProjection && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
                      <h3 className="font-display text-foreground mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" /> School Level Projection
                      </h3>
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 capitalize">
                          Currently: {report.youthProjection.currentSchoolLevel.replace("_", " ")}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 capitalize">
                          Next: {report.youthProjection.nextSchoolLevel} ({report.youthProjection.projectedTimeframe})
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{report.youthProjection.parentMessage}</p>
                    </div>
                  )}

                  {/* AI Analysis */}
                  {aiAnalysis && (
                    <>
                      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                        <h3 className="font-display text-foreground flex items-center gap-2">
                          <Brain className="w-4 h-4 text-amber-500" /> Executive Summary
                          <Badge className="ml-auto bg-amber-500/10 text-amber-500 border-0 text-xs">AI Analysis</Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{aiAnalysis.executive_summary}</p>
                        {aiAnalysis.comparable_type && (
                          <div className="bg-secondary rounded-xl p-3">
                            <p className="text-xs font-medium text-foreground mb-1">Athlete Profile Type</p>
                            <p className="text-sm text-muted-foreground">{aiAnalysis.comparable_type}</p>
                          </div>
                        )}
                        {aiAnalysis.ceiling_statement && (
                          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
                            <p className="text-xs font-medium text-green-600 mb-1">Ceiling Assessment</p>
                            <p className="text-sm text-muted-foreground">{aiAnalysis.ceiling_statement}</p>
                          </div>
                        )}
                      </div>

                      {/* Strengths + Gaps */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-card border border-border rounded-2xl p-5">
                          <h3 className="font-display text-sm text-foreground mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Strengths
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{aiAnalysis.strengths_narrative}</p>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-5">
                          <h3 className="font-display text-sm text-foreground mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-amber-500" /> Development Areas
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{aiAnalysis.gaps_narrative}</p>
                        </div>
                      </div>

                      {/* Biomechanical Insight */}
                      {aiAnalysis.biomechanical_insight && (
                        <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5">
                          <h3 className="font-display text-sm text-foreground mb-2 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-purple-500" /> Biomechanical Insight
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{aiAnalysis.biomechanical_insight}</p>
                        </div>
                      )}

                      {/* D1 / Pro Probability */}
                      <div className="bg-card border border-border rounded-2xl p-5">
                        <h3 className="font-display text-foreground mb-4">Probability Assessment</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "D1 Scholarship", value: aiAnalysis.d1_probability || 0, color: "#3b82f6" },
                            { label: sport === "softball" ? "Pro Softball" : "MLB Draft", value: aiAnalysis.pro_probability || 0, color: "#22c55e" },
                          ].map(p => (
                            <div key={p.label}>
                              <div className="flex justify-between mb-1.5">
                                <span className="text-xs text-muted-foreground">{p.label}</span>
                                <span className="text-sm font-display" style={{ color: p.color }}>{p.value}%</span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: p.color }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${p.value}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">Based on current metrics + development trajectory</p>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3">
                          Probabilities are projections based on current metrics relative to published benchmarks. They are not guarantees and change with development.
                        </p>
                      </div>

                      {/* Parent Summary */}
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                        <h3 className="font-display text-foreground mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-500" /> For Parents & Families
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{aiAnalysis.parent_summary}</p>
                        {aiAnalysis.primary_recommendation && (
                          <div className="bg-card rounded-xl p-3 mt-3">
                            <p className="text-xs font-medium text-foreground">Most Important Next Step</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{aiAnalysis.primary_recommendation}</p>
                          </div>
                        )}
                      </div>

                      {/* Timeline */}
                      {aiAnalysis.timeline_assessment && (
                        <div className="bg-card border border-border rounded-2xl p-5">
                          <h3 className="font-display text-foreground mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-cyan-500" /> Development Timeline
                          </h3>
                          <p className="text-sm text-muted-foreground">{aiAnalysis.timeline_assessment}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ── TOOL GRADES TAB ── */}
            <TabsContent value="tools">
              {report && (
                <div className="space-y-5">
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-display text-foreground mb-4">Tool Grades — 20-80 Scouting Scale</h3>
                    <div className="space-y-5">
                      {report.toolGrades.map(tool => (
                        <ToolBar key={tool.kpiName} tool={tool} />
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        The 20-80 scale is the standard professional scouting tool: 50 = MLB average, 60 = above average, 70 = plus-plus, 80 = elite/generational.
                        For youth/HS athletes, grades are normalized by age group to show development trajectory vs. peers.
                      </p>
                    </div>
                  </div>

                  {/* Biomechanical context for each tool */}
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-display text-foreground mb-4">Biomechanical Context</h3>
                    <div className="space-y-4">
                      {report.toolGrades.map(tool => {
                        const key = tool.kpiName.toLowerCase().replace(/\s+/g, "_").replace(/[-\/]/g, "");
                        const note = BIOMECHANICAL_NOTES[key];
                        if (!note) return null;
                        return (
                          <div key={tool.kpiName} className="bg-secondary rounded-xl p-3">
                            <p className="text-xs font-medium text-foreground mb-1">{tool.kpiName}</p>
                            <p className="text-xs text-muted-foreground">{note}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── ROADMAP TAB ── */}
            <TabsContent value="roadmap">
              {report && (
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" /> Development Roadmap
                    </h3>
                    <div className="space-y-4">
                      {report.developmentRoadmap.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${step.priority === "critical" ? "bg-red-500" : step.priority === "high" ? "bg-amber-500" : "bg-blue-500"}`}>
                              {i + 1}
                            </div>
                            {i < report.developmentRoadmap.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1 mb-1" />}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between mb-1">
                              <p className="font-medium text-sm text-foreground">{step.title}</p>
                              <Badge className={`text-[10px] ${step.priority === "critical" ? "bg-red-500/10 text-red-500" : step.priority === "high" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}>
                                {step.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{step.kpiTarget}</p>
                            <p className="text-xs text-foreground bg-secondary rounded-lg p-2">{step.action}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {step.timeframe}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {report.youthProjection && (
                    <div className="bg-card border border-border rounded-2xl p-5">
                      <h3 className="font-display text-foreground mb-3">Age-Appropriate Goals</h3>
                      <div className="space-y-2">
                        {report.youthProjection.ageAppropriateGoals.map((goal, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            <p className="text-sm text-foreground">{goal}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generate Again */}
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setReport(null); setAiAnalysis(null); setActiveTab("overview"); }}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Start New Report
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProspectGrader;
