import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Target, TrendingUp, Dumbbell, BarChart3, Clock, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const AcademyPathway = () => {
  const priorities = [
    {
      icon: Dumbbell,
      title: "Structured Strength Training",
      description: "Progressive resistance training to build power and durability"
    },
    {
      icon: BarChart3,
      title: "Measurable Performance Gains",
      description: "Track velocity, strength, and athletic metrics consistently"
    },
    {
      icon: Target,
      title: "Clear Role Development",
      description: "Begin identifying and developing primary position strengths"
    }
  ];

  const avoidItems = [
    "Ignoring recovery and rest protocols",
    "Volume without intent or purpose",
    "Short-term performance at long-term cost",
    "Skipping athletic development for skill work"
  ];

  const pillarFocus = [
    {
      pillar: "Velocity",
      focus: "Output Training",
      description: "Structured velocity development with intent-based training. Track metrics, push limits intelligently, and develop efficient power transfer patterns.",
      color: "from-red-500 to-orange-500",
      metrics: ["Exit Velocity", "Pitch Velocity", "Sprint Speed"]
    },
    {
      pillar: "Athleticism",
      focus: "Strength & Power",
      description: "Progressive strength training program. Focus on compound movements, explosive power development, and sport-specific conditioning.",
      color: "from-blue-500 to-cyan-500",
      metrics: ["Squat/Deadlift", "Vertical Jump", "Broad Jump"]
    },
    {
      pillar: "Utility",
      focus: "Skill Refinement",
      description: "Develop primary position while maintaining secondary options. Build baseball IQ and situational awareness under pressure.",
      color: "from-green-500 to-emerald-500",
      metrics: ["Position Versatility", "Situational Success", "Game IQ"]
    },
    {
      pillar: "Longevity",
      focus: "Durability Systems",
      description: "Comprehensive arm care, workload management, and recovery protocols. Availability is the most important ability.",
      color: "from-purple-500 to-pink-500",
      metrics: ["Throw Volume", "Recovery Score", "Availability Rate"]
    },
    {
      pillar: "Transfer",
      focus: "Competition Execution",
      description: "Practice design that mirrors game situations. Develop decision-making under pressure and competitive mental skills.",
      color: "from-amber-500 to-yellow-500",
      metrics: ["Practice-Game Carryover", "Clutch Performance", "Consistency"]
    }
  ];

  const weeklyStructure = [
    { day: "Monday", focus: "Velocity / Output", type: "high", description: "Max intent throwing, hitting for power" },
    { day: "Tuesday", focus: "Strength Training", type: "high", description: "Lower body emphasis, compound lifts" },
    { day: "Wednesday", focus: "Skill & Transfer", type: "medium", description: "Game situations, decision training" },
    { day: "Thursday", focus: "Strength Training", type: "high", description: "Upper body emphasis, power work" },
    { day: "Friday", focus: "Competition Prep", type: "medium", description: "Light work, mental preparation" },
    { day: "Weekend", focus: "Competition / Recovery", type: "varies", description: "Games or active recovery" }
  ];

  const benchmarks = [
    { category: "Exit Velocity", freshman: "75+ mph", sophomore: "82+ mph", junior: "88+ mph", senior: "92+ mph" },
    { category: "Squat (1RM)", freshman: "1.2x BW", sophomore: "1.5x BW", junior: "1.75x BW", senior: "2x BW" },
    { category: "60-Yard Dash", freshman: "7.8s", sophomore: "7.4s", junior: "7.0s", senior: "6.7s" },
    { category: "Vertical Jump", freshman: "22\"", sophomore: "26\"", junior: "28\"", senior: "30\"" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-secondary/20 via-background to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-secondary/20 text-secondary-foreground border-secondary/30">
              Ages 13-18
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bebas text-foreground mb-6">
              ACADEMY <span className="text-primary">PATHWAY</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Developing high-performance athletes through structured training, 
              measurable progress, and sustainable development practices.
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
              { icon: Dumbbell, label: "Strength & Power", desc: "Progressive resistance training" },
              { icon: TrendingUp, label: "Output Metrics", desc: "Measurable performance gains" },
              { icon: Target, label: "Skill Refinement", desc: "Position-specific development" },
              { icon: Clock, label: "Durability", desc: "Long-term availability focus" }
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
          <h2 className="text-3xl font-bebas text-center mb-4">VAULT™ PILLARS FOR ACADEMY</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Advanced application of each pillar with specific metrics and outcomes
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
                    <p className="text-muted-foreground mb-4">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.metrics.map((metric, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Benchmarks */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bebas text-center mb-4">PERFORMANCE BENCHMARKS</h2>
          <p className="text-center text-muted-foreground mb-12">
            Age-appropriate targets for academy athletes
          </p>
          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-bebas text-lg">Metric</th>
                  <th className="text-center py-4 px-4 font-bebas text-lg">Freshman</th>
                  <th className="text-center py-4 px-4 font-bebas text-lg">Sophomore</th>
                  <th className="text-center py-4 px-4 font-bebas text-lg">Junior</th>
                  <th className="text-center py-4 px-4 font-bebas text-lg">Senior</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-4 px-4 font-medium text-foreground">{row.category}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{row.freshman}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{row.sophomore}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{row.junior}</td>
                    <td className="py-4 px-4 text-center text-primary font-medium">{row.senior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Priorities & Avoid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Priorities */}
            <Card className="bg-card/50 border-green-500/30">
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
            <Card className="bg-card/50 border-red-500/30">
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
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bebas text-center mb-4">WEEKLY TRAINING STRUCTURE</h2>
          <p className="text-center text-muted-foreground mb-12">
            Balanced approach with structured intensity management
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {weeklyStructure.map((day, i) => (
              <Card key={i} className="bg-background/50 border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bebas text-lg text-primary">{day.day}</span>
                    <Badge 
                      variant="outline" 
                      className={
                        day.type === "high" 
                          ? "border-red-500/50 text-red-500" 
                          : day.type === "medium"
                          ? "border-yellow-500/50 text-yellow-500"
                          : "border-muted-foreground/50"
                      }
                    >
                      {day.type === "high" ? "High Intensity" : day.type === "medium" ? "Medium" : "Variable"}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-foreground mb-1">{day.focus}</h4>
                  <p className="text-sm text-muted-foreground">{day.description}</p>
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
              "TRAIN HARD. TRAIN SMART. STAY AVAILABLE."
            </blockquote>
            <p className="text-muted-foreground">
              Academy development balances aggressive performance gains with long-term 
              durability. Every decision passes through the lens of sustainable progress 
              and game-ready execution.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AcademyPathway;
