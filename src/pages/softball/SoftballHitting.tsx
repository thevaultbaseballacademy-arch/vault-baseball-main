import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, BookOpen, Loader2, Shield } from "lucide-react";
import { softballDrillLibrary } from "@/lib/softball/drills";
import { useSoftballProfile } from "@/hooks/useSoftballProfile";
import { isDrillVisibleForFormat, isDrillVisibleForAge, applySoftballTerminology } from "@/lib/softball/rules";

const allHittingStyles = [
  {
    name: "Rotational Power Hitting",
    description: "Full hip rotation with upward barrel path for driving the ball with backspin and authority.",
    focus: ["Exit Velocity", "Bat Speed", "Launch Angle"],
    formatTag: "all",
  },
  {
    name: "Slap Hitting",
    description: "Left-side contact hitting while moving toward first base. Soft slap for placement, power slap for gaps, drag bunt.",
    focus: ["Speed", "Placement", "Contact Rate"],
    formatTag: "fastpitch",
  },
  {
    name: "Slowpitch Power Hitting",
    description: "Timing high-arc pitches with maximum bat speed and an uppercut barrel path for distance.",
    focus: ["Exit Velocity", "Timing", "Home Runs"],
    formatTag: "slowpitch",
  },
];

const SoftballHitting = () => {
  const navigate = useNavigate();
  const { format, ageGroup, visibility, ageRules, loading } = useSoftballProfile();

  // Filter hitting styles by format and age
  const hittingStyles = allHittingStyles.filter(s => {
    if (s.formatTag === "fastpitch" && format === "slowpitch") return false;
    if (s.formatTag === "slowpitch" && format === "fastpitch") return false;
    // Slap hitting requires age 14U+
    if (s.name === "Slap Hitting" && !visibility.slapHitting) return false;
    return true;
  });

  // Filter drills
  const hittingDrills = softballDrillLibrary
    .filter(d => d.category === "hitting")
    .filter(d => isDrillVisibleForFormat(d.id, format))
    .filter(d => isDrillVisibleForAge(d.ageRange, ageGroup));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/softball")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Softball
          </Button>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <p className="text-xs font-display tracking-[0.3em] text-muted-foreground mb-2">VAULT SOFTBALL</p>
            <h1 className="text-3xl md:text-4xl font-display tracking-tight text-foreground">
              SOFTBALL HITTING
            </h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xl">
              {format === "slowpitch"
                ? "Power hitting, arc timing, and bat certification — built for slowpitch hitters."
                : "Slap hitting, rotational power, and timing adjustments — complete fastpitch hitting development."}
            </p>
          </motion.div>

          <div className="flex gap-2 mb-6">
            <Badge variant="outline" className="text-[10px] font-display capitalize">{format}</Badge>
            {ageGroup && <Badge variant="secondary" className="text-[10px] font-display">{ageGroup}</Badge>}
          </div>

          <Tabs defaultValue="styles" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="styles" className="font-display text-xs tracking-wider">HITTING STYLES</TabsTrigger>
              <TabsTrigger value="drills" className="font-display text-xs tracking-wider">DRILLS</TabsTrigger>
              <TabsTrigger value="extras" className="font-display text-xs tracking-wider">
                {format === "slowpitch" ? "BAT GUIDE" : "COURSE"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="styles" className="mt-6">
              <div className="space-y-4">
                {hittingStyles.map((style, i) => (
                  <motion.div key={style.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-border">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-display text-foreground">{style.name}</h3>
                          <Badge variant="outline" className="text-[10px] font-display capitalize">{style.formatTag === "all" ? format : style.formatTag}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{style.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {style.focus.map(f => (
                            <Badge key={f} variant="secondary" className="text-[10px] font-display tracking-wider">{f}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="drills" className="mt-6">
              <div className="space-y-3">
                {hittingDrills.map((drill, i) => (
                  <motion.div key={drill.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-display text-sm text-foreground">{applySoftballTerminology(drill.name)}</h4>
                          <Badge variant="secondary" className="text-[10px]">{drill.difficulty}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{applySoftballTerminology(drill.description)}</p>
                        <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
                          <span>⏱ {drill.duration}</span>
                          <span>👤 {drill.ageRange}</span>
                          <Badge variant="outline" className="text-[10px]">{drill.subcategory}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="extras" className="mt-6">
              {visibility.legalBatCertification ? (
                <Card className="border-border">
                  <CardContent className="p-6">
                    <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-display text-lg text-foreground text-center mb-2">LEGAL BAT CERTIFICATION GUIDE</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Understand ASA, USSSA, and NSA bat certification stamps and which bats are legal for your league.
                    </p>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-foreground">ASA/USA Softball</span>
                        <span>Most recreational and sanctioned leagues</span>
                      </div>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-foreground">USSSA</span>
                        <span>Travel ball and competitive leagues</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground">NSA</span>
                        <span>Select tournament play</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border cursor-pointer hover:border-foreground/20 transition-colors" onClick={() => navigate("/course/softball-hitting-system")}>
                  <CardContent className="p-6 text-center">
                    <BookOpen className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-display text-lg text-foreground mb-2">SOFTBALL HITTING SYSTEM</h3>
                    <p className="text-sm text-muted-foreground mb-4">8-week structured course covering swing mechanics, slap hitting, power development, and timing adjustments.</p>
                    <Button className="font-display tracking-wider text-xs">
                      VIEW COURSE <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default SoftballHitting;
