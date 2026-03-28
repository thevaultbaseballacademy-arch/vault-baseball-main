import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Play, X, Star, TrendingUp, Award, GraduationCap, 
  Target, Zap, Timer, Users, CheckCircle2, ArrowRight, Info
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// All names, schools, and results are illustrative composites — not real individuals
const videoTestimonials = [
  {
    id: 1,
    name: "J.M.",
    role: "D1 Commit, Southland University",
    thumbnail: "https://cdn.marblism.com/1NxauWxFGtn.webp",
    metric: "+9 MPH",
    metricLabel: "Exit Velo",
    quote: "After 8 weeks on the Velocity System, my exit velo jumped from 82 to 91 mph.",
    featured: true,
  },
  {
    id: 2,
    name: "M.W.",
    role: "D1 Commit, Bayou State University",
    thumbnail: "https://cdn.marblism.com/HdsE4Gvi9B7.webp",
    metric: "+7 MPH",
    metricLabel: "Fastball",
    quote: "Touched 94 for the first time in my life after the arm care program.",
    featured: true,
  },
  {
    id: 3,
    name: "R.C.",
    role: "JUCO Commit, Central Plains CC",
    thumbnail: "https://cdn.marblism.com/e9fzmmT2o9Q.webp",
    metric: "1.93s",
    metricLabel: "Pop Time",
    quote: "Dropped my pop time from 2.08 to 1.93. Got my first college offers.",
    featured: false,
  },
  {
    id: 4,
    name: "T.J.",
    role: "Senior, Lakeside HS",
    thumbnail: "https://cdn.marblism.com/nwf4_GebeVT.webp",
    metric: "+5 MPH",
    metricLabel: "Velo Gain",
    quote: "The systematic approach changed everything. Finally throwing in the mid-80s.",
    featured: false,
  },
  {
    id: 5,
    name: "Coach M.P.",
    role: "Head Coach, Southwest Titans 16U",
    thumbnail: "https://cdn.marblism.com/7oEYJwzA1AH.webp",
    metric: "22",
    metricLabel: "Athletes",
    quote: "We implemented Vault across our entire organization. Parents love seeing the data.",
    featured: true,
  },
  {
    id: 6,
    name: "D.C.",
    role: "D2 Commit, West Ridge University",
    thumbnail: "https://cdn.marblism.com/Aq6IXFkCdm5.webp",
    metric: "+11 MPH",
    metricLabel: "Exit Velo",
    quote: "Went from overlooked to recruited after one summer with VAULT.",
    featured: false,
  },
];

// Composite velocity gains — representative of typical athlete outcomes
const velocityGains = [
  { name: "J.M.", before: 82, after: 91, position: "OF", weeks: 8, program: "Velocity System" },
  { name: "M.W.", before: 87, after: 94, position: "RHP", weeks: 12, program: "Arm Care + Velo" },
  { name: "D.C.", before: 78, after: 89, position: "1B", weeks: 10, program: "Velocity System" },
  { name: "T.J.", before: 79, after: 84, position: "RHP", weeks: 6, program: "Accelerator" },
  { name: "R.C.", before: 75, after: 82, position: "C", weeks: 8, program: "Transfer System" },
  { name: "A.K.", before: 83, after: 90, position: "OF", weeks: 14, program: "Remote Training" },
  { name: "C.B.", before: 80, after: 87, position: "SS", weeks: 10, program: "Velocity System" },
  { name: "D.M.", before: 86, after: 92, position: "LHP", weeks: 8, program: "Remote Training" },
];

// Composite commit showcase — fictional schools
const commitShowcase = [
  { name: "J.M.", school: "Southland University", emoji: "⚾", year: "2025", position: "OF", metric: "+9 MPH" },
  { name: "M.W.", school: "Bayou State University", emoji: "🐊", year: "2025", position: "RHP", metric: "+7 MPH" },
  { name: "A.K.", school: "Lone Star State", emoji: "⭐", year: "2026", position: "OF", metric: "+7 MPH" },
  { name: "D.M.", school: "Pecan Valley University", emoji: "🏟️", year: "2025", position: "LHP", metric: "+6 MPH" },
  { name: "B.L.", school: "Midland Christian", emoji: "🐻", year: "2026", position: "C", metric: "1.89 Pop" },
  { name: "J.S.", school: "Prairie View College", emoji: "🦅", year: "2025", position: "SS", metric: "+8 MPH" },
  { name: "E.B.", school: "Ozark Hills University", emoji: "🌲", year: "2026", position: "RHP", metric: "+5 MPH" },
  { name: "N.D.", school: "Gulf Coast University", emoji: "🌊", year: "2025", position: "3B", metric: "+6 MPH" },
];

const WallOfWins = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const navigate = useNavigate();

  const featuredTestimonials = videoTestimonials.filter(t => t.featured);
  const otherTestimonials = videoTestimonials.filter(t => !t.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Athlete Results</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display text-foreground mb-6">
                WALL OF WINS
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Real development. Measurable gains. See the results that 
                VAULT™ training systems deliver for athletes at every level.
              </p>

              {/* Hero Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                {[
                  { value: "100+", label: "College-Level Athletes", icon: GraduationCap },
                  { value: "+6.2", label: "Avg MPH Gain", icon: Zap },
                  { value: "92%", label: "See Results in 8 Wks", icon: TrendingUp },
                  { value: "8 wks", label: "Avg Timeline", icon: Timer },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="text-center p-4 bg-card border border-border rounded-xl"
                  >
                    <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                    <p className="text-2xl md:text-3xl font-display text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Video Testimonials */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-accent text-sm font-medium uppercase tracking-widest mb-4 block">
                Athlete Spotlights
              </span>
              <h2 className="text-4xl md:text-5xl font-display text-foreground">
                HEAR FROM OUR ATHLETES
              </h2>
            </motion.div>

            {/* Featured Testimonials */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {featuredTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/50 hover:shadow-xl transition-all"
                >
                  <div 
                    className="relative aspect-video cursor-pointer overflow-hidden"
                    onClick={() => setActiveVideo(testimonial.thumbnail)}
                  >
                    <img 
                      src={testimonial.thumbnail} 
                      alt={`Athlete testimonial ${testimonial.id}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110">
                        <Play className="w-7 h-7 text-foreground ml-1" fill="currentColor" />
                      </div>
                    </div>

                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                        {testimonial.metric}
                      </div>
                      <span className="text-white/80 text-sm">{testimonial.metricLabel}</span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-white/70">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">"{testimonial.quote}"</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Other Testimonials */}
            <div className="grid md:grid-cols-3 gap-4">
              {otherTestimonials.map((testimonial, index) => (
                <motion.button
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveVideo(testimonial.thumbnail)}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-accent/50 transition-all text-left group"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={testimonial.thumbnail} 
                      alt={`Athlete testimonial ${testimonial.id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                      <Play className="w-6 h-6 text-white" fill="currentColor" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-xs font-bold bg-accent/10 text-accent rounded-full">
                        {testimonial.metric} {testimonial.metricLabel}
                      </span>
                    </div>
                    <p className="font-medium text-foreground truncate">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{testimonial.role}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Velocity Gains Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-accent text-sm font-medium uppercase tracking-widest mb-4 block">
                Measured Progress
              </span>
              <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
                VELOCITY GAINS
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Before & after results from athletes who completed VAULT™ training programs
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {velocityGains.map((athlete, index) => (
                <motion.div
                  key={athlete.name + index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-5 hover:border-accent/50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-foreground">{athlete.name}</p>
                      <p className="text-sm text-muted-foreground">{athlete.position} • {athlete.program}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Before</span>
                      <span className="font-medium text-foreground">{athlete.before} mph</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-muted-foreground/30 rounded-full"
                        style={{ width: `${(athlete.before / 100) * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">After</span>
                      <span className="font-bold text-accent">{athlete.after} mph</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-accent rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(athlete.after / 100) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">{athlete.weeks} weeks</span>
                    <span className="px-2 py-1 text-sm font-bold bg-green-500/10 text-green-600 rounded-full">
                      +{athlete.after - athlete.before} MPH
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Commit Showcase */}
        <section className="py-16 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-accent text-sm font-medium uppercase tracking-widest mb-4 block">
                Next-Level Athletes
              </span>
              <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
                COLLEGE-BOUND SHOWCASE
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Athletes who trained with VAULT™ and earned college baseball commitments
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {commitShowcase.map((commit, index) => (
                <motion.div
                  key={commit.name + index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-5 text-center hover:border-accent/50 hover:shadow-lg transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform">
                    {commit.emoji}
                  </div>
                  
                  <h3 className="font-display text-lg text-foreground mb-1">{commit.name}</h3>
                  <p className="text-sm text-accent font-medium mb-1">{commit.school}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {commit.position} • Class of {commit.year}
                  </p>
                  
                  <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
                    <TrendingUp className="w-3 h-3" />
                    {commit.metric}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Aggregate Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 bg-card border border-border rounded-2xl p-8 max-w-4xl mx-auto"
            >
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-4xl font-display text-foreground mb-1">100+</p>
                  <p className="text-sm text-muted-foreground">College-Level Athletes</p>
                </div>
                <div>
                  <p className="text-4xl font-display text-foreground mb-1">500+</p>
                  <p className="text-sm text-muted-foreground">Athletes Trained</p>
                </div>
                <div>
                  <p className="text-4xl font-display text-foreground mb-1">+6.2</p>
                  <p className="text-sm text-muted-foreground">Avg MPH Gain</p>
                </div>
                <div>
                  <p className="text-4xl font-display text-foreground mb-1">92%</p>
                  <p className="text-sm text-muted-foreground">See Measurable Gains</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-12 text-center"
            >
              <h2 className="text-4xl md:text-5xl font-display text-primary-foreground mb-4">
                READY TO BE NEXT?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                Join the athletes who have transformed their game with VAULT™ training systems.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => navigate("/products/founders-access")}
                  className="gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate("/courses")}
                  className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  View Programs
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-muted/50 border border-border rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Disclaimer:</strong> All athlete names shown are initials or composites to protect privacy. School names are fictional and do not represent any real university or college program. Velocity and performance metrics shown are representative of typical results achieved by athletes who completed VAULT™ training programs with consistent effort. Individual results vary based on age, baseline fitness, training consistency, and other factors. VAULT™ does not guarantee specific performance outcomes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Video Modal */}
      <Dialog open={!!activeVideo} onOpenChange={() => setActiveVideo(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none overflow-hidden">
          <button
            onClick={() => setActiveVideo(null)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          {activeVideo && (
            <div className="w-full">
              <img
                src={activeVideo}
                alt="Athlete spotlight"
                className="w-full h-auto"
              />
              <div className="p-6 bg-gradient-to-t from-black to-transparent absolute bottom-0 left-0 right-0">
                <p className="text-white/80 text-center">
                  Athlete spotlight — click to play
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WallOfWins;
