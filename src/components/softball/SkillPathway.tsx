import { motion } from "framer-motion";
import { TrendingUp, Target, Zap, Shield, Timer } from "lucide-react";
import { useSport } from "@/contexts/SportContext";

interface PathwayStep {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  skills: string[];
}

const softballPathways: PathwayStep[] = [
  {
    title: "Hitting Development",
    description: "Build a powerful, consistent swing from mechanics to game-ready at-bats.",
    icon: Zap,
    color: "#f97316",
    skills: ["Swing Mechanics", "Bat Speed", "Barrel Control", "Timing & Rhythm", "Power Development", "Contact Consistency"],
  },
  {
    title: "Fielding Development",
    description: "Develop elite defensive skills across all positions with emphasis on fundamentals.",
    icon: Shield,
    color: "#22c55e",
    skills: ["Glove Work", "Footwork", "Throwing Mechanics", "Reaction Time", "Defensive IQ"],
  },
  {
    title: "Base Running",
    description: "Maximize speed, aggression, and decision-making on the bases.",
    icon: Timer,
    color: "#3b82f6",
    skills: ["First-Step Quickness", "Acceleration", "Sliding Mechanics", "Baserunning Decisions"],
  },
  {
    title: "Fastpitch Pitching",
    description: "Complete windmill pitching development from mechanics through full arsenal mastery.",
    icon: Target,
    color: "#a855f7",
    skills: ["Pitching Mechanics", "Spin Development", "Pitch Command", "Fastball", "Change-Up", "Drop Ball", "Rise Ball", "Curveball", "Pitch Sequencing"],
  },
];

const SkillPathway = () => {
  const { sport } = useSport();

  if (sport !== 'softball') return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-foreground mb-1">SKILL DEVELOPMENT PATHWAYS</h2>
        <p className="text-sm text-muted-foreground">
          Structured progression from fundamentals to elite performance in every skill area.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {softballPathways.map((pathway, index) => (
          <motion.div
            key={pathway.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-5 hover:border-foreground/10 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${pathway.color}15` }}
              >
                <pathway.icon className="w-5 h-5" style={{ color: pathway.color }} />
              </div>
              <h3 className="font-display text-lg text-foreground">{pathway.title}</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{pathway.description}</p>

            <div className="flex flex-wrap gap-1.5">
              {pathway.skills.map(skill => (
                <span
                  key={skill}
                  className="text-[10px] px-2 py-0.5 bg-secondary rounded text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SkillPathway;
