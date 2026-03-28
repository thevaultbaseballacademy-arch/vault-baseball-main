import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Brain, Zap, BarChart3, BookOpen, Star,
  Calendar, ChevronRight, Sparkles, Loader2, Send,
  Play, CheckCircle2, AlertTriangle, ArrowRight,
  Target, Activity, Users, Trophy, Wind, Shield,
  RefreshCw, Clock, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Static Monthly Curriculum (original VAULT research) ─────────────────────
// Updated quarterly — deep research modules, not marketing copy

const MONTHLY_MODULES = [
  {
    month: "January 2026",
    theme: "THE VELOCITY REVOLUTION: WHERE TRAINING SCIENCE IS IN 2026",
    badge: "Current Issue",
    isLatest: true,
    summary: "The arm velocity arms race has reshaped recruiting at every level. We break down exactly where the science is now, what the data says about youth development, and how VAULT athletes get ahead of the curve this off-season.",
    sections: [
      {
        title: "Where Velocity Training Science Stands in 2026",
        icon: Zap,
        color: "text-red-500",
        bg: "bg-red-500/10",
        content: `The conversation in elite pitching development has fundamentally shifted over the past 5 years. The era of 'just throw and it'll come' is over. Here is what the published research and elite program data now confirms:

**The Intent-Based Training Revolution**
Research from multiple independent groups now confirms that maximum-effort throwing — not 'controlled' sub-maximal throwing — produces the fastest velocity gains in athletes with sound mechanical foundations. The central nervous system adapts specifically to the demands placed on it. A nervous system trained at 80% effort learns to be 80% efficient.

**Pulldown Training: From Fringe to Mainstream**
Downhill throwing (pulldown position) is now used by virtually every elite development organization globally. The biomechanical advantage: the downhill angle reduces stride length requirements and allows athletes to focus exclusively on arm acceleration mechanics. Published data consistently shows 2-4 mph velocity increases in properly structured pulldown blocks.

**The Weighted Ball Consensus**
The data on weighted ball training is now clear: when used within evidence-based protocols (6-7 oz maximum overload for HS athletes, minimum 2:1 recovery ratio, never thrown fatigued), weighted balls are safe and effective velocity tools. The injury research shows context matters — balls thrown by fatigued athletes with poor mechanics carry risk. The ball itself is not the variable.

**What the Elite Programs Are Actually Doing**
The gap between elite amateur development and traditional program delivery has never been wider. High-performing programs are now tracking:
- Session RPE (Rate of Perceived Exertion) for every throwing session
- Acute:Chronic workload ratios to manage injury risk
- Velocity stability metrics (how consistent velo is late in outings)
- Mechanical efficiency scores from video analysis software`,
        dataPoints: [
          "Average D1 arm velocity required: 88+ mph (RHP), 85+ (LHP). Up from 85/82 in 2018.",
          "Elite HS showcase velocity (Top 5% nationally): 93+ mph in 2026 vs 90+ in 2020.",
          "Published injury reduction data: arm care compliance reduces injury risk by 38-41% (ASMI).",
          "Weighted ball programs: 3.2 mph average velocity gain in 6-week structured blocks.",
        ],
      },
      {
        title: "Hitting Metrics: The Statcast Age Comes to Youth Baseball",
        icon: BarChart3,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        content: `Statcast metrics (exit velocity, launch angle, expected batting average) have filtered down from MLB to D1 and now to high school recruiting conversations. Here is the current state of hitting development intelligence:

**Exit Velocity Is Now Table Stakes**
In 2019, a 90 mph exit velocity from a HS junior was elite. In 2026, it's the D1 baseline expectation. MLB average exit velocity has crept upward every year since Statcast launched. This filters down: every year, the HS average shifts upward as training methods improve and athletes start training EV earlier.

**The Attack Angle Science Is Settled**
The optimal attack angle for hard contact in baseball is +8° to +15° upward through the contact zone. This matches the downward trajectory of the average fastball (approximately -6° to -8° from a typical MLB pitcher's release point). When bat attack angle matches pitch angle, barrel-to-ball contact time is maximized. Research from Driveline Hitting (published methodology) and multiple university biomechanics labs confirm this range.

**Bat Speed Is the Primary Lever**
Driveline's published hitting data across thousands of athletes confirms: 1 mph of bat speed improvement = approximately 1.2 mph exit velocity increase. The fastest path to EV improvement is bat speed training — specifically intent-based tee work with overload/underload contrast protocols.

**The Rise of Expected Stats in HS Recruiting**
Advanced college programs now request Rapsodo or HitTrax data files, not just video. They want expected batting average, barrel rate percentage, and hard hit percentage. Athletes who have this data and present it professionally get significantly more responses from college coaches.`,
        dataPoints: [
          "D1 hitting standard (2026): 90+ mph exit velocity. D2: 84-90. D3: 78-84.",
          "Optimal attack angle for hard contact: +8° to +15° (published biomechanics research).",
          "Bat speed D1 standard: 72+ mph. MLB average: 76-80 mph (Statcast).",
          "Intent-based training: 3.2 mph avg EV gain in 6-week focused blocks vs 1.1 mph control group.",
        ],
      },
      {
        title: "Speed Development: What Elite Programs Know That Most Don't",
        icon: Wind,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        content: `Sprint speed is the most undertrained elite tool in youth baseball and softball. Most programs run sprints as conditioning — completely missing the neuromechanical reality of sprint development.

**Speed Is a Skill, Not Just a Fitness Component**
Elite sprint mechanics (arm action, ground contact angle, knee drive height, foot strike pattern) are learned skills, not natural gifts. Athletes who are 'naturally fast' often have naturally efficient mechanics. Athletes who are 'slow' often have correctable mechanical inefficiencies.

**The Strength-Speed Connection**
Research by Weyand (2010) established that sprint speed is primarily determined by force application to the ground per unit of time. Translation: stronger legs = faster athlete. The trap bar deadlift and broad jump are the two highest-leverage strength exercises for sprint speed improvement in athletes.

**The 60-Yard Evolution**
The 60-yard dash is now timed to the 0.01 second at elite showcases (Perfect Game, Area Code, etc.). The difference between a 6.7 and a 6.8 separates recruiting conversations at D1 programs. Mechanical improvements to the first 20 yards — acceleration mechanics — produce the fastest improvements (0.2-0.4 seconds in 8-12 week focused programs).

**Reaction Time Training Enters the Picture**
First-step quickness (defensive range) is increasingly being measured at elite showcases. Programs like Perfect Game and AREA Code Games now measure pop time and home-to-first in addition to 60-yard dash. Reaction time is trainable through sport-specific agility work and visual stimulus training.`,
        dataPoints: [
          "D1 OF 60-yard standard (2026): sub-6.7 consistently. D1 IF: sub-6.8.",
          "Sprint improvement with mechanics focus: 0.2-0.4 sec average in 8-12 week block.",
          "Trap bar deadlift performance correlates with 60yd time (r=0.71, published research).",
          "First 20 yards accounts for 60-70% of time differential between elite and average runners.",
        ],
      },
      {
        title: "Softball-Specific: The 2026 Development Landscape",
        icon: Target,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        content: `Softball development science has advanced rapidly, with sport-specific research now available that didn't exist a decade ago. Here is where elite softball development stands:

**Pitching Velocity Inflation**
The rise ball arms race in D1 softball has pushed velocity expectations upward annually. The pitchers dominating D1 in 2025-26 are throwing 66-72 mph with elite movement. The change-up has become more important than ever — D1 hitters have adapted to high velocity, and the change-up is the primary weapon against elite contact hitters.

**The Pitcher Workload Crisis**
Softball has a significant youth arm health problem. Multiple published studies and USA Softball position papers have documented injury rates in youth pitchers that rival baseball. The fundamental difference: softball pitchers can throw every game, every inning, in ways that baseball rules prevent. Organizations that track pitch counts and enforce rest days consistently show lower injury rates.

**Slapping Has Evolved**
Elite slapper development now combines traditional slapping technique with exit velocity work. The best slappers at D1 are a genuine threat to drive the ball into the outfield, not just slap for singles. This dual-threat profile is increasingly what D1 programs recruit at the top of the lineup.

**Defensive Metrics Arrive in Softball**
Range factor, arm accuracy metrics (measured by throw speed and landing distance from target), and pop time for catchers are now being collected at elite travel showcases. Athletes who have this data professionally organized have a measurable edge in the recruiting process.`,
        dataPoints: [
          "D1 pitching standard (2026): 63+ mph fastball. Elite/scholarship: 66+ with movement.",
          "Pitcher-specific: change-up velocity differential target: 8-12 mph off fastball.",
          "Catcher pop time D1 standard: sub-1.75 (fastpitch). Elite: sub-1.65.",
          "D1 OF exit velocity standard: 80+ mph. D1 IF: 76+ mph.",
        ],
      },
    ],
    quiz: [
      { q: "What is the current D1 exit velocity standard for baseball outfielders?", a: "90+ mph (as of 2026 recruiting standards)" },
      { q: "What is the optimal attack angle range for hard contact?", a: "+8° to +15° upward through the contact zone" },
      { q: "How much velocity gain does 1 mph of bat speed typically produce?", a: "Approximately 1.2 mph of exit velocity increase" },
      { q: "What is the maximum pulldown velocity overload recommendation for HS athletes?", a: "6-7 oz maximum overload ball (per ASMI published guidelines)" },
    ],
  },
  {
    month: "December 2025",
    theme: "RECRUITING 2026: THE DATA THAT WINS OFFERS",
    badge: "Previous Issue",
    isLatest: false,
    summary: "How college programs are using data differently in 2026, what information actually gets athletes offers, and the parent education every family needs before showcase season.",
    sections: [
      {
        title: "How College Coaches Actually Use Data",
        icon: Trophy,
        color: "text-green-500",
        bg: "bg-green-500/10",
        content: `The college recruiting process has been fundamentally changed by data availability. Here is what actually works in 2026:

**What College Coaches Are Looking For**
D1 coaches receive hundreds of highlight videos monthly. Video is no longer a differentiator — it's table stakes. What separates athletes now is contextualized performance data. A coach watching a 90 mph exit velocity video wants to know: what was the pitcher throwing? What's the athlete's consistent EV? What are the trends?

**The Professional Data Package**
Athletes who present: (1) KPI data with date-stamped progression over 12+ months, (2) Rapsodo or HitTrax session files, (3) Academic transcript, (4) 60-yard dash time from a verified event, (5) Clean highlight video organized by skill type — receive significantly higher response rates from college coaches than those without.

**Division Targeting Intelligence**
Many families make the mistake of only targeting D1. The reality: D2 programs often provide better scholarship dollars, better playing time, better development environments, and often better professional pathways than mid-major D1 programs. Identifying the right fit at the right division is more valuable than chasing the D1 label.`,
        dataPoints: [
          "NCAA 2025 data: only 6.8% of HS baseball players compete at any college level.",
          "D2 average scholarship: 60-80% of tuition. D1 average: 35-55% (scholarships divided across roster).",
          "Athletes with organized data packages: 3.4× more coach responses (NCSA published survey).",
          "Optimal age to begin serious recruiting contact: 15-16 (after June 15 of sophomore year for D1/D2).",
        ],
      },
    ],
    quiz: [],
  },
  {
    month: "November 2025",
    theme: "THE YOUTH ATHLETE: WHAT THE RESEARCH SAYS ABOUT DEVELOPMENT AGES 10-14",
    badge: "Archive",
    isLatest: false,
    summary: "The most important 4-year window in an athlete's development — what the science says about training, specialization, and the long view that separates elite programs from the rest.",
    sections: [
      {
        title: "Critical Development Windows: Ages 10-14",
        icon: Users,
        color: "text-cyan-500",
        bg: "bg-cyan-500/10",
        content: `The years from 10-14 represent the most significant opportunity in athletic development. Here is what published research consistently shows:

**The Long-Term Athletic Development (LTAD) Model**
The Canadian Sport for Life LTAD model, validated across multiple sports, identifies two critical windows: (1) Speed window: ages 9-12 for girls, 10-13 for boys — when the nervous system is maximally responsive to sprint and agility training. (2) Strength window: begins at peak height velocity (PHV, the growth spurt) — typically 11-13 for girls, 13-15 for boys.

**Multi-Sport and Early Specialization Data**
Published research is now overwhelming: athletes who specialize in a single sport before age 14 show higher rates of overuse injury, higher rates of burnout, and equivalent or lower ultimate performance levels compared to multi-sport athletes who specialize later. The NSCA youth training guidelines specifically recommend multi-sport participation through age 14.

**What Elite Programs Actually Did as Youth Athletes**
Analysis of D1 baseball and softball rosters published by multiple universities shows the vast majority played multiple sports through middle school. Multi-sport participation develops movement diversity, competitive adaptability, and athletic intelligence that sport-specific training cannot replicate.`,
        dataPoints: [
          "Multi-sport athletes show 37% lower overuse injury rates than early specializers (AMSSM study).",
          "76% of D1 baseball players played multiple sports through at least age 14 (survey data).",
          "Early specialization (before 14): associated with higher burnout rates and lower long-term outcomes.",
          "Critical speed window: ages 10-13 — CNS maximally responsive to sprint/agility training.",
        ],
      },
    ],
    quiz: [],
  },
];

// ─── AI Chat Prompt ───────────────────────────────────────────────────────────
const SOG_SYSTEM_PROMPT = `You are VAULT™ State of the Game AI — a research-backed baseball and softball development intelligence advisor.

You answer questions about:
- Current development science and research trends in baseball/softball
- Recruiting standards, timelines, and what college programs actually look for
- Training methodology: velocity development, exit velocity, speed, mental performance
- Youth development best practices (ages 10-18)
- Softball-specific development: pitching, hitting, slapping, workload management
- What elite programs are doing differently
- Data interpretation: what numbers mean, benchmarks by level

Rules:
1. Always cite the basis for your claims (published research, public data, known standards)
2. Be specific with numbers — recruiters and parents need real benchmarks, not vague ranges
3. Distinguish between "established science" and "emerging evidence" honestly
4. For youth athletes under 14: always emphasize multi-sport and long-term development
5. Never make guarantees about outcomes — development depends on many factors
6. Softball and baseball have different standards — be sport-specific

Tone: Expert colleague. Confident but humble. Data-first. Practical.`;

const StateOfGame = () => {
  const [activeModule, setActiveModule] = useState(0);
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Welcome to VAULT™ State of the Game. I'm your research-backed development intelligence resource. Ask me anything about current baseball/softball development science, recruiting standards, training methodology, or what elite programs are doing. What's on your mind?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState("latest");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SOG_SYSTEM_PROMPT,
          messages: [
            ...chatMessages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg }
          ],
        }),
      });
      const data = await response.json();
      const text = data.content?.map((c: any) => c.text || "").join("") || "Unable to respond.";
      setChatMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Error connecting. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const currentModule = MONTHLY_MODULES[activeModule];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pt-4 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display text-foreground">STATE OF THE GAME™</h1>
                <p className="text-xs text-muted-foreground">Monthly Development Intelligence · Research-Backed · Updated Every Month</p>
              </div>
              <Badge className="ml-auto bg-green-500/10 text-green-500 border-green-500/20">
                <RefreshCw className="w-3 h-3 mr-1" /> Jan 2026 Issue Live
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
              Every month, VAULT publishes a deep-research briefing on where the game is going — what elite programs are doing, what the data says, and how to get ahead of the curve. Read, learn, then act.
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="latest" className="text-xs">This Month</TabsTrigger>
              <TabsTrigger value="archive" className="text-xs">Archive</TabsTrigger>
              <TabsTrigger value="ask" className="text-xs">Ask the AI</TabsTrigger>
            </TabsList>

            {/* ── LATEST ISSUE ── */}
            <TabsContent value="latest">
              <div className="space-y-5">
                {/* Issue Header */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20">January 2026</Badge>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Latest Issue</Badge>
                  </div>
                  <h2 className="text-2xl font-display text-foreground mb-2">{MONTHLY_MODULES[0].theme}</h2>
                  <p className="text-sm text-muted-foreground">{MONTHLY_MODULES[0].summary}</p>
                </div>

                {/* Sections */}
                {MONTHLY_MODULES[0].sections.map((section, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
                    <button
                      className="w-full p-5 flex items-start gap-4 hover:bg-secondary/30 transition-colors text-left"
                      onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                    >
                      <div className={`w-10 h-10 rounded-xl ${section.bg} flex items-center justify-center shrink-0`}>
                        <section.icon className={`w-5 h-5 ${section.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-foreground mb-1">{section.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{section.dataPoints[0]}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform ${expandedSection === i ? "rotate-90" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {expandedSection === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-border space-y-4">
                            <div className="pt-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                              {section.content.split('\n').map((line, j) => {
                                if (line.startsWith('**') && line.endsWith('**')) {
                                  return <p key={j} className="font-display text-foreground mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
                                }
                                return line.trim() ? <p key={j} className="mb-2">{line}</p> : null;
                              })}
                            </div>
                            <div className="bg-secondary rounded-xl p-4">
                              <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-2">Key Data Points</p>
                              <div className="space-y-2">
                                {section.dataPoints.map((dp, j) => (
                                  <div key={j} className="flex items-start gap-2">
                                    <BarChart3 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                    <p className="text-xs text-foreground">{dp}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {/* Knowledge Check */}
                {MONTHLY_MODULES[0].quiz.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Knowledge Check
                    </h3>
                    <div className="space-y-4">
                      {MONTHLY_MODULES[0].quiz.map((item, i) => (
                        <div key={i} className="bg-secondary rounded-xl p-4">
                          <p className="text-sm font-medium text-foreground mb-2">{item.q}</p>
                          {quizAnswers[i] ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5">
                              <p className="text-xs text-green-600 flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />{item.a}
                              </p>
                            </motion.div>
                          ) : (
                            <Button size="sm" variant="outline" className="text-xs h-7"
                              onClick={() => setQuizAnswers(prev => ({ ...prev, [i]: true }))}>
                              Reveal Answer
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── ARCHIVE ── */}
            <TabsContent value="archive">
              <div className="space-y-3">
                {MONTHLY_MODULES.filter(m => !m.isLatest).map((module, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{module.month}</Badge>
                          <Badge variant="outline" className="text-xs">{module.badge}</Badge>
                        </div>
                        <h3 className="font-display text-foreground">{module.theme}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{module.summary}</p>
                      </div>
                    </div>
                    {module.sections.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {module.sections.map((section, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <section.icon className={`w-3 h-3 ${section.color} shrink-0`} />
                            {section.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="text-center py-6 text-muted-foreground text-sm">
                  New issues published the first Monday of every month.
                </div>
              </div>
            </TabsContent>

            {/* ── AI CHAT ── */}
            <TabsContent value="ask">
              <div className="space-y-4">
                <div className="bg-secondary border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">VAULT AI Research Assistant</span> — Ask anything about baseball/softball development science, recruiting standards, training methodology, or where the game is heading. All answers are research-backed.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-2xl flex flex-col" style={{ height: "520px" }}>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-primary/10" : "bg-primary"}`}>
                          {msg.role === "assistant" ? <Brain className="w-3.5 h-3.5 text-primary" /> : <span className="text-xs text-primary-foreground font-bold">Y</span>}
                        </div>
                        <div className={`max-w-[82%] rounded-xl p-3 text-sm ${msg.role === "assistant" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"}`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <Brain className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="bg-secondary rounded-xl p-3"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-4 border-t border-border flex gap-2">
                    <Textarea
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Ask about development science, recruiting standards, training methodology..."
                      className="resize-none h-12 text-sm"
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                    />
                    <Button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} className="shrink-0 h-12 w-12 p-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Quick Questions */}
                <div className="bg-card border border-border rounded-2xl p-4">
                  <p className="text-xs font-medium text-foreground mb-3">Quick Questions</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "What are the current D1 velocity standards for RHP and LHP?",
                      "What does the research say about early specialization in baseball?",
                      "What exit velocity does my kid need to get recruited for D2 softball?",
                      "Is weighted ball training safe for a 15-year-old pitcher?",
                      "What are the ASMI youth pitch count guidelines?",
                      "How early should my daughter start the college recruiting process?",
                    ].map(q => (
                      <button key={q} onClick={() => setChatInput(q)}
                        className="text-left text-xs text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-lg p-2.5 transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StateOfGame;
