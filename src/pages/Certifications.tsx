import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Award, Shield, CheckCircle, Clock, Lock, Play, 
  ArrowRight, Loader2, AlertCircle, RefreshCw, Trophy, Video, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  useCertificationDefinitions, 
  useUserCertifications,
  useCheckPrerequisites,
  CertificationDefinition,
  UserCertification
} from "@/hooks/useCertifications";
import { 
  CERTIFICATION_PRICES, 
  getCertificationDisplayName,
  getCertificationPrice,
  type CertificationType 
} from "@/lib/certificationPricing";
import CertificateGenerator from "@/components/certifications/CertificateGenerator";
import CertificationBadge from "@/components/certifications/CertificationBadge";
import { useMyBadge } from "@/hooks/useCoachBadge";
import { useVideoExamAttempts } from "@/hooks/useVideoExam";

const CertificationCard = ({ 
  definition, 
  userCert, 
  allDefinitions,
  allUserCerts,
  onStartExam,
  onPurchase,
  isLoading,
  coachName,
}: { 
  definition: CertificationDefinition;
  userCert?: UserCertification;
  allDefinitions: CertificationDefinition[];
  allUserCerts: UserCertification[];
  onStartExam: (type: CertificationType) => void;
  onPurchase: (type: CertificationType) => void;
  isLoading: boolean;
  coachName: string;
}) => {
  const { canTake, missing } = useCheckPrerequisites(
    definition.certification_type, 
    allDefinitions, 
    allUserCerts
  );

  const isActive = userCert?.status === 'active' && new Date(userCert.expires_at) > new Date();
  const isExpired = userCert && (userCert.status === 'expired' || new Date(userCert.expires_at) <= new Date());
  const isPaid = definition.price_cents === 0;
  const needsPayment = !isPaid && !userCert;

  const daysUntilExpiry = userCert 
    ? Math.ceil((new Date(userCert.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const getStatusBadge = () => {
    if (isActive) {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Active</Badge>;
    }
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (needsPayment) {
      return <Badge variant="outline">${getCertificationPrice(definition.certification_type).toLocaleString()}</Badge>;
    }
    return <Badge variant="secondary">Not Started</Badge>;
  };

  const getActionButton = () => {
    if (!canTake && !isActive) {
      return (
        <Button disabled variant="outline" className="w-full">
          <Lock className="w-4 h-4 mr-2" />
          Complete Prerequisites First
        </Button>
      );
    }

    if (isActive) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Expires in {daysUntilExpiry} days</span>
          </div>
          {daysUntilExpiry <= 30 && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onStartExam(definition.certification_type)}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Renew Certification
            </Button>
          )}
        </div>
      );
    }

    if (needsPayment) {
      return (
        <Button 
          variant="vault" 
          className="w-full"
          onClick={() => onPurchase(definition.certification_type)}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Purchase & Take Exam
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      );
    }

    return (
      <Button 
        variant="vault" 
        className="w-full"
        onClick={() => onStartExam(definition.certification_type)}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
        {isExpired ? 'Retake Exam' : 'Start Exam'}
      </Button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`relative overflow-hidden ${isActive ? 'border-green-500/50' : ''}`}>
        {definition.is_required && (
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg">
            Required
          </div>
        )}
        
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isActive ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                {isActive ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Award className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">{definition.name}</CardTitle>
                <CardDescription className="mt-1">{definition.description}</CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-display text-foreground">{definition.question_count}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-display text-foreground">{definition.passing_score}%</p>
              <p className="text-xs text-muted-foreground">To Pass</p>
            </div>
            <div>
              <p className="text-2xl font-display text-foreground">{definition.validity_months}</p>
              <p className="text-xs text-muted-foreground">Months Valid</p>
            </div>
          </div>

          {userCert && isActive && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your Score</span>
                  <span className="font-medium">{userCert.score}%</span>
                </div>
                <Progress value={userCert.score} className="h-2" />
              </div>
              {userCert.certificate_number && (
                <CertificateGenerator
                  coachName={coachName}
                  certificationType={definition.certification_type}
                  certificateNumber={userCert.certificate_number}
                  score={userCert.score}
                  issuedAt={userCert.issued_at}
                  expiresAt={userCert.expires_at}
                />
              )}
            </div>
          )}

          {missing.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-500/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Prerequisites Required:</p>
                <p>{missing.map(m => getCertificationDisplayName(m)).join(', ')}</p>
              </div>
            </div>
          )}

          {getActionButton()}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Certifications = () => {
  const [user, setUser] = useState<any>(null);
  const [coachName, setCoachName] = useState<string>("");
  const [isCoach, setIsCoach] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: definitions = [], isLoading: defsLoading } = useCertificationDefinitions();
  const { data: userCerts = [], isLoading: certsLoading, refetch: refetchCerts } = useUserCertifications();

  useEffect(() => {
    // Handle success/cancel from Stripe
    if (searchParams.get('success')) {
      toast.success('Payment successful! You can now take your exam.');
      refetchCerts();
    } else if (searchParams.get('canceled')) {
      toast.info('Payment was canceled.');
    }
  }, [searchParams, refetchCerts]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      checkCoachRole(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/auth");
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkCoachRole = async (userId: string) => {
    try {
      // Check roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .in('role', ['admin', 'coach']);

      setIsCoach((roles || []).length > 0);

      // Get profile for coach name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('user_id', userId)
        .single();

      if (profile) {
        setCoachName(profile.display_name || profile.email || 'Coach');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking role:', error);
      setLoading(false);
    }
  };

  const handleStartExam = (certType: CertificationType) => {
    navigate(`/certifications/exam/${certType}`);
  };

  const handlePurchase = async (certType: CertificationType) => {
    const priceId = CERTIFICATION_PRICES[certType];
    if (!priceId) {
      // Free certification, go directly to exam
      handleStartExam(certType);
      return;
    }

    setPurchaseLoading(certType);
    try {
      const { data, error } = await supabase.functions.invoke('certification-checkout', {
        body: { 
          priceId, 
          certificationLabel: getCertificationDisplayName(certType) 
        },
      });

      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start checkout');
    } finally {
      setPurchaseLoading(null);
    }
  };

  if (loading || defsLoading || certsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isCoach) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-display text-foreground mb-2">Coach Access Required</h2>
              <p className="text-muted-foreground mb-6">
                Certifications are available for coaches only.
              </p>
              <Button variant="vault" onClick={() => navigate("/")}>
                Go Home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Baseball certifications
  const baseballRequired = definitions.filter(d => d.is_required && !d.certification_type.startsWith('softball'));
  const baseballAdvanced = definitions.filter(d => !d.is_required && d.certification_type === 'performance');
  const baseballSpecialists = definitions.filter(d => d.certification_type.includes('specialist') && !d.certification_type.startsWith('softball'));
  
  // Softball certifications
  const softballRequired = definitions.filter(d => d.is_required && d.certification_type.startsWith('softball'));
  const softballAdvanced = definitions.filter(d => !d.is_required && d.certification_type === 'softball_performance');
  const softballSpecialists = definitions.filter(d => d.certification_type.startsWith('softball') && d.certification_type.includes('specialist'));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Shield className="w-5 h-5" />
                <span className="font-medium">VAULT™ Coach Certification Program</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display text-foreground">
                COACH CERTIFICATIONS
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Standardization • Accountability • Authority
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/certifications/leaderboard')}
                className="gap-2"
              >
                <Trophy className="w-4 h-4" />
                View Leaderboard
              </Button>
            </div>

            {/* Progress Overview */}
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg text-foreground">Your Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      {userCerts.filter(c => c.status === 'active').length} of {definitions.length} certifications active
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {definitions.map(def => {
                      const cert = userCerts.find(c => c.certification_type === def.certification_type);
                      const isActive = cert?.status === 'active' && new Date(cert.expires_at) > new Date();
                      return (
                        <div 
                          key={def.id}
                          className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-muted'}`}
                          title={def.name}
                        />
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ⚾ BASEBALL CERTIFICATIONS */}
            <div className="space-y-4">
              <h2 className="text-xl font-display text-foreground flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full" />
                ⚾ Baseball — Required
              </h2>
              <div className="grid md:grid-cols-1 gap-4">
                {baseballRequired.map(def => (
                  <CertificationCard key={def.id} definition={def} userCert={userCerts.find(c => c.certification_type === def.certification_type)} allDefinitions={definitions} allUserCerts={userCerts} onStartExam={handleStartExam} onPurchase={handlePurchase} isLoading={purchaseLoading === def.certification_type} coachName={coachName} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-display text-foreground flex items-center gap-2">
                <span className="w-1 h-6 bg-accent rounded-full" />
                ⚾ Baseball — Performance
              </h2>
              <div className="grid md:grid-cols-1 gap-4">
                {baseballAdvanced.map(def => (
                  <CertificationCard key={def.id} definition={def} userCert={userCerts.find(c => c.certification_type === def.certification_type)} allDefinitions={definitions} allUserCerts={userCerts} onStartExam={handleStartExam} onPurchase={handlePurchase} isLoading={purchaseLoading === def.certification_type} coachName={coachName} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-display text-foreground flex items-center gap-2">
                <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                ⚾ Baseball — Position Specialists
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {baseballSpecialists.map(def => (
                  <CertificationCard key={def.id} definition={def} userCert={userCerts.find(c => c.certification_type === def.certification_type)} allDefinitions={definitions} allUserCerts={userCerts} onStartExam={handleStartExam} onPurchase={handlePurchase} isLoading={purchaseLoading === def.certification_type} coachName={coachName} />
                ))}
              </div>
            </div>

            {/* 🥎 SOFTBALL CERTIFICATIONS */}
            <div className="space-y-4 pt-6 border-t border-border">
              <h2 className="text-xl font-display text-foreground flex items-center gap-2">
                <span className="w-1 h-6 bg-pink-500 rounded-full" />
                🥎 Softball — Required
              </h2>
              <div className="grid md:grid-cols-1 gap-4">
                {softballRequired.map(def => (
                  <CertificationCard key={def.id} definition={def} userCert={userCerts.find(c => c.certification_type === def.certification_type)} allDefinitions={definitions} allUserCerts={userCerts} onStartExam={handleStartExam} onPurchase={handlePurchase} isLoading={purchaseLoading === def.certification_type} coachName={coachName} />
                ))}
              </div>
            </div>

            {softballAdvanced.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-display text-foreground flex items-center gap-2">
                  <span className="w-1 h-6 bg-purple-500 rounded-full" />
                  🥎 Softball — Performance
                </h2>
                <div className="grid md:grid-cols-1 gap-4">
                  {softballAdvanced.map(def => (
                    <CertificationCard key={def.id} definition={def} userCert={userCerts.find(c => c.certification_type === def.certification_type)} allDefinitions={definitions} allUserCerts={userCerts} onStartExam={handleStartExam} onPurchase={handlePurchase} isLoading={purchaseLoading === def.certification_type} coachName={coachName} />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-xl font-display text-foreground flex items-center gap-2">
                <span className="w-1 h-6 bg-amber-500 rounded-full" />
                🥎 Softball — Specialists
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {softballSpecialists.map(def => (
                  <CertificationCard key={def.id} definition={def} userCert={userCerts.find(c => c.certification_type === def.certification_type)} allDefinitions={definitions} allUserCerts={userCerts} onStartExam={handleStartExam} onPurchase={handlePurchase} isLoading={purchaseLoading === def.certification_type} coachName={coachName} />
                ))}
              </div>
            </div>

            {/* 🎥 VIDEO CERTIFICATION */}
            <VideoExamSection navigate={navigate} />

            {/* 🏆 YOUR BADGE */}
            <BadgeSummarySection />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const VIDEO_CERT_TYPES = [
  { type: "Softball Hitting Foundations", label: "Hitting Foundations Video Cert" },
  { type: "Softball Hitting Performance", label: "Hitting Performance Video Cert" },
  { type: "Softball Slap Specialist", label: "Slap Specialist Video Cert" },
];

const VideoExamSection = ({ navigate }: { navigate: (path: string) => void }) => {
  const { data: attempts = [] } = useVideoExamAttempts();

  return (
    <div className="space-y-4 pt-6 border-t border-border">
      <h2 className="text-xl font-display text-foreground flex items-center gap-2">
        <span className="w-1 h-6 bg-red-500 rounded-full" />
        🎥 Video Certification (PRO Required)
      </h2>
      <p className="text-sm text-muted-foreground">
        Watch real coaching scenarios. Identify the issue, cause, fix, and KPI. 80%+ to pass.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {VIDEO_CERT_TYPES.map(({ type, label }) => {
          const passed = attempts.some(a => a.certification_type === type && a.passed);
          const best = attempts
            .filter(a => a.certification_type === type && a.score !== null && a.total_points !== null)
            .sort((a, b) => (b.score || 0) - (a.score || 0))[0];
          return (
            <Card key={type} className={passed ? "border-green-500/50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Video className="w-5 h-5 text-primary" />
                  {passed && <Badge className="bg-green-600 text-white gap-1"><CheckCircle className="w-3 h-3" />Passed</Badge>}
                </div>
                <CardTitle className="text-base">{label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {best && (
                  <p className="text-sm text-muted-foreground">
                    Best: {best.score}/{best.total_points} ({best.total_points ? Math.round(((best.score || 0) / best.total_points) * 100) : 0}%)
                  </p>
                )}
                <Button
                  variant={passed ? "outline" : "vault"}
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/certifications/video-exam/${encodeURIComponent(type)}`)}
                >
                  {passed ? "Retake" : "Start Video Exam"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const BadgeSummarySection = () => {
  const { data: badge } = useMyBadge();
  if (!badge?.badge_level) return null;

  return (
    <div className="pt-6 border-t border-border">
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-display text-lg text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Your Certification Badge
              </h3>
              <p className="text-sm text-muted-foreground">
                Certified • Verified • Performance Validated
              </p>
            </div>
            <CertificationBadge badgeLevel={badge.badge_level} badgeName={badge.badge_name} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Certifications;
