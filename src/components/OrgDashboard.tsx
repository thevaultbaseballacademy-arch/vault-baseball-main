import { motion } from "framer-motion";
import { Gauge, Activity, Heart, TrendingUp, Users, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const metricCategories = [
  {
    title: "Velocity",
    icon: Gauge,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    metrics: ["Exit Velo", "Throwing Velo", "Bat Speed"],
  },
  {
    title: "Athleticism",
    icon: Activity,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    metrics: ["10/60yd Dash", "Vertical/Broad Jump", "RSI"],
  },
  {
    title: "Health",
    icon: Heart,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    metrics: ["Workload Management", "Arm Care Compliance", "Recovery Scores"],
  },
];

const OrgDashboard = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">For Directors & Org Leaders</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-display leading-tight mb-4">
              <span className="text-foreground">COMPLETE</span>
              <span className="block metallic-text">ORGANIZATIONAL OVERSIGHT.</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-8">
              Stop guessing. Start tracking. The Vault OS gives you a bird's-eye view of every athlete in your pipeline.
            </p>

            {/* Metric Categories */}
            <div className="space-y-4 mb-8">
              {metricCategories.map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <category.icon className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-display text-lg ${category.color}`}>{category.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.metrics.join(" • ")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Value Prop */}
            <div className="p-5 rounded-xl bg-accent/5 border border-accent/20 mb-8">
              <p className="text-foreground font-medium">
                Standardized programming across your entire staff. One dashboard. Zero performance gaps.
              </p>
            </div>

            <Link to="/products/org-starter-pack">
              <Button variant="vault" size="lg" className="group">
                Learn About Org Licenses
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-card rounded-2xl border border-border p-6 shadow-2xl">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-xl text-foreground">Organization Overview</h3>
                  <p className="text-sm text-muted-foreground">Real-time athlete metrics</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-500">Live</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Athletes</p>
                  <p className="text-2xl font-display text-foreground">48</p>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +12%
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Avg Exit Velo</p>
                  <p className="text-2xl font-display text-foreground">87.4</p>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +3.2 mph
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Compliance</p>
                  <p className="text-2xl font-display text-foreground">94%</p>
                  <p className="text-xs text-muted-foreground">Arm Care</p>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="relative h-40 bg-secondary/30 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-16 h-16 text-muted-foreground/20" />
                <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
                  {[65, 78, 82, 75, 88, 92, 85].map((height, i) => (
                    <div
                      key={i}
                      className="w-6 bg-gradient-to-t from-accent to-accent/50 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <div className="flex-1 p-3 rounded-lg bg-secondary/50 text-center">
                  <p className="text-xs text-muted-foreground">Weekly Reports</p>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-secondary/50 text-center">
                  <p className="text-xs text-muted-foreground">Team Comparison</p>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-secondary/50 text-center">
                  <p className="text-xs text-muted-foreground">Export Data</p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OrgDashboard;
