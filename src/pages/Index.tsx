import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, MessageCircle, Download, Check, Zap, Target, Shield,
  TrendingUp, Users, Star, ChevronDown, X, AlertTriangle, Gauge,
  Dumbbell, Heart, Shuffle, BarChart3, BookOpen, Clock, ArrowDown, CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DevelopmentPathway from "@/components/home/DevelopmentPathway";
import AthleteResults from "@/components/home/AthleteResults";
import ContentAuthority from "@/components/home/ContentAuthority";
import UpcomingLessons from "@/components/dashboard/UpcomingLessons";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

const stagger = (i: number, base = 0.06) => ({ delay: i * base });

const Index = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [dashboardPath, setDashboardPath] = useState("/dashboard");
  const [dashboardLabel, setDashboardLabel] = useState("My Dashboard");

  const resolveDashboardPath = async (uid: string | null) => {
    if (!uid) {
      setDashboardPath("/dashboard");
      setDashboardLabel("My Dashboard");
      return;
    }

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "coach")
      .maybeSingle();

    const isCoach = !!roleRow;
    setDashboardPath(isCoach ? "/coach-dashboard" : "/dashboard");
    setDashboardLabel(isCoach ? "Coach Dashboard" : "My Dashboard");
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      resolveDashboardPath(uid);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      resolveDashboardPath(uid);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openEddie = () => {
    const btn = document.querySelector('[aria-label="Ask Eddie AI"]') as HTMLButtonElement;
    if (btn) btn.click();
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Quick access for logged-in users */}
      {userId && (
        <div className="relative z-50 bg-primary text-primary-foreground px-4 py-3">
          <div className="container mx-auto max-w-4xl flex items-center justify-between">
            <span className="text-sm font-medium">You're logged in — access your dashboard for lessons, schedules & more.</span>
            <Button size="sm" variant="secondary" onClick={() => navigate(dashboardPath)} className="shrink-0 ml-3">
              {dashboardLabel} →
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        {/* BG */}
        <div className="absolute inset-0 bg-foreground" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--background)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--background)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Diagonal accent line */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04]" style={{
          background: "linear-gradient(135deg, transparent 30%, hsl(var(--background)) 100%)",
        }} />

        <div className="container mx-auto px-4 relative z-10 py-32 md:py-0">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Tag */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-block px-4 py-1.5 border border-primary-foreground/15 text-primary-foreground/50 text-[11px] font-display tracking-[0.35em]">
                  BASEBALL DEVELOPMENT — SYSTEMATIZED
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-[clamp(2.8rem,8vw,7rem)] font-display text-primary-foreground leading-[0.88] tracking-tight"
              >
                STOP GUESSING.
                <br />
                <span className="text-primary-foreground/40">START DEVELOPING.</span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-base md:text-lg text-primary-foreground/50 max-w-xl font-body leading-relaxed"
              >
                Vault gives baseball athletes a structured system for velocity, arm care, strength, and long-term performance development. No hype. No guesswork. Just results.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="flex flex-col sm:flex-row gap-3 pt-2"
              >
                <Button
                  size="xl"
                  className="font-display tracking-wide bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
                  onClick={() => navigate("/book-session")}
                >
                  <CalendarDays className="w-5 h-5 mr-2" />
                  BOOK DEVELOPMENT SESSION
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="font-display tracking-wide border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-foreground"
                  onClick={() => navigate("/evaluate")}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  SUBMIT ATHLETE VIDEO
                </Button>
              </motion.div>

              {/* Trust */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4"
              >
                {["500+ Athletes", "Ages 12–18", "No Card Required"].map((t, i) => (
                  <span key={i} className="text-[11px] text-primary-foreground/25 font-display tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary-foreground/20 rounded-full" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-primary-foreground/20 font-display tracking-[0.3em]">SCROLL</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          >
            <ArrowDown className="w-4 h-4 text-primary-foreground/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ STAT BAR ═══════════ */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { value: "6+", label: "AVG MPH GAINED" },
              { value: "500+", label: "ATHLETES TRAINED" },
              { value: "12", label: "WEEK SYSTEM" },
              { value: "5", label: "DEVELOPMENT PILLARS" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={stagger(i)}
                className="py-6 md:py-8 text-center"
              >
                <p className="text-3xl md:text-4xl font-display text-foreground">{s.value}</p>
                <p className="text-[10px] md:text-[11px] text-muted-foreground font-display tracking-[0.2em] mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PROBLEM: PAIN POINTS ═══════════ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto">
            <div className="mb-12 md:mb-16">
              <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground mb-4 block">THE PROBLEM</span>
              <h2 className="text-3xl md:text-5xl font-display text-foreground leading-[0.95]">
                HARD WORK WITHOUT A SYSTEM
                <br className="hidden md:block" />
                <span className="text-muted-foreground"> IS JUST WASTED EFFORT</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: Gauge, title: "Velocity plateau", text: "Throwing hard in practice, but your numbers won't move. You don't know what's holding you back." },
                { icon: AlertTriangle, title: "Arm soreness ignored", text: "Something doesn't feel right, but there's no protocol — just 'rest and come back.'" },
                { icon: Clock, title: "Money without structure", text: "Spending on lessons, camps, and gear — but nobody can show you the plan." },
                { icon: X, title: "Conflicting advice", text: "Every coach says something different. YouTube drills contradict your trainer. Nothing connects." },
                { icon: BarChart3, title: "No way to measure", text: "You're working, but you can't prove it. No data. No benchmarks. No trajectory." },
                { icon: Target, title: "Showcase anxiety", text: "College timeline is ticking. You don't know if you're on track or falling behind." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={stagger(i)}
                  className="flex items-start gap-4 p-5 bg-card border border-border group hover:border-foreground/20 transition-colors"
                >
                  <div className="w-9 h-9 bg-destructive/8 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-display text-foreground tracking-wide mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ ROOT CAUSE ═══════════ */}
      <section className="py-20 md:py-28 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-5xl mx-auto">
            <div className="mb-12 md:mb-16 max-w-2xl">
              <span className="text-[11px] font-display tracking-[0.3em] text-primary-foreground/30 mb-4 block">THE ROOT CAUSE</span>
              <h2 className="text-3xl md:text-5xl font-display leading-[0.95]">
                RANDOM TRAINING
                <br />
                PRODUCES RANDOM RESULTS.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-px bg-primary-foreground/10">
              {[
                {
                  num: "01",
                  title: "NO BASELINE",
                  desc: "You're training without knowing your current velocity, movement quality, or benchmarks. You can't improve what you can't measure.",
                },
                {
                  num: "02",
                  title: "NO STRUCTURE",
                  desc: "Jumping between drills, programs, and trainers. Development requires progressive overload across every pillar — not random workouts.",
                },
                {
                  num: "03",
                  title: "NO ACCOUNTABILITY",
                  desc: "Without tracking and coaching checkpoints, momentum dies. The best gains come from consistent, monitored, data-backed work.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={stagger(i, 0.12)}
                  className="bg-foreground p-8 md:p-10"
                >
                  <span className="text-6xl font-display text-primary-foreground/8">{item.num}</span>
                  <h3 className="font-display text-xl tracking-wide mt-2 mb-3">{item.title}</h3>
                  <p className="text-sm text-primary-foreground/45 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ THE V.A.U.L.T. SYSTEM ═══════════ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-5xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground mb-4 block">THE SOLUTION</span>
              <h2 className="text-4xl md:text-6xl font-display text-foreground mb-3">THE V.A.U.L.T. SYSTEM</h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
                Five pillars. One system. Every drill, metric, and coaching decision maps to measurable development.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-0 border border-border">
              {[
                { letter: "V", name: "Velocity", icon: Zap, cssVar: "--vault-velocity", desc: "Arm speed & exit velo programming" },
                { letter: "A", name: "Athleticism", icon: Dumbbell, cssVar: "--vault-athleticism", desc: "Speed, power, agility development" },
                { letter: "U", name: "Utility", icon: Shuffle, cssVar: "--vault-utility", desc: "Game IQ & positional versatility" },
                { letter: "L", name: "Longevity", icon: Heart, cssVar: "--vault-longevity", desc: "Arm care & injury prevention" },
                { letter: "T", name: "Transfer", icon: Target, cssVar: "--vault-transfer", desc: "Practice → game performance" },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={stagger(i, 0.08)}
                  className="text-center p-6 md:p-8 border-b sm:border-b-0 sm:border-r last:border-r-0 last:border-b-0 border-border group hover:bg-card transition-colors"
                >
                  <div className="text-5xl md:text-6xl font-display mb-2 transition-colors" style={{ color: `hsl(var(${p.cssVar}))` }}>
                    {p.letter}
                  </div>
                  <p className="font-display text-sm tracking-wider text-foreground mb-1">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{p.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button
                size="lg"
                variant="vault"
                className="font-display tracking-wide"
                onClick={openEddie}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                FIND YOUR STARTING POINT
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ WHO IT'S FOR ═══════════ */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-5xl mx-auto">
            <div className="mb-12 md:mb-16">
              <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground mb-4 block">WHO IT'S FOR</span>
              <h2 className="text-3xl md:text-5xl font-display text-foreground leading-[0.95]">
                BUILT FOR SERIOUS
                <br className="hidden md:block" />
                BASEBALL FAMILIES.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Zap, title: "ATHLETES (12–18)", points: ["Want to throw harder and hit farther", "Need a plan — not random drills", "Preparing for showcases or tryouts", "Want college-ready benchmarks"] },
                { icon: Users, title: "PARENTS", points: ["Want measurable improvement proof", "Done paying for lessons with no plan", "Worried about arm health and overuse", "Need a system they can trust"] },
                { icon: BookOpen, title: "COACHES", points: ["Need a development curriculum", "Want metrics to track each athlete", "Building programs across age groups", "Looking for coach certification"] },
              ].map((group, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={stagger(i, 0.1)}
                  className="bg-card border border-border p-7 md:p-8"
                >
                  <group.icon className="w-7 h-7 text-foreground mb-5" />
                  <h3 className="font-display text-lg tracking-wide text-foreground mb-5">{group.title}</h3>
                  <ul className="space-y-3">
                    {group.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-foreground shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ OFFER LADDER ═══════════ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-5xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground mb-4 block">THE PATH</span>
              <h2 className="text-3xl md:text-5xl font-display text-foreground mb-3">
                START FREE. GO AS FAR AS
                <br className="hidden md:block" />
                YOUR GOALS DEMAND.
              </h2>
              <p className="text-sm text-muted-foreground">Every level builds on the last. Pick your entry point.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: "01", name: "Free Athlete Evaluation", price: "FREE", desc: "Get your development score, velocity potential, and personalized program recommendation. Takes 2 minutes.", cta: "Start Evaluation", href: "/evaluate", highlight: false },
                { step: "02", name: "Development Assessment", price: "$97", desc: "Professional video analysis, development scorecard, and custom improvement plan within 48 hours.", cta: "Get Assessment", href: "/products/athlete-assessment", highlight: false },
                { step: "03", name: "Vault Velocity System", price: "$397", desc: "Complete 12-week self-guided velocity program. Drills, metrics, progressive overload — all built in.", cta: "Start the System", href: "/products/velocity-system", highlight: true },
                { step: "04", name: "Remote Training", price: "$199/mo", desc: "Monthly coaching, weekly programming, metrics tracking, and direct coach access. Cancel anytime.", cta: "Join Now", href: "/products/remote-training", highlight: false },
              ].map((offer, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={stagger(i, 0.08)}
                  className={`relative p-6 md:p-7 border flex flex-col ${offer.highlight ? "bg-foreground text-primary-foreground border-foreground ring-1 ring-foreground" : "bg-card text-foreground border-border"}`}
                >
                  {offer.highlight && (
                    <span className="absolute -top-3 left-4 px-3 py-1 bg-destructive text-destructive-foreground text-[10px] font-display tracking-widest">MOST POPULAR</span>
                  )}
                  <span className={`text-[10px] font-display tracking-[0.25em] mb-4 ${offer.highlight ? "text-primary-foreground/30" : "text-muted-foreground"}`}>STEP {offer.step}</span>
                  <h3 className="font-display text-lg tracking-wide mb-1">{offer.name}</h3>
                  <p className="text-3xl font-display mb-3">{offer.price}</p>
                  <p className={`text-xs mb-6 flex-1 leading-relaxed ${offer.highlight ? "text-primary-foreground/45" : "text-muted-foreground"}`}>{offer.desc}</p>
                  <Button
                    variant={offer.highlight ? "secondary" : "vault"}
                    className="w-full"
                    onClick={() => navigate(offer.href)}
                  >
                    {offer.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8">
              Not sure where to start?{" "}
              <button onClick={openEddie} className="underline text-foreground font-medium hover:no-underline">Ask Eddie AI</button> — he'll recommend the right product for your athlete.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ DEVELOPMENT PATHWAY ═══════════ */}
      <DevelopmentPathway />

      {/* ═══════════ ATHLETE RESULTS ═══════════ */}
      <AthleteResults />

      {/* ═══════════ PHILOSOPHY ═══════════ */}
      <section className="py-20 md:py-28 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto">
            <span className="text-[11px] font-display tracking-[0.3em] text-primary-foreground/30 mb-4 block">PHILOSOPHY</span>
            <h2 className="text-3xl md:text-5xl font-display leading-[0.95] mb-8">
              DEVELOPMENT OVER HYPE.
              <br />
              <span className="text-primary-foreground/35">ALWAYS.</span>
            </h2>
            <div className="space-y-6 text-sm md:text-base text-primary-foreground/50 leading-relaxed">
              <p>
                Vault doesn't sell quick fixes, magic drills, or "secret velocity hacks." We build athletes through structured, measurable, progressive development — the same way every elite program operates.
              </p>
              <p>
                Every protocol in the Vault system is rooted in biomechanics, strength science, and real coaching experience. If it doesn't produce results, it doesn't make the cut.
              </p>
              <p>
                We don't chase trends. We build systems. That's the difference between athletes who plateau and athletes who develop year over year.
              </p>
            </div>
            <div className="mt-10 pt-8 border-t border-primary-foreground/10">
              <p className="font-display text-lg tracking-wide text-primary-foreground/70">
                — Eddie Mejia, Founder & Development Architect
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ CONTENT AUTHORITY ═══════════ */}
      <ContentAuthority />

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-5xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground mb-4 block">RESULTS</span>
              <h2 className="text-3xl md:text-5xl font-display text-foreground">ATHLETES ARE GAINING REAL VELOCITY</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "J.M.", detail: "16 · RHP", quote: "I gained 6 mph in 8 weeks on the Velocity System. The drills are structured and they actually make sense.", stat: "+6 MPH", label: "Pitching Velo" },
                { name: "Parent Review", detail: "Parent · Son age 14", quote: "We finally feel like we're investing in something real. We can see his metrics and know exactly what he's working on.", stat: "5-PILLAR", label: "Full Tracking" },
                { name: "D.R.", detail: "17 · RHP/1B", quote: "The Remote Training keeps me accountable. I know exactly where I stand for college benchmarks.", stat: "+8 MPH", label: "Pitching Velo" },
                { name: "M.W.", detail: "14 · IF/P", quote: "Vault showed me exactly where I was losing velocity. In two months I went from 62 to 66.", stat: "+4 MPH", label: "Pitching Velo" },
                { name: "Coach R.K.", detail: "Head Coach · Travel Ball", quote: "I put my entire 14U team on Vault. The system gives me a framework for developing each player individually.", stat: "12", label: "Athletes Coached" },
                { name: "Parent Review", detail: "Parent · Son age 16", quote: "We spent thousands on private lessons last year with no plan. Vault gave us more structure in one month.", stat: "$397", label: "Full System" },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={stagger(i, 0.06)}
                  className="bg-card border border-border p-6 flex flex-col"
                >
                  <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-foreground text-foreground" />)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-5 italic leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="flex items-end justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground">{t.detail}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-lg font-display text-foreground">{t.stat}</span>
                      <span className="text-[10px] text-muted-foreground tracking-wider font-display">{t.label}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto">
            <div className="mb-12">
              <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground mb-4 block">FAQ</span>
              <h2 className="text-3xl md:text-5xl font-display text-foreground">COMMON QUESTIONS</h2>
            </div>
            <FAQSection />
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-24 md:py-36 bg-foreground text-primary-foreground relative overflow-hidden">
        {/* BG accent */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage:
            "linear-gradient(hsl(var(--background)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--background)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display leading-[0.88] mb-5">
              YOUR DEVELOPMENT
              <br />
              STARTS NOW.
            </h2>
            <p className="text-base md:text-lg text-primary-foreground/45 mb-10 max-w-lg mx-auto">
              Join the athletes and families who replaced random training with a real system — and started seeing results.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="xl"
                className="font-display tracking-wide bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
                onClick={() => navigate("/evaluate")}
              >
                <Zap className="w-5 h-5 mr-2" />
                START YOUR FREE EVALUATION
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-display tracking-wide border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-foreground"
                onClick={() => navigate("/products/velocity-system")}
              >
                VIEW VELOCITY SYSTEM
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-8">
              {["No Credit Card", "Instant Access", "Ages 12–18"].map((t, i) => (
                <span key={i} className="text-[10px] text-primary-foreground/20 font-display tracking-[0.2em]">{t}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-20 md:py-28 bg-foreground">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center space-y-6">
            <span className="text-[11px] font-display tracking-[0.3em] text-primary-foreground/40 block">GET STARTED TODAY</span>
            <h2 className="text-3xl md:text-5xl font-display text-primary-foreground">READY TO DEVELOP?</h2>
            <p className="text-sm text-primary-foreground/50 max-w-lg mx-auto">
              Book a session with a Vault coach, submit your video for evaluation, or start a training program. Your development starts now.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                size="lg"
                className="font-display tracking-wide bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
                onClick={() => navigate("/book-session")}
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                BOOK DEVELOPMENT SESSION
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-display tracking-wide border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-foreground"
                onClick={() => navigate("/evaluate")}
              >
                SUBMIT ATHLETE VIDEO
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-display tracking-wide border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-foreground"
                onClick={() => navigate("/courses")}
              >
                START TRAINING PROGRAM
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "What age group is Vault designed for?", a: "Vault is built for baseball athletes ages 12–18. The system scales to any skill level — from first-year travel ball to pre-college showcase athletes." },
    { q: "Do I need special equipment?", a: "No. A ball, glove, and access to a field or cage is all you need. For advanced metrics, Vault integrates with Rapsodo and Blast Motion — but they're optional." },
    { q: "How is this different from private lessons?", a: "Private lessons give you one coach's opinion for one hour a week. Vault gives you a complete system: structured programming, measurable benchmarks, arm care protocols, and ongoing tracking across all 5 pillars." },
    { q: "I'm not sure which product to start with.", a: "Ask Eddie AI. He'll ask about your goals, age, position, and current level, then recommend exactly where to start. Most athletes begin with the free guide or Velo-Check." },
    { q: "Is there a money-back guarantee?", a: "Yes. If you complete the work and don't see measurable improvement, contact us. We stand behind the system because the system works when you follow it." },
    { q: "Can coaches use Vault for their teams?", a: "Absolutely. We offer team licenses, coach certification programs, and organizational dashboards." },
    { q: "How quickly will I see results?", a: "Most athletes see measurable velocity gains within 4–6 weeks. The full 12-week program is designed for sustained improvement, not quick fixes." },
  ];

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-border bg-card">
          <button
            className="w-full flex items-center justify-between p-5 text-left"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span className="font-display text-foreground text-sm tracking-wide">{faq.q}</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ml-4 ${openIndex === i ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default Index;
