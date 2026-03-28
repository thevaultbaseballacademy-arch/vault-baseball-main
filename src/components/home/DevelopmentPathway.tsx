import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const stages = [
  {
    num: "01",
    name: "FOUNDATION",
    subtitle: "Movement & Mechanics",
    desc: "Establish baseline metrics, correct fundamental movement patterns, and build the mechanical foundation that all velocity development depends on.",
    metrics: ["Movement Screen", "Baseline Velo", "Mechanical Score"],
  },
  {
    num: "02",
    name: "DEVELOPMENT",
    subtitle: "Strength & Velocity",
    desc: "Progressive overload through structured throwing, plyo ball work, and strength programming. This is where measurable velocity gains happen.",
    metrics: ["Pitch Velocity", "Exit Velocity", "Sprint Speed"],
  },
  {
    num: "03",
    name: "RECRUITING",
    subtitle: "Performance & Exposure",
    desc: "Translate training gains into game performance. Build your recruiting profile with verified metrics, highlight video, and showcase preparation.",
    metrics: ["Pop Time", "60 Yard Dash", "Game Stats"],
  },
  {
    num: "04",
    name: "ELITE",
    subtitle: "Optimization & Longevity",
    desc: "Fine-tune mechanics for peak performance. Arm care protocols, workload management, and long-term development strategies for sustained success.",
    metrics: ["Arm Health Score", "Workload Index", "Transfer Rate"],
  },
];

const DevelopmentPathway = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="mb-12 md:mb-16">
            <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground mb-4 block">THE VAULT DEVELOPMENT SYSTEM</span>
            <h2 className="text-3xl md:text-5xl font-display text-foreground leading-[0.95]">
              A STRUCTURED PATH FROM
              <br className="hidden md:block" />
              <span className="text-muted-foreground"> BASELINE TO ELITE.</span>
            </h2>
          </div>

          <div className="space-y-3">
            {stages.map((stage, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-8"
              >
                <span className="text-5xl font-display text-muted-foreground/20 shrink-0 md:w-20">{stage.num}</span>
                <div className="flex-1">
                  <h3 className="font-display text-xl tracking-wide text-foreground">{stage.name}</h3>
                  <p className="text-xs font-display tracking-wider text-muted-foreground mb-2">{stage.subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{stage.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {stage.metrics.map((m, j) => (
                    <span key={j} className="px-3 py-1 border border-border text-[10px] font-display tracking-wider text-foreground">{m}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              variant="vault"
              size="lg"
              className="font-display tracking-wide"
              onClick={() => navigate("/evaluate")}
            >
              FIND YOUR STAGE — FREE EVALUATION
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DevelopmentPathway;
