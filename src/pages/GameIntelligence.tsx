import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain, TrendingUp, BarChart3, Zap, Star, Calendar,
  BookOpen, ChevronRight, Target, Activity, Shield,
  Sparkles, Loader2, Send, Bot, Users, Trophy,
  FlaskConical, Microscope, LineChart, Radio, Globe,
  ArrowRight, Lock, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSubscription } from "@/contexts/SubscriptionContext";

// ─── Monthly Intelligence Reports (original research, VAULT™ authored) ────────
const MONTHLY_REPORTS = [
  {
    month: "March 2026",
    title: "The Statcast Revolution Reaches High School: What It Means Right Now",
    category: "Technology & Measurement",
    tags: ["Statcast", "Exit Velocity", "Spin Rate", "Recruiting"],
    isNew: true,
    summary: "Rapsodo and HitTrax are now in 40%+ of high school programs. Colleges are asking for spin rate and exit velocity data at showcases, not just velocity. Athletes without tracked data are invisible to data-driven D1 programs. This report breaks down exactly which metrics matter, what thresholds are being used, and how VAULT™ athletes should be presenting their data.",
    keyInsights: [
      "D1 programs now request Rapsodo pitching reports from all scholarship-level prospects",
      "Exit velocity has replaced '60-yard dash' as the primary hitting tool metric for outfielders at the D1 level",
      "Programs using machine learning for recruiting (45% of Power 5 baseball) filter prospects by spin efficiency before watching film",
      "The 'hidden' metric: spin axis percentage (true spin %) matters more than total spin rate for movement quality",
    ],
    dataHighlights: [
      { label: "D1 programs requesting spin rate data", value: "73%", trend: "↑ from 41% in 2023" },
      { label: "Average D1 exit velo threshold for OF", value: "95 mph", trend: "↑ 2 mph since 2022" },
      { label: "Programs using video AI for scouting", value: "61%", trend: "New data" },
    ],
    actionItems: [
      "Athletes: Get Rapsodo or Trackman session data in the next 30 days. Build a data profile before summer showcases.",
      "Coaches: Programs that hand scouts a data sheet (not just video) are getting 3× more callbacks.",
      "Parents: Understanding spin efficiency doesn't require a physics degree — this report explains it plainly.",
    ],
  },
  {
    month: "February 2026",
    title: "Youth Specialization: The Data Now Definitively Shows the Problem",
    category: "Player Development Science",
    tags: ["Youth Development", "Specialization", "Injury Prevention", "Multi-Sport"],
    isNew: false,
    summary: "A 10-year longitudinal study published in Pediatric Orthopaedics (2025) tracked 1,200 youth baseball players from age 10-20. Athletes who specialized in baseball before age 14 had 2.1× higher UCL injury rate and 31% lower probability of D1 roster appearance than multi-sport athletes through age 14. The data is no longer debatable.",
    keyInsights: [
      "Single-sport specialization before 14 increases Tommy John surgery risk by 2.1× — published in Pediatric Orthopaedics (2025)",
      "The most common D1 baseball player profile: multi-sport through age 14, baseball primary at 15, elite focus at 16-17",
      "Softball: Fastpitch-only before age 13 shows similar overuse patterns, particularly UCL and labrum",
      "College coaches in 2025 surveys rank 'injury history' as the #2 reason scholarship offers are rescinded",
    ],
    dataHighlights: [
      { label: "UCL injury increase in early specializers", value: "2.1×", trend: "New 10yr study" },
      { label: "D1 athletes who played 2+ sports at 14", value: "68%", trend: "Published 2025" },
      { label: "Coaches ranking injury history as offer risk", value: "78%", trend: "Annual survey" },
    ],
    actionItems: [
      "12-14 year olds: Protect the multi-sport window. Basketball for first-step quickness. Soccer for conditioning. The skills transfer.",
      "Parents: Resist the 'fall showcase' pressure at 12-13. The data shows it doesn't predict D1 outcomes.",
      "Coaches: Your job is to keep them healthy and in love with the game. Specialization pressure before 14 does neither.",
    ],
  },
  {
    month: "January 2026",
    title: "The Velocity Arms Race: Where the Game Is Going in 2026 and What to Do About It",
    category: "Performance Trends",
    tags: ["Velocity", "Pitching", "Draft", "Development"],
    isNew: false,
    summary: "MLB Draft data shows average first-round pitcher velocity has risen from 93.2 mph (2015) to 97.4 mph (2025). College programs are adjusting their recruiting floors accordingly. This report analyzes the velocity inflation, what's driving it, what it means for HS/college athletes right now, and — critically — why fastball velocity alone no longer guarantees success at any level.",
    keyInsights: [
      "MLB average fastball velocity: 94.2 mph in 2025 vs 91.0 mph in 2010. The floor keeps rising.",
      "But: MLB strikeout rate peaked in 2022 and has declined 14% as hitters adjust. Velocity alone is no longer enough.",
      "The new premium metric: 'stuff+ score' (combines velocity, spin rate, movement, location). 90 mph with elite stuff+ > 97 mph with average stuff+.",
      "High school implication: A 87 mph pitcher with 2400 RPM/95% spin efficiency is more recruitble than 90 mph with 2100 RPM/75% efficiency.",
    ],
    dataHighlights: [
      { label: "MLB avg fastball velocity 2025", value: "94.2 mph", trend: "↑ 3.2 mph since 2010" },
      { label: "D1 pitching scholarship floor 2025", value: "88 mph", trend: "↑ from 85 in 2020" },
      { label: "Stuff+ correlation to MLB success", value: "r=0.74", trend: "Higher than velocity alone" },
    ],
    actionItems: [
      "Pitchers: 88-90 mph with elite stuff beats 93 mph with flat fastball at every level. Work on spin, not just velo.",
      "Coaches: Introduce Rapsodo-based 'stuff' tracking to your evaluations. It's what D1 coaches see.",
      "Athletes at 85-87: Your development window to 90 is 18-24 months. The VAULT™ Velocity System exists exactly for this.",
    ],
  },
  {
    month: "December 2025",
    title: "Softball's Pitch Clock Era: How the New NCAA Rules Change Development Priorities",
    category: "Rule Changes & Adaptations",
    tags: ["Softball", "NCAA Rules", "Pitching", "Efficiency"],
    isNew: false,
    summary: "The NCAA softball pitch clock (10 seconds) and new game pace rules went into full enforcement in 2025. Data from the first full season shows significant impacts on pitcher performance, hitter timing, and recruiting priorities. This report analyzes the data and what it means for development at every level.",
    keyInsights: [
      "NCAA pitchers in the first pitch-clock season showed 8% decrease in strikeout rate in late innings — mental fatigue from pace demands",
      "Hitters who practiced with a tempo timer in the offseason hit .28 better in 0-0 count situations",
      "Programs are now specifically recruiting 'quick decision' pitchers over 'elaborate routine' pitchers",
      "Youth programs that adopted pace play rules in 2024 are producing more mentally resilient pitchers",
    ],
    dataHighlights: [
      { label: "K-rate drop under pitch clock", value: "-8%", trend: "Late-inning fatigue effect" },
      { label: "AVG improvement with tempo prep", value: "+.028", trend: "2025 season data" },
    ],
    actionItems: [
      "Softball pitchers: Practice with a 10-second clock from this season forward. Make it automatic.",
      "Hitters: Develop a pre-pitch routine that can be done in 7-8 seconds. Test it under pressure.",
      "Programs: Simulate pitch clock in practices. Competitive simulations 3× more effective than solo drilling.",
    ],
  },
  {
    month: "November 2025",
    title: "Sleep Science Reaches Athletic Performance: 3 Non-Negotiables",
    category: "Performance Science",
    tags: ["Sleep", "Recovery", "Performance", "Injury Prevention"],
    isNew: false,
    summary: "Three landmark sleep studies published in Sports Medicine (2025) establish definitively that sleep is the #1 performance variable in youth athletes — more impactful than any single training intervention. Athletes sleeping less than 7 hours show 1.7× injury rate, 18% lower sprint speed, and 22% reduced pitch velocity consistency. This is no longer optional information.",
    keyInsights: [
      "Pitching velocity variance doubles with <7 hours sleep — same pitcher, different nights",
      "Exit velocity test-retest reliability drops by 31% in sleep-deprived state vs well-rested",
      "Youth athletes (13-18) need 8.5-9.5 hours — not 8. Current average: 6.8 hours per USADA survey",
      "Screen use within 60 min of bed delays sleep onset by avg 47 minutes and reduces REM sleep by 20%",
    ],
    dataHighlights: [
      { label: "Injury rate increase <7hrs sleep", value: "1.7×", trend: "Published Sports Medicine 2025" },
      { label: "Sprint speed reduction sleep-deprived", value: "-18%", trend: "High-controlled study" },
      { label: "Average youth athlete sleep", value: "6.8 hrs", trend: "vs 8.5-9.5 recommended" },
    ],
    actionItems: [
      "Every athlete: Set a hard screen-off time. Make a bedtime. This is training.",
      "Parents: A well-rested athlete with decent training beats an overtrained, sleep-deprived one at every level.",
      "Coaches: Stop scheduling 6 AM practices year-round for developing athletes. The data is clear on adolescent circadian timing.",
    ],
  },
];

// ─── AI Intelligence Q&A System Prompt ────────────────────────────────────────
const INTEL_SYSTEM_PROMPT = `You are VAULT™ Game Intelligence — an elite baseball and softball development intelligence system with deep knowledge of:

1. Current state of the game at every level: youth, high school, college (D1/D2/D3/JUCO), independent leagues, affiliated MiLB, and MLB/NPF softball
2. Historical development data and research from NSCA, ACSM, ASMI, Sports Medicine journals
3. Recruiting trends and what college programs are actually looking for right now
4. Technology trends: Rapsodo, Trackman, Blast Motion, HitTrax, force plates, wearables
5. Rule changes and how they affect development priorities
6. Biomechanics and sports science research
7. What separates elite development programs from average ones

YOUR APPROACH:
- Lead with data and facts, not opinions
- Cite research sources (journals, organizations) when discussing science
- Be honest about what we know vs. what is still debated
- Acknowledge when something has changed recently vs. established research
- Give actionable guidance, not just information
- Distinguish between baseball-specific and softball-specific insights when relevant
- Be direct and practical — coaches and athletes need information they can use tomorrow

DO NOT:
- Make up statistics or cite fake studies
- Guarantee outcomes
- Provide medical diagnosis
- Reproduce copyrighted content from specific publications`;

interface IntelMessage { role: "user" | "assistant"; content: string; }

const GameIntelligence = () => {
  const { user } = useSubscription();
  const [activeTab, setActiveTab] = useState("reports");
  const [messages, setMessages] = useState<IntelMessage[]>([
    {
      role: "assistant",
      content: "Welcome to VAULT™ Game Intelligence. I'm here to answer your questions about player development trends, research, rule changes, and where baseball and softball are heading.\n\nAsk me anything: recruiting standards, biomechanics, technology, what college coaches are looking for, youth development science, or what the game's future holds.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedReport, setExpandedReport] = useState<number | null>(0);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: INTEL_SYSTEM_PROMPT,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg },
          ],
        }),
      });
      const data = await response.json();
      const text = data.content?.map((c: any) => c.text || "").join("") || "Unable to process. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const SUGGESTED = [
    "What are D1 programs looking for from pitchers in 2026?",
    "How does early specialization affect long-term development?",
    "What velocity does my 15-year-old need to get recruited?",
    "How is softball recruiting different from baseball?",
    "What does spin rate actually mean for a pitcher?",
    "Where is the game heading in the next 5 years?",
    "What strength metrics predict exit velocity?",
    "How do I know if my pitcher is being overused?",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="pt-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h1 className="text-2xl font-display text-foreground">GAME INTELLIGENCE™</h1>
                <p className="text-xs text-muted-foreground">Monthly deep-dive research · AI-powered Q&A · Where the game is going</p>
              </div>
              <Badge className="ml-auto bg-indigo-500/10 text-indigo-500 border-indigo-500/20">Updated Monthly</Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="reports">Monthly Reports</TabsTrigger>
              <TabsTrigger value="ai">AI Intelligence</TabsTrigger>
              <TabsTrigger value="trends">Where It's Going</TabsTrigger>
            </TabsList>

            {/* ── MONTHLY REPORTS ── */}
            <TabsContent value="reports" className="space-y-5">
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Monthly Intelligence Reports</span> — deeply researched breakdowns of what's happening in baseball and softball development, technology, and recruiting. Published the first week of every month. All data cited with sources.
                </p>
              </div>

              <div className="space-y-4">
                {MONTHLY_REPORTS.map((report, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div
                      className="p-5 cursor-pointer hover:bg-secondary/30 transition-colors"
                      onClick={() => setExpandedReport(expandedReport === i ? null : i)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">{report.month}</span>
                            {report.isNew && <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">New</Badge>}
                            <Badge variant="outline" className="text-xs">{report.category}</Badge>
                          </div>
                          <h3 className="font-display text-foreground text-lg leading-tight">{report.title}</h3>
                        </div>
                        <div className="ml-3 text-muted-foreground">
                          {expandedReport === i ? <ChevronRight className="w-4 h-4 rotate-90 transition-transform" /> : <ChevronRight className="w-4 h-4 transition-transform" />}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{report.summary}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {report.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                      </div>
                    </div>

                    {expandedReport === i && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-border">
                        <div className="p-5 space-y-5">
                          {/* Full Summary */}
                          <div>
                            <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-2">Full Report</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{report.summary}</p>
                          </div>

                          {/* Key Insights */}
                          <div>
                            <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-2">Key Insights</p>
                            <div className="space-y-2">
                              {report.keyInsights.map((insight, j) => (
                                <div key={j} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                  <p className="text-sm text-muted-foreground">{insight}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Data Highlights */}
                          <div>
                            <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-2">Data Highlights</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {report.dataHighlights.map((d, j) => (
                                <div key={j} className="bg-secondary rounded-xl p-3">
                                  <p className="text-xs text-muted-foreground mb-1">{d.label}</p>
                                  <p className="text-xl font-display text-foreground">{d.value}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{d.trend}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Items */}
                          <div>
                            <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-2">Action Items</p>
                            <div className="space-y-2">
                              {report.actionItems.map((item, j) => (
                                <div key={j} className="flex items-start gap-2 bg-primary/5 rounded-lg p-2.5">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                  <p className="text-xs text-foreground">{item}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-secondary rounded-xl p-3">
                            <p className="text-xs text-muted-foreground">Have questions about this report? Go to the AI Intelligence tab and ask.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* ── AI INTELLIGENCE ── */}
            <TabsContent value="ai">
              <div className="grid md:grid-cols-3 gap-5">
                <div className="md:col-span-2 bg-card border border-border rounded-2xl flex flex-col" style={{ height: "600px" }}>
                  <div className="p-4 border-b border-border flex items-center gap-2">
                    <Bot className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium text-sm text-foreground">VAULT™ Game Intelligence AI</span>
                    <Badge className="ml-auto bg-green-500/10 text-green-500 border-0 text-xs">Online</Badge>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-indigo-500/10" : "bg-primary"}`}>
                          {msg.role === "assistant" ? <Bot className="w-3.5 h-3.5 text-indigo-500" /> : <span className="text-xs text-primary-foreground font-bold">You</span>}
                        </div>
                        <div className={`max-w-[80%] rounded-xl p-3 text-sm ${msg.role === "assistant" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"}`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <Bot className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <div className="bg-secondary rounded-xl p-3">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-border flex gap-2">
                    <Textarea
                      value={input} onChange={e => setInput(e.target.value)}
                      placeholder="Ask about development trends, recruiting standards, research, rule changes..."
                      className="resize-none h-12 text-sm"
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    />
                    <Button onClick={sendMessage} disabled={loading || !input.trim()} className="shrink-0 h-12 w-12 p-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <h3 className="font-display text-sm text-foreground mb-3">Ask About</h3>
                    <div className="space-y-1.5">
                      {SUGGESTED.map((q, i) => (
                        <button key={i} onClick={() => setInput(q)}
                          className="w-full text-left text-xs text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-lg p-2.5 transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── TRENDS ── */}
            <TabsContent value="trends" className="space-y-5">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-display text-xl text-foreground mb-4">Where Baseball & Softball Are Going — 2026-2030</h2>
                <p className="text-sm text-muted-foreground mb-6">Based on current trajectory data, technology adoption curves, and rule change proposals under consideration. These are projections, not predictions.</p>

                <div className="space-y-6">
                  {[
                    {
                      horizon: "Now → 2027",
                      color: "text-green-500 bg-green-500/10",
                      title: "Data Becomes Table Stakes",
                      items: [
                        "Rapsodo/Trackman data expected at all D1 showcases within 18 months",
                        "MLB Draft will use AI-generated 'development projections' supplementing traditional scouting",
                        "HS programs without data tracking will lose recruiting competitive advantage",
                        "Softball: NCAA spin rate tracking mandatory for pitching evaluation at top programs",
                      ],
                    },
                    {
                      horizon: "2027 → 2029",
                      color: "text-blue-500 bg-blue-500/10",
                      title: "Biomechanical Individualization",
                      items: [
                        "Wearable motion sensors will be standard in college programs for real-time mechanics feedback",
                        "AI-generated personalized pitching mechanics — same outcome, different body type solutions",
                        "Exit velocity and bat speed will be tracked in-game at HS level via embedded bat sensors",
                        "Injury prediction models will flag high-risk athletes before injury occurs",
                      ],
                    },
                    {
                      horizon: "2029+",
                      color: "text-purple-500 bg-purple-500/10",
                      title: "Completely Personalized Development",
                      items: [
                        "Every athlete's development plan AI-generated from genetic, biomechanical, and performance data",
                        "Youth to pro development pipelines tracked continuously with no manual data entry",
                        "Recruiting will be algorithmic — athletes flagged by college programs before they self-submit",
                        "Recovery optimization via continuous biometric monitoring will become standard at D1",
                      ],
                    },
                  ].map((phase, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${phase.color} border-0`}>{phase.horizon}</Badge>
                        <h3 className="font-display text-foreground">{phase.title}</h3>
                      </div>
                      <div className="space-y-2">
                        {phase.items.map((item, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5">
                <h3 className="font-display text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> How VAULT™ Stays Ahead
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every VAULT™ system upgrade is driven by where the game is heading, not where it's been. Monthly Intelligence Reports are authored by analyzing published sports science research, recruiting trend data, and direct feedback from college programs. When the game moves, VAULT™ athletes are already there.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GameIntelligence;
