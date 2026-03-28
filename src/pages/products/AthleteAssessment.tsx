import { motion } from "framer-motion";
import { Zap, Check, ArrowRight, Loader2, TrendingUp, Target, Video, FileText, BarChart3, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileConversionBar from "@/components/products/MobileConversionBar";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const AthleteAssessment = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.velo_check;

  const deliverables = [
    { icon: Video, label: "Mechanical Video Review", desc: "Frame-by-frame analysis of your throwing or hitting mechanics by Vault coaches." },
    { icon: BarChart3, label: "Development Scorecard", desc: "Detailed scoring across all 5 VAULT pillars with age-group benchmarks." },
    { icon: TrendingUp, label: "Velocity Potential Analysis", desc: "AI-projected velocity ceiling based on your current mechanics and physical profile." },
    { icon: FileText, label: "Custom Improvement Plan", desc: "Prioritized action plan with specific drills and timelines for measurable gains." },
  ];

  const features = [
    "Professional-grade mechanical breakdown",
    "Comparison to age-group benchmarks",
    "Arm health risk assessment",
    "5-pillar development scoring",
    "Personalized drill recommendations",
    "48-hour turnaround time",
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-foreground text-primary-foreground py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] font-display tracking-[0.3em] text-primary-foreground/30 mb-4 block"
            >
              TIER 1 — ASSESSMENT
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display leading-[0.9] mb-4"
            >
              VAULT DEVELOPMENT
              <br />
              <span className="text-primary-foreground/40">ASSESSMENT</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-primary-foreground/50 max-w-xl mb-8"
            >
              Get a professional mechanical breakdown, development scorecard, and custom improvement plan — the foundation every serious athlete needs before starting a training program.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-6"
            >
              <div>
                <span className="text-4xl font-display">{formatPrice(product.price)}</span>
                <span className="text-primary-foreground/30 text-sm ml-2">one-time</span>
              </div>
              <Button
                size="xl"
                className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 font-display tracking-wide"
                onClick={() => checkout("velo_check")}
                disabled={!!loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                GET YOUR ASSESSMENT
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground mb-4 block">WHAT'S INCLUDED</span>
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-10">YOUR COMPLETE DEVELOPMENT SNAPSHOT</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-12">
              {deliverables.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="border border-border bg-card p-6 flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-muted flex items-center justify-center shrink-0">
                    <d.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-display text-sm tracking-wide text-foreground mb-1">{d.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{d.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-border bg-card p-7">
                <h3 className="font-display text-lg text-foreground mb-5">EVERYTHING YOU GET</h3>
                <ul className="space-y-3">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-foreground shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div className="border border-border bg-muted p-5 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-display text-foreground">48-HOUR TURNAROUND</p>
                    <p className="text-xs text-muted-foreground">Submit your video, get your assessment within 2 business days.</p>
                  </div>
                </div>
                <div className="border border-border bg-muted p-5 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-display text-foreground">SATISFACTION GUARANTEED</p>
                    <p className="text-xs text-muted-foreground">Not happy with your assessment? We'll refund you. No questions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funnel CTA */}
      <section className="py-16 md:py-20 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display mb-4">
              NOT READY TO INVEST?
            </h2>
            <p className="text-primary-foreground/45 mb-8">
              Start with a free evaluation to see where your athlete stands — no card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/evaluate">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-foreground font-display tracking-wide"
                >
                  START FREE EVALUATION
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/products/velocity-system">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-foreground font-display tracking-wide"
                >
                  VIEW VELOCITY SYSTEM →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileConversionBar
        productName="Development Assessment"
        price={product.price}
        productKey="velo_check"
        onCheckout={checkout}
        loading={loading}
      />
    </main>
  );
};

export default AthleteAssessment;
