import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Target, Heart, Zap, Shield, Users } from "lucide-react";

const YouthPathway = () => {
  const priorities = [
    {
      icon: Users,
      title: "Athletic Development Over Specialization",
      description: "Build a broad athletic base before focusing on position-specific skills"
    },
    {
      icon: Target,
      title: "Basic Skill Acquisition",
      description: "Master fundamental movements and baseball mechanics"
    },
    {
      icon: Zap,
      title: "Safe Velocity Introduction",
      description: "Expose athletes to intent concepts without max output demands"
    }
  ];

  const avoidItems = [
    "Early specialization in one position",
    "Excessive workload and overtraining",
    "Outcome obsession over process",
    "Year-round competitive schedules"
  ];

  const pillarFocus = [
    {
      pillar: "Velocity",
      focus: "Intent Exposure",
      description: "Introduce the concept of effort and intent without demanding max output. Focus on efficient movement patterns.",
      color: "from-red-500 to-orange-500"
    },
    {
      pillar: "Athleticism",
      focus: "Movement Foundation",
      description: "Prioritize coordination, balance, and multi-sport activities. Build the athletic base that baseball skills will later build upon.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      pillar: "Utility",
      focus: "Position Sampling",
      description: "Expose athletes to multiple positions. Avoid early labels. Let them discover their strengths naturally.",
      color: "from-green-500 to-emerald-500"
    },
    {
      pillar: "Longevity",
      focus: "Load Management",
      description: "Strict pitch counts and throw limits. Emphasize rest and recovery. Protect developing arms and bodies.",
      color: "from-purple-500 to-pink-500"
    },
    {
      pillar: "Transfer",
      focus: "Game Play",
      description: "Prioritize playing actual games over isolated drills. Let competition be the teacher.",
      color: "from-amber-500 to-yellow-500"
    }
  ];

  const weeklyStructure = [
    { day: "Day 1", focus: "Movement & Coordination Games", type: "athleticism" },
    { day: "Day 2", focus: "Skill Introduction (Low Volume)", type: "skill" },
    { day: "Day 3", focus: "Active Recovery / Free Play", type: "recovery" },
    { day: "Day 4", focus: "Game Situations Practice", type: "transfer" },
    { day: "Day 5", focus: "Competition / Scrimmage", type: "game" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              Ages 8-12
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bebas text-foreground mb-6">
              YOUTH <span className="text-primary">PATHWAY</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Building the athletic foundation for long-term baseball success through 
              movement quality, coordination, and confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Primary Focus */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bebas text-center mb-12">PRIMARY FOCUS AREAS</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Target, label: "Movement Quality", desc: "Fundamental movement patterns" },
              { icon: Zap, label: "Coordination", desc: "Hand-eye and body awareness" },
              { icon: Shield, label: "Intent Exposure", desc: "Learning effort without max output" },
              { icon: Heart, label: "Enjoyment", desc: "Building love for the game" }
            ].map((item, i) => (
              <Card key={i} className="bg-background/50 border-border/50 text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pillar Application */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bebas text-center mb-4">VAULT™ PILLARS FOR YOUTH</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            How each pillar is adapted for youth development
          </p>
          <div className="space-y-4 max-w-4xl mx-auto">
            {pillarFocus.map((item, i) => (
              <Card key={i} className="bg-card/50 border-border/50 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className={`w-full md:w-48 bg-gradient-to-br ${item.color} p-6 flex items-center justify-center`}>
                    <div className="text-center text-white">
                      <div className="text-2xl font-bebas">{item.pillar}</div>
                      <div className="text-sm opacity-90">{item.focus}</div>
                    </div>
                  </div>
                  <CardContent className="flex-1 p-6">
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Priorities & Avoid */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Priorities */}
            <Card className="bg-background border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="w-5 h-5" />
                  Development Priorities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {priorities.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Avoid */}
            <Card className="bg-background border-red-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <XCircle className="w-5 h-5" />
                  What to Avoid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {avoidItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-500/70 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Weekly Structure */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bebas text-center mb-4">SAMPLE WEEKLY STRUCTURE</h2>
          <p className="text-center text-muted-foreground mb-12">
            Balanced approach prioritizing play and movement
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {weeklyStructure.map((day, i) => (
              <Card key={i} className="bg-card/50 border-border/50 text-center">
                <CardContent className="pt-6">
                  <div className="text-sm font-medium text-primary mb-2">{day.day}</div>
                  <div className="text-sm text-muted-foreground">{day.focus}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Message */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="text-2xl md:text-3xl font-bebas text-foreground mb-4">
              "AT THIS AGE, THE BEST TRAINING IS PLAYING."
            </blockquote>
            <p className="text-muted-foreground">
              Youth development focuses on building athletes first, baseball players second. 
              The goal is to create a love for the game while establishing movement patterns 
              that will support future performance.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default YouthPathway;
