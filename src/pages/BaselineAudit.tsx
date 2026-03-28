import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  Timer, 
  Target, 
  Shield, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Loader2,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const POSITIONS = [
  "Pitcher",
  "Catcher", 
  "First Base",
  "Second Base",
  "Shortstop",
  "Third Base",
  "Left Field",
  "Center Field",
  "Right Field",
  "Designated Hitter",
  "Utility Player",
];

const PILLARS = [
  {
    id: "velocity",
    name: "VELOCITY",
    icon: Zap,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "Exit velocity is the foundation of elite power. D1 programs want 95+ MPH.",
    benchmarks: { elite: 95, good: 88, developing: 80 },
    unit: "MPH",
  },
  {
    id: "athleticism",
    name: "ATHLETICISM",
    icon: Timer,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    description: "60-yard dash time reveals explosiveness and overall athletic ceiling.",
    benchmarks: { elite: 6.7, good: 7.0, developing: 7.4 },
    unit: "sec",
    inverted: true,
  },
  {
    id: "utility",
    name: "UTILITY",
    icon: Target,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10", 
    borderColor: "border-blue-500/30",
    description: "Multi-position versatility increases your value to college programs.",
  },
  {
    id: "longevity",
    name: "LONGEVITY",
    icon: Shield,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    description: "Arm health and injury prevention determine career length.",
  },
  {
    id: "transfer",
    name: "TRANSFER",
    icon: TrendingUp,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "How well does your training translate to game performance?",
  },
];

interface AuditData {
  exitVelo: string;
  sixtyYard: string;
  position: string;
  throwingVelo: string;
  injuryHistory: string;
  trainingFrequency: string;
}

interface ScoreResult {
  overall: number;
  velocity: number;
  athleticism: number;
  utility: number;
  longevity: number;
  transfer: number;
  tier: "ELITE" | "ADVANCED" | "DEVELOPING" | "FOUNDATIONAL";
  insights: string[];
}

const BaselineAudit = () => {
  const [step, setStep] = useState(0);
  const [auditData, setAuditData] = useState<AuditData>({
    exitVelo: "",
    sixtyYard: "",
    position: "",
    throwingVelo: "",
    injuryHistory: "none",
    trainingFrequency: "3-4",
  });
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadData, setLeadData] = useState({ name: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const calculateScore = (): ScoreResult => {
    const exitVelo = parseFloat(auditData.exitVelo) || 0;
    const sixtyYard = parseFloat(auditData.sixtyYard) || 8.0;
    
    // Velocity Score (0-100)
    let velocityScore = 0;
    if (exitVelo >= 95) velocityScore = 95 + ((exitVelo - 95) * 1);
    else if (exitVelo >= 88) velocityScore = 75 + ((exitVelo - 88) / 7) * 20;
    else if (exitVelo >= 80) velocityScore = 50 + ((exitVelo - 80) / 8) * 25;
    else velocityScore = Math.max(20, (exitVelo / 80) * 50);
    velocityScore = Math.min(100, velocityScore);

    // Athleticism Score (0-100) - lower is better
    let athleticismScore = 0;
    if (sixtyYard <= 6.7) athleticismScore = 95 + ((6.7 - sixtyYard) * 10);
    else if (sixtyYard <= 7.0) athleticismScore = 75 + ((7.0 - sixtyYard) / 0.3) * 20;
    else if (sixtyYard <= 7.4) athleticismScore = 50 + ((7.4 - sixtyYard) / 0.4) * 25;
    else athleticismScore = Math.max(20, 50 - ((sixtyYard - 7.4) * 10));
    athleticismScore = Math.min(100, Math.max(0, athleticismScore));

    // Utility Score based on position flexibility
    const utilityPositions = ["Utility Player", "Shortstop", "Center Field", "Second Base"];
    const utilityScore = utilityPositions.includes(auditData.position) ? 85 : 65;

    // Longevity Score based on injury history
    const longevityMap: Record<string, number> = {
      none: 90,
      minor: 70,
      moderate: 50,
      significant: 30,
    };
    const longevityScore = longevityMap[auditData.injuryHistory] || 70;

    // Transfer Score based on training frequency and overall performance
    const frequencyMap: Record<string, number> = {
      "1-2": 50,
      "3-4": 70,
      "5-6": 85,
      "7+": 95,
    };
    const transferScore = frequencyMap[auditData.trainingFrequency] || 70;

    // Overall weighted score
    const overall = Math.round(
      velocityScore * 0.30 +
      athleticismScore * 0.25 +
      utilityScore * 0.15 +
      longevityScore * 0.15 +
      transferScore * 0.15
    );

    // Determine tier
    let tier: ScoreResult["tier"];
    if (overall >= 85) tier = "ELITE";
    else if (overall >= 70) tier = "ADVANCED";
    else if (overall >= 55) tier = "DEVELOPING";
    else tier = "FOUNDATIONAL";

    // Generate insights
    const insights: string[] = [];
    if (velocityScore < 75) {
      insights.push("Your exit velocity is below D1 standards. Focus on power development.");
    }
    if (athleticismScore < 70) {
      insights.push("Improving your 60-yard time could unlock more recruiting opportunities.");
    }
    if (longevityScore < 70) {
      insights.push("Prioritize arm care and injury prevention protocols.");
    }
    if (transferScore < 75) {
      insights.push("Increase training frequency for better game transfer.");
    }
    if (insights.length === 0) {
      insights.push("You're on track for elite-level performance. Keep grinding!");
    }

    return {
      overall,
      velocity: Math.round(velocityScore),
      athleticism: Math.round(athleticismScore),
      utility: utilityScore,
      longevity: longevityScore,
      transfer: transferScore,
      tier,
      insights,
    };
  };

  const handleCalculateScore = () => {
    setShowLeadCapture(true);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Store the lead in Supabase
      const { error } = await supabase.from("activity_feed").insert({
        activity_type: "baseline_audit_lead",
        title: `Baseline Audit: ${leadData.name}`,
        description: `Email: ${leadData.email} | Exit Velo: ${auditData.exitVelo} | 60yd: ${auditData.sixtyYard} | Position: ${auditData.position}`,
        metadata: {
          name: leadData.name,
          email: leadData.email,
          ...auditData,
        },
      });

      if (error) throw error;

      const result = calculateScore();
      setScoreResult(result);
      setShowLeadCapture(false);
      setShowResults(true);

      toast({
        title: "Score Calculated!",
        description: "Your VAULT™ Baseline Score is ready.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    // Step 0: Intro
    {
      title: "VAULT™ Baseline Audit",
      content: (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-sm font-semibold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            Free Performance Assessment
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Discover Your Elite Potential
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            This 2-minute assessment evaluates your performance across the 5 VAULT™ pillars. 
            Get your personalized score and see exactly where you stand against D1 standards.
          </p>
          <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto pt-4">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className={`p-3 ${pillar.bgColor} border ${pillar.borderColor} flex flex-col items-center gap-2`}
              >
                <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {pillar.name.charAt(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // Step 1: Velocity
    {
      title: "VELOCITY",
      pillar: PILLARS[0],
      content: (
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 ${PILLARS[0].bgColor} border ${PILLARS[0].borderColor} ${PILLARS[0].color} text-sm font-semibold uppercase tracking-wider`}>
            <Zap className="w-4 h-4" />
            Pillar 1 of 5
          </div>
          <h3 className="text-2xl font-bold text-foreground">What's Your Exit Velocity?</h3>
          <p className="text-muted-foreground">{PILLARS[0].description}</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exitVelo" className="text-foreground font-semibold">
                Peak Exit Velo (MPH)
              </Label>
              <Input
                id="exitVelo"
                type="number"
                placeholder="e.g., 92"
                value={auditData.exitVelo}
                onChange={(e) => setAuditData({ ...auditData, exitVelo: e.target.value })}
                className="bg-secondary border-border text-foreground text-lg h-14"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="p-3 bg-red-500/10 border border-red-500/30">
                <div className="text-red-500 font-bold">95+</div>
                <div className="text-muted-foreground">D1 Elite</div>
              </div>
              <div className="p-3 bg-orange-500/10 border border-orange-500/30">
                <div className="text-orange-500 font-bold">88-94</div>
                <div className="text-muted-foreground">D1 Ready</div>
              </div>
              <div className="p-3 bg-muted border border-border">
                <div className="text-foreground font-bold">80-87</div>
                <div className="text-muted-foreground">Developing</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    // Step 2: Athleticism
    {
      title: "ATHLETICISM",
      pillar: PILLARS[1],
      content: (
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 ${PILLARS[1].bgColor} border ${PILLARS[1].borderColor} ${PILLARS[1].color} text-sm font-semibold uppercase tracking-wider`}>
            <Timer className="w-4 h-4" />
            Pillar 2 of 5
          </div>
          <h3 className="text-2xl font-bold text-foreground">What's Your 60-Yard Dash Time?</h3>
          <p className="text-muted-foreground">{PILLARS[1].description}</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sixtyYard" className="text-foreground font-semibold">
                60-Yard Dash (seconds)
              </Label>
              <Input
                id="sixtyYard"
                type="number"
                step="0.1"
                placeholder="e.g., 6.9"
                value={auditData.sixtyYard}
                onChange={(e) => setAuditData({ ...auditData, sixtyYard: e.target.value })}
                className="bg-secondary border-border text-foreground text-lg h-14"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="p-3 bg-green-500/10 border border-green-500/30">
                <div className="text-green-500 font-bold">&lt;6.7s</div>
                <div className="text-muted-foreground">D1 Elite</div>
              </div>
              <div className="p-3 bg-orange-500/10 border border-orange-500/30">
                <div className="text-orange-500 font-bold">6.7-7.0s</div>
                <div className="text-muted-foreground">D1 Ready</div>
              </div>
              <div className="p-3 bg-muted border border-border">
                <div className="text-foreground font-bold">7.0-7.4s</div>
                <div className="text-muted-foreground">Developing</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    // Step 3: Utility (Position)
    {
      title: "UTILITY",
      pillar: PILLARS[2],
      content: (
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 ${PILLARS[2].bgColor} border ${PILLARS[2].borderColor} ${PILLARS[2].color} text-sm font-semibold uppercase tracking-wider`}>
            <Target className="w-4 h-4" />
            Pillar 3 of 5
          </div>
          <h3 className="text-2xl font-bold text-foreground">What's Your Primary Position?</h3>
          <p className="text-muted-foreground">{PILLARS[2].description}</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">
                Primary Position
              </Label>
              <Select
                value={auditData.position}
                onValueChange={(value) => setAuditData({ ...auditData, position: value })}
              >
                <SelectTrigger className="bg-secondary border-border text-foreground h-14 text-lg">
                  <SelectValue placeholder="Select your position" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {POSITIONS.map((pos) => (
                    <SelectItem key={pos} value={pos} className="text-foreground">
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-muted-foreground">
                <span className="text-blue-500 font-semibold">Pro Tip:</span> Multi-position athletes 
                are 2.3x more likely to receive D1 offers. The VAULT™ system helps you develop versatility.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    // Step 4: Longevity
    {
      title: "LONGEVITY",
      pillar: PILLARS[3],
      content: (
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 ${PILLARS[3].bgColor} border ${PILLARS[3].borderColor} ${PILLARS[3].color} text-sm font-semibold uppercase tracking-wider`}>
            <Shield className="w-4 h-4" />
            Pillar 4 of 5
          </div>
          <h3 className="text-2xl font-bold text-foreground">What's Your Injury History?</h3>
          <p className="text-muted-foreground">{PILLARS[3].description}</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">
                Arm/Shoulder Injury History
              </Label>
              <Select
                value={auditData.injuryHistory}
                onValueChange={(value) => setAuditData({ ...auditData, injuryHistory: value })}
              >
                <SelectTrigger className="bg-secondary border-border text-foreground h-14 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="none" className="text-foreground">No injuries</SelectItem>
                  <SelectItem value="minor" className="text-foreground">Minor (missed &lt;2 weeks)</SelectItem>
                  <SelectItem value="moderate" className="text-foreground">Moderate (missed 2-8 weeks)</SelectItem>
                  <SelectItem value="significant" className="text-foreground">Significant (surgery/long-term)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/30">
              <p className="text-sm text-muted-foreground">
                <span className="text-green-500 font-semibold">Did You Know?</span> 35% of college pitchers 
                experience arm injuries. The VAULT™ Longevity protocols reduce this risk by up to 60%.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    // Step 5: Transfer
    {
      title: "TRANSFER",
      pillar: PILLARS[4],
      content: (
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 ${PILLARS[4].bgColor} border ${PILLARS[4].borderColor} ${PILLARS[4].color} text-sm font-semibold uppercase tracking-wider`}>
            <TrendingUp className="w-4 h-4" />
            Pillar 5 of 5
          </div>
          <h3 className="text-2xl font-bold text-foreground">Training Frequency</h3>
          <p className="text-muted-foreground">{PILLARS[4].description}</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">
                How many days/week do you train?
              </Label>
              <Select
                value={auditData.trainingFrequency}
                onValueChange={(value) => setAuditData({ ...auditData, trainingFrequency: value })}
              >
                <SelectTrigger className="bg-secondary border-border text-foreground h-14 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="1-2" className="text-foreground">1-2 days/week</SelectItem>
                  <SelectItem value="3-4" className="text-foreground">3-4 days/week</SelectItem>
                  <SelectItem value="5-6" className="text-foreground">5-6 days/week</SelectItem>
                  <SelectItem value="7+" className="text-foreground">7+ days/week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-purple-500/10 border border-purple-500/30">
              <p className="text-sm text-muted-foreground">
                <span className="text-purple-500 font-semibold">The Gap:</span> Most athletes train hard 
                but only 12% see their gains transfer to games. The VAULT™ Transfer system fixes this.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return auditData.exitVelo !== "";
    if (step === 2) return auditData.sixtyYard !== "";
    if (step === 3) return auditData.position !== "";
    if (step === 4) return auditData.injuryHistory !== "";
    if (step === 5) return auditData.trainingFrequency !== "";
    return true;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "ELITE": return "text-green-500 border-green-500/50 bg-green-500/10";
      case "ADVANCED": return "text-blue-500 border-blue-500/50 bg-blue-500/10";
      case "DEVELOPING": return "text-orange-500 border-orange-500/50 bg-orange-500/10";
      default: return "text-muted-foreground border-border bg-muted";
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Progress Bar */}
          {!showResults && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Step {step + 1} of {steps.length}</span>
                <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Content */}
          <AnimatePresence mode="wait">
            {showResults && scoreResult ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Score Header */}
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center gap-2 px-6 py-3 border text-lg font-bold uppercase tracking-wider ${getTierColor(scoreResult.tier)}`}>
                    <CheckCircle2 className="w-5 h-5" />
                    {scoreResult.tier} PROSPECT
                  </div>
                  <div className="text-7xl font-bold text-foreground">
                    {scoreResult.overall}
                  </div>
                  <p className="text-muted-foreground">Your VAULT™ Baseline Score</p>
                </div>

                {/* Pillar Breakdown */}
                <div className="bg-card border border-border p-6 space-y-4">
                  <h4 className="font-bold text-foreground uppercase tracking-wider">Pillar Breakdown</h4>
                  <div className="space-y-3">
                    {[
                      { name: "Velocity", score: scoreResult.velocity, color: "bg-red-500" },
                      { name: "Athleticism", score: scoreResult.athleticism, color: "bg-orange-500" },
                      { name: "Utility", score: scoreResult.utility, color: "bg-blue-500" },
                      { name: "Longevity", score: scoreResult.longevity, color: "bg-green-500" },
                      { name: "Transfer", score: scoreResult.transfer, color: "bg-purple-500" },
                    ].map((pillar) => (
                      <div key={pillar.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground font-medium">{pillar.name}</span>
                          <span className="text-muted-foreground">{pillar.score}/100</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${pillar.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pillar.score}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insights */}
                <div className="bg-card border border-border p-6 space-y-4">
                  <h4 className="font-bold text-foreground uppercase tracking-wider">Key Insights</h4>
                  <ul className="space-y-2">
                    {scoreResult.insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="bg-primary/10 border border-primary/30 p-6 space-y-4">
                  <h4 className="font-bold text-foreground text-xl">Ready to Level Up?</h4>
                  <p className="text-muted-foreground">
                    Get the complete roadmap to 95+ MPH exit velo and sub-6.8 60s with the 
                    VAULT™ Performance Blueprint.
                  </p>
                  <Button 
                    variant="vault" 
                    size="lg" 
                    className="w-full"
                    onClick={() => navigate("/performance-blueprint")}
                  >
                    Get Your Blueprint - $47
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-border p-8"
              >
                {steps[step].content}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {!showResults && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button
                  variant="vault"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="vault"
                  onClick={handleCalculateScore}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  Calculate My Score
                  <Zap className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Lead Capture Modal */}
      <Dialog open={showLeadCapture} onOpenChange={setShowLeadCapture}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-bold">
              Your Score is Ready! 🎯
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your info below to see your personalized VAULT™ Baseline Score and 
              receive your custom improvement roadmap.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLeadSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Full Name</Label>
              <Input
                id="name"
                required
                placeholder="John Smith"
                value={leadData.name}
                onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="john@email.com"
                value={leadData.email}
                onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <Button type="submit" variant="vault" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  Show My Score
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              We respect your privacy. No spam, ever.
            </p>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
};

export default BaselineAudit;
