import { motion } from "framer-motion";
import { Zap, Heart, Dumbbell, Target, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const categories = [
  { icon: Zap, name: "VELOCITY DEVELOPMENT", desc: "Throwing progression, intent drills, and plyo ball programming for measurable velocity gains.", cssVar: "--vault-velocity" },
  { icon: Heart, name: "ARM CARE", desc: "Injury prevention protocols, workload management, and recovery programming based on ASMI research.", cssVar: "--vault-longevity" },
  { icon: Dumbbell, name: "HITTING POWER", desc: "Exit velocity training, bat speed development, and rotational power programming.", cssVar: "--vault-athleticism" },
  { icon: Dumbbell, name: "STRENGTH & ATHLETICISM", desc: "Age-appropriate strength programming, speed development, and athletic movement patterns.", cssVar: "--vault-utility" },
  { icon: Target, name: "RECRUITING PREPARATION", desc: "Showcase planning, metrics benchmarks, highlight video strategy, and NCAA timeline guidance.", cssVar: "--vault-transfer" },
];

const ContentAuthority = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="mb-12 md:mb-16">
            <span className="text-[11px] font-display tracking-[0.3em] text-primary-foreground/30 mb-4 block">EXPERTISE</span>
            <h2 className="text-3xl md:text-5xl font-display leading-[0.95] mb-3">
              BUILT ON REAL
              <br />
              <span className="text-primary-foreground/35">COACHING KNOWLEDGE.</span>
            </h2>
            <p className="text-sm text-primary-foreground/40 max-w-lg">
              Every Vault protocol is rooted in biomechanics research, professional training methodology, and years of hands-on coaching experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-primary-foreground/10">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-foreground p-6 md:p-7 group"
              >
                <div className="w-9 h-9 border border-primary-foreground/10 flex items-center justify-center mb-4">
                  <cat.icon className="w-4 h-4" style={{ color: `hsl(var(${cat.cssVar}))` }} />
                </div>
                <h3 className="font-display text-sm tracking-wide mb-2">{cat.name}</h3>
                <p className="text-xs text-primary-foreground/40 leading-relaxed">{cat.desc}</p>
              </motion.div>
            ))}
            {/* CTA card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-foreground p-6 md:p-7 flex flex-col justify-center items-center text-center"
            >
              <BookOpen className="w-6 h-6 text-primary-foreground/30 mb-3" />
              <p className="text-xs text-primary-foreground/40 mb-4">Ready to see how this applies to your athlete?</p>
              <Button
                variant="outline"
                size="sm"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-foreground font-display tracking-wide"
                onClick={() => navigate("/evaluate")}
              >
                FREE EVALUATION
                <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContentAuthority;
