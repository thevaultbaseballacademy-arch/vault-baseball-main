import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { 
  Zap, 
  Timer, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Target,
  Shield,
  Play,
  FileText,
  Users,
  Star,
  Clock,
  Lock
} from "lucide-react";

const PerformanceBlueprint = () => {
  const { checkout, loading } = useProductCheckout();

  const handleCheckout = () => {
    checkout("performance_blueprint");
  };

  const features = [
    {
      icon: Zap,
      title: "12-Week Velocity System",
      description: "Scientifically-backed protocols to add 5-8 MPH to your exit velocity. Includes progressive overload templates, mobility drills, and recovery protocols.",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: Timer,
      title: "Athleticism Foundation Drills",
      description: "The exact speed and agility program used by D1 prospects. Target sub-6.8 60-yard times with our periodized sprint training.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: TrendingUp,
      title: "Transfer Protocol",
      description: "Bridge the gap between training gains and game performance. Learn the mental frameworks and situational drills that separate good from elite.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const bonuses = [
    {
      icon: FileText,
      title: "Weekly Tracking Templates",
      value: "$27",
      description: "Log your metrics, track progress, and identify weak points with our proven tracking system.",
    },
    {
      icon: Play,
      title: "Video Drill Library",
      value: "$47",
      description: "50+ HD drill demonstrations with coach commentary and common mistake corrections.",
    },
    {
      icon: Target,
      title: "D1 Benchmarks Guide",
      value: "$19",
      description: "Know exactly where you need to be for each position at every level from D1 to MLB.",
    },
  ];

  const testimonials = [
    {
      name: "Marcus Thompson",
      position: "2025 SS, Texas",
      quote: "Went from 89 to 96 exit velo in 10 weeks. The transfer drills are game-changers.",
      result: "+7 MPH Exit Velo",
    },
    {
      name: "Jake Williams", 
      position: "2024 OF, Florida",
      quote: "Dropped my 60 from 7.1 to 6.72. The sprint mechanics section alone is worth 10x the price.",
      result: "-0.38s 60-Yard",
    },
    {
      name: "Dylan Martinez",
      position: "2025 P/3B, California",
      quote: "Finally understanding how to transfer training to games. 3 HR in my first showcase after the program.",
      result: "3 HRs @ Showcase",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-b from-background via-background to-secondary/20">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-sm font-semibold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              Fast-Track Upgrade
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display text-foreground leading-tight">
              The Map to{" "}
              <span className="text-primary">95+ MPH</span>
              <br />
              & Sub-6.8 60s
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop guessing. Start executing. The complete 12-week roadmap used by 
              500+ athletes who've hit D1 benchmarks.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                variant="vault" 
                size="xl" 
                onClick={handleCheckout}
                disabled={loading === "performance_blueprint"}
                className="min-w-[280px]"
              >
                {loading === "performance_blueprint" ? (
                  "Processing..."
                ) : (
                  <>
                    Get Instant Access - $47
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                Secure Checkout
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Instant PDF Download
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Video Drill Library
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Lifetime Access
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-6 bg-secondary border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground">Athletes Enrolled</div>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div>
              <div className="text-2xl font-bold text-foreground">+6.2 MPH</div>
              <div className="text-sm text-muted-foreground">Avg Exit Velo Gain</div>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div>
              <div className="text-2xl font-bold text-foreground">-0.31s</div>
              <div className="text-sm text-muted-foreground">Avg 60-Yard Improvement</div>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div>
              <div className="flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">4.9/5 Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                What's Inside The Blueprint
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A complete system covering the 3 core pillars that determine D1 readiness. 
                No fluff. Just actionable protocols.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="bg-card border border-border p-6 space-y-4 hover:border-primary/50 transition-colors"
                >
                  <div className={`w-12 h-12 ${feature.bgColor} flex items-center justify-center`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Detailed Curriculum */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                The 12-Week Curriculum
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { weeks: "1-4", title: "Foundation Phase", desc: "Build the movement patterns and strength base that make elite velocity possible." },
                { weeks: "5-8", title: "Acceleration Phase", desc: "Progressive overload protocols to maximize power output and speed gains." },
                { weeks: "9-12", title: "Transfer Phase", desc: "Integrate your gains into game situations. This is where the magic happens." },
              ].map((phase, index) => (
                <motion.div
                  key={phase.weeks}
                  variants={itemVariants}
                  className="flex gap-6 p-6 bg-card border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-20 h-20 bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground uppercase">Weeks</div>
                      <div className="text-xl font-bold text-primary">{phase.weeks}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground">{phase.title}</h3>
                    <p className="text-muted-foreground">{phase.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bonuses */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-500 text-sm font-semibold uppercase tracking-wider">
                Included Free
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                $93 Worth of Bonuses
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {bonuses.map((bonus) => (
                <motion.div
                  key={bonus.title}
                  variants={itemVariants}
                  className="bg-card border border-green-500/30 p-6 space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 text-green-500 font-bold text-sm">
                    {bonus.value} VALUE
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 flex items-center justify-center">
                    <bonus.icon className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{bonus.title}</h3>
                  <p className="text-muted-foreground text-sm">{bonus.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Athletes Who Executed
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.name}
                  variants={itemVariants}
                  className="bg-card border border-border p-6 space-y-4"
                >
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.position}</div>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold">
                      {testimonial.result}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-12"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">Common Questions</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "How is this different from free YouTube content?",
                  a: "YouTube gives you random drills. This is a structured 12-week system with progressive overload, recovery protocols, and transfer drills that work together. Plus you get the tracking templates to measure your progress."
                },
                {
                  q: "What if I'm already training with a coach?",
                  a: "Perfect. This complements any in-person training. Many athletes use this as their at-home programming between sessions. Your coach will likely appreciate the structured approach."
                },
                {
                  q: "How quickly will I see results?",
                  a: "Most athletes see measurable improvements by Week 4-5. The full transformation happens over the 12-week cycle. We've seen +3-8 MPH exit velo gains and 0.2-0.5s improvements on 60-yard times."
                },
                {
                  q: "Is there a refund policy?",
                  a: "Yes. If you follow the program for 30 days and don't see improvement, email us with your tracking sheets and we'll refund you in full. We're confident in the system."
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-card border border-border p-6 space-y-2"
                >
                  <h3 className="font-bold text-foreground">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/50">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Stop Guessing. Start Executing.
            </h2>
            
            <div className="bg-card border border-border p-8 space-y-6">
              <div className="space-y-2">
                <div className="text-5xl font-bold text-foreground">$47</div>
                <div className="text-muted-foreground line-through">$140 Value</div>
              </div>

              <ul className="text-left space-y-3 max-w-sm mx-auto">
                {[
                  "12-Week Velocity System",
                  "Athleticism Foundation Drills",
                  "Transfer Protocol",
                  "Weekly Tracking Templates ($27)",
                  "Video Drill Library ($47)",
                  "D1 Benchmarks Guide ($19)",
                  "Lifetime Access",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button 
                variant="vault" 
                size="xl" 
                onClick={handleCheckout}
                disabled={loading === "performance_blueprint"}
                className="w-full max-w-sm"
              >
                {loading === "performance_blueprint" ? (
                  "Processing..."
                ) : (
                  <>
                    Get The Blueprint Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Secure Checkout
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  30-Day Guarantee
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Join 500+ athletes who've already hit D1 benchmarks with the Performance Blueprint.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default PerformanceBlueprint;
