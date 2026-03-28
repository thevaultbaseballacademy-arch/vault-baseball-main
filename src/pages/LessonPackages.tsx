import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Package, Video, Users, Zap, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLessonCredits } from "@/hooks/useLessonCredits";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LessonPackage {
  id: string;
  name: string;
  description: string;
  lesson_count: number;
  price_cents: number;
  stripe_price_id: string;
  package_type: string;
}

const LessonPackages = () => {
  const [packages, setPackages] = useState<LessonPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { remainingLessons } = useLessonCredits();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const { data, error } = await (supabase.from('lesson_packages' as any) as any)
      .select('*')
      .eq('is_active', true)
      .order('lesson_count');

    if (!error) setPackages(data || []);
    setLoading(false);
  };

  const handlePurchase = async (pkg: LessonPackage) => {
    setPurchasing(pkg.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { priceId: pkg.stripe_price_id },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setPurchasing(null);
    }
  };

  const benefits = [
    "1-on-1 remote video sessions with certified coaches",
    "Personalized velocity & performance feedback",
    "Session recordings & coach notes provided",
    "Use credits for group sessions too",
    "No expiration on unused credits",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">COACHING LESSON PACKS</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Book 1-on-1 remote lessons with VAULT™ certified coaches. Purchase a pack and schedule at your convenience.
            </p>
            {remainingLessons > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-primary font-semibold">You have {remainingLessons} lesson credit{remainingLessons !== 1 ? 's' : ''} remaining</span>
              </div>
            )}
          </motion.div>

          {/* Packages */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {packages.map((pkg, i) => (
              <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`relative overflow-hidden h-full ${pkg.lesson_count === 8 ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                  {pkg.lesson_count === 8 && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                      BEST VALUE
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="w-6 h-6 text-primary" />
                      <CardTitle className="font-display text-2xl">{pkg.name}</CardTitle>
                    </div>
                    <p className="text-muted-foreground">{pkg.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <span className="text-4xl font-display text-foreground">${(pkg.price_cents / 100).toFixed(0)}</span>
                      <span className="text-muted-foreground ml-2">
                        (${(pkg.price_cents / 100 / pkg.lesson_count).toFixed(0)}/lesson)
                      </span>
                    </div>
                    <Button
                      variant="vault"
                      className="w-full"
                      onClick={() => handlePurchase(pkg)}
                      disabled={purchasing === pkg.id}
                    >
                      {purchasing === pkg.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {purchasing === pkg.id ? 'Processing...' : `Get ${pkg.lesson_count} Lessons`}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Benefits */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-8">
            <h2 className="font-display text-2xl text-foreground mb-6 text-center">WHAT'S INCLUDED</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{b}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/remote-lessons')}>
              <Video className="w-4 h-4 mr-2" /> Book a Lesson
            </Button>
            <Button variant="outline" onClick={() => navigate('/group-sessions')}>
              <Users className="w-4 h-4 mr-2" /> Browse Group Sessions
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LessonPackages;
