import { motion } from "framer-motion";
import { Check, Loader2, Power, Zap, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const SUBSCRIPTION_TIERS = {
  basic: {
    price_id: "price_1SjGMKPhXS410TO5XQcZm9fZ",
    product_id: "prod_TgddaadHxz0mTj",
  },
  performance: {
    price_id: "price_1SjGMYPhXS410TO5bGu1kSSZ",
    product_id: "prod_TgddQA4gp7kWZy",
  },
  elite: {
    price_id: "price_1SjGMhPhXS410TO59WKiE81b",
    product_id: "prod_Tgdd8gSJpkk33e",
  },
};

const plans = [
  {
    id: 1,
    name: "Athlete",
    description: "Core system access for individual athletes",
    price: 29,
    period: "/month",
    icon: Zap,
    features: [
      "Access to 2 training modules",
      "Weekly programming updates",
      "Basic metrics dashboard",
      "Community forum access",
      "Email support",
    ],
    popular: false,
    tier: "basic" as const,
    postLaunchLabel: "Standard Pricing Post-Launch",
  },
  {
    id: 2,
    name: "Performance",
    description: "Full suite for serious competitors",
    price: 59,
    period: "/month",
    icon: Shield,
    features: [
      "All 5 VAULT™ modules unlocked",
      "Personalized programming",
      "Advanced metrics dashboard",
      "Video analysis (2x/month)",
      "Coach feedback & notes",
      "Priority support",
    ],
    popular: true,
    tier: "performance" as const,
    postLaunchLabel: "Standard Pricing Post-Launch",
    bestValue: true,
    d1Badge: true,
    annualAnchor: "(Standard Rate: $708/yr)",
    hasFreeTrial: true,
  },
  {
    id: 3,
    name: "Elite",
    description: "Complete framework for next-level athletes",
    price: 149,
    period: "/month",
    icon: Award,
    features: [
      "Everything in Performance",
      "1-on-1 virtual coaching sessions",
      "Custom program design",
      "Unlimited video analysis",
      "College recruiting guidance",
      "Direct coach messaging",
    ],
    popular: false,
    tier: "elite" as const,
    postLaunchLabel: "Standard Pricing Post-Launch",
  },
];

const Pricing = () => {
  const [user, setUser] = useState<any>(null);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkSubscription();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkSubscription();
      } else {
        setCurrentProductId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.subscribed && data?.product_id) {
        setCurrentProductId(data.product_id);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async (tier: keyof typeof SUBSCRIPTION_TIERS) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to activate a membership.",
        variant: "destructive",
      });
      return;
    }

    setLoadingTier(tier);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: SUBSCRIPTION_TIERS[tier].price_id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingTier('manage');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open subscription management",
        variant: "destructive",
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const isCurrentPlan = (tier: keyof typeof SUBSCRIPTION_TIERS) => {
    return currentProductId === SUBSCRIPTION_TIERS[tier].product_id;
  };

  return (
    <section id="pricing" className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card mb-6">
            <Power className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Activation Blocks</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-display text-foreground mb-4 tracking-wider">
            ACTIVATE YOUR TIER
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Select the membership level that matches your training commitment and performance goals.
          </p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-4 italic">
            VAULT™ is a complete OS. We don't sell pieces; we build athletes. Choose Monthly for flexibility or Founder's for Lifetime ownership.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-card border-2 p-8 ${
                  plan.popular
                    ? "border-foreground"
                    : "border-border"
                } ${isCurrentPlan(plan.tier) ? "ring-2 ring-longevity" : ""}`}
              >
                {/* Launch Special Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none rounded-lg" />
                
                {/* D1 Prospect Standard Badge for $59 tier */}
                {(plan as any).d1Badge && (
                  <div className="absolute -top-3 -left-3 z-20">
                    <div className="bg-utility text-[#181818] px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-lg">
                      D1 Prospect Standard
                    </div>
                  </div>
                )}
                
                {/* Best Value Ribbon for $59 tier */}
                {(plan as any).bestValue && (
                  <div className="absolute -top-3 -right-3 z-20">
                    <div className="bg-amber-500 text-[#181818] px-3 py-1 text-xs font-bold uppercase tracking-wider transform rotate-12 shadow-lg">
                      Best Value
                    </div>
                  </div>
                )}

                {plan.popular && (
                  <div className="absolute -top-px left-0 right-0">
                    <div className="h-1 bg-foreground" />
                  </div>
                )}

                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-foreground text-background text-xs uppercase tracking-[0.15em]">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan(plan.tier) && (
                  <div className="absolute -top-4 right-4">
                    <span className="px-4 py-1 bg-longevity text-[#181818] text-xs uppercase tracking-[0.15em]">
                      Active
                    </span>
                  </div>
                )}

                <div className="mb-8 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 border border-border flex items-center justify-center">
                      <Icon className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display text-foreground tracking-wide">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-display text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  {/* Annual Anchor Text for $59 tier */}
                  {(plan as any).annualAnchor && (
                    <p className="text-xs text-muted-foreground mt-1">{(plan as any).annualAnchor}</p>
                  )}
                  {/* Post-Launch Label */}
                  <p className="text-xs text-muted-foreground mt-2 italic">{(plan as any).postLaunchLabel}</p>
                  
                  {/* Lifetime Upsell for $59 tier */}
                  {(plan as any).lifetimeUpsell && (
                    <a 
                      href="/products/founders-access" 
                      className="block mt-3 text-xs text-amber-500 hover:text-amber-400 underline"
                    >
                      {(plan as any).lifetimeUpsell}
                    </a>
                  )}
                </div>

                {/* Launch Special Banner */}
                <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/40 rounded-lg relative z-10">
                  <p className="text-xs text-amber-500 font-bold uppercase tracking-wide text-center">
                    🚀 LAUNCH SPECIAL: Get Lifetime Access to ALL Tiers for $499
                  </p>
                </div>

                <ul className="space-y-3 mb-8 relative z-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-foreground" />
                      </div>
                      <span className="text-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="relative z-10 space-y-3">
                  {(plan as any).hasFreeTrial ? (
                    <>
                      <Button
                        variant="vault"
                        size="lg"
                        className="w-full"
                        onClick={() => window.location.href = '/trial'}
                      >
                        <Power className="w-4 h-4 mr-2" />
                        Start 7-Day Free Trial
                      </Button>
                      <a 
                        href="/products/founders-access" 
                        className="block text-center text-sm text-amber-500 hover:text-amber-400 underline"
                      >
                        Wait, I want the $499 Lifetime Deal instead.
                      </a>
                    </>
                  ) : (
                    <Button
                      variant="vault"
                      size="lg"
                      className="w-full bg-amber-500 hover:bg-amber-600 text-[#181818]"
                      onClick={() => window.location.href = '/products/founders-access'}
                    >
                      <Power className="w-4 h-4 mr-2" />
                      Get Lifetime Access - $499
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Org Fast-Pass Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          <div className="p-6 border-2 border-utility bg-card">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-utility flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#181818]" />
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground tracking-wide">Org Fast-Pass</h3>
                <p className="text-xs text-muted-foreground">Complete VAULT™ suite for organizations</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              25 athletes, coach certification included. Full framework access for your entire program.
            </p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-display text-foreground">$2,500</span>
              <span className="text-sm text-muted-foreground">/year</span>
            </div>
            <Button variant="vault" className="w-full" onClick={() => window.location.href = '/products/org-starter-pack'}>
              <Power className="w-4 h-4 mr-2" />
              Activate Org Access
            </Button>
          </div>
          
          <div className="p-6 border-2 border-border bg-card">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 border border-border flex items-center justify-center">
                <Award className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground tracking-wide">Coach Certification</h3>
                <p className="text-xs text-muted-foreground">VAULT™ Verified Coach Badge</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Get certified, access drill libraries, and grow your coaching business with the VAULT™ framework.
            </p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-display text-foreground">$500</span>
              <span className="text-sm text-muted-foreground">/year</span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/products/certified-coach'}>
              Get Certified
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
