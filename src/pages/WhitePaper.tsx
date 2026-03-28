import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, AlertTriangle, Target, Shield, TrendingUp, Download, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const bulletPoints = [
  {
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    text: "Why 70% of 'facility gains' never transfer to the game.",
  },
  {
    icon: Target,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    text: "How top D1 programs are using 'Utility Pillars' to build versatile rosters.",
  },
  {
    icon: Shield,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    text: "The 5-pillar framework for reducing arm injuries by 40%.",
  },
];

const WhitePaper = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    
    try {
      // Store the lead in the database
      const { error } = await supabase
        .from('activity_feed')
        .insert({
          activity_type: 'whitepaper_download',
          title: 'White Paper Download',
          description: `${name} (${email}) downloaded the 2026 State of Player Development report`,
          metadata: { email, name, downloaded_at: new Date().toISOString() }
        });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Check your email for the download link!");
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                  <FileText className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent">Free Research Report</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-display leading-tight mb-4">
                  <span className="text-foreground">THE 2026 STATE OF</span>
                  <span className="block metallic-text">PLAYER DEVELOPMENT:</span>
                  <span className="block text-accent">THE GAP REPORT.</span>
                </h1>

                <p className="text-lg text-muted-foreground mb-8">
                  A comprehensive analysis of why most training programs fail to produce game-ready athletes—and what the top programs are doing differently.
                </p>

                {/* Bullet Points */}
                <div className="space-y-4 mb-8">
                  {bulletPoints.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <p className="text-foreground pt-2">{item.text}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
                  <div className="text-center">
                    <p className="text-2xl font-display text-accent">24</p>
                    <p className="text-xs text-muted-foreground">Pages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-display text-accent">50+</p>
                    <p className="text-xs text-muted-foreground">Data Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-display text-accent">5</p>
                    <p className="text-xs text-muted-foreground">Pillars Covered</p>
                  </div>
                </div>
              </motion.div>

              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
                  {submitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-display text-foreground mb-2">You're In!</h3>
                      <p className="text-muted-foreground mb-6">
                        Check your inbox for the download link. The report is on its way.
                      </p>
                      <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                        <p className="text-sm text-foreground">
                          <strong>Next Step:</strong> While you wait, explore our Founder's Access offer for lifetime platform access.
                        </p>
                        <Button variant="vault" size="sm" className="mt-3" asChild>
                          <a href="/products/founders-access">
                            View Founder's Access <ArrowRight className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                          <Download className="w-8 h-8 text-accent" />
                        </div>
                        <h3 className="text-2xl font-display text-foreground mb-2">Download the Report</h3>
                        <p className="text-sm text-muted-foreground">
                          Enter your details below to get instant access.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Your Name</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="John Smith"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="coach@team.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1"
                            required
                          />
                        </div>

                        <Button 
                          type="submit" 
                          variant="vault" 
                          size="lg" 
                          className="w-full"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Download className="w-5 h-5 mr-2" />
                              Download the White Paper
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                          By downloading, you agree to receive occasional updates about VAULT™. Unsubscribe anytime.
                        </p>
                      </form>
                    </>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>No spam, ever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span>1,200+ downloads</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WhitePaper;
