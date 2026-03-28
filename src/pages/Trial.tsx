import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, User, Loader2, Eye, EyeOff, Zap, Target, TrendingUp, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import LegalAgreements from "@/components/auth/LegalAgreements";

const VAULT_TRIAL_PRICE_ID = 'price_1SrNRkPhXS410TO5vvzFSpNX';

const trialSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const Trial = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [legalAgreed, setLegalAgreed] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/velocity-baseline", { replace: true });
      }
    });
  }, [navigate]);

  const validateForm = () => {
    try {
      trialSchema.parse({ email, password, name });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: typeof errors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof typeof errors;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/velocity-baseline`;
      
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
            trial_user: true,
          },
        },
      });
      
      if (signUpError) throw signUpError;
      
      if (authData.user) {
        // Create trial record
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        const { error: trialError } = await supabase
          .from('user_trials')
          .insert({
            user_id: authData.user.id,
            trial_type: 'velocity_baseline',
            expires_at: expiresAt.toISOString(),
            status: 'active',
          });
        
        if (trialError) {
          console.error("Trial creation error:", trialError);
          // Continue anyway - user is created
        }
        
        // Redirect to Stripe checkout for the trial subscription
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: { priceId: VAULT_TRIAL_PRICE_ID },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          
          if (error) throw error;
          
          if (data?.url) {
            // Redirect to Stripe checkout (avoid popup blockers)
            window.location.href = data.url;
          }
        } else {
          // Fallback: redirect to velocity baseline if no session
          toast({
            title: "Welcome to VAULT!",
            description: "Your account has been created. Please sign in to continue.",
          });
          navigate("/auth", { replace: true });
        }
      }
    } catch (error: any) {
      let message = error.message || "An error occurred";
      if (error.message?.includes("User already registered")) {
        message = "This email is already registered. Please sign in instead.";
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Target, text: "Establish Your Velocity Baseline" },
    { icon: TrendingUp, text: "Track Your Progress in Real-Time" },
    { icon: Zap, text: "Get Personalized Training Insights" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold">7-DAY FREE TRIAL</span>
          </div>
          
          <h1 className="font-display text-5xl text-foreground mb-4 tracking-wide">
            VELOCITY BASELINE
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-md">
            Discover your true Baseball Performance & Velocity potential. Our AI-powered analysis establishes your baseline and creates a personalized development path.
          </p>
          
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-lg text-foreground">{benefit.text}</span>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-card/50 rounded-xl border border-border/50">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">$499 for Lifetime Founder's Access</p>
                <p className="text-sm text-muted-foreground">
                  7 Days Free • Then one-time payment for lifetime access (Limited Window)
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg">
            <p className="text-muted-foreground italic text-sm">
              "If it doesn't transfer to the game, it doesn't matter."
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">— VAULT™ Core Philosophy</p>
          </div>
        </motion.div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
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

          {/* Mobile benefits */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-primary font-semibold text-sm">7-DAY FREE TRIAL</span>
            </div>
            <h2 className="font-display text-2xl text-foreground mb-2">VELOCITY BASELINE</h2>
            <p className="text-muted-foreground text-sm">Discover your Baseball Performance & Velocity potential</p>
            <p className="text-primary font-semibold text-sm mt-2">$499 Lifetime Founder's Access</p>
          </div>

          {/* Trial Signup Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl text-foreground mb-2">
                START YOUR FREE TRIAL
              </h1>
              <p className="text-muted-foreground">
                7 Days Free • Then $499 for Lifetime Founder's Access (Limited Window)
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              {/* Legal Agreements */}
              <div className="pt-2 border-t border-border/50">
                <LegalAgreements onAgreementChange={setLegalAgreed} />
              </div>

              <Button
                type="submit"
                variant="vault"
                size="lg"
                className="w-full"
                disabled={loading || !legalAgreed}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating Your Account...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Start 7-Day Free Trial
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <a
                  href="/auth"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              ← Back to Home
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Trial;
