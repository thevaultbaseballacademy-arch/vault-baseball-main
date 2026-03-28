import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, Trophy, Zap, Video, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useValidate22MToken, useActivate22MTrial } from "@/hooks/use22MTrialStatus";

const TRIAL_BENEFITS = [
  { icon: BarChart3, title: "Athlete Dashboard", desc: "Track your velocity, performance metrics, and training progress" },
  { icon: Zap, title: "Vault Training Modules", desc: "Access structured development programs designed for elite athletes" },
  { icon: Users, title: "Eddie AI Assistant", desc: "Get personalized coaching insights and training recommendations" },
  { icon: Video, title: "Video Analysis", desc: "Upload mechanics videos for professional review and feedback" },
  { icon: Trophy, title: "Progress Tracking", desc: "Monitor your development with detailed analytics and milestones" },
];

const Claim22MAccess = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useValidate22MToken(inviteToken);
  const activateTrial = useActivate22MTrial();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth", {
          state: { from: { pathname: `/claim-22m${inviteToken ? `?invite=${inviteToken}` : ""}` } },
        });
        return;
      }
      setUser(session.user);
      setLoading(false);
    });
  }, [navigate, inviteToken]);

  const handleActivateTrial = async () => {
    if (!user || !tokenData) return;
    setActivating(true);

    try {
      await activateTrial.mutateAsync({
        userId: user.id,
        tokenId: tokenData.id,
      });

      toast({
        title: "Welcome to Vault! 🎉",
        description: "Your 22M Founding Athlete Access has been activated. You have 7 days of full access.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Activation error:", error);
      
      if (error.message?.includes("duplicate") || error.code === "23505") {
        toast({
          title: "Already Activated",
          description: "You already have an active trial. Head to your dashboard to continue.",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Activation Failed",
          description: error.message || "Unable to activate trial. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setActivating(false);
    }
  };

  if (loading || tokenLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isValidToken = tokenData && !tokenError;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium mb-6">
                <Trophy className="w-4 h-4" />
                EXCLUSIVE 22M PROGRAM
              </div>
              <h1 className="text-4xl md:text-5xl font-display tracking-wider text-foreground mb-4">
                22M FOUNDING ATHLETE ACCESS
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience the full Vault development system for 7 days. Train like a pro with 
                structured programs, AI-powered coaching, and professional video analysis.
              </p>
            </div>

            {/* Token Status */}
            {!isValidToken ? (
              <div className="bg-destructive/10 border border-destructive/20 p-8 text-center">
                <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-display text-foreground mb-2">INVALID INVITE LINK</h2>
                <p className="text-muted-foreground mb-6">
                  This invite link is invalid, expired, or has reached its usage limit.
                  Contact your 22M program coordinator for a new invite.
                </p>
                <Button variant="ghost" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            ) : (
              <>
                {/* Valid Token - Show Benefits */}
                <div className="bg-card border border-border p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <span className="text-foreground font-medium">
                      Invite verified: {tokenData.label || "22M Baseball Program"}
                    </span>
                  </div>

                  <h2 className="text-xl font-display tracking-wide text-foreground mb-4">
                    WHAT YOU GET FOR 7 DAYS
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {TRIAL_BENEFITS.map(({ icon: Icon, title, desc }) => (
                      <div key={title} className="flex gap-3 p-4 bg-muted/50 border border-border">
                        <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">{title}</p>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="vault"
                    size="lg"
                    className="w-full"
                    onClick={handleActivateTrial}
                    disabled={activating}
                  >
                    {activating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Activating...
                      </>
                    ) : (
                      "Activate My 7-Day Trial"
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    No payment required. Full access for 7 days.
                  </p>
                </div>

                {/* After Trial Info */}
                <div className="bg-muted/30 border border-border p-6">
                  <h3 className="font-display text-foreground mb-3">AFTER YOUR TRIAL</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Love the system? Continue your development with one of our programs:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-card border border-border">
                      <p className="font-medium text-foreground">Vault Velocity System</p>
                      <p className="text-2xl font-display text-primary mt-1">$397</p>
                      <p className="text-xs text-muted-foreground">One-time access</p>
                    </div>
                    <div className="p-4 bg-card border border-border">
                      <p className="font-medium text-foreground">Remote Training Membership</p>
                      <p className="text-2xl font-display text-primary mt-1">$199/mo</p>
                      <p className="text-xs text-muted-foreground">Ongoing coaching support</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Claim22MAccess;
