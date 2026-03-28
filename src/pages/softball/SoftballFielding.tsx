import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { softballDrillLibrary } from "@/lib/softball/drills";
import { softballPositions } from "@/lib/softball/positions";
import { useSoftballProfile } from "@/hooks/useSoftballProfile";
import { isDrillVisibleForFormat, isDrillVisibleForAge, applySoftballTerminology } from "@/lib/softball/rules";

const SoftballFielding = () => {
  const navigate = useNavigate();
  const { format, ageGroup, visibility, loading } = useSoftballProfile();

  const fieldingPositions = softballPositions.filter(p => p.id !== "hitting");
  const fieldingDrills = softballDrillLibrary
    .filter(d => d.category === "fielding")
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
              POSITION-SPECIFIC FIELDING
            </h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xl">
              {applySoftballTerminology("Elite defensive development for every position — infield, outfield, catching, and pitchers fielding their position.")}
            </p>
          </motion.div>

          <div className="flex gap-2 mb-6">
            <Badge variant="outline" className="text-[10px] font-display capitalize">{format}</Badge>
            {ageGroup && <Badge variant="secondary" className="text-[10px] font-display">{ageGroup}</Badge>}
          </div>

          {/* Slowpitch-specific: deep outfield positioning callout */}
          {visibility.deepOutfieldPositioning && (
            <Card className="border-border mb-6">
              <CardContent className="p-4">
                <h4 className="font-display text-sm text-foreground mb-1">DEEP OUTFIELD POSITIONING</h4>
                <p className="text-xs text-muted-foreground">
                  Slowpitch outfielders play deeper than fastpitch. Positioning starts at the fence line and adjusts forward based on the batter. Focus on reading the arc off the bat.
                </p>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="positions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="positions" className="font-display text-xs tracking-wider">POSITIONS</TabsTrigger>
              <TabsTrigger value="drills" className="font-display text-xs tracking-wider">DRILLS</TabsTrigger>
              <TabsTrigger value="course" className="font-display text-xs tracking-wider">COURSE</TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {fieldingPositions.map((pos, i) => {
                  const Icon = pos.icon;
                  return (
                    <motion.div key={pos.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="border-border hover:border-foreground/20 transition-colors cursor-pointer"
                        onClick={() => navigate(`/course/${pos.courseId}`)}>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: `${pos.color}20` }}>
                              <Icon className="w-5 h-5" style={{ color: pos.color }} />
                            </div>
                            <div>
                              <h3 className="font-display text-foreground">{pos.name}</h3>
                              <p className="text-xs text-muted-foreground">{applySoftballTerminology(pos.description)}</p>
                            </div>
                          </div>
                          {pos.hasNewContent && (
                            <Badge className="text-[10px] font-display bg-primary text-primary-foreground">NEW CONTENT</Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="drills" className="mt-6">
              <div className="space-y-3">
                {fieldingDrills.map((drill, i) => (
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

            <TabsContent value="course" className="mt-6">
              <Card className="border-border cursor-pointer hover:border-foreground/20 transition-colors" onClick={() => navigate("/course/softball-fielding-system")}>
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-display text-lg text-foreground mb-2">SOFTBALL FIELDING SYSTEM</h3>
                  <p className="text-sm text-muted-foreground mb-4">6-week course covering infield play, outfield routes, catching techniques, and throwing mechanics.</p>
                  <Button className="font-display tracking-wider text-xs">
                    VIEW COURSE <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default SoftballFielding;
