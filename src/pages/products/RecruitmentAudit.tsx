import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, TrendingUp, Target, BarChart3,
  Share2, Download, Zap, Activity,
  Award, Brain, CheckCircle2,
  ArrowRight, Loader2,
  Link2, Sparkles,
  MessageSquare, Route, Trophy, Timer,
  ClipboardList, Send, Mail, QrCode, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileConversionBar from "@/components/products/MobileConversionBar";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const divisionStandards = {
  baseball: {
    pitcher: {
      D1: { "Velo": "88-95+ mph", "K/9": ">9", "Command": "Elite" },
      D2: { "Velo": "83-90 mph", "K/9": ">7", "Command": "Solid" },
      D3: { "Velo": "78-85 mph", "K/9": ">6", "Command": "Developing" },
      JUCO: { "Velo": "80-88 mph", "K/9": ">7", "Command": "Solid" },
    },
    catcher: {
      D1: { "Pop Time": "<1.90s", "Exit Velo": "90+ mph", "Arm": "80+ mph" },
      D2: { "Pop Time": "<1.95s", "Exit Velo": "85+ mph", "Arm": "75+ mph" },
      D3: { "Pop Time": "<2.00s", "Exit Velo": "80+ mph", "Arm": "72+ mph" },
      JUCO: { "Pop Time": "<1.95s", "Exit Velo": "82+ mph", "Arm": "75+ mph" },
    },
    outfield: {
      D1: { "Exit Velo": "95+ mph", "60yd": "<6.7s", "Arm": "90+ mph" },
      D2: { "Exit Velo": "88+ mph", "60yd": "<6.9s", "Arm": "85+ mph" },
      D3: { "Exit Velo": "82+ mph", "60yd": "<7.1s", "Arm": "80+ mph" },
      JUCO: { "Exit Velo": "85+ mph", "60yd": "<7.0s", "Arm": "82+ mph" },
    },
    infield: {
      D1: { "Exit Velo": "93+ mph", "60yd": "<6.8s", "IF Velo": "88+ mph" },
      D2: { "Exit Velo": "86+ mph", "60yd": "<7.0s", "IF Velo": "83+ mph" },
      D3: { "Exit Velo": "80+ mph", "60yd": "<7.2s", "IF Velo": "78+ mph" },
      JUCO: { "Exit Velo": "83+ mph", "60yd": "<7.1s", "IF Velo": "80+ mph" },
    },
  },
  softball: {
    pitcher: {
      D1: { "Velo": "62-70+ mph", "Spin": "High", "Command": "Elite" },
      D2: { "Velo": "58-65 mph", "Spin": "Above Avg", "Command": "Solid" },
      D3: { "Velo": "54-61 mph", "Spin": "Average", "Command": "Developing" },
      JUCO: { "Velo": "56-63 mph", "Spin": "Above Avg", "Command": "Solid" },
    },
    catcher: {
      D1: { "Pop Time": "<1.70s", "Exit Velo": "78+ mph", "Arm": "65+ mph" },
      D2: { "Pop Time": "<1.80s", "Exit Velo": "72+ mph", "Arm": "60+ mph" },
      D3: { "Pop Time": "<1.85s", "Exit Velo": "68+ mph", "Arm": "57+ mph" },
      JUCO: { "Pop Time": "<1.78s", "Exit Velo": "70+ mph", "Arm": "62+ mph" },
    },
    outfield: {
      D1: { "Exit Velo": "80+ mph", "60yd": "<7.5s", "Arm": "68+ mph" },
      D2: { "Exit Velo": "74+ mph", "60yd": "<7.8s", "Arm": "63+ mph" },
      D3: { "Exit Velo": "68+ mph", "60yd": "<8.1s", "Arm": "60+ mph" },
      JUCO: { "Exit Velo": "71+ mph", "60yd": "<7.9s", "Arm": "62+ mph" },
    },
  },
};

const Sparkline = ({ data, color = "#22c55e" }: { data: number[]; color?: string }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80; const h = 32;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" points={pts} />
      <circle cx={w} cy={h - (((data[data.length - 1] - min) / range) * (h - 4)) - 2} r="3" fill={color} />
    </svg>
  );
};

const demoAthlete = {
  name: "Jake Morrison", position: "RHP / OF", gradYear: "2026", gpa: "3.4",
  kpis: [
    { label: "Pitch Velocity", value: 87, unit: "mph", trend: [80, 82, 83, 85, 86, 87], division: "D2", target: 90, color: "#ef4444" },
    { label: "Exit Velocity", value: 94, unit: "mph", trend: [87, 89, 91, 92, 93, 94], division: "D1", target: 95, color: "#3b82f6" },
    { label: "60-Yard Dash", value: 6.8, unit: "sec", trend: [7.2, 7.1, 7.0, 6.95, 6.85, 6.8], division: "D1", target: 6.7, color: "#f59e0b", lower_is_better: true },
    { label: "Bat Speed", value: 71, unit: "mph", trend: [64, 66, 67, 69, 70, 71], division: "D2", target: 75, color: "#8b5cf6" },
  ],
  coachNotes: [
    { date: "Mar 2025", author: "Coach Davis", note: "Mechanics significantly cleaner. Hip-shoulder separation improved ~15%. Ready to test higher mound intensity." },
    { date: "Feb 2025", author: "Coach Davis", note: "Arm action more efficient, reduced stress position visible. Command improving — locating fastball low consistently." },
    { date: "Jan 2025", author: "Coach Martinez", note: "Strength base up meaningfully. Ground force production is the biggest unlock for both velo and exit velo gains." },
  ],
  aiAnalysis: "Jake's 7-mph velocity gain over 6 months is elite-tier development (average is 3-4 mph/season). Exit velocity already meets D1 OF standards. Primary gap: pitch velocity needs +3 mph to solidify D1 arm. Recommended focus: hip-load timing and front-leg blocking mechanics. Division projection: strong D2 now, D1 realistic by Fall 2025 if trajectory holds. Academic profile (3.4 GPA) opens academic-focused D1 and D3 programs where baseball and grades carry equal weight.",
};

const divisionColors: Record<string, string> = {
  D1: "text-green-500 bg-green-500/10",
  D2: "text-blue-500 bg-blue-500/10",
  D3: "text-amber-500 bg-amber-500/10",
  JUCO: "text-purple-500 bg-purple-500/10",
};

const features = [
  { icon: BarChart3, title: "Full KPI Tracking Dashboard", desc: "Every measurable metric tracked over time with visual growth charts and division benchmarks overlaid.", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: MessageSquare, title: "Coach Notes + Assessment Log", desc: "Dated notes from every session, structured assessments tied to your KPI data. A real development paper trail.", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Brain, title: "AI Development Analysis", desc: "AI reads your KPI trajectory, coach notes, and assessments — identifies recruiting gap, division fit, 90-day plan.", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Share2, title: "One-Click Scout & College Sharing", desc: "Password-protected recruiting profile link. Colleges and scouts get a professional presentation of your full story.", color: "text-green-500", bg: "bg-green-500/10" },
  { icon: Target, title: "Division Fit Scoring", desc: "Position-specific D1/D2/D3/JUCO standards. Know exactly where you stand today and what the gap is.", color: "text-red-500", bg: "bg-red-500/10" },
  { icon: Route, title: "6-12 Month Development Roadmap", desc: "Prioritized, VAULT-integrated training plan tied to your specific gaps — built from your actual numbers.", color: "text-cyan-500", bg: "bg-cyan-500/10" },
];

const whatIsIncluded = [
  "Athlete snapshot (position, grad year, academic profile)",
  "Full KPI history with trend charts",
  "Division standard comparison (D1 / D2 / D3 / JUCO / NAIA)",
  "Coach assessment log with dated notes",
  "AI-generated development analysis & gap identification",
  "Personalized 6-month roadmap with VAULT program alignment",
  "Shareable recruiting profile (college & scout ready)",
  "Position-specific benchmark overlays",
  "PDF export for email campaigns to coaches",
  "QR code for recruiting visits and showcases",
];

const RecruitmentAudit = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.recruitment_audit;
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* HERO */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-10 h-10 text-green-500" />
            </div>
            <Badge className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">Baseball &amp; Softball Recruiting Intelligence</Badge>
            <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">RECRUITMENT AUDIT 2.0</h1>
            <p className="text-2xl font-display text-green-500 mb-4">KPI GROWTH · COACH ASSESSMENTS · AI ANALYSIS · SCOUT SHARING</p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The most comprehensive athlete recruiting intelligence product available. A living development profile that tracks every KPI, logs every coach note, runs AI analysis on your trajectory, and lets you share it all with a single link.
            </p>
          </motion.div>

          {/* PRICING CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-card to-secondary border border-border rounded-2xl p-8 mb-16 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">One-Time Investment</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-display text-foreground">{formatPrice(product?.price_cents ?? 9700)}</span>
                <span className="text-muted-foreground">one-time</span>
              </div>
              <p className="text-sm text-muted-foreground">Includes all updates, unlimited profile shares, and lifetime access to your audit.</p>
            </div>
            <div className="flex flex-col gap-3 md:min-w-60">
              <Button variant="vault" size="lg" className="w-full h-14 text-lg" disabled={loading} onClick={() => checkout("recruitment_audit")}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                Get My Audit
              </Button>
              <Link to="/recruiting"><Button variant="outline" size="lg" className="w-full">Go to Recruiting Hub <ChevronRight className="w-4 h-4 ml-1" /></Button></Link>
            </div>
          </motion.div>

          {/* TABS */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-16">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="overview">What's Included</TabsTrigger>
              <TabsTrigger value="demo">Live Demo Profile</TabsTrigger>
              <TabsTrigger value="standards">Division Standards</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-4 mb-10">
                {features.map((f, i) => (
                  <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="bg-card border border-border rounded-2xl p-6 flex gap-4">
                    <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center shrink-0`}>
                      <f.icon className={`w-6 h-6 ${f.color}`} />
                    </div>
                    <div>
                      <h3 className="font-display text-foreground mb-1">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="bg-card border border-border rounded-2xl p-8">
                <h3 className="font-display text-xl text-foreground mb-6 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-green-500" /> EVERYTHING IN YOUR AUDIT
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {whatIsIncluded.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="demo">
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-display text-foreground">{demoAthlete.name}</h2>
                      <p className="text-muted-foreground">{demoAthlete.position} · Class of {demoAthlete.gradYear} · GPA {demoAthlete.gpa}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-2"><Share2 className="w-4 h-4" /> Share</Button>
                      <Button size="sm" variant="outline" className="gap-2"><Download className="w-4 h-4" /> PDF</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[{ label: "Division Fit", value: "D1/D2", color: "text-green-500" }, { label: "KPIs Tracked", value: "4", color: "text-blue-500" }, { label: "Growth Period", value: "6 mo", color: "text-amber-500" }, { label: "Coach Notes", value: "3", color: "text-purple-500" }].map((s) => (
                      <div key={s.label} className="bg-secondary rounded-xl p-3 text-center">
                        <p className={`text-xl font-display ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" /> KPI Growth Tracking</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {demoAthlete.kpis.map((kpi) => (
                      <div key={kpi.label} className="bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-foreground">{kpi.label}</span>
                          <Badge className={divisionColors[kpi.division]}>{kpi.division}</Badge>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-display text-foreground">{kpi.value} <span className="text-sm text-muted-foreground">{kpi.unit}</span></span>
                          <Sparkline data={kpi.trend} color={kpi.color} />
                        </div>
                        <Progress value={Math.min(Math.round((kpi.value / kpi.target) * 100), 100)} className="h-1.5 mb-1" />
                        <p className="text-xs text-muted-foreground">Target: {kpi.target} {kpi.unit}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-purple-500" /> Coach Assessment Log</h3>
                  <div className="space-y-3">
                    {demoAthlete.coachNotes.map((note, i) => (
                      <div key={i} className="bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-xs text-primary-foreground font-bold">{note.author.split(" ")[1][0]}</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{note.author}</span>
                          <span className="text-xs text-muted-foreground">· {note.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6">
                  <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-amber-500" /> AI Development Analysis
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">Powered by VAULT AI</Badge>
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">{demoAthlete.aiAnalysis}</p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">D1 Trajectory: Yes</Badge>
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Primary Gap: Pitch Velo +3mph</Badge>
                    <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Timeline: 8-10 months</Badge>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2"><Share2 className="w-4 h-4 text-green-500" /> College &amp; Scout Sharing</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {[{ icon: Link2, color: "text-green-500", title: "Shareable Link", desc: "Password protected. Works on any device.", action: "Generate Link" }, { icon: Mail, color: "text-blue-500", title: "PDF Export", desc: "Send directly to coaches and recruiters.", action: "Export PDF" }, { icon: QrCode, color: "text-purple-500", title: "QR Code", desc: "Print for showcases and campus visits.", action: "Download QR" }].map((item) => (
                      <div key={item.title} className="bg-secondary rounded-xl p-4 flex flex-col gap-3 items-center text-center">
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                        <div><p className="font-medium text-sm text-foreground">{item.title}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                        <Button size="sm" variant="outline" className="w-full text-xs">{item.action}</Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">This is a preview with sample data. Your real audit uses your actual KPIs and coach notes.</p>
                  <Button variant="vault" size="lg" onClick={() => checkout("recruitment_audit")} disabled={loading} className="mt-2">
                    <Zap className="w-4 h-4 mr-2" /> Unlock My Full Audit — {formatPrice(product?.price_cents ?? 9700)}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="standards">
              <div className="space-y-6">
                {["baseball", "softball"].map((sport) => (
                  <div key={sport} className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-display text-xl text-foreground mb-2 capitalize">{sport} Division Standards by Position</h3>
                    <p className="text-sm text-muted-foreground mb-6">Based on NCSA, PBR, and college program data. Standards represent typical scholarship-level thresholds.</p>
                    <div className="space-y-6">
                      {Object.entries(divisionStandards[sport as "baseball" | "softball"]).map(([position, levels]) => (
                        <div key={position}>
                          <h4 className="font-display text-foreground capitalize mb-3 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500" /> {position}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(levels).map(([div, stats]) => (
                              <div key={div} className="bg-secondary rounded-xl p-3">
                                <Badge className={`${divisionColors[div]} mb-2 text-xs`}>{div}</Badge>
                                {Object.entries(stats).map(([key, val]) => (
                                  <div key={key} className="flex justify-between text-xs mt-1">
                                    <span className="text-muted-foreground">{key}</span>
                                    <span className="text-foreground font-medium">{val}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="bg-secondary border border-border rounded-2xl p-6 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-2">Important Disclaimer</p>
                  <p>These standards represent general benchmarks based on publicly available recruiting data from NCSA, Perfect Game, and published college program standards. Individual offers depend on position need, academic profile, program fit, recruiting timeline, and many other factors. VAULT provides data-driven context — not guarantees. Numbers reflect typical ranges for offered/scholarship athletes in each division.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-center bg-gradient-to-br from-card to-secondary border border-border rounded-2xl p-12">
            <GraduationCap className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-display text-foreground mb-3">STOP GUESSING. START KNOWING.</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Colleges don't recruit blind. Give them a professional, data-backed athlete profile that tells your complete development story.</p>
            <Button variant="vault" size="lg" className="h-14 px-12 text-lg" onClick={() => checkout("recruitment_audit")} disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ArrowRight className="w-5 h-5 mr-2" />}
              Get My Recruitment Audit — {formatPrice(product?.price_cents ?? 9700)}
            </Button>
          </motion.div>
        </div>
      </section>
      <MobileConversionBar title="Recruitment Audit" price={formatPrice(product?.price_cents ?? 9700)} onCheckout={() => checkout("recruitment_audit")} loading={loading} />
      <Footer />
    </main>
  );
};

export default RecruitmentAudit;
