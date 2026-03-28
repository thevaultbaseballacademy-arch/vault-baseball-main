import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, ArrowRight, ArrowLeft, User, Users, Target, Zap, Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useActivationTracking } from "@/hooks/useActivationTracking";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STEPS = [
  { id: "identity", label: "Athlete Info", icon: User },
  { id: "metrics", label: "Current Numbers", icon: Zap },
  { id: "goals", label: "Goals & Struggles", icon: Target },
  { id: "connect", label: "Stay Connected", icon: Mail },
];

const AthleteOnboarding = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { track } = useActivationTracking();

  const [form, setForm] = useState({
    athlete_name: "",
    parent_name: "",
    age: "",
    email: "",
    current_level: "",
    position: "",
    current_velocity: "",
    exit_velo: "",
    sixty_time: "",
    athlete_goals: "",
    biggest_struggle: "",
    training_history: "",
    social_handle: "",
  });

  const productPurchased = searchParams.get("product") || null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        setForm(f => ({ ...f, email: session.user.email || "" }));
      }
    });
  }, []);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const canAdvance = () => {
    if (step === 0) return form.athlete_name.trim().length > 0;
    if (step === 3) return form.email.trim().length > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!form.email.trim()) {
      toast({ title: "Required", description: "Email is required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("athlete_onboarding").insert({
        user_id: userId,
        email: form.email.trim(),
        athlete_name: form.athlete_name.trim() || null,
        parent_name: form.parent_name.trim() || null,
        age: form.age ? parseInt(form.age) : null,
        athlete_goals: form.athlete_goals.trim() || null,
        biggest_struggle: form.biggest_struggle.trim() || null,
        training_history: form.training_history.trim() || null,
        current_level: form.current_level || null,
        position: form.position || null,
        current_velocity: form.current_velocity.trim() || null,
        exit_velo: form.exit_velo.trim() || null,
        sixty_time: form.sixty_time.trim() || null,
        social_handle: form.social_handle.trim() || null,
        product_purchased: productPurchased,
      });
      if (error) throw error;

      // Sync key fields to the user's profile for CRM / dashboard use
      if (userId) {
        const profileUpdate: Record<string, unknown> = {};
        if (form.athlete_name.trim()) profileUpdate.display_name = form.athlete_name.trim();
        if (form.position) profileUpdate.position = form.position;
        if (form.social_handle.trim()) profileUpdate.instagram_url = form.social_handle.trim();
        if (form.sixty_time.trim()) profileUpdate.sixty_yard_dash = parseFloat(form.sixty_time);

        if (Object.keys(profileUpdate).length > 0) {
          await supabase.from("profiles").update(profileUpdate).eq("user_id", userId);
        }
      }

      setSubmitted(true);
      track('onboarding_complete', { position: form.position, level: form.current_level });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else handleSubmit();
  };
  const back = () => { if (step > 0) setStep(s => s - 1); };

  const slideVariants = {
    enter: { x: 60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -60, opacity: 0 },
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-28 pb-20">
          <div className="container mx-auto px-4 max-w-xl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display text-foreground mb-3">YOU'RE IN</h1>
              <p className="text-lg text-muted-foreground mb-2">Welcome to the Vault, {form.athlete_name.split(" ")[0] || "athlete"}.</p>
              <p className="text-muted-foreground mb-10">Your personalized development path is being built. Here's what happens next:</p>

              <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left space-y-4">
                {[
                  "Your coach profile is being set up",
                  "You'll receive a welcome email with next steps",
                  "Access your training programs from the dashboard",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-display text-primary">{i + 1}</span>
                    </div>
                    <p className="text-sm text-foreground">{item}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="vault" size="lg" onClick={() => navigate("/my-programs")}>
                  Start Training <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1 border border-primary/20 text-primary text-xs font-display tracking-[0.2em] mb-4">
                POST-PURCHASE SETUP
              </span>
              <h1 className="text-3xl md:text-4xl font-display text-foreground mb-2">LET'S BUILD YOUR PLAN</h1>
              <p className="text-muted-foreground">Takes about 2 minutes. Every answer helps us personalize your experience.</p>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between mb-8 px-2">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = i < step;
                const active = i === step;
                return (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        done ? "bg-primary border-primary" : active ? "border-primary bg-primary/10" : "border-border bg-card"
                      }`}>
                        {done ? <Check className="w-4 h-4 text-primary-foreground" /> : <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />}
                      </div>
                      <span className={`text-[10px] mt-1.5 font-medium hidden sm:block ${active ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded ${done ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form Card */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 min-h-[340px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  {/* Step 0 — Identity */}
                  {step === 0 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-display text-foreground mb-1">WHO'S THE ATHLETE?</h2>
                        <p className="text-sm text-muted-foreground">We'll use this to personalize your dashboard and training plan.</p>
                      </div>
                      <div>
                        <Label htmlFor="athlete_name">Athlete Full Name *</Label>
                        <Input id="athlete_name" value={form.athlete_name} onChange={e => set("athlete_name", e.target.value)} placeholder="e.g., Jake Martinez" maxLength={100} />
                      </div>
                      <div>
                        <Label htmlFor="parent_name">Parent / Guardian Name</Label>
                        <Input id="parent_name" value={form.parent_name} onChange={e => set("parent_name", e.target.value)} placeholder="Leave blank if not applicable" maxLength={100} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="age">Age</Label>
                          <Input id="age" type="number" min={8} max={30} value={form.age} onChange={e => set("age", e.target.value)} placeholder="e.g., 15" />
                        </div>
                        <div>
                          <Label>Primary Position</Label>
                          <Select value={form.position} onValueChange={v => set("position", v)}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pitcher">Pitcher</SelectItem>
                              <SelectItem value="catcher">Catcher</SelectItem>
                              <SelectItem value="infielder">Infielder</SelectItem>
                              <SelectItem value="outfielder">Outfielder</SelectItem>
                              <SelectItem value="utility">Utility</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 1 — Metrics */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-display text-foreground mb-1">WHERE ARE YOU RIGHT NOW?</h2>
                        <p className="text-sm text-muted-foreground">No judgment — we need a baseline to track your growth.</p>
                      </div>
                      <div>
                        <Label>Current Level</Label>
                        <Select value={form.current_level} onValueChange={v => set("current_level", v)}>
                          <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="youth">Youth (12U)</SelectItem>
                            <SelectItem value="middle_school">Middle School</SelectItem>
                            <SelectItem value="high_school_jv">High School JV</SelectItem>
                            <SelectItem value="high_school_varsity">High School Varsity</SelectItem>
                            <SelectItem value="travel">Travel Ball</SelectItem>
                            <SelectItem value="college">College</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="velo">Throwing Velo</Label>
                          <Input id="velo" value={form.current_velocity} onChange={e => set("current_velocity", e.target.value)} placeholder="mph" maxLength={10} />
                        </div>
                        <div>
                          <Label htmlFor="exit">Exit Velo</Label>
                          <Input id="exit" value={form.exit_velo} onChange={e => set("exit_velo", e.target.value)} placeholder="mph" maxLength={10} />
                        </div>
                        <div>
                          <Label htmlFor="sixty">60-Yard Dash</Label>
                          <Input id="sixty" value={form.sixty_time} onChange={e => set("sixty_time", e.target.value)} placeholder="sec" maxLength={10} />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="training_history">Training History</Label>
                        <Textarea id="training_history" value={form.training_history} onChange={e => set("training_history", e.target.value)} placeholder="What training have you done before? (lessons, camps, travel ball, etc.)" maxLength={1000} rows={3} />
                      </div>
                    </div>
                  )}

                  {/* Step 2 — Goals */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-display text-foreground mb-1">WHAT ARE YOU CHASING?</h2>
                        <p className="text-sm text-muted-foreground">Tell us so we can align your training to what matters most.</p>
                      </div>
                      <div>
                        <Label htmlFor="goals">Top Development Goals</Label>
                        <Textarea id="goals" value={form.athlete_goals} onChange={e => set("athlete_goals", e.target.value)} placeholder="e.g., Increase velocity by 5 mph, earn a college roster spot, stay healthy through the season..." maxLength={1000} rows={3} />
                      </div>
                      <div>
                        <Label htmlFor="struggle">Biggest Struggle Right Now</Label>
                        <Textarea id="struggle" value={form.biggest_struggle} onChange={e => set("biggest_struggle", e.target.value)} placeholder="e.g., Inconsistent mechanics, can't recover fast enough, don't know what to train..." maxLength={1000} rows={3} />
                      </div>
                    </div>
                  )}

                  {/* Step 3 — Connect */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-display text-foreground mb-1">STAY CONNECTED</h2>
                        <p className="text-sm text-muted-foreground">We'll send your plan, weekly check-ins, and progress reports here.</p>
                      </div>
                      <div>
                        <Label htmlFor="email">Best Email *</Label>
                        <Input id="email" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@email.com" required maxLength={255} />
                      </div>
                      <div>
                        <Label htmlFor="social">Instagram Handle</Label>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input id="social" className="pl-10" value={form.social_handle} onChange={e => set("social_handle", e.target.value)} placeholder="@yourhandle" maxLength={100} />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={back} disabled={step === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button variant="vault" onClick={next} disabled={!canAdvance() || loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {step === STEPS.length - 1 ? "Complete Setup" : "Continue"}
                {step < STEPS.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>

            {/* Step counter */}
            <p className="text-center text-xs text-muted-foreground mt-4">
              Step {step + 1} of {STEPS.length}
            </p>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default AthleteOnboarding;
