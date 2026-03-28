import { motion } from "framer-motion";
import { Award, Check, ArrowRight, Loader2, BadgeCheck, Users, BookOpen, Globe, Star, Shield, TrendingUp, Zap, DollarSign, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const VaultVerifiedCoach = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.vault_verified_coach;

  const benefits = [
    { icon: BadgeCheck, title: "Official Credential", description: "Display the VAULT Verified Coach badge on your website, social media, business cards, and all marketing materials with full brand licensing" },
    { icon: Globe, title: "Directory Listing", description: "Featured profile in our searchable coach directory with booking links, athlete testimonials, and direct inquiry form — parents find YOU" },
    { icon: BookOpen, title: "Complete Drill Library", description: "Access to 200+ VAULT drills, session plans, and program templates with video demonstrations to use with your athletes" },
    { icon: Users, title: "Coach Network", description: "Private Slack community of certified coaches for collaboration, referrals, continuing education, and peer support" },
  ];

  const certificationModules = [
    {
      module: "Module 1",
      title: "The VAULT Philosophy & Foundations",
      topics: ["Movement-first development principles", "The 5 pillars of complete baseball development", "Age-appropriate training progressions", "Building athlete buy-in and culture"],
      duration: "2 hours",
    },
    {
      module: "Module 2",
      title: "Velocity Development Science",
      topics: ["Biomechanical efficiency patterns", "Force production sequencing", "Intent-based training methodology", "Velocity program design principles"],
      duration: "3 hours",
    },
    {
      module: "Module 3",
      title: "Longevity & Arm Care",
      topics: ["Workload management protocols", "Recovery optimization strategies", "Red flag recognition and response", "Building durable arms for long careers"],
      duration: "2.5 hours",
    },
    {
      module: "Module 4",
      title: "Transfer & Game Performance",
      topics: ["Practice-to-game bridging techniques", "Constraint-led drill design", "Decision training frameworks", "Pressure inoculation protocols"],
      duration: "2.5 hours",
    },
    {
      module: "Module 5",
      title: "Business & Client Management",
      topics: ["Marketing your certification effectively", "Parent communication frameworks", "Pricing and packaging your services", "Building long-term client relationships"],
      duration: "2 hours",
    },
  ];

  const included = [
    { item: "Official VAULT Verified Coach digital badge", detail: "High-res files for web, print, and social" },
    { item: "Featured listing in searchable coach directory", detail: "With booking links and athlete reviews" },
    { item: "200+ drill library with video demonstrations", detail: "New drills added quarterly" },
    { item: "Marketing materials package", detail: "Logos, templates, social graphics, email templates" },
    { item: "Quarterly continuing education webinars", detail: "Stay current with latest methodology" },
    { item: "Private Slack community access", detail: "Network with 150+ certified coaches" },
    { item: "Client referral network participation", detail: "Receive referrals from VAULT and other coaches" },
    { item: "Annual recertification included", detail: "Just complete CE requirements, no extra cost" },
    { item: "Priority support from VAULT team", detail: "Direct line for questions and program design help" },
    { item: "VAULT brand licensing for marketing", detail: "Use our credibility to grow your business" },
  ];

  const requirements = [
    { requirement: "2+ years coaching experience", description: "High school, travel, or professional level" },
    { requirement: "Complete all 5 training modules", description: "Self-paced, typically 2-3 weeks" },
    { requirement: "Pass module assessments", description: "80% minimum score on each" },
    { requirement: "Submit practical video", description: "Demonstrate methodology application" },
    { requirement: "Agree to coaching standards", description: "Uphold VAULT quality and ethics" },
  ];

  const testimonials = [
    { name: "Coach Mike Reynolds", role: "Travel Ball Director, TX", quote: "The certification paid for itself in the first month. Parents see the badge and immediately trust my methodology.", avatar: "MR" },
    { name: "Jake Morrison", role: "Private Instructor, FL", quote: "The drill library alone is worth 3x what I paid. I use it for every session. The referral network has sent me 8 new clients.", avatar: "JM" },
    { name: "Sarah Chen", role: "High School Coach, CA", quote: "Finally, a certification that actually improves my coaching, not just gives me a piece of paper. My athletes are performing better.", avatar: "SC" },
  ];

  const roiCalculation = [
    { label: "Your Investment", value: "$499", subtext: "One-time annual certification" },
    { label: "New Clients Needed to ROI", value: "2-3", subtext: "At average $200/month each" },
    { label: "Average New Clients in Year 1", value: "5-10", subtext: "From directory + referrals" },
    { label: "Typical First-Year ROI", value: "10x+", subtext: "Based on certified coach surveys" },
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium border border-emerald-500/20">
                <Award className="w-4 h-4" />
                B2B Revenue Stream — Turn Coaches Into Brand Ambassadors
              </span>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <BadgeCheck className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                VAULT VERIFIED COACH
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                The official certification for baseball coaches who want proven methodology, marketing credibility, 
                and a network that actually grows their business. Stop competing on price — compete on quality.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600">
                  <BookOpen className="w-3 h-3 mr-1" /> 12+ Hours Training
                </Badge>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600">
                  <Users className="w-3 h-3 mr-1" /> 150+ Certified Coaches
                </Badge>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600">
                  <Globe className="w-3 h-3 mr-1" /> Directory Listing
                </Badge>
              </div>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
            >
              {benefits.map((benefit, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-display text-foreground mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border border-emerald-500/20 rounded-2xl p-8 mb-12"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm text-emerald-600 font-medium">Annual Certification</p>
                    <Badge className="bg-emerald-500/20 text-emerald-600 border-0">Includes Renewal</Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete training, materials, directory listing, and annual renewal all included
                  </p>
                </div>
                <Button
                  variant="vault"
                  size="xl"
                  onClick={() => checkout('vault_verified_coach')}
                  disabled={loading === 'vault_verified_coach'}
                  className="whitespace-nowrap"
                >
                  {loading === 'vault_verified_coach' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Get Certified Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>

            {/* ROI Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">The ROI Math</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {roiCalculation.map((item, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <div className="text-2xl md:text-3xl font-display text-emerald-500 mb-1">{item.value}</div>
                    <p className="text-xs text-muted-foreground">{item.subtext}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Just 2-3 new clients from your directory listing and referral network pays for the entire certification
              </p>
            </motion.div>

            {/* Certification Modules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-2 text-center">Certification Curriculum</h3>
              <p className="text-center text-muted-foreground mb-6">12+ hours of in-depth training across 5 comprehensive modules</p>
              <div className="space-y-4">
                {certificationModules.map((mod, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <div>
                          <span className="text-xs text-emerald-500 font-medium">{mod.module}</span>
                          <h4 className="font-display text-foreground">{mod.title}</h4>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-muted text-muted-foreground text-xs">
                        {mod.duration}
                      </Badge>
                    </div>
                    <div className="ml-11 flex flex-wrap gap-2">
                      {mod.topics.map((topic, j) => (
                        <span key={j} className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
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
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
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
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">What Certified Coaches Say</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {testimonials.map((testimonial, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{testimonial.quote}"</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-secondary/50 rounded-2xl p-6"
            >
              <h3 className="text-lg font-display text-foreground mb-4 text-center">Requirements to Get Certified</h3>
              <div className="grid md:grid-cols-5 gap-4">
                {requirements.map((req, i) => (
                  <div key={i} className="text-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                      {i + 1}
                    </div>
                    <p className="font-medium text-foreground text-sm mb-1">{req.requirement}</p>
                    <p className="text-xs text-muted-foreground">{req.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default VaultVerifiedCoach;