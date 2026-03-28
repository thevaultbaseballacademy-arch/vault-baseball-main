import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Shield, Users, BarChart3, Award, Play, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { supabase } from "@/integrations/supabase/client";

const PartnerClaim = () => {
  const { checkout, loading } = useProductCheckout();
  const [spotsTaken, setSpotsTaken] = useState(0);
  const TOTAL_SPOTS = 1000;

  useEffect(() => {
    const checkSpots = async () => {
      const { count } = await supabase
        .from('user_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('product_key', 'founders_access')
        .eq('status', 'completed');
      setSpotsTaken(count || 0);
    };
    checkSpots();
  }, []);

  const spotsRemaining = TOTAL_SPOTS - spotsTaken;
  const isSoldOut = spotsRemaining <= 0;

  const benefits = [
    {
      icon: Shield,
      title: "VAULT™ Certified Partner Status",
      description: "Official recognition as a VAULT™ partner organization with exclusive branding rights"
    },
    {
      icon: BarChart3,
      title: "Advanced Metrics Dashboard",
      description: "Track every athlete's velocity, workload, and development progress in real-time"
    },
    {
      icon: Users,
      title: "Unlimited Athlete Access",
      description: "Each family member gets their own lifetime account with full V.A.U.L.T. system access"
    },
    {
      icon: Award,
      title: "Priority Support & Updates",
      description: "Direct line to our coaching staff and first access to new features and systems"
    },
  ];

  const included = [
    "Lifetime access to all 5 VAULT™ pillars (Velocity, Athleticism, Utility, Longevity, Transfer)",
    "Personal athlete dashboard with progress tracking",
    "Weekly training programming customized to position",
    "Video analysis submission portal",
    "Recruiting guidance and college roadmap tools",
    "Exclusive Founder's Discord community access",
    "Founder's badge on athlete profile",
    "All future content updates included forever",
  ];

  const handleCheckout = () => {
    checkout('founders_access');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Exclusive Partner Offer</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display leading-[0.9] mb-6">
                <span className="text-muted-foreground">Your Organization is a</span>
                <span className="block metallic-text mt-2">VAULT™ CERTIFIED PARTNER</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
                As a member of a VAULT™ Partner Organization, you and your family have exclusive access to our 
                <span className="text-foreground font-semibold"> Lifetime Membership at 50% off</span>.
              </p>
              
              <div className="flex items-center justify-center gap-4 text-lg mb-8">
                <span className="text-muted-foreground line-through">$999</span>
                <span className="text-3xl font-bold text-primary">$499</span>
                <span className="text-sm text-muted-foreground">one-time payment</span>
              </div>
            </motion.div>

            {/* Video Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <Card className="bg-card/50 border-border/50 overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-primary ml-1" />
                    </div>
                    <p className="text-muted-foreground">Watch: How the VAULT™ System Works</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">2 min overview from our coaching staff</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mb-16"
            >
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-display mb-4">
                  Claim Your Partner Discount
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Enter your organization's referral code at checkout to unlock your exclusive 50% partner discount.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 w-full sm:w-auto"
                    onClick={handleCheckout}
                    disabled={loading === 'founders_access' || isSoldOut}
                  >
                    {loading === 'founders_access' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : isSoldOut ? (
                      "Sold Out"
                    ) : (
                      <>
                        Get Lifetime Access
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4 max-w-md mx-auto">
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
                    💰 Partner Referral Fee
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your org earns a <span className="font-semibold text-foreground">$100 Partner Referral Fee</span> for each family signup with your code
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  💡 Use your org's referral code (e.g., TIGERS100, CANES100) at checkout for 50% off
                </p>

                {!isSoldOut && spotsRemaining <= 20 && (
                  <p className="text-sm text-amber-500 mt-3 font-medium">
                    ⚡ Only {spotsRemaining} of {TOTAL_SPOTS} Founder spots remaining
                  </p>
                )}
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display mb-4">
                What Partner Families Get
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your organization has partnered with VAULT™ to give families exclusive access to elite-level training systems.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-card/50 border-border/50 p-6 h-full hover:border-primary/30 transition-colors">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground text-sm">{benefit.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-card/50 border-border/50 p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-display mb-8 text-center">
                  Everything Included in Lifetime Access
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {included.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-display mb-4">
                Your Personal Dashboard
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Track progress, access training programs, and monitor development metrics all in one place.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-card/50 border-border/50 overflow-hidden">
                <div className="aspect-[16/9] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center p-8">
                  <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
                    {/* Mock Dashboard Cards */}
                    <div className="bg-background/80 rounded-lg p-4 border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">Fastball Velo</div>
                      <div className="text-2xl font-bold text-primary">87.2</div>
                      <div className="text-xs text-green-500">+2.4 mph</div>
                    </div>
                    <div className="bg-background/80 rounded-lg p-4 border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">Weekly Workload</div>
                      <div className="text-2xl font-bold">847</div>
                      <div className="text-xs text-muted-foreground">throws</div>
                    </div>
                    <div className="bg-background/80 rounded-lg p-4 border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">Course Progress</div>
                      <div className="text-2xl font-bold">67%</div>
                      <div className="text-xs text-amber-500">4 lessons left</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-display mb-4">
                Ready to Join?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Your organization has already done the work. Now it's time to give your athlete the edge they deserve.
              </p>
              
              <Button
                size="lg"
                className="text-lg px-10 py-6"
                onClick={handleCheckout}
                disabled={loading === 'founders_access' || isSoldOut}
              >
                {loading === 'founders_access' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : isSoldOut ? (
                  "Sold Out"
                ) : (
                  <>
                    Claim Partner Discount
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground mt-4">
                Enter your org's referral code at checkout • Secure payment via Stripe
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PartnerClaim;
