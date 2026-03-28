import { motion, AnimatePresence } from "framer-motion";
import { Zap, Dumbbell, Shuffle, Heart, Target, ArrowRight, ChevronRight, Activity, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const pillars = [
  {
    letter: "V",
    name: "Velocity",
    icon: Zap,
    color: "bg-velocity",
    textColor: "text-velocity",
    borderColor: "border-velocity",
    hoverBg: "hover:bg-velocity/10",
    description: "Develop athletes capable of producing and transferring force efficiently to maximize performance output.",
    focus: ["Intent-based training", "Ground force utilization", "Rotational sequencing", "Efficient energy transfer"],
    metrics: ["Exit velocity", "Pitch velocity", "Rotational power", "Jump metrics"],
  },
  {
    letter: "A",
    name: "Athleticism",
    icon: Dumbbell,
    color: "bg-athleticism",
    textColor: "text-athleticism",
    borderColor: "border-athleticism",
    hoverBg: "hover:bg-athleticism/10",
    description: "Build fast, strong, resilient athletes who move efficiently and stay durable throughout their career.",
    focus: ["Linear and lateral speed", "Strength development", "Movement efficiency", "Mobility and stability"],
    metrics: ["Sprint times", "Strength ratios", "Movement screens", "Change-of-direction"],
  },
  {
    letter: "U",
    name: "Utility",
    icon: Shuffle,
    color: "bg-utility",
    textColor: "text-utility",
    borderColor: "border-utility",
    hoverBg: "hover:bg-utility/10",
    description: "Develop adaptable athletes capable of transferring skills across roles and game situations.",
    focus: ["Positional versatility", "Skill transfer", "Baseball IQ", "Efficient practice habits"],
    metrics: ["Skill consistency", "Positional adaptability", "Variable execution"],
  },
  {
    letter: "L",
    name: "Longevity",
    icon: Heart,
    color: "bg-longevity",
    textColor: "text-longevity",
    borderColor: "border-longevity",
    hoverBg: "hover:bg-longevity/10",
    description: "Keep athletes healthy, available, and progressing over time. Availability is the most overlooked performance metric.",
    focus: ["Arm care systems", "Workload management", "Recovery protocols", "Tissue resilience"],
    metrics: ["Throw volume", "Recovery indicators", "Availability rate", "Injury risk markers"],
    badge: "Founder's Pre-Sale",
    link: "/products/founders-access",
  },
  {
    letter: "T",
    name: "Transfer",
    icon: Target,
    color: "bg-transfer",
    textColor: "text-transfer",
    borderColor: "border-transfer",
    hoverBg: "hover:bg-transfer/10",
    description: "Ensure training adaptations appear in competition. Training that does not show up in games fails its purpose.",
    focus: ["Practice design", "Decision-making under pressure", "Competitive execution", "Game realism"],
    metrics: ["Practice-to-game carryover", "Situational success", "Consistency under pressure"],
    badge: "Founder's Pre-Sale",
    link: "/products/founders-access",
  },
];

const VaultPillars = () => {
  const [expandedPillar, setExpandedPillar] = useState<number | null>(null);

  return (
    <section id="pillars" className="py-24 bg-background relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px'
      }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card mb-6">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Operating System Framework</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-display text-foreground mb-4 tracking-wider">
            THE 5 PILLARS
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            VAULT™ is a complete operating system built on five interconnected performance modules. 
            <span className="block mt-2 font-semibold text-foreground">Each module is required. None stand alone.</span>
          </p>
        </motion.div>

        {/* Horizontal Pillar Modules - Desktop */}
        <div className="hidden md:grid grid-cols-5 gap-4 mb-12">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const isExpanded = expandedPillar === index;
            
            return (
              <motion.div
                key={pillar.letter}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setExpandedPillar(isExpanded ? null : index)}
                className={`group relative bg-card border-2 cursor-pointer transition-all duration-200 ${isExpanded ? pillar.borderColor : 'border-border hover:border-muted-foreground'}`}
              >
                {/* Top accent bar */}
                <div className={`h-1.5 ${pillar.color}`} />
                
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 border ${pillar.borderColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${pillar.textColor}`} />
                    </div>
                    {pillar.badge && (
                      <Badge variant="outline" className={`text-[8px] ${pillar.borderColor} ${pillar.textColor}`}>
                        PRE-SALE
                      </Badge>
                    )}
                  </div>
                  
                  <span className={`text-4xl font-display ${pillar.textColor} block`}>{pillar.letter}</span>
                  <span className="text-sm text-foreground uppercase tracking-[0.1em] font-medium">{pillar.name}</span>
                  
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-3">{pillar.description}</p>
                  
                  <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>View Module</span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Expanded Pillar Detail */}
        <AnimatePresence>
          {expandedPillar !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <div className={`p-8 border-2 ${pillars[expandedPillar].borderColor} bg-card`}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-display text-foreground mb-4 tracking-wide">
                      {pillars[expandedPillar].name} — Focus Areas
                    </h3>
                    <ul className="space-y-3">
                      {pillars[expandedPillar].focus.map((item) => (
                        <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <CheckCircle2 className={`w-4 h-4 ${pillars[expandedPillar].textColor}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-2xl font-display text-foreground mb-4 tracking-wide">
                      Key Metrics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {pillars[expandedPillar].metrics.map((metric) => (
                        <span
                          key={metric}
                          className={`px-3 py-2 border ${pillars[expandedPillar].borderColor} text-xs uppercase tracking-wider`}
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                    {pillars[expandedPillar].link && (
                      <Link to={pillars[expandedPillar].link!} className="inline-block mt-6">
                        <Button variant="vault" size="lg">
                          Activate Module
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vertical Stack - Mobile */}
        <div className="md:hidden space-y-4 mb-12">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const isExpanded = expandedPillar === index;
            
            return (
              <motion.div
                key={pillar.letter}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setExpandedPillar(isExpanded ? null : index)}
                className={`bg-card border-2 cursor-pointer transition-all ${isExpanded ? pillar.borderColor : 'border-border'}`}
              >
                <div className={`h-1 ${pillar.color}`} />
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 border ${pillar.borderColor} flex items-center justify-center`}>
                      <span className={`text-2xl font-display ${pillar.textColor}`}>{pillar.letter}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-display text-foreground tracking-wide">{pillar.name}</span>
                        {pillar.badge && (
                          <Badge variant="outline" className={`text-[8px] ${pillar.borderColor} ${pillar.textColor}`}>
                            PRE-SALE
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pillar.description}</p>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-border"
                      >
                        <div className="space-y-3 mb-4">
                          {pillar.focus.map((item) => (
                            <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className={`w-3 h-3 ${pillar.textColor}`} />
                              {item}
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {pillar.metrics.map((metric) => (
                            <span
                              key={metric}
                              className={`px-2 py-1 border ${pillar.borderColor} text-[10px] uppercase tracking-wider`}
                            >
                              {metric}
                            </span>
                          ))}
                        </div>
                        {pillar.link && (
                          <Link to={pillar.link} className="block mt-4">
                            <Button variant="vault" size="sm" className="w-full">
                              Activate Module
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* System Standard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-block p-8 border-2 border-foreground bg-card">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-longevity animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Operating System Active</span>
            </div>
            <p className="text-2xl md:text-4xl font-display text-foreground tracking-wide">
              "VAULT™ is not a program.
              <span className="block text-muted-foreground">VAULT™ is the standard."</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VaultPillars;
