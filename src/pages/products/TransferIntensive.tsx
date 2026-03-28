import { motion } from "framer-motion";
import { Users, Check, ArrowRight, Loader2, Calendar, Video, MessageSquare, Target, Zap, Star, Trophy, Clock, Shield, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";


const TransferIntensive = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.transfer_intensive;

  const weeklySchedule = [
    {
      week: "Week 1",
      title: "Foundation & Assessment",
      focus: "Identify your transfer gaps",
      items: [
        "Live diagnostic session: Analyze where your practice performance breaks down in games",
        "Individual video review comparing practice vs. game mechanics",
        "Personalized transfer scorecard identifying your 3 highest-leverage fixes",
        "Custom practice design template based on your specific gaps",
      ],
    },
    {
      week: "Week 2", 
      title: "Decision Training",
      focus: "Train your instincts under pressure",
      items: [
        "Live group session: Decision-making frameworks used by elite performers",
        "Constraint-led drill sequences that force game-realistic choices",
        "Implementation feedback on your practice video submissions",
        "Competitive scenario library with 25+ game-like situations",
      ],
    },
    {
      week: "Week 3",
      title: "Pressure Simulation",
      focus: "Bridge practice intensity to game intensity",
      items: [
        "Live group session: Stress inoculation techniques from sports psychology",
        "Mid-program progress review with updated action items",
        "Heart rate variability and arousal management protocols",
        "High-stakes drill progressions with artificial consequences",
      ],
    },
    {
      week: "Week 4",
      title: "Competition Prep & Peak Performance",
      focus: "Lock in your gains for game day",
      items: [
        "Live group session: Pre-competition routines and mental primers",
        "Final video analysis comparing Week 1 baseline to Week 4 execution",
        "Personalized game-day checklist and warm-up sequence",
        "Post-program maintenance plan to retain your transfer improvements",
      ],
    },
  ];

  const included = [
    { item: "4 weekly 60-minute live group coaching sessions via Zoom", detail: "Every Wednesday 7pm CT" },
    { item: "4 individual video analyses with detailed feedback", detail: "48-hour turnaround guaranteed" },
    { item: "Direct access to VAULT coaches in private Discord", detail: "Get answers between sessions" },
    { item: "Complete drill library for game-realistic training", detail: "50+ transfer-specific drills" },
    { item: "Weekly accountability check-ins", detail: "Track metrics that matter" },
    { item: "Personalized practice design review each week", detail: "Optimize your training time" },
    { item: "Lifetime access to session recordings", detail: "Re-watch anytime forever" },
    { item: "Certificate of completion", detail: "Add to your recruiting portfolio" },
  ];

  const features = [
    { icon: Video, title: "Live Coaching", description: "Weekly group sessions with real-time Q&A, hot seat coaching, and personalized feedback from our transfer specialists" },
    { icon: MessageSquare, title: "Direct Access", description: "Private Discord channel for questions between sessions — get answers from coaches within 24 hours" },
    { icon: Target, title: "Video Analysis", description: "4 individual video reviews comparing your practice vs. game mechanics with specific action items" },
    { icon: Calendar, title: "Accountability", description: "Weekly check-ins with transfer metrics tracking to keep you progressing toward game-day execution" },
  ];

  const problemsSolved = [
    { problem: "You dominate in practice but struggle when it counts", solution: "Our decision training drills force game-realistic pressure so practice performance transfers" },
    { problem: "Your mechanics break down under game-day stress", solution: "Stress inoculation protocols train your nervous system to stay calm when stakes are high" },
    { problem: "You're training hard but not seeing game results", solution: "We identify the specific gaps between your practice and game performance, then close them" },
    { problem: "You don't know what to focus on in practice", solution: "Custom practice designs ensure every rep builds toward game-day execution" },
  ];

  const results = [
    { stat: "87%", label: "of athletes report improved game-day confidence after 4 weeks" },
    { stat: "3.2x", label: "average improvement in practice-to-game transfer metrics" },
    { stat: "4 hrs", label: "total live coaching time with our transfer specialists" },
    { stat: "48hr", label: "turnaround on all video analysis submissions" },
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium border border-blue-500/20">
                <Users className="w-4 h-4" />
                Limited to 20 Athletes Per Cohort
              </span>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-blue-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                THE TRANSFER INTENSIVE
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                4 weeks of live virtual coaching designed to bridge the gap between practice and game performance. 
                Stop training hard without seeing results when it matters most.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="outline" className="border-blue-500/30 text-blue-600">
                  <Clock className="w-3 h-3 mr-1" /> 4 Live Sessions
                </Badge>
                <Badge variant="outline" className="border-blue-500/30 text-blue-600">
                  <Video className="w-3 h-3 mr-1" /> 4 Video Reviews
                </Badge>
                <Badge variant="outline" className="border-blue-500/30 text-blue-600">
                  <MessageSquare className="w-3 h-3 mr-1" /> Private Discord
                </Badge>
              </div>
            </motion.div>


            {/* The Problem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">
                Does This Sound Like You?
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {problemsSolved.map((item, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Zap className="w-3 h-3 text-red-500" />
                      </div>
                      <p className="font-medium text-foreground text-sm">{item.problem}</p>
                    </div>
                    <div className="flex items-start gap-3 ml-9">
                      <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{item.solution}</p>
                    </div>
                  </div>
                ))}
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
                <div key={i} className="bg-gradient-to-br from-blue-500/5 to-blue-600/10 border border-blue-500/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-display text-blue-500 mb-1">{result.stat}</div>
                  <p className="text-xs text-muted-foreground">{result.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            >
              {features.map((feature, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </motion.div>

            {/* Weekly Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-2 text-center">The 4-Week Curriculum</h3>
              <p className="text-center text-muted-foreground mb-6">Each week builds on the last, progressively closing your transfer gap</p>
              <div className="grid md:grid-cols-2 gap-4">
                {weeklySchedule.map((week, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-xs text-blue-500 font-medium">{week.week}</span>
                        <h4 className="font-display text-foreground">{week.title}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic mb-3 ml-11">{week.focus}</p>
                    <ul className="space-y-2 ml-11">
                      {week.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
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
              className="bg-gradient-to-br from-blue-500/5 to-blue-600/10 border border-blue-500/20 rounded-2xl p-8 mb-12"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm text-blue-600 font-medium">4-Week Live Program</p>
                    <Badge className="bg-blue-500/20 text-blue-600 border-0">Next cohort starts Feb 5</Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                    <span className="text-muted-foreground">one-time</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Less than $75/week for personalized live coaching — cheaper than one private lesson
                  </p>
                </div>
                <Button
                  variant="vault"
                  size="xl"
                  onClick={() => checkout('transfer_intensive')}
                  disabled={loading === 'transfer_intensive'}
                  className="whitespace-nowrap"
                >
                  {loading === 'transfer_intensive' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Reserve Your Spot
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
                    <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-foreground text-sm font-medium">{item.item}</span>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Who This Is For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="grid md:grid-cols-2 gap-6 mb-12"
            >
              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                <h4 className="font-display text-foreground mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  This Is For You If...
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• You practice hard but don't see it show up in games</li>
                  <li>• You want live coaching but can't afford 1-on-1 sessions</li>
                  <li>• You're preparing for a big season or showcase</li>
                  <li>• You learn best with accountability and structure</li>
                  <li>• You're committed to 4 weeks of focused development</li>
                </ul>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                <h4 className="font-display text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  This Is NOT For You If...
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• You're looking for a passive video course</li>
                  <li>• You can't commit 2-3 hours/week for 4 weeks</li>
                  <li>• You want someone to do the work for you</li>
                  <li>• You're not willing to submit practice video</li>
                  <li>• You're not ready to be coached directly</li>
                </ul>
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-secondary/50 rounded-2xl p-6"
            >
              <h3 className="text-lg font-display text-foreground mb-4 text-center">Common Questions</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-foreground">When do live sessions take place?</p>
                  <p className="text-muted-foreground">Every Wednesday at 7pm CT. Sessions last 60-75 minutes and are recorded if you can't make it live.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">What if I miss a session?</p>
                  <p className="text-muted-foreground">All sessions are recorded and available within 24 hours. You'll still get your individual video review and full Discord access.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">How is this different from the Transfer System?</p>
                  <p className="text-muted-foreground">The Transfer System is self-paced content. This Intensive is live coaching with direct feedback, accountability, and a structured cohort experience.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">When does the next cohort start?</p>
                  <p className="text-muted-foreground">New cohorts start on the first Wednesday of each month. After purchase, you'll receive onboarding with exact dates within 24 hours.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default TransferIntensive;