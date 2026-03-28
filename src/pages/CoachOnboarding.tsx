import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, Circle, ArrowRight, Users, Calendar, 
  BarChart3, User, Loader2, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface OnboardingStep {
  key: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  completed: boolean;
}

const CoachOnboarding = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchOnboarding(session.user.id);
    });
  }, [navigate]);

  const fetchOnboarding = async (userId: string) => {
    const { data } = await supabase
      .from("coach_onboarding")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!data) {
      // Create onboarding record if missing
      const { data: newData } = await supabase
        .from("coach_onboarding")
        .insert({ user_id: userId })
        .select()
        .single();
      setOnboarding(newData);
    } else {
      setOnboarding(data);
    }
    setLoading(false);
  };

  const markStep = async (step: string) => {
    if (!onboarding) return;
    const updates: any = { [step]: true, updated_at: new Date().toISOString() };
    
    // Check if all steps will be complete
    const currentSteps = {
      setup_profile: onboarding.setup_profile,
      connected_athletes: onboarding.connected_athletes,
      created_schedule: onboarding.created_schedule,
      reviewed_dashboard: onboarding.reviewed_dashboard,
      [step]: true,
    };
    
    if (Object.values(currentSteps).every(Boolean)) {
      updates.completed_at = new Date().toISOString();
    }

    await supabase
      .from("coach_onboarding")
      .update(updates)
      .eq("id", onboarding.id);

    setOnboarding({ ...onboarding, ...updates });
  };

  const steps: OnboardingStep[] = [
    {
      key: "setup_profile",
      title: "Set Up Your Coach Profile",
      description: "Add your name, photo, and coaching specialization so athletes can find you.",
      icon: User,
      href: `/profile/${user?.id}`,
      completed: onboarding?.setup_profile || false,
    },
    {
      key: "reviewed_dashboard",
      title: "Explore Your Dashboard",
      description: "Take a tour of the Coach Command Center — your hub for everything.",
      icon: BarChart3,
      href: "/coach",
      completed: onboarding?.reviewed_dashboard || false,
    },
    {
      key: "connected_athletes",
      title: "Connect With Athletes",
      description: "Search for athletes and request to connect so you can track their progress.",
      icon: Users,
      href: "/coach",
      completed: onboarding?.connected_athletes || false,
    },
    {
      key: "created_schedule",
      title: "Create Your First Schedule",
      description: "Build a training program and assign it to your athletes.",
      icon: Calendar,
      href: "/coach",
      completed: onboarding?.created_schedule || false,
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const allComplete = completedCount === steps.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display text-foreground mb-2">
                COACH SETUP
              </h1>
              <p className="text-muted-foreground">
                Complete these steps to get the most out of your coaching tools.
              </p>
              {/* Progress */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-48 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${(completedCount / steps.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {completedCount}/{steps.length}
                </span>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, i) => (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-card border rounded-xl p-5 flex items-center gap-4 transition-colors ${
                    step.completed ? "border-accent/30" : "border-border"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.completed ? "bg-accent/10" : "bg-secondary"
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-accent" />
                    ) : (
                      <step.icon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${step.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {step.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {!step.completed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        markStep(step.key);
                        navigate(step.href);
                      }}
                    >
                      Start
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* All complete */}
            {allComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-accent/5 border border-accent/30 rounded-2xl p-8 text-center"
              >
                <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
                <h2 className="text-xl font-display text-foreground mb-2">You're All Set!</h2>
                <p className="text-muted-foreground mb-6">
                  Your coaching toolkit is ready. Head to your dashboard to start working with athletes.
                </p>
                <Button variant="vault" onClick={() => navigate("/coach")}>
                  Open Coach Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Skip */}
            {!allComplete && (
              <div className="text-center">
                <Button variant="ghost" onClick={() => navigate("/coach")}>
                  Skip for now — go to dashboard
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CoachOnboarding;
