import { motion } from "framer-motion";
import { Video, Check, ArrowRight, Loader2, Clock, Zap, Target, FileText, Dumbbell, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileConversionBar from "@/components/products/MobileConversionBar";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const VeloCheck = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.velo_check;

  const reportSections = [
    {
      icon: FileText,
      title: "Athlete Profile",
      items: ["Athlete Name", "Primary Goal", "Primary Breakdown Area"],
    },
    {
      icon: Target,
      title: "Vault Fix #1: Mechanical",
      items: ["Specific mechanical issue identified", "Root cause explanation", "Visual breakdown"],
    },
    {
      icon: Zap,
      title: "Vault Fix #2: Movement",
      items: ["Movement pattern correction", "Kinetic chain analysis", "Sequencing improvement"],
    },
    {
      icon: Dumbbell,
      title: "Vault Fix #3: Training Priority",
      items: ["Physical limitation addressed", "Strength/mobility focus", "Training prescription"],
    },
  ];

  const drillsSection = [
    "Immediate drill recommendations",
    "Movement cues to apply",
    "Practice frequency guidelines",
    "Video examples included",
  ];

  const perfectFor = [
    "Non-members testing Vault quality",
    "Remote athletes without local coaching",
    "Parents exploring options before committing",
    "Players wanting a quick velocity check-up",
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
              <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-blue-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                GET 3 EXACT FIXES THAT UNLOCK MORE VELOCITY
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload a hitting or throwing video. Vault coaches analyze it and deliver 
                3 specific Vault Fixes you can apply immediately.
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
                  <p className="text-sm text-blue-600 font-medium mb-2">One-Time Analysis</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Delivered within 48 hours
                  </p>
                </div>
                <Button
                  variant="vault"
                  size="xl"
                  onClick={() => checkout('velo_check')}
                  disabled={loading === 'velo_check'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading === 'velo_check' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Video className="w-5 h-5 mr-2" />
                  )}
                  Get Your Velo-Check
                </Button>
              </div>
            </motion.div>

            {/* Velo-Check Report Structure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-display text-foreground mb-6 text-center">
                Your Velo-Check Report Includes
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {reportSections.map((section, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <section.icon className="w-5 h-5 text-blue-500" />
                      </div>
                      <h3 className="font-display text-lg text-foreground">{section.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-blue-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Drills to Apply Immediately */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-500/20 rounded-2xl p-8 mb-12"
            >
              <h3 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-blue-500" />
                Drills to Apply Immediately
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {drillsSection.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-blue-500" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recommended Program Path */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
                <Route className="w-5 h-5 text-blue-500" />
                Recommended Program Path
              </h3>
              <p className="text-muted-foreground mb-4">
                Based on your analysis, we'll recommend the ideal Vault program to address your fixes 
                and accelerate your development.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-vault/10 text-vault text-sm rounded-full">Velocity System</span>
                <span className="px-3 py-1 bg-vault/10 text-vault text-sm rounded-full">Performance Membership</span>
                <span className="px-3 py-1 bg-vault/10 text-vault text-sm rounded-full">Velocity Accelerator</span>
              </div>
            </motion.div>

            {/* Perfect For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-xl font-display text-foreground mb-4">Perfect For</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {perfectFor.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-blue-500" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upsell */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-vault/5 border border-vault/20 rounded-2xl p-8 text-center"
            >
              <h3 className="text-xl font-display text-foreground mb-2">
                Apply Your Fixes Inside Vault Performance
              </h3>
              <p className="text-muted-foreground mb-4">
                Get ongoing coaching, metrics tracking, and structured programming 
                to turn your fixes into real velocity gains.
              </p>
              <Link to="/#pricing">
                <Button variant="outline" className="border-vault text-vault hover:bg-vault hover:text-white">
                  View Performance Membership — $59/month
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
        productKey="velo_check"
        onCheckout={checkout}
        loading={loading}
        ctaText="Get Velo-Check"
      />
      <Footer />
    </main>
  );
};

export default VeloCheck;
