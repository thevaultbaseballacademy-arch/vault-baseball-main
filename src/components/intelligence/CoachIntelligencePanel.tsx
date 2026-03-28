import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain, TrendingUp, TrendingDown, Minus, AlertTriangle,
  Users, ChevronDown, ChevronUp, Clock, Zap, CheckCircle2,
  Target, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/contexts/SportContext";
import {
  analyzeAthlete,
  buildIntelligenceInput,
  IntelligenceOutput,
  DevelopmentStatus,
  IntelligenceAlert,
} from "@/lib/intelligence/engine";

interface AthleteIntelligence {
  userId: string;
  displayName: string;
  output: IntelligenceOutput;
}

interface Props {
  coachUserId: string;
}

const statusBadge: Record<DevelopmentStatus, { label: string; cls: string }> = {
  improving: { label: 'Improving', cls: 'bg-green-500/10 text-green-500' },
  stable: { label: 'Stable', cls: 'bg-blue-500/10 text-blue-500' },
  stalled: { label: 'Stalled', cls: 'bg-amber-500/10 text-amber-500' },
  regressing: { label: 'Regressing', cls: 'bg-red-500/10 text-red-500' },
};

const CoachIntelligencePanel = ({ coachUserId }: Props) => {
  const [athletes, setAthletes] = useState<AthleteIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [allAlerts, setAllAlerts] = useState<(IntelligenceAlert & { athleteName: string })[]>([]);
  const { sport } = useSport();

  useEffect(() => {
    loadAthleteIntelligence();
  }, [coachUserId, sport]);

  const loadAthleteIntelligence = async () => {
    setLoading(true);
    try {
      // Get assigned athletes
      const { data: assignments } = await supabase
        .from('coach_athlete_assignments')
        .select('athlete_user_id')
        .eq('coach_user_id', coachUserId)
        .eq('is_active', true);

      if (!assignments?.length) {
        setLoading(false);
        return;
      }

      const athleteIds = assignments.map(a => a.athlete_user_id);

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', athleteIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p.display_name || 'Athlete']));

      // Fetch data for all athletes in parallel
      const results: AthleteIntelligence[] = [];
      const alertList: (IntelligenceAlert & { athleteName: string })[] = [];

      await Promise.all(athleteIds.map(async (athleteId) => {
        const [checkinsRes, kpisRes] = await Promise.all([
          supabase.from('athlete_checkins').select('*').eq('user_id', athleteId).order('checkin_date', { ascending: true }).limit(60),
          supabase.from('athlete_kpis').select('*').eq('user_id', athleteId).order('recorded_at', { ascending: true }).limit(100),
        ]);

        const input = buildIntelligenceInput(sport, checkinsRes.data || [], kpisRes.data || [], []);
        const output = analyzeAthlete(input);
        const name = profileMap.get(athleteId) || 'Athlete';

        results.push({ userId: athleteId, displayName: name, output });
        output.alerts.forEach(a => alertList.push({ ...a, athleteName: name, athleteId }));
      }));

      // Sort: regressing/stalled athletes first
      const statusOrder: Record<DevelopmentStatus, number> = { regressing: 0, stalled: 1, stable: 2, improving: 3 };
      results.sort((a, b) => statusOrder[a.output.status] - statusOrder[b.output.status]);

      setAthletes(results);
      setAllAlerts(alertList.sort((a, b) => {
        const sev: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return (sev[a.severity] || 3) - (sev[b.severity] || 3);
      }));
    } catch (err) {
      console.error('Coach intelligence error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-display text-foreground">Development Intelligence</h2>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-card border border-border rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-display text-foreground">Development Intelligence</h2>
        <span className="text-xs text-muted-foreground ml-auto">{athletes.length} athletes</span>
      </div>

      {/* Alerts Summary */}
      {allAlerts.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Active Alerts</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {allAlerts.slice(0, 5).map((alert, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                alert.severity === 'critical' ? 'bg-red-500/10' :
                alert.severity === 'high' ? 'bg-amber-500/10' : 'bg-secondary'
              }`}>
                <Zap className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                  alert.severity === 'critical' ? 'text-red-500' :
                  alert.severity === 'high' ? 'text-amber-500' : 'text-muted-foreground'
                }`} />
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{alert.athleteName}: {alert.title}</p>
                  <p className="text-muted-foreground">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Athlete Cards */}
      {athletes.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No assigned athletes to analyze.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {athletes.map((athlete) => {
            const badge = statusBadge[athlete.output.status];
            const isExpanded = expanded === athlete.userId;

            return (
              <motion.div
                key={athlete.userId}
                layout
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                {/* Summary Row */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : athlete.userId)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-display text-accent">
                    {athlete.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{athlete.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      Score: {athlete.output.overallScore} · {athlete.output.gaps.length} gaps · {athlete.output.alerts.length} alerts
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-4 pb-4 space-y-3 border-t border-border pt-3"
                  >
                    {/* Priorities */}
                    {athlete.output.priorities.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Priorities</p>
                        {athlete.output.priorities.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs py-1">
                            <span className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-display text-accent">{i + 1}</span>
                            <span className="text-foreground capitalize">{p}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Strengths & Gaps */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Strengths</p>
                        {athlete.output.strengths.slice(0, 3).map((s, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs py-0.5">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            <span className="text-foreground capitalize truncate">{s.area}</span>
                          </div>
                        ))}
                        {athlete.output.strengths.length === 0 && <p className="text-xs text-muted-foreground">No data yet</p>}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Gaps</p>
                        {athlete.output.gaps.slice(0, 3).map((g, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs py-0.5">
                            <AlertTriangle className={`w-3 h-3 ${g.priority === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                            <span className="text-foreground capitalize truncate">{g.area}</span>
                          </div>
                        ))}
                        {athlete.output.gaps.length === 0 && <p className="text-xs text-muted-foreground">No gaps detected</p>}
                      </div>
                    </div>

                    {/* Recommended Drills */}
                    {athlete.output.recommendedDrills.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Recommended Drills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {athlete.output.recommendedDrills.slice(0, 4).map((d, i) => (
                            <span key={i} className="text-[10px] px-2 py-1 bg-secondary rounded-full text-foreground">
                              {d.drillId} — {d.reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weekly Plan */}
                    <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                      <p className="text-xs font-medium text-foreground mb-1">Weekly Plan</p>
                      <p className="text-[10px] text-muted-foreground italic">{athlete.output.weeklyPlan.notes}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CoachIntelligencePanel;
