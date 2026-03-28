import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, AlertTriangle, CheckCircle, TrendingUp, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  softballAssessments,
  generateRecommendations,
  calculateOverallScore,
  type AssessmentModule as AssessmentModuleType,
  type AssessmentResult,
  type AssessmentRecommendation,
} from "@/lib/softball/assessments";
import { softballDrillLibrary } from "@/lib/softball/drills";

const levelColors = {
  strength: "text-green-400",
  needs_work: "text-amber-400",
  critical: "text-red-400",
};

const levelIcons = {
  strength: CheckCircle,
  needs_work: TrendingUp,
  critical: AlertTriangle,
};

const AssessmentModule = () => {
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentModuleType | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [results, setResults] = useState<{
    overall: { score: number; maxScore: number; percentage: number };
    recommendations: AssessmentRecommendation[];
  } | null>(null);

  const handleStartAssessment = (assessment: AssessmentModuleType) => {
    setSelectedAssessment(assessment);
    setScores({});
    setResults(null);
  };

  const handleScoreChange = (criteriaId: string, value: number[]) => {
    setScores(prev => ({ ...prev, [criteriaId]: value[0] }));
  };

  const handleSubmit = () => {
    if (!selectedAssessment) return;
    const assessmentResults: AssessmentResult[] = selectedAssessment.criteria.map(c => ({
      criteriaId: c.id,
      score: scores[c.id] || 0,
    }));
    const overall = calculateOverallScore(selectedAssessment, assessmentResults);
    const recommendations = generateRecommendations(selectedAssessment, assessmentResults);
    setResults({ overall, recommendations });
  };

  const handleReset = () => {
    setSelectedAssessment(null);
    setScores({});
    setResults(null);
  };

  const allScored = selectedAssessment?.criteria.every(c => scores[c.id] !== undefined) || false;

  // Assessment selection view
  if (!selectedAssessment) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select an assessment to evaluate skills and get personalized drill recommendations.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {softballAssessments.map(assessment => (
            <motion.button
              key={assessment.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStartAssessment(assessment)}
              className="text-left bg-card border border-border rounded-xl p-5 hover:border-foreground/20 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <ClipboardCheck className="w-5 h-5 text-accent" />
                <h3 className="font-display text-lg text-foreground">{assessment.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{assessment.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>⏱ {assessment.estimatedTime}</span>
                <span>{assessment.criteria.length} criteria</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Results view
  if (results) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl text-foreground">{selectedAssessment.name} Results</h3>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" /> New Assessment
          </Button>
        </div>

        {/* Overall Score */}
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
          <p className="text-5xl font-display text-foreground">{results.overall.percentage}%</p>
          <p className="text-sm text-muted-foreground mt-1">{results.overall.score} / {results.overall.maxScore}</p>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="font-display text-sm text-foreground">RECOMMENDATIONS</h4>
          {results.recommendations.map((rec, i) => {
            const Icon = levelIcons[rec.level];
            const drills = rec.recommendedDrillIds
              .map(id => softballDrillLibrary.find(d => d.id === id))
              .filter(Boolean);

            return (
              <div key={i} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${levelColors[rec.level]}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground text-sm">{rec.area}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{rec.level.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.message}</p>
                    {drills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {drills.map(d => d && (
                          <span key={d.id} className="text-xs px-2 py-0.5 bg-secondary rounded text-muted-foreground">
                            {d.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Scoring view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-foreground">{selectedAssessment.name}</h3>
        <Button variant="ghost" size="sm" onClick={handleReset}>Cancel</Button>
      </div>
      <p className="text-sm text-muted-foreground">{selectedAssessment.description}</p>

      <div className="space-y-5">
        {selectedAssessment.criteria.map(criteria => (
          <div key={criteria.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-sm text-foreground">{criteria.name}</h4>
              <span className="font-display text-lg text-foreground">{scores[criteria.id] ?? 0}/{criteria.maxScore}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{criteria.description}</p>
            <Slider
              value={[scores[criteria.id] ?? 0]}
              onValueChange={v => handleScoreChange(criteria.id, v)}
              max={criteria.maxScore}
              step={1}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <Button
        variant="vault"
        className="w-full"
        disabled={!allScored}
        onClick={handleSubmit}
      >
        Generate Assessment Results
      </Button>
    </div>
  );
};

export default AssessmentModule;
