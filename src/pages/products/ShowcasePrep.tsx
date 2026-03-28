import { motion } from "framer-motion";
import { Zap, Check, ArrowRight, Loader2, Calendar, Target, TrendingUp, Trophy, Clock, Video, Shield, Brain, Star, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";


const ShowcasePrep = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.showcase_prep;

  const phases = [
    {
      days: "Days 1-10",
      title: "Foundation & Assessment",
      focus: "Establish your baseline and build the foundation",
      items: [
        "Complete baseline metrics assessment (velocity, movement quality, body composition)",
        "Full mechanics video analysis identifying your 3 biggest limiters",
        "Personalized 30-day roadmap based on your specific gaps",
        "Daily mobility and activation protocols (15 min)",
        "Introduction to peak performance nutrition timing",
      ],
      icon: Target,
    },
    {
      days: "Days 11-20",
      title: "Build & Intensify",
      focus: "Maximize your output and sharpen skills",
      items: [
        "High-intensity velocity work with progressive overload",
        "Showcase-specific skills training (60-yard, fielding, BP protocols)",
        "Simulated tryout scenarios with artificial pressure",
        "Recovery optimization protocols (sleep, nutrition, active recovery)",
        "Mid-program video check-in with progress feedback",
      ],
      icon: TrendingUp,
    },
    {
      days: "Days 21-30",
      title: "Peak & Execute",
      focus: "Taper strategically and prepare to dominate",
      items: [
        "Velocity peaking protocol — hit your highest numbers on day 30",
        "Pre-showcase taper strategy (reduce volume, maintain intensity)",
        "Mental preparation routines and visualization scripts",
        "Game-day execution plan with hour-by-hour timeline",
        "Final metrics assessment showing your 30-day gains",
      ],
      icon: Trophy,
    },
  ];

  const included = [
    { item: "Complete 30-day periodized training program", detail: "Daily workouts designed to peak on your showcase date" },
    { item: "Daily workout videos with demonstrations", detail: "Every exercise explained with coaching cues" },
    { item: "Pre and post metrics assessment", detail: "See exactly how much you improved" },
    { item: "2 video analyses with personalized feedback", detail: "Mechanics reviews with specific fixes" },
    { item: "Showcase-specific skills checklist", detail: "60-yard, BP, fielding, bullpen protocols" },
    { item: "Nutrition timing guide for peak performance", detail: "What to eat and when for max output" },
    { item: "Sleep optimization protocol", detail: "Recovery strategies for faster adaptation" },
    { item: "Pre-event mental prep routine", detail: "Visualization scripts and confidence builders" },
    { item: "Day-of showcase game plan", detail: "Hour-by-hour timeline so nothing is left to chance" },
    { item: "Parent guide for showcase support", detail: "How families can help without adding pressure" },
  ];

  const idealFor = [
    { emoji: "🎯", title: "Spring Tryouts", description: "High school varsity or travel ball team tryouts", color: "orange" },
    { emoji: "⭐", title: "PBR/PG Showcases", description: "Perfect Beast, Perfect Game, or similar events", color: "orange" },
    { emoji: "🏫", title: "College Visits", description: "Unofficial visits, prospect camps, or ID camps", color: "orange" },
    { emoji: "📋", title: "Draft Prep", description: "Pre-draft workouts and pro scout showcases", color: "orange" },
  ];

  const results = [
    { stat: "2-4 MPH", label: "Average velocity gain in 30 days", icon: Flame },
    { stat: "0.1-0.2s", label: "Average 60-yard improvement", icon: Clock },
    { stat: "89%", label: "Athletes hit personal bests at showcases", icon: Star },
    { stat: "30", label: "Days of focused, periodized training", icon: Calendar },
  ];

  const testimonials = [
    { name: "Marcus Chen", role: "2025 SS, Texas", quote: "Added 3 MPH and ran my fastest 60 ever. Got 4 offers the week after my PBR showcase.", result: "+3 MPH" },
    { name: "Dylan Foster", role: "2026 RHP, Florida", quote: "This program had me throwing 88 on showcase day when I was stuck at 84. The peaking protocol works.", result: "84→88" },
    { name: "Jake Williams", role: "2024 OF, California", quote: "I was so prepared I felt like I'd done the showcase 10 times before. Zero nerves, just execution.", result: "6.5→6.3 sixty" },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 text-sm font-medium border border-orange-500/20">
                <Zap className="w-4 h-4" />
                Peak Exactly When It Matters Most
              </span>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-orange-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                SHOWCASE PREP BUNDLE
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                30 days of high-intensity, strategically periodized preparation designed to have you 
                peak on your most important evaluation day. Walk in knowing you're at your absolute best.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="outline" className="border-orange-500/30 text-orange-600">
                  <Calendar className="w-3 h-3 mr-1" /> 30-Day Program
                </Badge>
                <Badge variant="outline" className="border-orange-500/30 text-orange-600">
                  <Video className="w-3 h-3 mr-1" /> 2 Video Reviews
                </Badge>
                <Badge variant="outline" className="border-orange-500/30 text-orange-600">
                  <TrendingUp className="w-3 h-3 mr-1" /> Peak Protocol
                </Badge>
              </div>
            </motion.div>


            {/* Results Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            >
              {results.map((result, i) => (
                <div key={i} className="bg-gradient-to-br from-orange-500/5 to-orange-600/10 border border-orange-500/20 rounded-xl p-4 text-center">
                  <result.icon className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-display text-orange-500 mb-1">{result.stat}</div>
                  <p className="text-xs text-muted-foreground">{result.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Ideal For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">Perfect For</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {idealFor.map((item, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 text-center hover:border-orange-500/30 transition-colors">
                    <div className="text-3xl mb-2">{item.emoji}</div>
                    <h3 className="font-medium text-foreground text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 30-Day Phases */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-2 text-center">The 30-Day Roadmap</h3>
              <p className="text-center text-muted-foreground mb-6">Scientifically periodized to have you peaking on day 30 — not day 20 or day 35</p>
              <div className="grid md:grid-cols-3 gap-4">
                {phases.map((phase, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center">
                        <phase.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs text-orange-500 font-medium">{phase.days}</span>
                        <h4 className="font-display text-foreground">{phase.title}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic mb-3">{phase.focus}</p>
                    <ul className="space-y-2">
                      {phase.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-gradient-to-br from-orange-500/5 to-orange-600/10 border border-orange-500/20 rounded-2xl p-8 mb-12"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm text-orange-600 font-medium">30-Day Intensive Program</p>
                    <Badge className="bg-orange-500/20 text-orange-600 border-0">Spring Ready</Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                    <span className="text-muted-foreground">one-time</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Less than $7/day for complete showcase preparation with video feedback
                  </p>
                </div>
                <Button
                  variant="vault"
                  size="xl"
                  onClick={() => checkout('showcase_prep')}
                  disabled={loading === 'showcase_prep'}
                  className="whitespace-nowrap"
                >
                  {loading === 'showcase_prep' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Start Your Prep Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-6 mb-12"
            >
              <h3 className="text-xl font-display text-foreground mb-6 text-center">Everything You Get</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {included.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-foreground text-sm font-medium">{item.item}</span>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">Showcase Success Stories</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {testimonials.map((testimonial, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                      <Badge className="bg-orange-500 text-white border-0">{testimonial.result}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{testimonial.quote}"</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Timing Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-secondary/50 rounded-2xl p-6 text-center"
            >
              <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-display text-foreground mb-2">Perfect Your Timing</h3>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-4">
                Start this program <strong>exactly 30-35 days before your target showcase or tryout</strong>. 
                The program is scientifically designed to have you peaking on your event day — not a week before or after.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Check className="w-3 h-3 text-orange-500" /> PBR Showcases</span>
                <span className="flex items-center gap-1"><Check className="w-3 h-3 text-orange-500" /> Perfect Game Events</span>
                <span className="flex items-center gap-1"><Check className="w-3 h-3 text-orange-500" /> College ID Camps</span>
                <span className="flex items-center gap-1"><Check className="w-3 h-3 text-orange-500" /> HS Varsity Tryouts</span>
                <span className="flex items-center gap-1"><Check className="w-3 h-3 text-orange-500" /> Travel Ball Tryouts</span>
                <span className="flex items-center gap-1"><Check className="w-3 h-3 text-orange-500" /> Pro Scout Workouts</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default ShowcasePrep;