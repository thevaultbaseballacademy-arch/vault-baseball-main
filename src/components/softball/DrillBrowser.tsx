import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Clock, Dumbbell, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  softballDrillLibrary,
  skillCategories,
  getSubcategories,
  type SoftballDrill,
  type SkillCategory,
  type DifficultyLevel,
} from "@/lib/softball/drills";

const difficultyColors: Record<DifficultyLevel, string> = {
  beginner: "bg-green-500/15 text-green-400 border-green-500/30",
  intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  advanced: "bg-red-500/15 text-red-400 border-red-500/30",
};

const DrillCard = ({ drill }: { drill: SoftballDrill }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 hover:border-foreground/10 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-display text-base text-foreground">{drill.name}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${difficultyColors[drill.difficulty]}`}>
              {drill.difficulty}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{drill.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{drill.duration}</span>
            <span>Ages {drill.ageRange}</span>
            <span className="capitalize">{drill.subcategory}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 pt-4 border-t border-border space-y-3"
        >
          <div>
            <h4 className="text-xs font-medium text-foreground mb-2">COACHING POINTS</h4>
            <ul className="space-y-1">
              {drill.coachingPoints.map((point, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-medium text-foreground mb-2">EQUIPMENT</h4>
            <div className="flex flex-wrap gap-1.5">
              {drill.equipment.map(eq => (
                <span key={eq} className="text-xs px-2 py-0.5 bg-secondary rounded text-muted-foreground">{eq}</span>
              ))}
            </div>
          </div>
          {drill.reps && (
            <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Volume:</span> {drill.reps}</p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

const DrillBrowser = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SkillCategory | "all">("all");
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyLevel | "all">("all");

  const filteredDrills = softballDrillLibrary.filter(drill => {
    const matchesSearch = !searchQuery ||
      drill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drill.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || drill.category === activeCategory;
    const matchesDifficulty = activeDifficulty === "all" || drill.difficulty === activeDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search drills by name, skill, or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("all")}
          >
            All Categories
          </Button>
          {skillCategories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon} {cat.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "beginner", "intermediate", "advanced"] as const).map(level => (
            <Button
              key={level}
              variant={activeDifficulty === level ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveDifficulty(level)}
              className="text-xs"
            >
              {level === "all" ? "All Levels" : level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filteredDrills.length} drills found</p>
      </div>

      <div className="grid gap-3">
        {filteredDrills.map(drill => (
          <DrillCard key={drill.id} drill={drill} />
        ))}
      </div>

      {filteredDrills.length === 0 && (
        <div className="text-center py-12">
          <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No drills match your filters.</p>
        </div>
      )}
    </div>
  );
};

export default DrillBrowser;
