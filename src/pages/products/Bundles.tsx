import { motion } from "framer-motion";
import { Package, Check, ArrowRight, Loader2, Zap, GraduationCap, Award, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const Bundles = () => {
  const { checkout, loading } = useProductCheckout();

  const bundles = [
    {
      key: 'velocity_max_pack' as const,
      name: 'Velocity Max Pack',
      icon: Zap,
      color: 'red',
      price: PRODUCT_PRICES.velocity_max_pack.price,
      originalValue: 77700, // $399 + $79 + $299
      tagline: 'The Complete Velocity Package',
      description: 'Everything you need for maximum velocity gains',
      includes: [
        { name: '12-Week Vault Velocity System', value: '$399' },
        { name: 'Velo-Check™ Analysis', value: '$79' },
        { name: 'Velocity Accelerator Lite (no coach video)', value: '$299 value' },
      ],
      whyItWorks: "Feels like a no-brainer upgrade.",
    },
    {
      key: 'recruiting_edge_pack' as const,
      name: 'Recruiting Edge Pack',
      icon: GraduationCap,
      color: 'green',
      price: PRODUCT_PRICES.recruiting_edge_pack.price,
      originalValue: 64700, // $199 + ~$299 + $149
      tagline: 'Get Recruited Faster',
      description: 'Complete recruiting preparation package',
      includes: [
        { name: 'Recruitment Audit', value: '$199' },
        { name: '12-Week Strength & Conditioning Program', value: '$299 value' },
        { name: '30-day Vault Performance Membership', value: '$59 value' },
      ],
      whyItWorks: "Parents want clarity + action in one package.",
    },
    {
      key: 'coach_authority_pack' as const,
      name: 'Coach Authority Pack',
      icon: Award,
      color: 'foreground',
      price: PRODUCT_PRICES.coach_authority_pack.price,
      originalValue: 91400, // $500 + $399 + varies
      tagline: 'Build Your Coaching Brand',
      description: 'Everything to launch as a certified VAULT™ coach',
      includes: [
        { name: 'VAULT™ Certified Coach (1 year)', value: '$500' },
        { name: 'Velocity System License', value: '$399 value' },
        { name: 'Metrics Playbook', value: 'Exclusive' },
      ],
      whyItWorks: "Pure margin. Pure IP leverage.",
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', btn: 'bg-red-600 hover:bg-red-700' };
      case 'green':
        return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20', btn: 'bg-green-600 hover:bg-green-700' };
      default:
        return { bg: 'bg-secondary', text: 'text-foreground', border: 'border-border', btn: 'bg-foreground hover:bg-foreground/90' };
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
                <Package className="w-4 h-4" />
                High-Value Bundles
              </span>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                BUNDLE & SAVE
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get more for less with our curated training bundles. 
                Each pack is designed for specific athlete goals.
              </p>
            </motion.div>

            {/* Bundles Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {bundles.map((bundle, i) => {
                const Icon = bundle.icon;
                const colors = getColorClasses(bundle.color);
                const savings = bundle.originalValue - bundle.price;
                
                return (
                  <motion.div
                    key={bundle.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-card border ${colors.border} rounded-2xl p-8 flex flex-col`}
                  >
                    {/* Icon & Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center`}>
                        <Icon className={`w-7 h-7 ${colors.text}`} />
                      </div>
                      <span className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-xs font-medium`}>
                        Save {formatPrice(savings)}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-display text-foreground mb-2">
                      {bundle.name}
                    </h2>
                    <p className={`text-sm ${colors.text} font-medium mb-2`}>
                      {bundle.tagline}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      {bundle.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-display text-foreground">
                          {formatPrice(bundle.price)}
                        </span>
                        <span className="text-muted-foreground line-through text-sm">
                          {formatPrice(bundle.originalValue)}
                        </span>
                      </div>
                    </div>

                    {/* Includes */}
                    <div className="flex-1 mb-6">
                      <p className="text-sm font-medium text-foreground mb-3">Includes:</p>
                      <ul className="space-y-3">
                        {bundle.includes.map((item, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <Check className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-0.5`} />
                            <span className="text-sm text-muted-foreground">
                              {item.name}
                              <span className="text-xs text-muted-foreground/60 ml-1">({item.value})</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <Button
                      variant="vault"
                      size="lg"
                      onClick={() => checkout(bundle.key)}
                      disabled={loading === bundle.key}
                      className={`w-full ${colors.btn} text-white`}
                    >
                      {loading === bundle.key ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : null}
                      Get {bundle.name}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {/* Why Bundles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16 text-center"
            >
              <p className="text-muted-foreground">
                Not sure which bundle is right for you?{' '}
                <a href="/#pricing" className="text-primary hover:underline">
                  Compare memberships
                </a>
                {' '}or{' '}
                <a href="/products/velo-check" className="text-primary hover:underline">
                  start with a Velo-Check
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Bundles;
