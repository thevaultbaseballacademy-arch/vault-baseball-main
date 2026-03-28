import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import {
  GraduationCap, Target, Trophy, School, CheckCircle2,
  Circle, ExternalLink, FileText, Shield
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useParentPortal } from "@/hooks/useParentPortal";

const commitmentLabels: Record<string, { label: string; color: string }> = {
  uncommitted: { label: "Uncommitted", color: "text-muted-foreground" },
  verbal_commit: { label: "Verbal Commit", color: "text-green-500" },
  signed: { label: "Signed NLI", color: "text-primary" },
  enrolled: { label: "Enrolled", color: "text-primary" },
};

const ParentRecruiting = () => {
  const [searchParams] = useSearchParams();
  const athleteId = searchParams.get("athlete");
  const { activeLinks, fetchAthleteData, athleteData } = useParentPortal();

  const selectedLink = athleteId
    ? activeLinks.find((l) => l.athlete_user_id === athleteId)
    : activeLinks[0];
  const currentAthleteId = selectedLink?.athlete_user_id;

  useEffect(() => {
    if (currentAthleteId && !athleteData[currentAthleteId]) fetchAthleteData(currentAthleteId);
  }, [currentAthleteId]);

  const data = currentAthleteId ? athleteData[currentAthleteId] : null;
  const profile = data?.profile;
  const recruiting = data?.recruiting;
  const gradYear = profile?.graduation_year || 0;
  const is14UPlus = gradYear > 0 && (new Date().getFullYear() + 4 - gradYear) >= 14;

  if (!currentAthleteId) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Link an athlete to view recruiting status.</p>
        <Link to="/parent" className="text-primary text-sm hover:underline mt-2 inline-block">Go to My Athletes</Link>
      </div>
    );
  }

  if (!is14UPlus && !recruiting) {
    return (
      <div className="p-6 lg:p-10 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-display text-foreground">RECRUITING READINESS</h1>
            <p className="text-sm text-muted-foreground">{profile?.display_name}</p>
          </div>
        </div>
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-2xl">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Recruiting features unlock at 14U and above.</p>
          <p className="text-xs mt-1">Focus on development now — recruiting tools will be ready when the time comes.</p>
        </div>
      </div>
    );
  }

  const commitInfo = commitmentLabels[recruiting?.commitment_status || "uncommitted"];

  // Profile completeness calculation
  const completenessChecks = [
    !!recruiting?.gpa,
    !!recruiting?.sat_act_score,
    !!recruiting?.intended_major,
    !!recruiting?.division_target && recruiting.division_target.length > 0,
    !!recruiting?.school_interest_list && recruiting.school_interest_list.length > 0,
    !!recruiting?.verified_stats && recruiting.verified_stats.length > 0,
    !!recruiting?.eligibility_checklist && recruiting.eligibility_checklist.length > 0,
    !!recruiting?.shareable_link,
  ];
  const completeCount = completenessChecks.filter(Boolean).length;
  const completePct = Math.round((completeCount / completenessChecks.length) * 100);

  // School interest tracker
  const schools = (recruiting?.school_interest_list || []) as any[];
  const contacted = schools.filter(s => s.contacted).length;
  const responded = schools.filter(s => s.responded).length;

  // Verified stats
  const verifiedStats = (recruiting?.verified_stats || []) as any[];

  // Eligibility checklist
  const eligibility = (recruiting?.eligibility_checklist || []) as any[];
  const eligibilityDone = eligibility.filter(e => e.isComplete).length;

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">RECRUITING READINESS</h1>
          <p className="text-sm text-muted-foreground">{profile?.display_name} • Class of {gradYear}</p>
        </div>
      </div>

      {recruiting ? (
        <>
          {/* Profile Completeness */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Profile Completeness
              </h3>
              <span className="text-lg font-display text-foreground">{completePct}%</span>
            </div>
            <Progress value={completePct} className="h-3 mb-3" />
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "GPA", done: !!recruiting.gpa },
                { label: "SAT/ACT Score", done: !!recruiting.sat_act_score },
                { label: "Intended Major", done: !!recruiting.intended_major },
                { label: "Division Targets", done: !!recruiting.division_target?.length },
                { label: "School Interest List", done: !!schools.length },
                { label: "Verified Stats", done: !!verifiedStats.length },
                { label: "Eligibility Checklist", done: !!eligibility.length },
                { label: "Shareable Profile Link", done: !!recruiting.shareable_link },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  {item.done
                    ? <CheckCircle2 className="w-3 h-3 text-green-500" />
                    : <Circle className="w-3 h-3 text-muted-foreground" />}
                  <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Commitment + Academic */}
          <div className="grid sm:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Status</p>
                  <p className={`text-xl font-display ${commitInfo.color}`}>{commitInfo.label}</p>
                  {recruiting.committed_school && (
                    <p className="text-sm text-foreground flex items-center gap-1 mt-1">
                      <School className="w-3.5 h-3.5" /> {recruiting.committed_school}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-6">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-2xl font-display text-foreground">{recruiting.gpa || "—"}</p>
                  <p className="text-xs text-muted-foreground">GPA</p>
                </div>
                <div>
                  <p className="text-2xl font-display text-foreground">{recruiting.sat_act_score || "—"}</p>
                  <p className="text-xs text-muted-foreground">SAT/ACT</p>
                </div>
              </div>
              {recruiting.division_target && recruiting.division_target.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {recruiting.division_target.map((d) => (
                    <span key={d} className="px-2 py-1 bg-green-500/10 text-green-500 rounded-lg text-xs">{d}</span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Verified Stats */}
          {verifiedStats.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" /> Verified Stats
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {verifiedStats.map((s: any, i: number) => (
                  <div key={i} className="bg-secondary rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">{s.kpiName}</p>
                    <p className="text-lg font-display text-foreground">{s.value}</p>
                    {s.verifiedBy && <p className="text-[10px] text-green-500">✓ Verified</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* College Interest Tracker */}
          {schools.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-foreground mb-3 flex items-center gap-2">
                <School className="w-4 h-4 text-primary" /> College Coach Interest
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div className="bg-secondary rounded-xl p-3">
                  <p className="text-xl font-display text-foreground">{schools.length}</p>
                  <p className="text-xs text-muted-foreground">Schools</p>
                </div>
                <div className="bg-secondary rounded-xl p-3">
                  <p className="text-xl font-display text-foreground">{contacted}</p>
                  <p className="text-xs text-muted-foreground">Contacted</p>
                </div>
                <div className="bg-secondary rounded-xl p-3">
                  <p className="text-xl font-display text-foreground">{responded}</p>
                  <p className="text-xs text-muted-foreground">Responded</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {schools.slice(0, 8).map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 bg-secondary rounded-lg">
                    <span className="text-foreground flex-1 truncate">{s.schoolName}</span>
                    {s.division && <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">{s.division}</span>}
                    {s.responded && <span className="text-[10px] text-green-500">Responded</span>}
                    {s.visitScheduled && <span className="text-[10px] text-blue-500">Visit ✓</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Next Steps Checklist */}
          {eligibility.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent" /> Next Steps Checklist
                </h3>
                <span className="text-xs text-muted-foreground">{eligibilityDone}/{eligibility.length}</span>
              </div>
              <div className="space-y-2">
                {eligibility.map((e: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {e.isComplete
                      ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />}
                    <span className={e.isComplete ? "text-foreground" : "text-muted-foreground"}>{e.item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Shareable Link */}
          {recruiting.shareable_link && (
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl text-sm">
              <ExternalLink className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Public Profile:</span>
              <a href={recruiting.shareable_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                {recruiting.shareable_link}
              </a>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-2xl">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No recruiting profile set up yet.</p>
          <p className="text-xs mt-1">Your athlete can build their recruiting profile in the Recruiting Hub.</p>
        </div>
      )}
    </div>
  );
};

export default ParentRecruiting;
