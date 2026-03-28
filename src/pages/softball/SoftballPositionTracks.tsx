import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Target, Shield, Diamond, Circle, Zap, Layers,
  ChevronRight, CheckCircle2, AlertTriangle, TrendingUp,
  BookOpen, Brain, Dumbbell, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  softballPositionTracks,
  PositionTrack,
  windmillPhases,
  fastpitchPitchLibrary,
  velocityBenchmarks,
  pitchLoadRules,
  injuryRiskFlags,
  developmentCategories,
  type SoftballAgeGroup,
} from "@/lib/softball/positionTracks";

const iconMap: Record<string, React.ElementType> = {
  Target, Shield, Diamond, Circle, Zap, Layers,
};

const levelColors: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
  intermediate: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  advanced: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  elite: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const ageGroups: SoftballAgeGroup[] = ['10U', '12U', '14U', '16U', '18U', 'College'];

const SoftballPositionTracks = () => {
  const navigate = useNavigate();
  const [selectedTrack, setSelectedTrack] = useState<PositionTrack | null>(null);
  const [selectedAge, setSelectedAge] = useState<SoftballAgeGroup>('14U');

  if (selectedTrack) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <Button variant="ghost" className="mb-6" onClick={() => setSelectedTrack(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> All Position Tracks
            </Button>
            <TrackDetail track={selectedTrack} selectedAge={selectedAge} setSelectedAge={setSelectedAge} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/softball/development")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Softball Development
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center">
              <span className="text-3xl mb-2 block">🥎</span>
              <h1 className="text-3xl md:text-5xl font-display text-foreground mb-2">POSITION TRACKS</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Position-specific development pathways with skill progressions, KPI benchmarks by age group, drill assignments, and intelligence engine integration.
              </p>
            </div>

            {/* Position Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {softballPositionTracks.map((track, i) => {
                const Icon = iconMap[track.icon] || Target;
                return (
                  <motion.button
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedTrack(track)}
                    className="bg-card border border-border rounded-2xl p-6 text-left hover:border-foreground/20 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${track.color}15` }}>
                        <Icon className="w-6 h-6" style={{ color: track.color }} />
                      </div>
                      <div>
                        <h3 className="font-display text-foreground">{track.name}</h3>
                        <span className="text-xs text-muted-foreground">{track.abbreviation}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{track.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {track.categories.slice(0, 4).map(c => (
                        <span key={c} className="text-[9px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">{c}</span>
                      ))}
                      {track.categories.length > 4 && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">+{track.categories.length - 4}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <span>View Track</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Development Categories */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-foreground text-xl mb-4">DEVELOPMENT CATEGORIES</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {developmentCategories.map(cat => (
                  <div key={cat.id} className="flex items-start gap-3 p-3 rounded-xl bg-secondary">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {cat.name}
                        {cat.formatRestriction && <span className="text-[10px] ml-2 text-muted-foreground">({cat.formatRestriction} only)</span>}
                        {cat.ageRestriction && <span className="text-[10px] ml-2 text-muted-foreground">({cat.ageRestriction})</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// ─── TRACK DETAIL VIEW ───────────────────────────────────────────────

const TrackDetail = ({
  track,
  selectedAge,
  setSelectedAge,
}: {
  track: PositionTrack;
  selectedAge: SoftballAgeGroup;
  setSelectedAge: (a: SoftballAgeGroup) => void;
}) => {
  const Icon = iconMap[track.icon] || Target;
  const isPitcher = track.id === 'pitcher';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${track.color}15` }}>
          <Icon className="w-8 h-8" style={{ color: track.color }} />
        </div>
        <div>
          <h1 className="text-2xl md:text-4xl font-display text-foreground">{track.name.toUpperCase()}</h1>
          <p className="text-muted-foreground text-sm">{track.description}</p>
        </div>
      </div>

      {/* Age Group Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-muted-foreground shrink-0">Age Group:</span>
        {ageGroups.map(ag => (
          <button
            key={ag}
            onClick={() => setSelectedAge(ag)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedAge === ag
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {ag}
          </button>
        ))}
      </div>

      <Tabs defaultValue="pathway" className="w-full">
        <TabsList className={`grid w-full ${isPitcher ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <TabsTrigger value="pathway" className="text-xs">🎯 Pathway</TabsTrigger>
          <TabsTrigger value="benchmarks" className="text-xs">📊 Benchmarks</TabsTrigger>
          <TabsTrigger value="drills" className="text-xs">🏋️ Drills</TabsTrigger>
          <TabsTrigger value="assessment" className="text-xs">📋 Assessment</TabsTrigger>
          {isPitcher && <TabsTrigger value="pitching" className="text-xs">⚾ Pitching</TabsTrigger>}
        </TabsList>

        {/* Skill Pathway */}
        <TabsContent value="pathway" className="mt-6 space-y-4">
          <h3 className="font-display text-foreground text-lg">SKILL PATHWAY</h3>
          <div className="relative">
            {track.skillPathway.map((step, i) => (
              <div key={step.level} className="flex gap-4 mb-6 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-display ${levelColors[step.level]}`}>
                    {i + 1}
                  </div>
                  {i < track.skillPathway.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-display text-foreground">{step.label}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">{step.typicalAgeRange}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {step.skills.map(s => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* KPI Benchmarks */}
        <TabsContent value="benchmarks" className="mt-6 space-y-4">
          <h3 className="font-display text-foreground text-lg">KPI BENCHMARKS — {selectedAge}</h3>
          {track.kpiBenchmarks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No benchmarks defined for this track yet.</p>
          ) : (
            <div className="space-y-4">
              {track.kpiBenchmarks.map(benchmark => {
                const ageBench = benchmark.benchmarks[selectedAge];
                if (!ageBench) return null;
                return (
                  <div key={benchmark.kpiName} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-foreground capitalize">{benchmark.kpiName.replace(/_/g, ' ')}</h4>
                        <span className="text-[10px] text-muted-foreground">{benchmark.category} • {benchmark.unit}</span>
                      </div>
                      {benchmark.lowerIsBetter && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded">Lower is better</span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { label: 'Below Avg', value: ageBench.low, color: 'text-red-400' },
                        { label: 'Average', value: ageBench.avg, color: 'text-amber-400' },
                        { label: 'Good', value: ageBench.good, color: 'text-green-400' },
                        { label: 'Elite', value: ageBench.elite, color: 'text-purple-400' },
                      ].map(tier => (
                        <div key={tier.label} className="p-2 rounded-lg bg-secondary">
                          <p className={`text-lg font-display ${tier.color}`}>{tier.value}</p>
                          <p className="text-[10px] text-muted-foreground">{tier.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Drill Progressions */}
        <TabsContent value="drills" className="mt-6 space-y-4">
          <h3 className="font-display text-foreground text-lg">DRILL PROGRESSIONS</h3>
          {track.drillProgressions.map((phase, i) => (
            <div key={phase.phase} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-display text-primary">{i + 1}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">{phase.phase}</h4>
                  <span className="text-[10px] text-muted-foreground">{phase.weeksTypical} weeks typical</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {phase.focusAreas.map(f => (
                  <span key={f} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">{f}</span>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">{phase.drillIds.length} drills in this phase</p>
            </div>
          ))}
        </TabsContent>

        {/* Assessment */}
        <TabsContent value="assessment" className="mt-6 space-y-4">
          <h3 className="font-display text-foreground text-lg">ASSESSMENT AREAS</h3>
          <div className="space-y-2">
            {track.assessmentAreas.map(area => (
              <div key={area.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{area.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">/ {area.maxScore}</span>
              </div>
            ))}
          </div>

          {/* Intelligence Rules */}
          <div className="mt-6">
            <h3 className="font-display text-foreground text-lg mb-3">INTELLIGENCE RULES</h3>
            <div className="space-y-2">
              {track.intelligenceRules.map(rule => (
                <div key={rule.id} className="p-3 bg-secondary rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-medium text-foreground">{rule.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">IF: {rule.condition}</p>
                  <p className="text-[10px] text-primary">THEN: {rule.action}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Fastpitch Pitching System (pitcher only) */}
        {isPitcher && (
          <TabsContent value="pitching" className="mt-6 space-y-6">
            {/* Phase Tracking */}
            <div>
              <h3 className="font-display text-foreground text-lg mb-3">WINDMILL PHASE TRACKING</h3>
              <div className="space-y-3">
                {windmillPhases.map(phase => (
                  <div key={phase.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <span className="text-xs font-display text-purple-500">{phase.id}</span>
                      </div>
                      <h4 className="text-sm font-medium text-foreground">{phase.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{phase.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {phase.keyPoints.map(kp => (
                        <span key={kp} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">{kp}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pitch Library */}
            <div>
              <h3 className="font-display text-foreground text-lg mb-3">PITCH DEVELOPMENT LIBRARY</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {fastpitchPitchLibrary.map(pitch => (
                  <div key={pitch.name} className="bg-card border border-border rounded-xl p-4">
                    <h4 className="text-sm font-medium text-foreground mb-1">{pitch.name}</h4>
                    <div className="space-y-1 text-[10px] text-muted-foreground">
                      <p>Grips: {pitch.grips.join(', ')}</p>
                      <p>Spin: {pitch.spinType}</p>
                      <p>Movement: {pitch.movement}</p>
                      <p className="text-primary">Introduce at: {pitch.typicalIntroAge}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Velocity Benchmarks */}
            <div>
              <h3 className="font-display text-foreground text-lg mb-3">VELOCITY BENCHMARKS</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {velocityBenchmarks.map(vb => (
                  <div key={vb.ageGroup} className={`p-3 rounded-xl text-center ${
                    selectedAge === vb.ageGroup ? 'bg-primary/10 border border-primary/30' : 'bg-secondary'
                  }`}>
                    <p className="text-xs font-display text-foreground">{vb.ageGroup}</p>
                    <p className="text-lg font-display text-primary">{vb.low}–{vb.high}</p>
                    <p className="text-[10px] text-muted-foreground">mph</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pitch Load Rules */}
            <div>
              <h3 className="font-display text-foreground text-lg mb-3">PITCH LOAD SAFETY RULES</h3>
              <div className="space-y-2">
                {pitchLoadRules.map(rule => (
                  <div key={rule.ageGroup} className="flex items-center gap-4 p-3 bg-card border border-border rounded-xl">
                    <div className="w-16 text-xs font-display text-foreground">{rule.ageGroup}</div>
                    <div className="flex-1 grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div>
                        <p className="text-foreground font-medium">{rule.maxPerDay}</p>
                        <p className="text-muted-foreground">/ day</p>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{rule.maxPerWeek}</p>
                        <p className="text-muted-foreground">/ week</p>
                      </div>
                      <div>
                        <p className="text-amber-400 font-medium">{rule.restDayRule}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Injury Risk Flags */}
            <div>
              <h3 className="font-display text-foreground text-lg mb-3">INJURY RISK FLAGS</h3>
              <div className="space-y-1.5">
                {injuryRiskFlags.map(flag => (
                  <div key={flag} className="flex items-center gap-2 p-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="text-xs text-foreground">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
};

export default SoftballPositionTracks;
