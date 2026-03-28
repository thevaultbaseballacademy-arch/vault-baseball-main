import { motion } from "framer-motion";
import { Award, Check, ArrowRight, Loader2, BookOpen, Users, Globe, Building, Shield, Calendar, MessageSquare, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileConversionBar from "@/components/products/MobileConversionBar";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const CertifiedCoach = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.certified_coach;

  const whatCoachesGet = [
    {
      icon: Award,
      title: "VAULT™ Certification Badge",
      description: "Official credentials recognized across the baseball training industry",
    },
    {
      icon: BookOpen,
      title: "Drill & Program Library",
      description: "200+ exercises and programming templates at your fingertips",
    },
    {
      icon: Shield,
      title: "Brand Usage Rights",
      description: "Permission to use VAULT™ branding in your marketing and facility",
    },
    {
      icon: Globe,
      title: "Website Listing",
      description: "Get listed in the official VAULT™ Certified Coach directory",
    },
  ];

  const fullIncludes = [
    { icon: Award, text: "VAULT™ Certification badge" },
    { icon: BookOpen, text: "Complete drill library access" },
    { icon: Shield, text: "Brand usage rights" },
    { icon: Globe, text: "Listing on Vault website" },
    { icon: Video, text: "Programming templates" },
    { icon: Calendar, text: "Coach education modules" },
    { icon: Users, text: "Exclusive coach community" },
    { icon: MessageSquare, text: "Quarterly webinars & updates" },
    { icon: Shield, text: "Priority support channel" },
    { icon: Calendar, text: "Annual certification renewal" },
  ];

  const whoItsFor = [
    { icon: Users, title: "Private Instructors", description: "Elevate your 1-on-1 coaching with proven methodology" },
    { icon: Building, title: "Facility Owners", description: "Differentiate your training center with VAULT™ certification" },
    { icon: Award, title: "Travel Org Coaches", description: "Bring elite training systems to your organization" },
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
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-background" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                BECOME A VAULT™ CERTIFIED COACH
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join the network of certified VAULT™ coaches. Get the credentials, 
                resources, and recognition to grow your coaching business.
              </p>
            </motion.div>

            {/* What Coaches Get - Main Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {whatCoachesGet.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="bg-card border border-border rounded-xl p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-foreground" />
                    </div>
                    <h3 className="font-display text-lg text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                );
              })}
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-foreground to-foreground/90 border border-border rounded-2xl p-8 mb-12 text-background"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-background/70 font-medium mb-2">Annual Certification</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-display">{formatPrice(product.price)}</span>
                    <span className="text-background/70">/year</span>
                  </div>
                  <p className="text-sm text-background/70">
                    Full access to all coach resources and certification
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="xl"
                  onClick={() => checkout('certified_coach')}
                  disabled={loading === 'certified_coach'}
                  className="bg-background text-foreground hover:bg-background/90"
                >
                  {loading === 'certified_coach' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Award className="w-5 h-5 mr-2" />
                  )}
                  Become VAULT™ Certified
                </Button>
              </div>
            </motion.div>

            {/* Who It's For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6">Who It's For</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {whoItsFor.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="bg-secondary/30 rounded-xl p-5">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                      <h4 className="font-display text-foreground mb-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Full Includes List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6">Everything You Get</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {fullIncludes.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-foreground" />
                      </div>
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Bundle Hook */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-vault/5 border border-vault/20 rounded-2xl p-8 mb-12 text-center"
            >
              <h3 className="text-xl font-display text-foreground mb-2">
                Coach Authority Pack — Save $250
              </h3>
              <p className="text-muted-foreground mb-4">
                Get VAULT™ Certification + Velocity System License + Metrics Playbook in one bundle.
              </p>
              <Link to="/products/bundles">
                <Button variant="outline" className="border-vault text-vault hover:bg-vault hover:text-white">
                  View Coach Bundle
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Directory Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-secondary/50 rounded-2xl p-8 text-center"
            >
              <h3 className="text-xl font-display text-foreground mb-2">
                Looking for a Certified Coach?
              </h3>
              <p className="text-muted-foreground mb-4">
                Browse our directory of VAULT™ Certified Coaches to find expert training in your area.
              </p>
              <Link to="/find-coach">
                <Button variant="outline">
                  Find a VAULT™ Coach
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
        productKey="certified_coach"
        onCheckout={checkout}
        loading={loading}
        ctaText="Get Certified"
      />
      <Footer />
    </main>
  );
};

export default CertifiedCoach;
