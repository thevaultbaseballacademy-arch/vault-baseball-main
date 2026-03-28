import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Check, ArrowRight, Loader2, Zap, Target, Shield, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const mistakes = [
  { icon: AlertTriangle, title: "Training Max Effort Every Session", desc: "Why throwing at 100% actually slows your development and increases injury risk." },
  { icon: Target, title: "Ignoring Mechanical Sequencing", desc: "The kinetic chain breakdown that robs most pitchers of 3-7 mph." },
  { icon: Shield, title: "Skipping Arm Care Completely", desc: "The recovery protocols elite programs use that most athletes never learn." },
  { icon: TrendingUp, title: "No Baseline Metrics", desc: "Why you can't improve what you don't measure — and what to track." },
  { icon: Zap, title: "Random Drill Selection", desc: "How undirected practice creates bad habits that take months to undo." },
];

const FreeVelocityGuide = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    athlete_name: "",
    parent_name: "",
    email: "",
    athlete_age: "",
    primary_position: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.athlete_name.trim() || !form.email.trim()) {
      toast({ title: "Required", description: "Athlete name and email are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("lead_captures").insert({
        athlete_name: form.athlete_name.trim(),
        parent_name: form.parent_name.trim() || null,
        email: form.email.trim(),
        athlete_age: form.athlete_age ? parseInt(form.athlete_age) : null,
        primary_position: form.primary_position || null,
        lead_source: "free_guide",
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left — Content */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <span className="inline-block px-3 py-1 bg-destructive/10 text-destructive text-xs font-medium tracking-wide mb-4">
                  FREE GUIDE
                </span>
                <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4 leading-tight">
                  5 MISTAKES THAT KILL PITCH VELOCITY
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Most athletes train harder, not smarter. This guide reveals the 5 most common development mistakes 
                  that hold pitchers back — and the system-driven fixes that unlock real velocity gains.
                </p>

                <div className="space-y-4">
                  {mistakes.map((m, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-10 h-10 bg-destructive/10 flex items-center justify-center shrink-0">
                        <m.icon className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-display text-foreground text-sm">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right — Form */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                {submitted ? (
                  <div className="bg-card border border-border p-8 text-center">
                    <div className="w-16 h-16 bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-display text-foreground mb-2">YOU'RE IN</h2>
                    <p className="text-muted-foreground mb-6">
                      Check your email for the guide. While you wait, let Eddie AI help you find your next step.
                    </p>
                    <div className="flex flex-col gap-3">
                      <Button variant="vault" size="lg" onClick={() => window.location.href = "/products/velo-check"}>
                        Get Your Velo-Check Analysis
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button variant="outline" onClick={() => window.location.href = "/products/velocity-system"}>
                        Explore Vault Velocity System
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card border border-border p-8">
                    <h2 className="text-2xl font-display text-foreground mb-1">GET THE FREE GUIDE</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Enter your info below and we'll send the guide to your inbox instantly.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="athlete_name">Athlete Name *</Label>
                        <Input id="athlete_name" value={form.athlete_name} onChange={(e) => setForm(f => ({ ...f, athlete_name: e.target.value }))} placeholder="Athlete's full name" required maxLength={100} />
                      </div>
                      <div>
                        <Label htmlFor="parent_name">Parent/Guardian Name</Label>
                        <Input id="parent_name" value={form.parent_name} onChange={(e) => setForm(f => ({ ...f, parent_name: e.target.value }))} placeholder="Parent's name (optional)" maxLength={100} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" required maxLength={255} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="age">Athlete Age</Label>
                          <Select value={form.athlete_age} onValueChange={(v) => setForm(f => ({ ...f, athlete_age: v }))}>
                            <SelectTrigger><SelectValue placeholder="Age" /></SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => i + 10).map(age => (
                                <SelectItem key={age} value={String(age)}>{age}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="position">Primary Position</Label>
                          <Select value={form.primary_position} onValueChange={(v) => setForm(f => ({ ...f, primary_position: v }))}>
                            <SelectTrigger><SelectValue placeholder="Position" /></SelectTrigger>
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

                      <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                        Download Free Guide
                      </Button>
                      <p className="text-[10px] text-muted-foreground text-center">
                        We respect your privacy. No spam, ever.
                      </p>
                    </form>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default FreeVelocityGuide;
