import { motion } from "framer-motion";
import { Zap, Check, ArrowRight, Loader2, Calendar, Target, Flame, RotateCcw, Video, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileConversionBar from "@/components/products/MobileConversionBar";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const VelocityAccelerator = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.velocity_accelerator;

  const programRules = [
    "Maximum intent every session",
    "No skipping deload weeks",
    "Video check-ins required",
    "Track all metrics religiously",
  ];

  const weeklyFocus = [
    { week: "Weeks 1-2", focus: "Foundation & Assessment", description: "Baseline testing, movement prep, intent introduction" },
    { week: "Weeks 3-4", focus: "Overload Phase", description: "Heavy intent work, overload implements, max effort days" },
    { week: "Week 5", focus: "Deload & Retest", description: "Recovery focus, form refinement, mid-program testing" },
    { week: "Week 6", focus: "Peak & Transfer", description: "Competition simulation, final testing, velocity peaks" },
  ];

  const trainingSplit = [
    { day: "Day 1", focus: "Lower Body Power", exercises: "Jumps, deadlifts, med ball slams" },
    { day: "Day 2", focus: "Rotational Power", exercises: "Med ball rotations, cable work, intent swings" },
    { day: "Day 3", focus: "Upper Body + Core", exercises: "Pressing, pulling, anti-rotation" },
    { day: "Day 4", focus: "Intent & Velocity", exercises: "Max effort swings/throws, overload work" },
  ];

  const intentGuidelines = [
    "100% intent on designated sets",
    "Quality over quantity always",
    "Rest fully between max effort reps",
    "Mental preparation before each swing/throw",
  ];

  const includes = [
    "6-week focused velocity program",
    "Weekly structure with clear progressions",
    "Intent & overload emphasis throughout",
    "1 coach feedback video included",
    "Deload protocol built in",
    "Pre/post testing framework",
  ];

  const bestFor = [
    "Off-season velocity pushes",
    "Showcase & tryout prep",
    "Plateau breakers ready to level up",
    "Athletes with 6 weeks to commit fully",
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-orange-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                6 WEEKS. MAXIMUM INTENT. SERIOUS VELOCITY GAINS.
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A high-intensity velocity sprint for athletes who want results fast. 
                No fluff, no filler — just focused work and measurable gains.
              </p>
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-card to-secondary border border-border rounded-2xl p-8 mb-12"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-orange-600 font-medium mb-2">6-Week Sprint Program</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Includes 1 coach feedback video
                  </p>
                </div>
                <Button
                  variant="vault"
                  size="xl"
                  onClick={() => checkout('velocity_accelerator')}
                  disabled={loading === 'velocity_accelerator'}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {loading === 'velocity_accelerator' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2" />
                  )}
                  Start the Velocity Accelerator
                </Button>
              </div>
            </motion.div>

            {/* Program Rules & Expectations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-8 mb-12"
            >
              <h3 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Program Rules & Expectations
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {programRules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-orange-500" />
                    {rule}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Weekly Velocity Focus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-display text-foreground mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-orange-500" />
                Weekly Velocity Focus
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {weeklyFocus.map((week, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <div className="text-sm text-orange-500 font-medium mb-1">{week.week}</div>
                    <h4 className="font-display text-foreground mb-2">{week.focus}</h4>
                    <p className="text-sm text-muted-foreground">{week.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Weekly Training Split */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-xl font-display text-foreground mb-6 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-orange-500" />
                Weekly Training Split (3–4 days)
              </h3>
              <div className="space-y-4">
                {trainingSplit.map((day, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="font-display text-orange-500 w-16">{day.day}</div>
                    <div className="font-medium text-foreground flex-1">{day.focus}</div>
                    <div className="text-sm text-muted-foreground">{day.exercises}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Intent Guidelines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500/5 to-orange-600/5 border border-orange-500/20 rounded-2xl p-8 mb-12"
            >
              <h3 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Intent Guidelines
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {intentGuidelines.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-orange-500" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Deload & Retest */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-orange-500" />
                Deload & Retest Protocol
              </h3>
              <p className="text-muted-foreground mb-4">
                Week 5 is dedicated to recovery and retesting. This isn't optional — it's where gains are realized.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-background/50 rounded-lg p-4">
                  <div className="font-display text-foreground mb-1">Reduce Volume</div>
                  <p className="text-sm text-muted-foreground">50% reduction in total sets</p>
                </div>
                <div className="bg-background/50 rounded-lg p-4">
                  <div className="font-display text-foreground mb-1">Maintain Intent</div>
                  <p className="text-sm text-muted-foreground">Quality stays high, quantity drops</p>
                </div>
                <div className="bg-background/50 rounded-lg p-4">
                  <div className="font-display text-foreground mb-1">Retest Metrics</div>
                  <p className="text-sm text-muted-foreground">Compare to Week 1 baseline</p>
                </div>
              </div>
            </motion.div>

            {/* What's Included & Best For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid md:grid-cols-2 gap-6 mb-12"
            >
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-orange-500" />
                  What's Included
                </h3>
                <ul className="space-y-2">
                  {includes.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-orange-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  Best For
                </h3>
                <ul className="space-y-2">
                  {bestFor.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-orange-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Coach Feedback Video */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-gradient-to-br from-card to-secondary border border-border rounded-2xl p-8 mb-12"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground mb-2">1 Coach Feedback Video Included</h3>
                  <p className="text-muted-foreground">
                    Submit your swing or throw mid-program and receive personalized video feedback 
                    from a Vault coach to ensure you're on track.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Bundle Hook */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-vault/5 border border-vault/20 rounded-2xl p-8 text-center"
            >
              <h3 className="text-xl font-display text-foreground mb-2">
                Want More? Check Out the Velocity Max Pack
              </h3>
              <p className="text-muted-foreground mb-4">
                Get the 12-Week Velocity System + Velo-Check + Accelerator Lite for maximum gains.
              </p>
              <Link to="/products/bundles">
                <Button variant="outline" className="border-vault text-vault hover:bg-vault hover:text-white">
                  View Bundle — Save $78
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      <MobileConversionBar
        productName={product.name}
        price={product.price}
        productKey="velocity_accelerator"
        onCheckout={checkout}
        loading={loading}
        ctaText="Start Now"
      />
      <Footer />
    </main>
  );
};

export default VelocityAccelerator;
