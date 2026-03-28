import { motion } from "framer-motion";
import { 
  Zap, Check, ArrowRight, Loader2, TrendingUp, Target, Users, 
  Star, Shield, Play, Clock, Award, Quote, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileConversionBar from "@/components/products/MobileConversionBar";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const VelocitySystem = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.velocity_12week;

  const features = [
    "12 weeks of structured, progressive programming",
    "Lower body → rotational → transfer phases",
    "Med ball & intent-based velocity training",
    "Weekly progression model with checkpoints",
    "Built-in testing & tracking templates",
    "HD video demonstration library (50+ videos)",
    "Exit velocity tracking spreadsheets",
    "Pitch velocity development protocols",
  ];

  const whoItsFor = [
    { icon: Target, text: "HS & college-bound players" },
    { icon: TrendingUp, text: "Players chasing real velocity gains" },
    { icon: Users, text: "Athletes who want results without subscriptions" },
  ];

  const testimonials = [
    {
      name: "Jake Thompson",
      role: "HS Junior, Texas",
      image: "/testimonial-jake.jpg",
      quote: "Went from 78 to 86 mph in 10 weeks. The progression made sense and I never felt like I was guessing.",
      result: "+8 MPH",
    },
    {
      name: "Marcus Williams",
      role: "College Freshman, Florida",
      image: "/testimonial-marcus.jpg", 
      quote: "The med ball work and intent training completely changed how I understand velocity. Worth every penny.",
      result: "94 MPH Exit Velo",
    },
    {
      name: "Ryan Chen",
      role: "HS Senior, California",
      image: "/testimonial-ryan.jpg",
      quote: "I tried 3 other programs before this. VAULT was the first one that actually explained WHY each drill mattered.",
      result: "+12 MPH EV",
    },
  ];

  const stats = [
    { value: "2,400+", label: "Athletes Trained" },
    { value: "6.2", label: "Avg MPH Gained" },
    { value: "94%", label: "Complete the Program" },
    { value: "30-Day", label: "Money-Back Guarantee" },
  ];

  const weekBreakdown = [
    { weeks: "Weeks 1-4", title: "Foundation", desc: "Lower body power, movement patterns, baseline testing" },
    { weeks: "Weeks 5-8", title: "Rotation", desc: "Hip-shoulder separation, med ball progressions, intent work" },
    { weeks: "Weeks 9-12", title: "Transfer", desc: "Game application, peak testing, maintenance planning" },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Stand-Alone Program
                </Badge>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  <Shield className="w-3 h-3 mr-1" />
                  30-Day Guarantee
                </Badge>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                INCREASE BAT SPEED. INCREASE EXIT VELOCITY.
              </h1>
              <p className="text-2xl font-display text-red-500 mb-4">
                DO IT THE RIGHT WAY.
              </p>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                A 12-week, phase-based velocity system built for serious baseball players 
                who want real, measurable power gains.
              </p>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-xl bg-card border border-border">
                  <div className="text-2xl md:text-3xl font-display text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Video Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative rounded-2xl overflow-hidden mb-12 aspect-video bg-gradient-to-br from-red-500/20 to-primary/20 border border-border"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/20 transition-colors">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-white font-medium">Watch Program Preview</p>
                  <p className="text-white/60 text-sm">2:47</p>
                </div>
              </div>
              <img 
                src="/assets/course-hitting.jpg" 
                alt="Velocity System Preview"
                className="w-full h-full object-cover opacity-50"
              />
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-card to-secondary border-2 border-primary/20 rounded-2xl p-8 mb-12"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm text-red-600 font-medium">One-Time Purchase</p>
                    <Badge variant="outline" className="border-green-500/50 text-green-600">
                      Save $100
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                    <span className="text-xl text-muted-foreground line-through">$499</span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4 text-green-500" />
                      Lifetime access
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4 text-green-500" />
                      No recurring fees
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4 text-green-500" />
                      Instant access
                    </span>
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    variant="vault"
                    size="xl"
                    onClick={() => checkout('velocity_12week')}
                    disabled={loading === 'velocity_12week'}
                    className="text-lg px-8"
                  >
                    {loading === 'velocity_12week' ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : null}
                    Get Instant Access
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    🔒 Secure checkout • 30-day money-back guarantee
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Program Structure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                12-Week Program Structure
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {weekBreakdown.map((phase, i) => (
                  <div key={i} className="relative">
                    <div className="text-sm text-primary font-medium mb-2">{phase.weeks}</div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">{phase.title}</h4>
                    <p className="text-sm text-muted-foreground">{phase.desc}</p>
                    {i < weekBreakdown.length - 1 && (
                      <ChevronRight className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 text-muted-foreground/30" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                What's Included
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center flex items-center justify-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                What Athletes Are Saying
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-6">
                    <Quote className="w-8 h-8 text-primary/20 mb-4" />
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        {testimonial.result}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Who It's For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6">Who It's For</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {whoItsFor.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-red-500" />
                      </div>
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-center"
            >
              <h3 className="text-2xl md:text-3xl font-display text-white mb-4">
                Ready to Add Real Velocity?
              </h3>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                Join 2,400+ athletes who've transformed their power with the VAULT Velocity System. 
                Start today with our 30-day money-back guarantee.
              </p>
              <Button
                size="xl"
                onClick={() => checkout('velocity_12week')}
                disabled={loading === 'velocity_12week'}
                className="bg-white text-primary hover:bg-white/90 text-lg px-10"
              >
                {loading === 'velocity_12week' ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                Get the 12-Week System — {formatPrice(product.price)}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Upsell */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 bg-secondary/50 rounded-2xl p-8 text-center"
            >
              <h3 className="text-xl font-display text-foreground mb-2">
                Want Coaching Feedback & All Five Systems?
              </h3>
              <p className="text-muted-foreground mb-4">
                Upgrade to Vault Performance Membership for personalized coaching, 
                video analysis, and access to all training systems.
              </p>
              <Link to="/#pricing">
                <Button variant="outline">
                  Compare Membership Options
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
        productKey="velocity_12week"
        onCheckout={checkout}
        loading={loading}
        ctaText="Buy Now"
      />
      <Footer />
    </main>
  );
};

export default VelocitySystem;