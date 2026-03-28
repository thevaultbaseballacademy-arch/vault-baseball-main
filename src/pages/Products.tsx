import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Zap, Video, Target, GraduationCap, Award, Package, 
  ArrowRight, Users, TrendingUp, Flame, Shield,
  Star, Sparkles, HelpCircle, SearchX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductFilters, { Category, PriceRange } from "@/components/products/ProductFilters";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

interface Product {
  key: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  features?: string[];
  href: string;
  price: number;
  badge?: string;
  badgeColor?: string;
  category: Category;
  savings?: number;
}

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");

  const allProducts: Product[] = useMemo(() => [
    // Flagship Products
    {
      key: "velocity_12week",
      icon: Zap,
      title: "12-Week Velocity System",
      subtitle: "Flagship Program",
      description: "Phase-based velocity system for serious baseball players who want real, measurable power gains.",
      features: ["12 weeks structured programming", "Lower body → rotational → transfer phases", "Built-in testing checkpoints"],
      href: "/products/velocity-system",
      price: PRODUCT_PRICES.velocity_12week.price,
      badge: "Most Popular",
      badgeColor: "bg-red-500",
      category: "flagship" as Category,
    },
    {
      key: "velocity_accelerator",
      icon: Flame,
      title: "Velocity Accelerator",
      subtitle: "6-Week Sprint",
      description: "High-intensity velocity sprint for athletes who want results fast.",
      features: ["6-week focused program", "Intent & overload emphasis", "1 coach feedback video"],
      href: "/products/velocity-accelerator",
      price: PRODUCT_PRICES.velocity_accelerator.price,
      badge: "Intensive",
      badgeColor: "bg-orange-500",
      category: "flagship" as Category,
    },
    // Entry Products
    {
      key: "velo_check",
      icon: Video,
      title: "Velo-Check™ Analysis",
      subtitle: "Video Review",
      description: "Get 3 exact fixes that unlock more velocity. Upload a video, receive expert analysis within 48 hours.",
      features: ["Video breakdown", "3 mechanical fixes", "Drill recommendations"],
      href: "/products/velo-check",
      price: PRODUCT_PRICES.velo_check.price,
      badge: "Quick Start",
      badgeColor: "bg-blue-500",
      category: "entry" as Category,
    },
    {
      key: "recruitment_audit",
      icon: GraduationCap,
      title: "Recruitment Audit",
      subtitle: "Advisory Service",
      description: "Know exactly where you stand and what it takes to get recruited to your target programs.",
      features: ["Metrics review", "Division-fit analysis", "6-12 month plan"],
      href: "/products/recruitment",
      price: PRODUCT_PRICES.recruitment_audit.price,
      badge: "Parents Love",
      badgeColor: "bg-green-500",
      category: "entry" as Category,
    },
    // Core Systems
    {
      key: "longevity_system",
      icon: Shield,
      title: "Longevity System",
      subtitle: "Full Release",
      description: "Arm health monitoring, workload management, and recovery protocols to maximize availability.",
      href: "/products/longevity",
      price: PRODUCT_PRICES.longevity_system.price,
      category: "flagship" as Category,
    },
    {
      key: "transfer_system",
      icon: Target,
      title: "Transfer System",
      subtitle: "Full Release",
      description: "Bridge practice performance to game-day execution with competition-focused training.",
      href: "/products/transfer",
      price: PRODUCT_PRICES.transfer_system.price,
      category: "flagship" as Category,
    },
    // Featured Products
    {
      key: "transfer_intensive",
      icon: Users,
      title: "Transfer Intensive",
      subtitle: "4-Week Live Coaching",
      description: "Live virtual coaching block with weekly group sessions and personalized feedback.",
      href: "/products/transfer-intensive",
      price: PRODUCT_PRICES.transfer_intensive.price,
      badge: "Live",
      badgeColor: "bg-blue-500",
      category: "featured" as Category,
    },
    {
      key: "vault_verified_coach",
      icon: Award,
      title: "VAULT Verified Coach",
      subtitle: "Annual Certification",
      description: "Official certification with badge, directory listing, and marketing materials.",
      href: "/products/vault-verified",
      price: PRODUCT_PRICES.vault_verified_coach.price,
      badge: "B2B",
      badgeColor: "bg-emerald-500",
      category: "coaching" as Category,
    },
    {
      key: "showcase_prep",
      icon: TrendingUp,
      title: "Showcase Prep Bundle",
      subtitle: "30-Day Program",
      description: "High-intensity preparation for tryouts, showcases, and draft workouts.",
      href: "/products/showcase-prep",
      price: PRODUCT_PRICES.showcase_prep.price,
      badge: "Spring Ready",
      badgeColor: "bg-orange-500",
      category: "featured" as Category,
    },
    {
      key: "video_analysis_5pack",
      icon: Video,
      title: "Video Analysis 5-Pack",
      subtitle: "A-la-carte",
      description: "5 professional video reviews with detailed feedback. Perfect add-on for members.",
      href: "/products/video-analysis",
      price: PRODUCT_PRICES.video_analysis_5pack.price,
      badge: "Add-On",
      badgeColor: "bg-cyan-500",
      category: "featured" as Category,
    },
    // Bundles
    {
      key: "velocity_max_pack",
      icon: Package,
      title: "Velocity Max Pack",
      subtitle: "Bundle",
      description: "12-Week System + Velo-Check + Accelerator Lite",
      price: PRODUCT_PRICES.velocity_max_pack.price,
      savings: PRODUCT_PRICES.velocity_max_pack.savings,
      href: "/products/bundles",
      category: "bundles" as Category,
    },
    {
      key: "recruiting_edge_pack",
      icon: Package,
      title: "Recruiting Edge Pack",
      subtitle: "Bundle",
      description: "Recruitment Audit + 12-Week S&C + 30-day membership",
      price: PRODUCT_PRICES.recruiting_edge_pack.price,
      savings: PRODUCT_PRICES.recruiting_edge_pack.savings,
      href: "/products/bundles",
      category: "bundles" as Category,
    },
    {
      key: "coach_authority_pack",
      icon: Package,
      title: "Coach Authority Pack",
      subtitle: "Bundle",
      description: "Certification + Velocity System License + Metrics Playbook",
      price: PRODUCT_PRICES.coach_authority_pack.price,
      savings: PRODUCT_PRICES.coach_authority_pack.savings,
      href: "/products/bundles",
      category: "bundles" as Category,
    },
    // Coaching products
    {
      key: "certified_coach",
      icon: Award,
      title: "Certified Coach Program",
      subtitle: "Annual Certification",
      description: "Get certified, access our drill library, and grow your coaching business with VAULT™ credentialing.",
      href: "/products/certified-coach",
      price: PRODUCT_PRICES.certified_coach.price,
      category: "coaching" as Category,
    },
  ], []);

  const filterByPrice = (price: number, range: PriceRange): boolean => {
    const priceInDollars = price / 100;
    switch (range) {
      case "under100":
        return priceInDollars < 100;
      case "100to300":
        return priceInDollars >= 100 && priceInDollars <= 300;
      case "300to500":
        return priceInDollars > 300 && priceInDollars <= 500;
      case "over500":
        return priceInDollars > 500;
      default:
        return true;
    }
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = category === "all" || product.category === category;

      // Price filter
      const matchesPrice = filterByPrice(product.price, priceRange);

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [allProducts, searchQuery, category, priceRange]);

  // Group filtered products by category for display
  const flagshipProducts = filteredProducts.filter(p => p.category === "flagship");
  const entryProducts = filteredProducts.filter(p => p.category === "entry");
  const featuredProducts = filteredProducts.filter(p => p.category === "featured");
  const bundles = filteredProducts.filter(p => p.category === "bundles");
  const coachingProducts = filteredProducts.filter(p => p.category === "coaching");

  const hasNoResults = filteredProducts.length === 0;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Complete Product Catalog
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display text-foreground mb-6">
              VAULT™ Products & Programs
            </h1>
            <p className="text-xl text-muted-foreground">
              From quick video analysis to comprehensive velocity systems — find the right tool for your development stage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        category={category}
        onCategoryChange={setCategory}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        resultCount={filteredProducts.length}
      />

      {/* No Results State */}
      {hasNoResults && (
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 mx-auto flex items-center justify-center mb-6">
              <SearchX className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-display text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters to find what you're looking for.</p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setCategory("all"); setPriceRange("all"); }}>
              Clear Filters
            </Button>
          </div>
        </section>
      )}

      {/* Flagship Products */}
      {flagshipProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-3xl font-display text-foreground">Flagship Programs</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Our core velocity development systems — structured, proven, and designed for serious athletes.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {flagshipProducts.map((product, index) => (
                <motion.div
                  key={product.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={product.href}>
                    <div className="group relative h-full p-8 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                      {product.badge && (
                        <Badge className={`absolute top-4 right-4 ${product.badgeColor} text-white border-0`}>
                          {product.badge}
                        </Badge>
                      )}
                      <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center mb-6">
                        <product.icon className="w-7 h-7 text-red-500" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{product.subtitle}</p>
                      <h3 className="text-2xl font-display text-foreground mb-3">{product.title}</h3>
                      <p className="text-muted-foreground mb-6">{product.description}</p>
                      {product.features && (
                        <ul className="space-y-2 mb-8">
                          {product.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
                        <span className="text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Learn More <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Entry Products */}
      {entryProducts.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-3xl font-display text-foreground">Entry Points</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Low-friction ways to experience Vault quality before committing to a full program.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {entryProducts.map((product, index) => (
                <motion.div
                  key={product.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={product.href}>
                    <div className="group relative h-full p-8 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                      {product.badge && (
                        <Badge className={`absolute top-4 right-4 ${product.badgeColor} text-white border-0`}>
                          {product.badge}
                        </Badge>
                      )}
                      <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                        <product.icon className="w-7 h-7 text-blue-500" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{product.subtitle}</p>
                      <h3 className="text-2xl font-display text-foreground mb-3">{product.title}</h3>
                      <p className="text-muted-foreground mb-6">{product.description}</p>
                      {product.features && (
                        <ul className="space-y-2 mb-8">
                          {product.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
                        <span className="text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Learn More <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-cyan-500" />
                </div>
                <h2 className="text-3xl font-display text-foreground">Featured Products</h2>
                <Badge className="bg-red-500 text-white border-0">New</Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Fresh offerings designed for maximum impact — live coaching, certifications, and targeted programs.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={product.href}>
                    <div className="group relative h-full p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                      {product.badge && (
                        <Badge className={`absolute top-3 right-3 ${product.badgeColor} text-white border-0 text-xs`}>
                          {product.badge}
                        </Badge>
                      )}
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                        <product.icon className="w-6 h-6 text-cyan-500" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{product.subtitle}</p>
                      <h3 className="text-lg font-display text-foreground mb-2">{product.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-foreground">{formatPrice(product.price)}</span>
                        <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* Bundles */}
      {bundles.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-3xl font-display text-foreground">Value Bundles</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Combine products for maximum impact and savings.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {bundles.map((bundle, index) => (
                <motion.div
                  key={bundle.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={bundle.href}>
                    <div className="group h-full p-6 rounded-2xl border border-border bg-card hover:border-green-500/50 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-display text-foreground">{bundle.title}</h3>
                        {bundle.savings && (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                            Save {formatPrice(bundle.savings)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-6">{bundle.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-foreground">{formatPrice(bundle.price)}</span>
                        <span className="text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1 text-sm">
                          View Bundle <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coaching Products */}
      {coachingProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-display text-foreground">For Coaches</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Grow your coaching business with VAULT™ certification and credentialing.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {coachingProducts.map((product, index) => (
                <motion.div
                  key={product.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={product.href}>
                    <div className="group flex items-center gap-6 p-6 rounded-2xl border border-border bg-card hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300">
                      <div className="w-14 h-14 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <product.icon className="w-7 h-7 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-display text-foreground">{product.title}</h3>
                          {product.badge && (
                            <Badge className={`${product.badgeColor} text-white border-0 text-xs`}>
                              {product.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xl font-bold text-foreground">{formatPrice(product.price)}</span>
                        <p className="text-xs text-muted-foreground">per year</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coach Certification CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12"
          >
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-0">For Coaches</Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-display text-white mb-4">
                Become a VAULT™ Certified Coach
              </h2>
              <p className="text-white/80 mb-8 text-lg">
                Get certified, access our drill library, and grow your coaching business with VAULT™ credentialing.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products/certified-coach">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <span className="flex items-center text-white font-semibold">
                  {formatPrice(PRODUCT_PRICES.certified_coach.price)}/year
                </span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
              <Award className="w-full h-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Licenses CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="w-14 h-14 rounded-xl bg-accent/10 mx-auto flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-accent" />
            </div>
            <h2 className="text-3xl font-display text-foreground mb-4">
              Team & Organization Licenses
            </h2>
            <p className="text-muted-foreground mb-8">
              Equip your entire organization with VAULT™ methodology. Custom onboarding, admin dashboards, and volume pricing available.
            </p>
            <Link to="/products/team-licenses">
              <Button size="lg" variant="outline">
                View Team Options
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 mx-auto flex items-center justify-center mb-6">
              <HelpCircle className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-3xl font-display text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about purchasing and accessing VAULT™ products.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="access" className="border border-border rounded-xl px-6 bg-card">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  How do I access my purchased products?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  After purchase, you'll receive an email with login instructions. All your products are accessible through your VAULT™ Dashboard. Simply log in with your account credentials and navigate to "My Programs" to access all purchased content, including videos, workouts, and resources.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment" className="border border-border rounded-xl px-6 bg-card">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  What payment methods do you accept?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment system. All transactions are encrypted and your payment information is never stored on our servers.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="lifetime" className="border border-border rounded-xl px-6 bg-card">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  What does "Lifetime Access" mean?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Lifetime Access products grant you permanent access to the program. As we develop and enhance the program, you'll receive all updates and new content at no additional cost.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="refund" className="border border-border rounded-xl px-6 bg-card">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  What is your refund policy?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We offer a 7-day satisfaction guarantee on all digital products. If you're not satisfied with your purchase, contact our support team within 7 days of purchase for a full refund. One-on-one services like video analysis are non-refundable once delivered. See our full Refund Policy for details.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="difference" className="border border-border rounded-xl px-6 bg-card">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  What's the difference between one-time purchases and memberships?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  One-time purchases (like the 12-Week Velocity System) give you permanent access to that specific program. Memberships provide ongoing access to premium content, community features, and coach support for a monthly or annual fee. You can combine both — use one-time programs for structured training and memberships for ongoing development.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="bundle" className="border border-border rounded-xl px-6 bg-card">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  Can I upgrade from a single product to a bundle?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! Contact our support team and we'll apply your previous purchase as credit toward the bundle price. We want to make sure you get the best value, so we'll always honor what you've already invested with us.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="multiple" className="border border-border rounded-xl px-6 bg-card">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  Can I purchase products for multiple athletes (team or family)?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely! For teams or organizations, check out our Team & Organization Licenses which include volume pricing, admin dashboards, and custom onboarding. For families with multiple athletes, contact us for family pricing options.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="support" className="border border-border rounded-xl px-6 bg-card">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  How do I get help if I have issues with my purchase?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our support team is here to help! Use the chat widget in the bottom-right corner of any page, email us at support@vaultbaseball.com, or visit our Contact page. We typically respond within 24 hours on business days.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Products;
