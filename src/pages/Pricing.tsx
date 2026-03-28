import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Check, Zap, Star, Shield, Trophy, Users, Calendar,
  CreditCard, ChevronDown, ChevronUp, ArrowRight,
  Sparkles, Gift, Building2, DollarSign, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import {
  PRODUCT_PRICES, MEMBERSHIP_TIERS, formatPrice,
  getBNPLInstallments, getMembershipComparisonValue,
  type ProductKey
} from "@/lib/productPricing";

const TIER_ICONS: Record<string, React.ElementType> = {
  basic: Zap, performance: Star, elite: Trophy, remote_training: Users,
};

const TIER_COLORS: Record<string, string> = {
  basic: "text-blue-500", performance: "text-amber-500",
  elite: "text-green-500", remote_training: "text-purple-500",
};

const TIER_BORDERS: Record<string, string> = {
  basic: "border-border", performance: "border-amber-500/50 shadow-amber-500/10 shadow-lg",
  elite: "border-green-500/30", remote_training: "border-purple-500/30",
};

const FAQ = [
  { q: "Can I switch plans anytime?", a: "Yes. Upgrade or downgrade at any time. Upgrades take effect immediately with prorated billing. Downgrades take effect at the next billing cycle." },
  { q: "Is there a free trial?", a: "New athletes get a 7-day trial when signing up through the app. No credit card required for the trial." },
  { q: "How does Klarna / Affirm work?", a: "On any eligible purchase $50+, you'll see Klarna and Affirm options at checkout. Klarna splits your payment into 4 equal installments (0% APR on qualifying purchases). Affirm offers flexible 3-36 month financing. Both are managed by the payment provider — VAULT™ receives full payment upfront." },
  { q: "Can parents purchase for their athlete?", a: "Absolutely. You can purchase any plan and enter your athlete's email to link the account. The parent portal is included free with any Performance plan or above." },
  { q: "Do coaches get paid through VAULT™?", a: "Yes. VAULT™ certified coaches receive direct payouts to their connected bank account via Stripe Connect. Payouts process within 2 business days of a lesson being completed and marked paid." },
  { q: "What's included in the Org License?", a: "Full VAULT™ OS for your entire program: athlete accounts, coach tools, parent portals, analytics, team dashboard, and practice plan builder. Annual billing only. Contact us for custom pricing above 100 athletes." },
  { q: "Are one-time purchases really lifetime?", a: "Yes. One-time purchases give you permanent access to that specific program and all future content updates to that program. They do not include membership features like AI coaching, prospect grading, or parent portal." },
  { q: "What payment methods are accepted?", a: "All major credit/debit cards (Visa, Mastercard, Amex, Discover), Apple Pay, Google Pay, Klarna (pay in 4), and Affirm (monthly financing). All payments processed securely by Stripe." },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { checkout, loading } = useProductCheckout();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showOneTime, setShowOneTime] = useState(false);

  const handleCheckout = (key: ProductKey) => checkout(key);

  const annualDiscount = (monthly: number, annual: number) =>
    Math.round((1 - annual / (monthly * 12)) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-12 pb-8 text-center max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-amber-500/10 text-amber-500 border-0">Honest pricing. No surprises.</Badge>
            <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
              INVEST IN THE ATHLETE
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Every plan includes the full VAULT™ course library, KPI tracking, and recovery system.
              No hidden fees. Cancel anytime.
            </p>
            {/* BNPL Banner */}
            <div className="flex items-center justify-center gap-3 bg-secondary border border-border rounded-xl p-3 max-w-md mx-auto mb-6">
              <CreditCard className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                Pay over time with <span className="font-medium text-foreground">Klarna</span> or <span className="font-medium text-foreground">Affirm</span> on orders $50+
              </p>
            </div>
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3">
              <span className={`text-sm ${billing === "monthly" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Monthly</span>
              <button
                onClick={() => setBilling(b => b === "monthly" ? "annual" : "monthly")}
                className={`relative w-12 h-6 rounded-full transition-colors ${billing === "annual" ? "bg-primary" : "bg-secondary border border-border"}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${billing === "annual" ? "translate-x-7" : "translate-x-1"}`} />
              </button>
              <span className={`text-sm ${billing === "annual" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                Annual <Badge className="ml-1 bg-green-500/10 text-green-600 border-0 text-[10px]">Save up to 20%</Badge>
              </span>
            </div>
          </motion.div>
        </section>

        {/* Membership Tiers */}
        <section className="container mx-auto px-4 pb-12 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MEMBERSHIP_TIERS.map((key, i) => {
              const product = PRODUCT_PRICES[key] as any;
              const Icon = TIER_ICONS[key];
              const color = TIER_COLORS[key];
              const border = TIER_BORDERS[key];
              const displayPrice = billing === "annual" && product.annualPrice
                ? Math.round(product.annualPrice / 12)
                : product.price;
              const bnpl = getBNPLInstallments(product.annualPrice || product.price);
              const isLoading = loading === key;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`relative bg-card border rounded-2xl p-6 flex flex-col ${border}`}
                >
                  {product.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-amber-500 text-white border-0 text-xs px-3">{product.badge}</Badge>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <h3 className="font-display text-foreground text-lg">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.tagline}</p>
                  </div>

                  <div className="mb-1">
                    <span className="text-3xl font-display text-foreground">{formatPrice(displayPrice)}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  {billing === "annual" && product.annualPrice && (
                    <p className="text-xs text-green-600 mb-1">
                      Save {annualDiscount(product.price, product.annualPrice)}% vs monthly
                    </p>
                  )}
                  {bnpl && billing === "annual" && (
                    <p className="text-xs text-muted-foreground mb-3">
                      or {bnpl.monthly}/mo × 4 with {bnpl.provider}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mb-4">{getMembershipComparisonValue(key)}</p>

                  <div className="flex-1 space-y-2 mb-5">
                    {product.features.map((f: string, fi: number) => (
                      <div key={fi} className="flex items-start gap-2">
                        <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${color}`} />
                        <span className="text-xs text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant={product.highlight ? "vault" : "outline"}
                    className="w-full"
                    onClick={() => handleCheckout(key)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading…" : "Get Started"}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Annual savings note */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Annual plans billed as one payment. Monthly plans billed each month. Cancel anytime.
          </p>
        </section>

        {/* BNPL Section */}
        <section className="container mx-auto px-4 pb-12 max-w-3xl">
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h2 className="font-display text-xl text-foreground mb-2">Flexible Payment Options</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Development shouldn't be limited by upfront cost. VAULT™ supports Klarna and Affirm
              so families can invest in their athlete today and pay over time.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-secondary rounded-xl p-4">
                <p className="font-medium text-foreground mb-1">Klarna — Pay in 4</p>
                <p className="text-xs text-muted-foreground">Split any order into 4 equal payments, every 2 weeks. 0% interest on qualifying purchases.</p>
              </div>
              <div className="bg-secondary rounded-xl p-4">
                <p className="font-medium text-foreground mb-1">Affirm — Monthly Plans</p>
                <p className="text-xs text-muted-foreground">Choose 3 to 36 monthly payments. Flexible terms based on your credit profile.</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Available at checkout on orders $50+. Subject to approval. Rates and eligibility determined by Klarna/Affirm.
            </p>
          </div>
        </section>

        {/* One-Time Products */}
        <section className="container mx-auto px-4 pb-12 max-w-5xl">
          <button
            onClick={() => setShowOneTime(!showOneTime)}
            className="w-full flex items-center justify-between bg-card border border-border rounded-2xl p-5 hover:bg-secondary/30 transition-colors mb-4"
          >
            <div className="text-left">
              <h2 className="font-display text-foreground">One-Time Programs & Products</h2>
              <p className="text-sm text-muted-foreground">Focused programs you own forever — no subscription required</p>
            </div>
            {showOneTime ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>

          <AnimatePresence>
            {showOneTime && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {([
                    'performance_blueprint', 'velo_check', 'velocity_accelerator',
                    'velocity_12week', 'recruitment_audit', 'showcase_prep',
                    'video_analysis_5pack', 'longevity_system', 'transfer_system',
                    'velocity_max_pack', 'recruiting_edge_pack', 'founders_access',
                  ] as ProductKey[]).map((key) => {
                    const p = PRODUCT_PRICES[key] as any;
                    const bnpl = getBNPLInstallments(p.price);
                    return (
                      <div key={key} className={`bg-card border rounded-xl p-4 flex flex-col ${p.highlight ? "border-amber-500/40" : "border-border"}`}>
                        {p.badge && <Badge className="w-fit mb-2 bg-amber-500/10 text-amber-600 border-0 text-[10px]">{p.badge}</Badge>}
                        <h4 className="font-medium text-foreground text-sm mb-1">{p.name}</h4>
                        <p className="text-xs text-muted-foreground mb-3 flex-1">{p.tagline}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-display text-foreground">{formatPrice(p.price)}</span>
                            {p.savings && <span className="text-xs text-green-600 ml-2">Save {formatPrice(p.savings)}</span>}
                            {bnpl && <p className="text-xs text-muted-foreground">or {bnpl.monthly} × 4</p>}
                          </div>
                          <Button size="sm" variant={p.highlight ? "vault" : "outline"}
                            onClick={() => handleCheckout(key)} disabled={loading === key}>
                            {loading === key ? "…" : "Buy"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Team / Org */}
        <section className="container mx-auto px-4 pb-12 max-w-4xl">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-display text-foreground">Programs, Travel Teams & Academies</h2>
                <p className="text-sm text-muted-foreground">Full VAULT™ OS for your organization</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {(['small_org_license', 'org_quick_start'] as ProductKey[]).map((key) => {
                const p = PRODUCT_PRICES[key] as any;
                return (
                  <div key={key} className="bg-secondary rounded-xl p-4">
                    <Badge variant="outline" className="mb-2 text-xs">{p.badge || 'Organization'}</Badge>
                    <h3 className="font-medium text-foreground mb-1">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{p.tagline}</p>
                    <div className="text-2xl font-display text-foreground mb-1">{formatPrice(p.price)}<span className="text-sm text-muted-foreground">/yr</span></div>
                    <div className="space-y-1 mb-3">
                      {p.features.slice(0, 4).map((f: string, i: number) => (
                        <div key={i} className="flex gap-2 text-xs text-muted-foreground"><Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />{f}</div>
                      ))}
                    </div>
                    <Button variant="vault" size="sm" className="w-full" onClick={() => handleCheckout(key)} disabled={loading === key}>
                      {loading === key ? "…" : "Get License"}
                    </Button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Need 100+ athletes or custom pricing? <Link to="/contact" className="text-primary underline">Contact us</Link> for enterprise rates.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 pb-16 max-w-3xl">
          <h2 className="font-display text-2xl text-foreground text-center mb-6">Common Questions</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <span className="text-sm font-medium text-foreground">{item.q}</span>
                  {expandedFaq === i ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4">
                        <p className="text-sm text-muted-foreground">{item.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Trust + Security */}
        <section className="container mx-auto px-4 pb-16 max-w-3xl">
          <div className="flex items-center justify-center gap-6 flex-wrap text-muted-foreground text-xs">
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> 256-bit SSL encryption</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Stripe-secured payments</span>
            <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Klarna · Affirm · All major cards</span>
            <span className="flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> Cancel anytime</span>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
