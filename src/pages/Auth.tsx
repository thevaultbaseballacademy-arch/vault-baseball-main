import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, Loader2, Eye, EyeOff, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import MFAVerify from "@/components/auth/MFAVerify";
import LegalAgreements from "@/components/auth/LegalAgreements";
import RoleSelector from "@/components/auth/RoleSelector";
import SportSelector from "@/components/auth/SportSelector";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { SportType } from "@/lib/sportTypes";
import vaultLogo from "@/assets/vault-logo-new.webp";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

type UserRole = "athlete" | "coach" | "parent";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("athlete");
  const [sportType, setSportType] = useState<SportType>("baseball");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [legalAgreed, setLegalAgreed] = useState(false);
  
  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaUserId, setMfaUserId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { recordSession } = useSessionManagement();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) checkMFAStatus(session);
    });
  }, [navigate, location]);

  const checkMFAStatus = async (session: any) => {
    try {
      const { data: { currentLevel } } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (currentLevel === "aal2") {
        await routeByRole(session.user.id);
      } else {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const verifiedFactors = factors?.totp?.filter(f => f.status === "verified") || [];
        if (verifiedFactors.length > 0) {
          setMfaRequired(true);
          setMfaFactorId(verifiedFactors[0].id);
          setMfaUserId(session.user.id);
        } else {
          await routeByRole(session.user.id);
        }
      }
    } catch (error) {
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  };

  /** Route user to the correct dashboard based on their role */
  const routeByRole = async (userId: string) => {
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== "/auth") {
      navigate(from, { replace: true });
      return;
    }

    // Check user_roles table for role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const userRoles = roles?.map(r => r.role) || [];
    
    if (userRoles.includes("owner")) {
      navigate("/owner", { replace: true });
    } else if (userRoles.includes("admin")) {
      navigate("/admin", { replace: true });
    } else if (userRoles.includes("coach")) {
      navigate("/coach-dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  const validateForm = () => {
    try {
      authSchema.parse({ email, password, name: isLogin ? undefined : name });
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
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const verifiedFactors = factors?.totp?.filter(f => f.status === "verified") || [];
        
        if (verifiedFactors.length > 0 && data.user) {
          setMfaRequired(true);
          setMfaFactorId(verifiedFactors[0].id);
          setMfaUserId(data.user.id);
          toast({ title: "2FA Required", description: "Please enter your authentication code." });
        } else {
          await recordSession();
          toast({ title: "Welcome back!", description: "You're signed in." });
          if (data.user) {
            await routeByRole(data.user.id);
          }
        }
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { full_name: name, display_name: name, signup_role: role, sport_type: sportType },
          },
        });
        if (error) throw error;

        // If user was auto-confirmed (e.g. in dev), assign role immediately
        if (signUpData.user && signUpData.session) {
          await assignRole(signUpData.user.id, role);
          // Update sport_type on the profile
          await supabase.from('profiles').update({ sport_type: sportType } as any).eq('user_id', signUpData.user.id);
          await recordSession();
          toast({ title: "Account created!", description: "Welcome to the Vault." });
          await routeByRole(signUpData.user.id);
        } else {
          toast({ title: "Account created!", description: "Check your email to verify, then sign in." });
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      let message = error.message || "An error occurred";
      if (error.message?.includes("User already registered")) {
        message = "This email is already registered. Please sign in instead.";
      } else if (error.message?.includes("Invalid login credentials")) {
        message = "Invalid email or password. Please try again.";
      } else if (error.message?.includes("Email not confirmed")) {
        message = "Please confirm your email before signing in.";
      }
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, selectedRole: UserRole) => {
    try {
      // "parent" is not a value in the app_role DB enum, so we insert "athlete"
      // as the DB role but also persist the true role via profile + user metadata
      // so that parent-portal RBAC lookups work correctly.
      const dbRole = selectedRole === "coach" ? "coach" as const : "athlete" as const;
      await supabase.from("user_roles").upsert(
        [{ user_id: userId, role: dbRole }],
        { onConflict: "user_id,role" }
      );
      if (selectedRole === "parent") {
        await supabase.auth.updateUser({ data: { signup_role: "parent" } });
        await supabase.from("profiles").update({ role: "parent" } as any).eq("user_id", userId);
      }
    } catch (err) {
      console.error("Error assigning role:", err);
    }
  };

  const handleMFASuccess = async () => {
    await recordSession();
    toast({ title: "Welcome back!", description: "You're signed in." });
    if (mfaUserId) {
      await routeByRole(mfaUserId);
    }
  };

  const handleMFACancel = async () => {
    await supabase.auth.signOut();
    setMfaRequired(false);
    setMfaUserId(null);
    setMfaFactorId(null);
  };

  if (mfaRequired && mfaFactorId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          <button onClick={() => navigate("/")} className="flex items-center">
            <img src={vaultLogo} alt="Vault Baseball" className="h-12 w-auto" />
          </button>
        </div>
        <MFAVerify
          factorId={mfaFactorId}
          userId={mfaUserId || ""}
          onSuccess={handleMFASuccess}
          onCancel={handleMFACancel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <button onClick={() => navigate("/")} className="flex items-center">
            <img src={vaultLogo} alt="Vault Baseball" className="h-14 w-auto" />
          </button>
        </div>

        {/* Toggle */}
        <div className="flex bg-secondary rounded-xl p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              !isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <div className="text-center mb-5">
            <h1 className="font-display text-2xl text-foreground">
              {isLogin ? "WELCOME BACK" : "JOIN THE VAULT"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin ? "Sign in to your account" : "Start your training journey"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <RoleSelector value={role} onChange={setRole} />
                <SportSelector value={sportType} onChange={setSportType} />
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                  minLength={6}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              {isLogin && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      toast({ title: "Enter your email", description: "Type your email above, then click Forgot Password.", variant: "destructive" });
                      return;
                    }
                    try {
                      const { error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/reset-password`,
                      });
                      if (error) throw error;
                      toast({ title: "Reset link sent", description: "Check your email for a password reset link." });
                    } catch (err: any) {
                      toast({ title: "Error", description: err.message || "Could not send reset link.", variant: "destructive" });
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
                >
                  <KeyRound className="w-3 h-3" />
                  Forgot Password?
                </button>
              )}
            </div>

            {!isLogin && (
              <div className="pt-1 border-t border-border/50">
                <LegalAgreements onAgreementChange={setLegalAgreed} />
              </div>
            )}

            <Button
              type="submit"
              variant="vault"
              size="lg"
              className="w-full h-12"
              disabled={loading || (!isLogin && !legalAgreed)}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              {loading
                ? (isLogin ? "Signing In..." : "Creating Account...")
                : (isLogin ? "Sign In" : "Create Account")
              }
            </Button>
          </form>
        </div>

        {/* Back to home */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
