import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Target, TrendingUp, ArrowRight, Loader2, CheckCircle, BarChart3, Activity, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const evalSchema = z.object({
  athlete_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email").max(255),
  parent_email: z.string().email("Enter a valid parent email").max(255).or(z.literal("")),
  age: z.number().min(8, "Age must be 8+").max(22, "Age must be 22 or under"),
  position: z.string().min(1, "Select a position"),
  current_velocity: z.string().max(20).optional(),
});

type EvalResult = {
  development_score: number;
  development_tier: string;
  velocity_potential: string;
  strengths: string[];
  improvement_areas: string[];
  recommended_program: string;
  recommendation_reason: string;
  key_metrics_to_track: string[];
  summary: string;
};

const FreeEvaluation = () => {
  const [formData, setFormData] = useState({
    athlete_name: "",
    email: "",
    parent_email: "",
    age: "",
    position: "",
    current_velocity: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = evalSchema.parse({
        ...formData,
        age: parseInt(formData.age) || 0,
      });
      setErrors({});

      setLoading(true);

      const { data, error } = await supabase.functions.invoke("free-evaluation", {
        body: {
          athlete_name: validated.athlete_name,
          email: validated.email,
          parent_email: validated.parent_email || undefined,
          age: validated.age,
          position: validated.position,
          current_velocity: validated.current_velocity || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data.evaluation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Evaluation Error",
          description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const programRoutes: Record<string, string> = {
    "Vault Development Assessment": "/products/athlete-assessment",
    "Vault Velocity System": "/products/velocity-system",
    "Vault Remote Training": "/products/remote-training",
  };

  const tierColors: Record<string, string> = {
    Foundation: "text-vault-utility",
    Development: "text-vault-athleticism",
    "Recruiting Ready": "text-vault-longevity",
    Elite: "text-vault-velocity",
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-foreground text-primary-foreground py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] font-display tracking-[0.3em] text-primary-foreground/30 mb-4 block"
            >
              FREE ATHLETE EVALUATION
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display leading-[0.9] mb-4"
            >
              WHERE DOES YOUR ATHLETE
              <br />
              <span className="text-primary-foreground/40">ACTUALLY STAND?</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-primary-foreground/50 max-w-lg mx-auto"
            >
              Get a development rating, velocity potential, and personalized program recommendation — in under 2 minutes. No card required.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-display text-foreground mb-6">ATHLETE INFORMATION</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label className="text-xs font-display tracking-wider text-muted-foreground">ATHLETE NAME *</Label>
                      <Input
                        value={formData.athlete_name}
                        onChange={(e) => setFormData((p) => ({ ...p, athlete_name: e.target.value }))}
                        className="mt-1"
                        placeholder="First and last name"
                      />
                      {errors.athlete_name && <p className="text-destructive text-xs mt-1">{errors.athlete_name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-display tracking-wider text-muted-foreground">ATHLETE EMAIL *</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                          className="mt-1"
                          placeholder="athlete@email.com"
                        />
                        {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <Label className="text-xs font-display tracking-wider text-muted-foreground">PARENT EMAIL</Label>
                        <Input
                          type="email"
                          value={formData.parent_email}
                          onChange={(e) => setFormData((p) => ({ ...p, parent_email: e.target.value }))}
                          className="mt-1"
                          placeholder="parent@email.com"
                        />
                        {errors.parent_email && <p className="text-destructive text-xs mt-1">{errors.parent_email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs font-display tracking-wider text-muted-foreground">AGE *</Label>
                        <Input
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData((p) => ({ ...p, age: e.target.value }))}
                          className="mt-1"
                          placeholder="14"
                          min={8}
                          max={22}
                        />
                        {errors.age && <p className="text-destructive text-xs mt-1">{errors.age}</p>}
                      </div>
                      <div>
                        <Label className="text-xs font-display tracking-wider text-muted-foreground">POSITION *</Label>
                        <Select
                          value={formData.position}
                          onValueChange={(v) => setFormData((p) => ({ ...p, position: v }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {["RHP", "LHP", "C", "1B", "2B", "SS", "3B", "OF", "DH", "Utility"].map((pos) => (
                              <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.position && <p className="text-destructive text-xs mt-1">{errors.position}</p>}
                      </div>
                      <div>
                        <Label className="text-xs font-display tracking-wider text-muted-foreground">CURRENT VELO</Label>
                        <Input
                          value={formData.current_velocity}
                          onChange={(e) => setFormData((p) => ({ ...p, current_velocity: e.target.value }))}
                          className="mt-1"
                          placeholder="e.g. 72 mph"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="xl"
                      variant="vault"
                      className="w-full font-display tracking-wide"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          ANALYZING ATHLETE PROFILE...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          GET YOUR FREE EVALUATION
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-[11px] text-muted-foreground text-center">
                      Free. No credit card. Results in under 60 seconds.
                    </p>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle className="w-5 h-5 text-vault-longevity" />
                    <h2 className="text-2xl font-display text-foreground">EVALUATION COMPLETE</h2>
                  </div>

                  {/* Score card */}
                  <div className="border border-border bg-card p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs font-display tracking-wider text-muted-foreground">DEVELOPMENT SCORE</p>
                        <p className="text-5xl font-display text-foreground">{result.development_score}<span className="text-2xl text-muted-foreground">/100</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-display tracking-wider text-muted-foreground">CURRENT STAGE</p>
                        <p className={`text-xl font-display ${tierColors[result.development_tier] || "text-foreground"}`}>{result.development_tier}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                  </div>

                  {/* Velocity potential */}
                  <div className="border border-border bg-card p-5 mb-4">
                    <p className="text-xs font-display tracking-wider text-muted-foreground mb-1">VELOCITY POTENTIAL</p>
                    <p className="text-sm text-foreground font-medium">{result.velocity_potential}</p>
                  </div>

                  {/* Strengths & Areas */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border border-border bg-card p-5">
                      <p className="text-xs font-display tracking-wider text-vault-longevity mb-3">STRENGTHS</p>
                      <ul className="space-y-2">
                        {result.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-vault-longevity shrink-0 mt-0.5" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border border-border bg-card p-5">
                      <p className="text-xs font-display tracking-wider text-vault-velocity mb-3">IMPROVE</p>
                      <ul className="space-y-2">
                        {result.improvement_areas.map((a, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <Target className="w-3 h-3 text-vault-velocity shrink-0 mt-0.5" />{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* KPIs to track */}
                  <div className="border border-border bg-card p-5 mb-6">
                    <p className="text-xs font-display tracking-wider text-muted-foreground mb-3">KEY METRICS TO TRACK</p>
                    <div className="flex flex-wrap gap-2">
                      {result.key_metrics_to_track.map((m, i) => (
                        <span key={i} className="px-3 py-1 border border-border text-[11px] font-display tracking-wider text-foreground">{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Recommended program */}
                  <div className="border-2 border-foreground bg-foreground text-primary-foreground p-6">
                    <p className="text-xs font-display tracking-wider text-primary-foreground/30 mb-2">RECOMMENDED NEXT STEP</p>
                    <h3 className="text-xl font-display mb-2">{result.recommended_program}</h3>
                    <p className="text-sm text-primary-foreground/50 mb-4">{result.recommendation_reason}</p>
                    <Button
                      className="w-full bg-primary-foreground text-foreground hover:bg-primary-foreground/90 font-display tracking-wide"
                      onClick={() => navigate(programRoutes[result.recommended_program] || "/products")}
                    >
                      VIEW PROGRAM DETAILS
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4 font-display tracking-wide"
                    onClick={() => { setResult(null); setFormData({ athlete_name: "", email: "", parent_email: "", age: "", position: "", current_velocity: "" }); }}
                  >
                    EVALUATE ANOTHER ATHLETE
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right column — value props */}
            <div className="hidden lg:block">
              <div className="sticky top-32 space-y-6">
                <div className="border border-border bg-card p-7">
                  <h3 className="font-display text-lg text-foreground mb-5">WHAT YOU'LL GET</h3>
                  <ul className="space-y-4">
                    {[
                      { icon: BarChart3, label: "Development Score (1–100)", desc: "See exactly where your athlete ranks for their age group." },
                      { icon: TrendingUp, label: "Velocity Potential", desc: "AI-projected velocity ceiling based on age and current metrics." },
                      { icon: Activity, label: "Improvement Plan", desc: "Specific areas to focus on for the fastest measurable gains." },
                      { icon: Award, label: "Program Recommendation", desc: "The right Vault program matched to your athlete's stage." },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-muted flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-display tracking-wide text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-border bg-muted p-6">
                  <p className="text-xs text-muted-foreground italic mb-3">"I had no idea where my son actually stood. The Vault evaluation gave us a clear picture and the exact program to follow."</p>
                  <p className="text-xs font-display text-foreground">— Parent of 14U Athlete</p>
                </div>

                <div className="text-center">
                  <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground">500+ ATHLETES EVALUATED</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default FreeEvaluation;
