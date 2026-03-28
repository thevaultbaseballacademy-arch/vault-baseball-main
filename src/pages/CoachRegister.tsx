import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  UserCheck, Loader2, ArrowLeft, Shield, CheckCircle, Clock,
  Target, Video, Users, BarChart3, Calendar, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CoachApplicationForm from "@/components/coach-register/CoachApplicationForm";

const BENEFITS = [
  { icon: Users, title: "Athlete Marketplace", desc: "Access to athletes and parents actively seeking coaching" },
  { icon: Video, title: "Remote Lessons", desc: "Offer live video lessons and async video analysis" },
  { icon: Target, title: "Profile Exposure", desc: "Public coach profile with ratings and specialties" },
  { icon: Calendar, title: "Session Booking", desc: "Secure scheduling and booking built into the platform" },
  { icon: BookOpen, title: "Video Coaching Tools", desc: "Built-in tools for video breakdown and analysis" },
  { icon: BarChart3, title: "Progress Tracking", desc: "Track athlete KPIs and development over time" },
];

const WHO_IS_FOR = [
  "Former college or professional baseball players",
  "Experienced private instructors",
  "Strength and performance coaches working with baseball athletes",
  "Coaches committed to structured development systems",
];

const CoachRegister = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [isAlreadyCoach, setIsAlreadyCoach] = useState(false);
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [inviteTokenId, setInviteTokenId] = useState<string | null>(null);
  const [defaultName, setDefaultName] = useState("");
  const [defaultEmail, setDefaultEmail] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth", {
          state: { from: { pathname: `/coach-register${inviteToken ? `?invite=${inviteToken}` : ""}` } },
        });
        return;
      }
      setUser(session.user);
      setDefaultEmail(session.user.email || "");
      init(session.user.id);
    });
  }, [navigate]);

  const init = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "coach")
        .maybeSingle();

      if (roleData) {
        setIsAlreadyCoach(true);
        setLoading(false);
        return;
      }

      const { data: reqData } = await supabase
        .from("coach_registration_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (reqData) setExistingRequest(reqData);

      if (inviteToken) {
        const { data: isValid } = await (supabase.rpc as any)("validate_coach_invite_token", { p_token: inviteToken });
        setInviteValid(!!isValid);
        if (isValid) {
          setInviteTokenId(inviteToken);
        }
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile?.display_name) setDefaultName(profile.display_name);
    } catch (error) {
      console.error("Error initializing:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="container mx-auto px-4 max-w-3xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary flex items-center justify-center mx-auto mb-5">
                <UserCheck className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display tracking-wider text-foreground mb-3">
                BECOME A VAULT CERTIFIED COACH
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
                Join the Vault development network and work with athletes who are serious about real progress.
              </p>
              {inviteValid && (
                <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Invite verified — instant access upon submission
                </div>
              )}
              {inviteValid === false && (
                <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive text-sm">
                  Invite link is invalid or expired
                </div>
              )}
            </div>

            {/* Already a coach */}
            {isAlreadyCoach && (
              <div className="bg-card border border-border p-8 text-center">
                <CheckCircle className="w-12 h-12 text-foreground mx-auto mb-4" />
                <h2 className="text-xl font-display text-foreground mb-2">YOU'RE ALREADY A COACH</h2>
                <p className="text-muted-foreground mb-6">Head to your dashboard to get started.</p>
                <Button variant="vault" onClick={() => navigate("/coach")}>Go to Coach Dashboard</Button>
              </div>
            )}

            {/* Existing pending request */}
            {existingRequest && !isAlreadyCoach && (
              <div className="bg-card border border-border p-8 text-center">
                {existingRequest.status === "pending" ? (
                  <>
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-display text-foreground mb-2">APPLICATION SUBMITTED</h2>
                    <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                      Thank you for applying to the Vault Coach Network.
                    </p>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                      Our team will review your application to determine if you are a good fit for the Vault development system. If approved, you will receive next steps for joining the platform.
                    </p>
                  </>
                ) : existingRequest.status === "rejected" ? (
                  <>
                    <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-display text-foreground mb-2">APPLICATION NOT APPROVED</h2>
                    <p className="text-muted-foreground mb-6">Contact support for more information.</p>
                  </>
                ) : null}
                <Button variant="ghost" onClick={() => navigate("/")}>Back to Home</Button>
              </div>
            )}

            {/* Application content */}
            {!isAlreadyCoach && !existingRequest && (
              <>
                {/* Intro */}
                <div className="bg-card border border-border p-6 md:p-8 space-y-4">
                  <p className="text-foreground leading-relaxed">
                    Vault Baseball is built around one principle: <span className="font-semibold">development through systems, discipline, and measurable progress.</span>
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We work with coaches who believe in structured training and long-term athlete growth. If you are passionate about helping athletes improve and want to be part of a high-level development platform, you can apply to join the Vault Coach Marketplace.
                  </p>
                </div>

                {/* Who This Is For */}
                <div>
                  <h2 className="text-2xl font-display tracking-wide text-foreground mb-4">WHO THIS IS FOR</h2>
                  <div className="bg-card border border-border p-6 space-y-3">
                    {WHO_IS_FOR.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-foreground mt-2 shrink-0" />
                        <p className="text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What Coaches Get */}
                <div>
                  <h2 className="text-2xl font-display tracking-wide text-foreground mb-4">WHAT COACHES GET</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {BENEFITS.map(({ icon: Icon, title, desc }) => (
                      <div key={title} className="bg-card border border-border p-4 flex gap-3">
                        <Icon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <CoachApplicationForm
                  user={user}
                  inviteValid={inviteValid}
                  inviteTokenId={inviteTokenId}
                  defaultName={defaultName}
                  defaultEmail={defaultEmail}
                  onSubmitted={() => setExistingRequest({ status: "pending" })}
                  onAutoApproved={() => navigate("/coach-onboarding")}
                />
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CoachRegister;
