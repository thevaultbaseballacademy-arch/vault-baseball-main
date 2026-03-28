import { motion } from "framer-motion";
import { Clock, Zap, Dumbbell, Shuffle, Heart, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import NewThisWeekBadge from "@/components/ui/NewThisWeekBadge";
import courseHitting from "@/assets/course-hitting.jpg";
import coursePitching from "@/assets/course-pitching.jpg";
import courseFielding from "@/assets/course-fielding.jpg";

const trainingSystems = [
  {
    id: "velocity",
    pillar: "V",
    title: "Velocity System",
    description: "Increase bat speed, exit velocity, and throwing power through intent-based training and efficient energy transfer.",
    image: courseHitting,
    duration: "12 Weeks",
    modules: 6,
    icon: Zap,
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-500/10",
    textColor: "text-red-500",
    metrics: ["Exit Velocity", "Bat Speed", "Throwing Velo", "Rotational Power"],
    isNew: true, // Mark as new for demo
  },
  {
    id: "athleticism",
    pillar: "A",
    title: "Athleticism Program",
    description: "Build fast, strong, resilient athletes with comprehensive strength, speed, and movement training.",
    image: coursePitching,
    duration: "12 Weeks",
    modules: 8,
    icon: Dumbbell,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-500",
    metrics: ["Sprint Times", "Strength Ratios", "Jump Metrics", "Agility"],
    isNew: false,
  },
  {
    id: "utility",
    pillar: "U",
    title: "Utility Development",
    description: "Develop positional versatility, baseball IQ, and adaptable skills that transfer across roles.",
    image: courseFielding,
    duration: "8 Weeks",
    modules: 5,
    icon: Shuffle,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
    metrics: ["Positional Flex", "Skill Transfer", "Baseball IQ", "Adaptability"],
    isNew: false,
  },
];

const additionalSystems = [
  {
    pillar: "L",
    title: "Longevity & Arm Care",
    description: "Arm care systems, workload management, and recovery protocols to keep athletes available.",
    subtext: "Weekly updates to drill libraries, arm care protocols, and game-transfer tracking. Part of the core Vault OS.",
    icon: Heart,
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-500",
    status: "V1 Protocols Active • Full Module Launch Q2 2026",
  },
  {
    pillar: "T",
    title: "Transfer Training",
    description: "Practice design that ensures training adaptations appear in competition.",
    subtext: "Weekly updates to drill libraries, arm care protocols, and game-transfer tracking. Part of the core Vault OS.",
    icon: Target,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-500",
    status: "V1 Protocols Active • Full Module Launch Q2 2026",
  },
];

const SystemCard = ({ system, index }: { system: typeof trainingSystems[0]; index: number }) => {
  const Icon = system.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-foreground/20 transition-all duration-500 hover:shadow-xl"
    >
      {/* New This Week Badge */}
      {system.isNew && (
        <NewThisWeekBadge variant="floating" forceShow={true} size="sm" />
      )}

      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={system.image}
          alt={system.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        
        {/* Pillar Badge */}
        <div className="absolute top-4 left-4">
          <div className={`w-10 h-10 rounded-xl ${system.bgColor} flex items-center justify-center border border-border`}>
            <span className={`text-xl font-display ${system.textColor}`}>{system.pillar}</span>
          </div>
        </div>

        {/* Icon */}
        <div className="absolute bottom-4 right-4">
          <div className="w-12 h-12 rounded-xl bg-background/90 backdrop-blur-sm flex items-center justify-center border border-border">
            <Icon className={`w-6 h-6 ${system.textColor}`} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {system.duration}
          </span>
          <span>{system.modules} Modules</span>
        </div>

        <h3 className="text-xl font-display text-foreground mb-2 group-hover:text-accent transition-colors">
          {system.title}
        </h3>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {system.description}
        </p>

        {/* Metrics */}
        <div className="flex flex-wrap gap-2 mb-6">
          {system.metrics.map((metric) => (
            <span 
              key={metric}
              className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground"
            >
              {metric}
            </span>
          ))}
        </div>

        <Button variant="default" className="w-full group/btn">
          Start Program
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
};

const Courses = () => {
  return (
    <section id="courses" className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-medium uppercase tracking-widest mb-4 block">
            Training Systems
          </span>
          <h2 className="text-4xl md:text-6xl font-display text-foreground mb-4">
            PILLAR-BASED PROGRAMS
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Each program aligns with the VAULT™ framework pillars, ensuring systematic development 
            that transfers to game performance.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainingSystems.map((system, index) => (
            <SystemCard key={system.id} system={system} index={index} />
          ))}
        </div>

        {/* Additional Systems */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid md:grid-cols-2 gap-6"
        >
          {additionalSystems.map((system) => {
            const Icon = system.icon;
            return (
              <div 
                key={system.pillar}
                className="p-6 rounded-2xl border border-border bg-card hover:border-foreground/20 transition-colors"
              >
                <div className="flex items-center gap-6 mb-3">
                  <div className={`w-14 h-14 rounded-xl ${system.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-7 h-7 ${system.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-lg font-display ${system.textColor}`}>{system.pillar}</span>
                      <h3 className="font-display text-lg text-foreground">{system.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{system.description}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-xs text-green-400 font-medium whitespace-nowrap">
                    {system.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground/80 italic pl-20">
                  {system.subtext}
                </p>
              </div>
            );
          })}
        </motion.div>

        {/* Softball CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 rounded-2xl border border-border bg-card text-center"
        >
          <span className="text-3xl mb-2 block">🥎</span>
          <h3 className="font-display text-xl text-foreground mb-2">SOFTBALL ATHLETE?</h3>
          <p className="text-muted-foreground text-sm mb-4 max-w-lg mx-auto">
            We now offer fastpitch-specific development systems — pitching, hitting, fielding, and baserunning programs built for softball athletes.
          </p>
          <Link to="/softball">
            <Button variant="outline">
              Explore Softball Development
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link to="/courses">
            <Button variant="outline" size="lg">
              View All Training Systems
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Courses;
