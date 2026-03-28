import { motion } from "framer-motion";
import { Users, Check, ArrowRight, Loader2, Building, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const TeamLicenses = () => {
  const { checkout, loading } = useProductCheckout();
  const smallOrgProduct = PRODUCT_PRICES.small_org_license;
  const quickStartProduct = PRODUCT_PRICES.org_quick_start;

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
              className="text-center mb-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <Building className="w-10 h-10 text-accent" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                TEAM & ORGANIZATION LICENSES
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Bring the VAULT™ system to your entire organization. 
                Standardized training, centralized management, measurable results.
              </p>
            </motion.div>

            {/* License Options */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Small Org License */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-accent" />
                  <h3 className="text-2xl font-display text-foreground">Small Organization</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Perfect for travel teams, small academies, and training facilities.
                </p>
                
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-display text-foreground">{formatPrice(smallOrgProduct.price)}</span>
                  <span className="text-muted-foreground">/year</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    "Up to 25 athlete accounts",
                    "Unlimited coaching staff access",
                    "All 5 VAULT™ training systems",
                    "Team progress dashboard",
                    "Bulk athlete management",
                    "Priority support",
                    "VAULT™ licensing rights",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant="vault"
                  size="lg"
                  className="w-full"
                  onClick={() => checkout('small_org_license')}
                  disabled={loading === 'small_org_license'}
                >
                  {loading === 'small_org_license' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Buy Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              {/* Org Quick-Start */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-card to-secondary border-2 border-foreground rounded-2xl p-8 relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-foreground text-background text-sm font-semibold">
                    Most Popular
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Building className="w-6 h-6 text-foreground" />
                  <h3 className="text-2xl font-display text-foreground">Org Quick-Start</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  For established academies and organizations ready to scale.
                </p>
                
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-display text-foreground">{formatPrice(quickStartProduct.price)}</span>
                  <span className="text-muted-foreground">/year</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    "Up to 75 athlete accounts",
                    "Unlimited coaching staff access",
                    "All 5 VAULT™ training systems",
                    "Advanced analytics dashboard",
                    "White-label options available",
                    "Dedicated account manager",
                    "Full VAULT™ licensing rights",
                    "Onboarding & staff training",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant="vault"
                  size="lg"
                  className="w-full"
                  onClick={() => checkout('org_quick_start')}
                  disabled={loading === 'org_quick_start'}
                >
                  {loading === 'org_quick_start' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </div>

            {/* Enterprise */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-secondary/50 rounded-2xl p-8 text-center"
            >
              <h3 className="text-xl font-display text-foreground mb-2">
                Need a Custom Enterprise Solution?
              </h3>
              <p className="text-muted-foreground mb-4">
                For large organizations, college programs, and custom requirements, 
                contact us for a tailored solution.
              </p>
              <Button variant="outline" asChild>
                <a href="mailto:sales@vaultbaseball.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Sales
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default TeamLicenses;
