import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Target, ChevronDown, ChevronUp, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  softballPrograms,
  type TrainingProgram,
} from "@/lib/softball/programs";
import { softballDrillLibrary } from "@/lib/softball/drills";

const difficultyBadge: Record<string, string> = {
  beginner: "bg-green-500/15 text-green-400",
  intermediate: "bg-amber-500/15 text-amber-400",
  advanced: "bg-red-500/15 text-red-400",
};

const ProgramCard = ({ program }: { program: TrainingProgram }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-foreground/10 transition-colors"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-display text-lg text-foreground mb-1">{program.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{program.description}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded capitalize shrink-0 ${difficultyBadge[program.difficulty]}`}>
            {program.difficulty}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{program.durationWeeks} weeks</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{program.sessionsPerWeek}x/week</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />Ages {program.targetAgeRange}</span>
        </div>

        {/* Goals */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-foreground mb-2">PROGRAM GOALS</h4>
          <ul className="space-y-1">
            {program.goals.map((goal, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <Target className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                {goal}
              </li>
            ))}
          </ul>
        </div>

        {/* KPIs Tracked */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {program.kpisTracked.map(kpi => (
            <span key={kpi} className="text-[10px] px-2 py-0.5 bg-secondary rounded text-muted-foreground capitalize">
              {kpi.replace(/_/g, ' ')}
            </span>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide" : "View"} Weekly Plan
          {expanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-border p-5 space-y-3"
        >
          {program.weeks.map(week => {
            const drills = week.drillIds
              .map(id => softballDrillLibrary.find(d => d.id === id))
              .filter(Boolean);

            return (
              <div key={week.week} className="bg-secondary/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-sm text-foreground">Week {week.week}</span>
                  <span className="text-xs text-muted-foreground">{week.focus}</span>
                </div>
                {week.notes && (
                  <p className="text-xs text-muted-foreground mb-2 italic">{week.notes}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {drills.map(d => d && (
                    <span key={d.id} className="text-[10px] px-2 py-0.5 bg-card border border-border rounded text-muted-foreground">
                      {d.name}
                    </span>
                  ))}
                </div>
                {week.kpiTargets && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(week.kpiTargets).map(([kpi, target]) => (
                      <span key={kpi} className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent rounded">
                        🎯 {kpi.replace(/_/g, ' ')}: {target}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

const ProgramBrowser = () => {
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filtered = filterCategory === "all"
    ? softballPrograms
    : softballPrograms.filter(p => p.category === filterCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {["all", "general", "hitting", "pitching", "fielding"].map(cat => (
          <Button
            key={cat}
            variant={filterCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(cat)}
          >
            {cat === "all" ? "All Programs" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map(program => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </div>
  );
};

export default ProgramBrowser;
