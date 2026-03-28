import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Zap, Target, TrendingUp, Clock, Activity, 
  ArrowRight, CheckCircle2, AlertCircle, Calendar,
  Upload, Video, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { format, differenceInDays, differenceInHours } from "date-fns";
import { useProductCheckout } from "@/hooks/useProductCheckout";

interface TrialData {
  id: string;
  trial_type: string;
  started_at: string;
  expires_at: string;
  status: string;
}

const VelocityBaseline = () => {
  const [trial, setTrial] = useState<TrialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkout, loading: checkoutLoading } = useProductCheckout();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/trial", { replace: true });
        return;
      }
      
      setUser(session.user);
      
      // Fetch trial data
      const { data: trialData, error } = await supabase
        .from('user_trials')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching trial:", error);
      }
      
      setTrial(trialData);
      setLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  const getTrialTimeRemaining = () => {
    if (!trial) return null;
    
    const expiresAt = new Date(trial.expires_at);
    const now = new Date();
    
    const daysLeft = differenceInDays(expiresAt, now);
    const hoursLeft = differenceInHours(expiresAt, now) % 24;
    
    if (daysLeft < 0) return { expired: true, text: "Trial Expired" };
    
    return {
      expired: false,
      days: daysLeft,
      hours: hoursLeft,
      text: `${daysLeft}d ${hoursLeft}h remaining`
    };
  };

  const handleUpgrade = () => {
    checkout('founders_access', `${window.location.origin}/payment-success`, `${window.location.origin}/velocity-baseline`);
  };

  const timeRemaining = getTrialTimeRemaining();

  const baselineMetrics = [
    { label: "Fastball Velocity", value: "--", unit: "mph", icon: Zap, status: "pending" },
    { label: "Changeup Velocity", value: "--", unit: "mph", icon: Activity, status: "pending" },
    { label: "Breaking Ball Velocity", value: "--", unit: "mph", icon: TrendingUp, status: "pending" },
    { label: "Arm Strength Index", value: "--", unit: "", icon: Target, status: "pending" },
  ];

  const checklistItems = [
    { id: 1, text: "Complete profile setup", done: false, action: () => navigate('/account') },
    { id: 2, text: "Connect your training device", done: false, action: () => navigate('/device-metrics') },
    { id: 3, text: "Record 10+ fastball throws", done: false, action: () => navigate('/device-metrics') },
    { id: 4, text: "Record 5+ changeup throws", done: false, action: () => navigate('/device-metrics') },
    { id: 5, text: "Record 5+ breaking ball throws", done: false, action: () => navigate('/device-metrics') },
    { id: 6, text: "Complete baseline assessment", done: false, action: () => {} },
  ];

  const completedCount = checklistItems.filter(item => item.done).length;
  const progressPercent = (completedCount / checklistItems.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Trial Banner */}
          {trial && timeRemaining && !timeRemaining.expired && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground font-medium">
                    Free Trial: <span className="text-primary font-bold">{timeRemaining.text}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Complete your baseline before your trial ends
                  </p>
                </div>
              </div>
              <Button 
                variant="vault" 
                size="sm"
                onClick={handleUpgrade}
                disabled={checkoutLoading === 'founders_access'}
              >
                {checkoutLoading === 'founders_access' ? "Processing..." : "Upgrade to Full Access — $499"}
              </Button>
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              <Zap className="w-3 h-3 mr-1" />
              VELOCITY BASELINE TRIAL
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              ESTABLISH YOUR BASELINE
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Welcome, {user?.user_metadata?.full_name || 'Athlete'}! Complete the checklist below to establish your velocity baseline and unlock personalized training recommendations.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Progress & Checklist */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Baseline Progress</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {completedCount}/{checklistItems.length} completed
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={progressPercent} className="h-3 mb-6" />
                    
                    <div className="space-y-3">
                      {checklistItems.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            item.done ? 'bg-primary/10' : 'bg-muted/50 hover:bg-muted'
                          }`}
                        >
                          {item.done ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                          )}
                          <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                            {item.text}
                          </span>
                          {!item.done && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-auto"
                              onClick={item.action}
                            >
                              Start <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Baseline Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Your Velocity Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {baselineMetrics.map((metric, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl bg-muted/50 border border-border/50"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <metric.icon className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">{metric.label}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">{metric.value}</span>
                            <span className="text-muted-foreground">{metric.unit}</span>
                          </div>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Awaiting data
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Video Upload Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-primary" />
                      Upload Your Pitching Videos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Upload videos of your pitching sessions to get AI-powered analysis and track your mechanics.
                    </p>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                      <p className="text-foreground font-medium mb-1">Drop videos here or click to upload</p>
                      <p className="text-sm text-muted-foreground">MP4, MOV up to 500MB</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="vault" 
                      className="w-full justify-start"
                      onClick={() => navigate('/device-metrics')}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Connect Device
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/device-metrics')}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Manual Entry
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Session
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Trial Info */}
              {trial && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        Trial Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Started</span>
                        <span className="text-foreground">{format(new Date(trial.started_at), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires</span>
                        <span className="text-foreground">{format(new Date(trial.expires_at), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant="default" className="bg-primary">Active</Badge>
                      </div>
                      <hr className="border-border/50" />
                      <p className="text-muted-foreground text-xs">
                        Upgrade anytime to keep your data and unlock unlimited access.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Upgrade CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-card border-primary/30">
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg text-foreground mb-2">
                      UNLOCK FULL VAULT™ OS
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get lifetime access to all training systems, unlimited tracking, and personalized coaching.
                    </p>
                    <Button 
                      variant="vault" 
                      className="w-full"
                      onClick={handleUpgrade}
                      disabled={checkoutLoading === 'founders_access'}
                    >
                      {checkoutLoading === 'founders_access' ? (
                        "Processing..."
                      ) : (
                        <>
                          Upgrade — $499 Founder's Price
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      Limited time • Lifetime access
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VelocityBaseline;
