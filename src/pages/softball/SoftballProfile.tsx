import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, Loader2, Target, Zap, Shield, TrendingUp, BookOpen, Calendar, AlertTriangle } from "lucide-react";
import { useSoftballProfile } from "@/hooks/useSoftballProfile";
import { getFormatVisibility } from "@/lib/softball/rules";

interface SkillScore {
  skill_category: string;
  current_score: number;
  trend: string;
  sessions_count: number;
}

const SoftballProfile = () => {
  const navigate = useNavigate();
  const { user, profile, format, ageGroup, visibility, ageRules, loading } = useSoftballProfile();
  const [skills, setSkills] = useState<SkillScore[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      const skillsRes = await (supabase as any).from("skill_progression").select("*").eq("user_id", user.id).eq("sport_type", "softball");
      const recsRes = await (supabase as any).from("development_recommendations").select("*").eq("athlete_user_id", user.id).eq("sport_type", "softball").eq("status", "pending").order("created_at", { ascending: false }).limit(5);
      if (skillsRes.data) setSkills(skillsRes.data as SkillScore[]);
      if (recsRes.data) setRecommendations(recsRes.data);
      setDataLoading(false);
    };
    loadData();
  }, [user]);

  const skillIcons: Record<string, React.ReactNode> = {
    pitching: <Target className="w-4 h-4" />,
    hitting: <Zap className="w-4 h-4" />,
    fielding: <Shield className="w-4 h-4" />,
    baserunning: <TrendingUp className="w-4 h-4" />,
  };

  // Filter skill categories shown based on format
  const visibleSkillCategories = skills.filter(s => {
    // Slowpitch doesn't have a pitching skill track (it's an arc delivery, not a skill to develop)
    if (format === "slowpitch" && s.skill_category === "pitching") return false;
    // Slowpitch doesn't track baserunning (no stealing)
    if (format === "slowpitch" && s.skill_category === "baserunning" && !visibility.stealingDrills) return false;
    return true;
  });

  // Build quick actions based on format
  const quickActions = [
    { label: "BOOK LESSON", icon: Calendar, path: "/softball/lessons/booking" },
    { label: "COURSES", icon: BookOpen, path: "/softball/courses" },
    { label: "ANALYTICS", icon: TrendingUp, path: "/softball/analytics" },
    ...(visibility.windmillMechanics
      ? [{ label: "PITCHING", icon: Target, path: "/softball/pitching" }]
      : []),
    { label: "HITTING", icon: Zap, path: "/softball/hitting" },
    { label: "FIELDING", icon: Shield, path: "/softball/fielding" },
  ];

  if (loading || dataLoading) {
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

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-xs font-display tracking-[0.3em] text-muted-foreground mb-2">SOFTBALL PROFILE</p>
            <h1 className="text-3xl md:text-4xl font-display tracking-tight text-foreground">
              {profile?.display_name || "Athlete"}'s Development
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="text-xs font-display">🥎 Softball</Badge>
              <Badge variant="outline" className="text-xs font-display capitalize">{format}</Badge>
              {ageGroup && <Badge variant="outline" className="text-xs font-display">{ageGroup} · {ageRules.pitchingDistance}</Badge>}
              {profile?.position && <Badge variant="outline" className="text-xs font-display">{profile.position}</Badge>}
            </div>
          </motion.div>

          {/* Age group context alerts */}
          {ageGroup === "8U" && (
            <Card className="border-border mb-6">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-display text-sm text-foreground">Coach Pitch Division</h4>
                  <p className="text-xs text-muted-foreground">Windmill pitching drills are not shown for 8U athletes. Focus is on fundamentals: throwing, catching, hitting, and fielding.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skill Scores */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {visibleSkillCategories.length > 0 ? visibleSkillCategories.map((skill, i) => (
              <motion.div key={skill.skill_category} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {skillIcons[skill.skill_category] || <Target className="w-4 h-4" />}
                        <span className="font-display text-sm tracking-wider uppercase text-foreground">{skill.skill_category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-display text-foreground">{skill.current_score}</span>
                        <span className="text-xs text-muted-foreground">/100</span>
                        {skill.trend === "improving" && <TrendingUp className="w-3.5 h-3.5 text-primary" />}
                      </div>
                    </div>
                    <Progress value={skill.current_score} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">{skill.sessions_count} sessions tracked</p>
                  </CardContent>
                </Card>
              </motion.div>
            )) : (
              <Card className="border-border md:col-span-2">
                <CardContent className="py-12 text-center">
                  <Target className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No skill scores yet. Complete a lesson or assessment to start tracking.</p>
                  <Button size="sm" className="mt-4 font-display tracking-wider text-xs" onClick={() => navigate("/softball/lessons/booking")}>
                    <Calendar className="w-3 h-3 mr-1" /> BOOK A LESSON
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommendations */}
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="font-display text-lg tracking-wider">RECOMMENDED FOR YOU</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={rec.recommendation_type === "course" ? "default" : "secondary"} className="text-[10px]">
                            {rec.recommendation_type === "course" ? "COURSE" : "DRILL"}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] capitalize">{rec.skill_category}</Badge>
                        </div>
                        <p className="text-sm text-foreground">{rec.recommendation_reason}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Recommendations will appear as you complete lessons and assessments.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map(action => (
              <Button key={action.label} variant="outline" className="h-auto py-4 flex flex-col gap-2 font-display tracking-wider text-xs" onClick={() => navigate(action.path)}>
                <action.icon className="w-5 h-5" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default SoftballProfile;
