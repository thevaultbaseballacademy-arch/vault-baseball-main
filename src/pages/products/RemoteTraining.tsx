import { motion } from "framer-motion";
import {
  Video, Check, ArrowRight, Loader2, Calendar, MessageCircle,
  BarChart3, Users, Zap, Shield, Target, TrendingUp, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileConversionBar from "@/components/products/MobileConversionBar";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const RemoteTraining = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.remote_training;

  const included = [
    { icon: Calendar, title: "Weekly Programming", desc: "Custom training plans delivered every week — structured around your goals, position, and level." },
    { icon: Video, title: "Video Analysis", desc: "Submit throwing or hitting video and get direct coach feedback with specific mechanical fixes." },
    { icon: BarChart3, title: "Metrics Tracking", desc: "Track velocity, exit velo, and performance data over time. See exactly where you're improving." },
    { icon: MessageCircle, title: "Direct Coach Access", desc: "Message your assigned Vault coach anytime. Get answers within 24 hours — no gatekeeping." },
    { icon: Target, title: "Monthly Check-Ins", desc: "Structured monthly reviews to adjust programming, set new targets, and keep development on track." },
    { icon: Shield, title: "Arm Care Protocols", desc: "Built-in recovery and arm health programming so you develop velocity without risk." },
  ];

  const comparison = [
    { feature: "Structured weekly programming", vault: true, other: false },
    { feature: "Video analysis with coach feedback", vault: true, other: false },
    { feature: "Metrics tracking dashboard", vault: true, other: false },
    { feature: "Direct coach messaging", vault: true, other: false },
    { feature: "Progressive overload model", vault: true, other: false },
    { feature: "Arm care built in", vault: true, other: false },
    { feature: "Cancel anytime", vault: true, other: false },
    { feature: "Under $50/week", vault: true, other: false },
  ];

  const perfectFor = [
    "Athletes training remotely without local coaching",
    "Players who completed the Velocity System and want ongoing support",
    "Families who want a structured plan — not random lessons",
    "Athletes preparing for showcases, tryouts, or college recruiting",
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-24 bg-foreground text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(hsl(var(--background)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--background)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block px-4 py-1.5 border border-primary-foreground/20 text-primary-foreground/50 text-xs font-display tracking-[0.25em] mb-8">
                ONGOING DEVELOPMENT
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display leading-[0.9] mb-6">
                STOP TRAINING ALONE.<br />START DEVELOPING WITH A SYSTEM.
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/50 max-w-2xl mx-auto mb-10">
                Weekly programming, video analysis, metrics tracking, and direct coach access — 
                delivered remotely, structured for results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-lg px-10 py-6 font-display tracking-wide"
                  onClick={() => checkout('remote_training')}
                  disabled={loading === 'remote_training'}
                >
                  {loading === 'remote_training' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2" />
                  )}
                  JOIN REMOTE TRAINING — {formatPrice(product.price)}/MO
                </Button>
                <p className="text-xs text-primary-foreground/30 font-display tracking-wider">CANCEL ANYTIME · NO CONTRACTS</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">

          {/* What's Included */}
          <section className="py-20">
            <motion.div {...fadeUp}>
              <div className="text-center mb-14">
                <span className="text-xs font-display tracking-[0.25em] text-muted-foreground mb-3 block">WHAT'S INCLUDED</span>
                <h2 className="text-3xl md:text-5xl font-display text-foreground mb-4">
                  EVERYTHING YOU NEED TO DEVELOP — REMOTELY
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {included.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card border border-border p-6"
                  >
                    <div className="w-10 h-10 bg-foreground/5 flex items-center justify-center mb-4">
                      <item.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <h3 className="font-display text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Pricing Card */}
          <section className="pb-20">
            <motion.div {...fadeUp}>
              <div className="bg-foreground text-primary-foreground p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive via-foreground to-destructive" />
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                  <div>
                    <span className="text-xs font-display tracking-[0.25em] text-primary-foreground/40 mb-2 block">MONTHLY MEMBERSHIP</span>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-6xl font-display">{formatPrice(product.price)}</span>
                      <span className="text-xl text-primary-foreground/40 font-display">/month</span>
                    </div>
                    <p className="text-sm text-primary-foreground/50 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Cancel anytime · No long-term contracts · Under $50/week
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="text-lg px-10 py-6 font-display tracking-wide bg-primary-foreground text-foreground hover:bg-primary-foreground/90 shrink-0"
                    onClick={() => checkout('remote_training')}
                    disabled={loading === 'remote_training'}
                  >
                    {loading === 'remote_training' ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="w-5 h-5 mr-2" />
                    )}
                    Start Remote Training
                  </Button>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Vault vs. Everything Else */}
          <section className="pb-20">
            <motion.div {...fadeUp}>
              <div className="text-center mb-10">
                <span className="text-xs font-display tracking-[0.25em] text-muted-foreground mb-3 block">COMPARISON</span>
                <h2 className="text-3xl md:text-4xl font-display text-foreground">VAULT VS. RANDOM TRAINING</h2>
              </div>
              <div className="bg-card border border-border overflow-hidden">
                <div className="grid grid-cols-3 border-b border-border">
                  <div className="p-4 text-sm font-display text-muted-foreground">FEATURE</div>
                  <div className="p-4 text-sm font-display text-foreground text-center border-x border-border bg-foreground/[0.03]">VAULT REMOTE</div>
                  <div className="p-4 text-sm font-display text-muted-foreground text-center">PRIVATE LESSONS</div>
                </div>
                {comparison.map((row, i) => (
                  <div key={i} className="grid grid-cols-3 border-b border-border last:border-0">
                    <div className="p-4 text-sm text-muted-foreground">{row.feature}</div>
                    <div className="p-4 text-center border-x border-border bg-foreground/[0.03]">
                      <Check className="w-4 h-4 text-foreground mx-auto" />
                    </div>
                    <div className="p-4 text-center">
                      {row.other ? (
                        <Check className="w-4 h-4 text-muted-foreground mx-auto" />
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Perfect For */}
          <section className="pb-20">
            <motion.div {...fadeUp}>
              <div className="bg-muted border border-border p-8 md:p-12">
                <h3 className="text-2xl font-display text-foreground mb-6">PERFECT FOR</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {perfectFor.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>

          {/* Upsell from lower tier */}
          <section className="pb-20">
            <motion.div {...fadeUp}>
              <div className="bg-card border border-border p-8 md:p-12 text-center">
                <TrendingUp className="w-8 h-8 text-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-display text-foreground mb-2">NOT READY FOR MONTHLY COACHING?</h3>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Start with a one-time Velo-Check Assessment or the Vault Velocity System — 
                  then upgrade to Remote Training when you're ready for ongoing support.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/products/velo-check">
                    <Button variant="outline" className="font-display">
                      Velo-Check — $97
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/products/velocity-system">
                    <Button variant="outline" className="font-display">
                      Velocity System — $397
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Final CTA */}
          <section className="pb-24">
            <motion.div {...fadeUp}>
              <div className="bg-foreground text-primary-foreground p-10 md:p-16 text-center">
                <h2 className="text-3xl md:text-5xl font-display mb-4">STOP GUESSING. START DEVELOPING.</h2>
                <p className="text-primary-foreground/50 mb-8 max-w-lg mx-auto">
                  Join the athletes who replaced random training with structured, coached development — and started seeing real results.
                </p>
                <Button
                  size="lg"
                  className="text-lg px-10 py-6 font-display tracking-wide bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
                  onClick={() => checkout('remote_training')}
                  disabled={loading === 'remote_training'}
                >
                  {loading === 'remote_training' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2" />
                  )}
                  JOIN REMOTE TRAINING — {formatPrice(product.price)}/MO
                </Button>
                <p className="mt-4 text-xs text-primary-foreground/30 font-display tracking-wider">
                  CANCEL ANYTIME · NO CONTRACTS · RESULTS OR ADJUST
                </p>
              </div>
            </motion.div>
          </section>

        </div>
      </div>

      <MobileConversionBar
        productName={product.name}
        price={product.price}
        productKey="remote_training"
        onCheckout={checkout}
        loading={loading}
        ctaText="Join Remote Training"
      />
      <Footer />
    </main>
  );
};

export default RemoteTraining;
