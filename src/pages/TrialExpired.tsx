import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, AlertTriangle, Lock, Database, TrendingUp, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import TrialFeedbackForm from "@/components/trial/TrialFeedbackForm";

const TrialExpired = () => {
  const navigate = useNavigate();
  const { checkout, loading } = useProductCheckout();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleUpgrade = () => {
    checkout('founders_access', `${window.location.origin}/payment-success`, `${window.location.origin}/trial-expired`);
  };

  const dataPoints = [
    { icon: Database, label: "Your velocity baseline data" },
    { icon: TrendingUp, label: "Progress tracking history" },
    { icon: Zap, label: "Personalized insights" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <a href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center relative overflow-hidden">
              <Shield className="w-6 h-6 text-primary-foreground" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-3xl leading-none text-foreground tracking-wider">
                VAULT
              </span>
              <span className="text-xs font-medium text-muted-foreground tracking-[0.2em] uppercase">
                Baseball
              </span>
            </div>
          </a>
        </div>

        {/* Main Card */}
        <Card className="border-destructive/30 bg-gradient-to-br from-destructive/5 via-card to-card overflow-hidden">
          <CardContent className="p-8 md:p-12">
            {/* Warning Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <Lock className="w-10 h-10 text-destructive" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                YOUR PROOF WEEK HAS ENDED
              </h1>
              <p className="text-lg text-muted-foreground">
                Don't lose your baseline data. Upgrade now to keep your progress.
              </p>
            </motion.div>

            {/* Feedback Form (shown first) or Upgrade CTA */}
            {!showUpgrade ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <TrialFeedbackForm onComplete={() => setShowUpgrade(true)} />
              </motion.div>
            ) : (
              <>
                {/* Data at Risk */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-4 bg-destructive/5 rounded-xl border border-destructive/20"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <span className="font-semibold text-foreground">Data at Risk</span>
                  </div>
                  <div className="space-y-3">
                    {dataPoints.map((point, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <point.icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground">{point.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Button
                    onClick={handleUpgrade}
                    variant="vault"
                    size="lg"
                    className="w-full h-14 text-lg"
                    disabled={loading === 'founders_access'}
                  >
                    {loading === 'founders_access' ? (
                      "Processing..."
                    ) : (
                      <>
                        Upgrade to Full VAULT™ OS — $499
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-primary font-semibold mb-1">
                      🚀 Founder's Price — Limited Time Only
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Lifetime access • All future updates included • No recurring fees
                    </p>
                  </div>
                </motion.div>
              </>
            )}

            {/* Secondary Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={() => navigate("/auth")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in with different account
              </button>
              <span className="hidden sm:inline text-border">|</span>
              <button
                onClick={() => navigate("/")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Return to homepage
              </button>
            </motion.div>
          </CardContent>
        </Card>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground italic">
            "I saw a 4 mph gain in my first month. The baseline tracking was the game-changer."
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            — Jake M., College Pitcher
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TrialExpired;
