import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface VerifyPurchaseResponse {
  verified: boolean;
  products?: string[];
  productKey?: string;
  coursesUnlocked?: string[];
  isFoundersAccess?: boolean;
  alreadyProcessed?: boolean;
  message?: string;
  warnings?: string[];
  error?: string;
  code?: string;
}

// Map product keys to human-readable info
const PRODUCT_INFO: Record<string, { name: string; tagline: string }> = {
  velo_check: { name: "VELO-CHECK ASSESSMENT", tagline: "Your personalized mechanical report will be delivered within 48 hours." },
  velocity_12week: { name: "VAULT VELOCITY SYSTEM", tagline: "12 weeks of structured velocity development — starting now." },
  remote_training: { name: "REMOTE TRAINING", tagline: "Your coach will reach out within 24 hours to build your first week." },
  founders_access: { name: "FOUNDER'S ACCESS", tagline: "Lifetime access to the complete V.A.U.L.T. suite. Welcome to the inner circle." },
};

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [productKey, setProductKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const fireConfetti = useCallback(() => {
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.15, y: 0.6 }, colors: ["#181818", "#B9B9B9", "#F5F5F5", "#4A4A4A"] });
    confetti({ particleCount: 80, spread: 70, origin: { x: 0.85, y: 0.6 }, colors: ["#181818", "#B9B9B9", "#F5F5F5", "#4A4A4A"] });
    setTimeout(() => {
      confetti({ particleCount: 120, spread: 100, origin: { x: 0.5, y: 0.5 }, colors: ["#181818", "#B9B9B9", "#D4D4D4", "#F5F5F5"] });
    }, 250);
  }, []);

  useEffect(() => {
    const verifyPurchase = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setVerifying(false);
        setVerified(true);
        fireConfetti();
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setVerifying(false);
          setVerified(true);
          setErrorMessage("Sign in to access your purchased content.");
          return;
        }

        const { data, error } = await supabase.functions.invoke<VerifyPurchaseResponse>("verify-purchase", {
          body: { sessionId },
        });

        if (error) {
          console.error("Verification error:", error);
          setVerified(true);
          setErrorMessage("Payment successful. If content doesn't appear, contact support.");
          fireConfetti();
          return;
        }

        if (data?.error) {
          setVerified(false);
          setErrorMessage(data.error);
          return;
        }

        setVerified(data?.verified ?? false);
        setProductKey(data?.productKey || null);

        if (data?.verified) {
          fireConfetti();
          if (!data.alreadyProcessed) {
            toast({ title: "Access Granted", description: "Your content is ready." });
          }
        }
      } catch {
        setVerified(true);
        fireConfetti();
      } finally {
        setVerifying(false);
      }
    };

    verifyPurchase();
  }, [searchParams, toast, fireConfetti]);

  const info = productKey ? PRODUCT_INFO[productKey] : null;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto text-center"
          >
            {verifying ? (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-foreground animate-spin" />
                </div>
                <h1 className="text-3xl font-display text-foreground">VERIFYING PURCHASE...</h1>
                <p className="text-sm text-muted-foreground">Unlocking your content. This takes a moment.</p>
              </div>
            ) : verified ? (
              <div className="space-y-8">
                {/* Check icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  className="w-16 h-16 bg-foreground flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="w-8 h-8 text-background" />
                </motion.div>

                {/* Headline */}
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-4xl md:text-5xl font-display text-foreground mb-2"
                  >
                    YOU'RE IN.
                  </motion.h1>
                  {info && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="text-xs font-display tracking-[0.25em] text-muted-foreground"
                    >
                      {info.name}
                    </motion.p>
                  )}
                </div>

                {/* Tagline */}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto"
                >
                  {info?.tagline || "Thank you for your purchase. Your Vault content is ready."}
                </motion.p>

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="bg-muted border border-border p-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">{errorMessage}</p>
                    </div>
                  </motion.div>
                )}

                {/* Next steps */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card border border-border p-6 text-left space-y-4"
                >
                  <p className="text-[11px] font-display tracking-[0.25em] text-muted-foreground">NEXT STEPS</p>
                  <div className="space-y-3">
                    {[
                      { num: "01", text: "Complete your athlete onboarding so we can personalize your experience." },
                      { num: "02", text: "Check your email for access details and login instructions." },
                      { num: "03", text: "Start your first training session from your dashboard." },
                    ].map((step) => (
                      <div key={step.num} className="flex gap-3">
                        <span className="text-lg font-display text-border">{step.num}</span>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col gap-3"
                >
                  <Link to={`/athlete-onboarding${productKey ? `?product=${productKey}` : ""}`}>
                    <Button variant="vault" size="lg" className="w-full">
                      COMPLETE ONBOARDING
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="vaultOutline" size="lg" className="w-full">
                      GO TO DASHBOARD
                    </Button>
                  </Link>
                </motion.div>
              </div>
            ) : (
              /* Verification failed */
              <div className="space-y-6">
                <div className="w-16 h-16 bg-destructive/10 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-4xl font-display text-foreground">VERIFICATION ISSUE</h1>
                <p className="text-sm text-muted-foreground">
                  {errorMessage || "We couldn't verify your purchase. Please contact support."}
                </p>
                <div className="flex flex-col gap-3">
                  <Link to="/contact">
                    <Button variant="vault" size="lg" className="w-full">CONTACT SUPPORT</Button>
                  </Link>
                  <Link to="/">
                    <Button variant="vaultOutline" size="lg" className="w-full">RETURN HOME</Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default PaymentSuccess;
