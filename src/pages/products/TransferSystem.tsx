import { motion } from "framer-motion";
import { Target, Check, ShieldCheck, ArrowRight, Loader2, Crosshair, Brain, Flame, Trophy, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";
import { useHasProductAccess } from "@/hooks/useUserPurchases";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const TransferSystem = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.transfer_system;
  const [userId, setUserId] = useState<string | undefined>();
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);
  
  const { hasAccess } = useHasProductAccess(userId, 'transfer_system');

  const pillars = [
    {
      icon: Brain,
      title: "Decision Training",
      description: "Train your brain to make better decisions faster under game-like pressure and time constraints",
    },
    {
      icon: Crosshair,
      title: "Game-Realistic Practice",
      description: "Design practices that mirror the chaos, timing, and demands of real competition",
    },
    {
      icon: Flame,
      title: "Competitive Execution",
      description: "Build the mental frameworks to perform under pressure when it matters most",
    },
    {
      icon: Trophy,
      title: "Performance Tracking",
      description: "Measure what matters—track practice-to-game transfer rates and identify gaps",
    },
  ];

  const included = [
    "12-week transfer-focused training plan with progressions",
    "60+ game-realistic drill library with video demos",
    "Practice design templates (daily, weekly, seasonal)",
    "Competitive scenario builder worksheet",
    "Decision training protocols for each position",
    "Pre-game mental preparation routine",
    "Post-game self-assessment framework",
    "AI-powered practice design recommendations",
    "Transfer rate analytics dashboard",
    "Video analysis with decision-point tagging",
    "Custom drill builder with randomization",
    "Game stats platform integration",
    "Access to private community",
  ];

  const stats = [
    { value: "40%", label: "of practice gains typically don't transfer to games" },
    { value: "2.5x", label: "better transfer with game-realistic training design" },
    { value: "73%", label: "of coaches say practice-to-game gap is their biggest challenge" },
  ];

  const problems = [
    "You crush it in BP but can't replicate it in games",
    "Your mechanics look great in drills but fall apart under pressure",
    "You practice harder than anyone but game stats don't show it",
    "You feel like you're training hard but not getting better results",
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-purple-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                VAULT™ TRANSFER SYSTEM
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Training that doesn't show up in games fails its purpose. Bridge the gap between 
                practice performance and game-day execution with competition-focused training design.
              </p>
            </motion.div>

            {/* Problem Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="bg-card border border-destructive/20 rounded-2xl p-8 mb-16"
            >
              <h3 className="text-xl font-display text-foreground mb-6 text-center">Sound Familiar?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {problems.map((problem, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-destructive text-lg">✗</span>
                    <p className="text-muted-foreground">{problem}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-foreground font-medium mt-6 pt-6 border-t border-border">
                This is the practice-to-game transfer problem—and it's solvable.
              </p>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
            >
              {stats.map((stat, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6 text-center">
                  <div className="text-4xl font-display text-purple-500 mb-2">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Pillars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
            >
              {pillars.map((pillar, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                    <pillar.icon className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-display text-foreground mb-2">{pillar.title}</h3>
                  <p className="text-muted-foreground text-sm">{pillar.description}</p>
                </div>
              ))}
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-purple-500/5 to-purple-600/10 border border-purple-500/20 rounded-2xl p-8 mb-16"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-purple-600 font-medium mb-2">Full Access</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                    <span className="text-muted-foreground">one-time</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Lifetime access to all Transfer System content &amp; future updates
                  </p>
                </div>
                {hasAccess ? (
                  <Button variant="vault" size="xl" asChild>
                    <Link to="/course/transfer-system">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Access Your Course
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="vault"
                    size="xl"
                    onClick={() => checkout('transfer_system')}
                    disabled={loading === 'transfer_system'}
                    className="whitespace-nowrap"
                  >
                    {loading === 'transfer_system' ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : null}
                    Get Full Access
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-16"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">Everything Included</h3>
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="grid md:grid-cols-2 gap-3">
                  {included.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Who It's For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card border border-border rounded-2xl p-8 mb-16"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">Who This Is For</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">⚾</div>
                  <h4 className="font-medium text-foreground mb-2">Hitters</h4>
                  <p className="text-sm text-muted-foreground">Who want their cage work to actually show up against live pitching in games</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🧤</div>
                  <h4 className="font-medium text-foreground mb-2">Fielders</h4>
                  <p className="text-sm text-muted-foreground">Who need to make the routine play and the big play when pressure is highest</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">📋</div>
                  <h4 className="font-medium text-foreground mb-2">Coaches</h4>
                  <p className="text-sm text-muted-foreground">Who want to design practices that actually prepare their team for game situations</p>
                </div>
              </div>
            </motion.div>

            {/* Guarantee */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-secondary/50 rounded-2xl p-6 text-center"
            >
              <ShieldCheck className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">30-Day Money-Back Guarantee:</strong> If you don't see measurable improvement 
                in your practice-to-game transfer within 30 days, we'll refund your purchase — no questions asked.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default TransferSystem;
