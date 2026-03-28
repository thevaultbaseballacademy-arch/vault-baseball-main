import { motion } from "framer-motion";
import {
  ArrowRight, Building2, Users, Award, CheckCircle, Shield, BookOpen,
  BarChart3, Video, GraduationCap, Lock, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CertificationDisclaimer from "@/components/legal/CertificationDisclaimer";
import { useProductCheckout } from "@/hooks/useProductCheckout";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const OrgLicensing = () => {
  const { checkout, loading } = useProductCheckout();

  const packages = [
    {
      id: "course_only",
      name: "Course Access Package",
      price: "$2,500",
      priceNote: "per organization / year",
      highlight: false,
      features: [
        "Full Baseball + Softball Course Access",
        "All Training Modules (Hitting, Pitching, Fielding, etc.)",
        "Drill Library with Video Demos",
        "KPI Tracking Dashboard",
        "Recruiting Data Dashboard",
        "Up to 25 User Seats",
        "Priority Email Support",
      ],
      excluded: [
        "Certification Exams",
        "Coach Badge System",
        "Advanced Coaching Dashboards",
      ],
      cta: "Get Course Access",
      icon: BookOpen,
    },
    {
      id: "full_cert",
      name: "Full Course + Certification Package",
      price: "$3,500",
      priceNote: "per organization / year",
      highlight: true,
      features: [
        "Everything in Course Access Package",
        "Full Certification System (All Specializations)",
        "1 Coach Full Certification Included",
        "Badge System (Foundations → PRO)",
        "Video-Based Exam Engine",
        "KPI-Based Assessment Engine",
        "Advanced Coaching Dashboards",
        "Certification Compliance Tracking",
        "Recruiting Profile with Verified Badges",
        "Organization Admin Dashboard",
        "Dedicated Onboarding Support",
      ],
      excluded: [],
      cta: "Get Full Access",
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 text-center mb-16">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded text-xs font-bold tracking-widest uppercase mb-6">
              <Building2 className="w-4 h-4" />
              Organization Licensing
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-foreground mb-4">
              VAULT™ OS for Organizations
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Deploy the complete VAULT™ development system across your entire organization.
              Baseball + Softball. Standardized coaching. Verified results.
            </p>
          </motion.div>
        </section>

        {/* Packages */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className={`relative p-8 h-full flex flex-col ${
                  pkg.highlight
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                }`}>
                  {pkg.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded uppercase tracking-wider">
                      Recommended
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded ${
                      pkg.highlight ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <pkg.icon className={`w-6 h-6 ${
                        pkg.highlight ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-foreground">
                        {pkg.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-display font-black text-foreground">
                      {pkg.price}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {pkg.priceNote}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3 mb-8">
                    {pkg.features.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground">{f}</span>
                      </div>
                    ))}
                    {pkg.excluded.map((f) => (
                      <div key={f} className="flex items-start gap-2 opacity-40">
                        <Lock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground line-through">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => checkout("org_starter_pack")}
                    disabled={!!loading}
                    className="w-full"
                    variant={pkg.highlight ? "default" : "outline"}
                    size="lg"
                  >
                    {pkg.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Access control rules */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <motion.div {...fadeUp}>
              <h2 className="text-2xl font-display font-bold text-foreground mb-6 text-center">
                Certification Access Control
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Shield, text: "Certification required to unlock coaching tools" },
                  { icon: Lock, text: "Non-certified users cannot teach full VAULT™ system" },
                  { icon: GraduationCap, text: "Specialist modules locked until specialist cert passed" },
                  { icon: Zap, text: "PRO badge requires all certs + video exam + KPI thresholds" },
                ].map((rule) => (
                  <div key={rule.text} className="flex items-start gap-3 bg-card border border-border rounded p-4">
                    <rule.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground">{rule.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Legal disclaimer */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <CertificationDisclaimer />
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 text-center">
          <motion.div {...fadeUp}>
            <Card className="p-10 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                Ready to deploy VAULT™ OS?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Contact us for custom enterprise pricing, multi-organization deployments,
                and white-label solutions.
              </p>
              <Button size="lg" onClick={() => window.location.href = "/contact"}>
                Contact Sales
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OrgLicensing;
