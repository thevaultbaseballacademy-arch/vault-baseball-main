import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsFilters {
  teamId?: string;
  role?: string;
  certType?: string;
  status?: string;
  dateRange: number; // days
}

export interface KPIData {
  compliancePercent: number;
  expiringIn30Days: number;
  accessLocked: number;
  passRate90Days: number;
  avgRiskIndex: number;
}

export interface StatusBreakdown {
  Active: number;
  Expiring: number;
  Expired: number;
  Locked: number;
}

export interface CoachWithRisk {
  id: string;
  name: string;
  email: string;
  role: string;
  certifications: Array<{
    cert_type: string;
    status: string;
    expiration_date: string | null;
    last_score: number | null;
  }>;
  riskIndex: number;
  status: string;
}

export interface ExamPerformanceData {
  passRateTrend: Array<{ date: string; passRate: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
  hardestQuestions: Array<{
    questionId: string;
    incorrectCount: number;
    totalAttempts: number;
    incorrectRate: number;
  }>;
}

const calculateRiskIndex = (
  certifications: CoachWithRisk["certifications"],
  recentAttempts: Array<{ pass_fail: boolean; created_at: string; score: number }>
): number => {
  let risk = 0;

  // +35 if any cert is Expired or Locked
  if (certifications.some((c) => c.status === "Expired" || c.status === "Locked")) {
    risk += 35;
  }

  // +20 if any cert expires within 14 days
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
  if (certifications.some((c) => c.expiration_date && new Date(c.expiration_date) <= twoWeeksFromNow)) {
    risk += 20;
  }

  // +15 if last attempt failed
  const sortedAttempts = [...recentAttempts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  if (sortedAttempts.length > 0 && !sortedAttempts[0].pass_fail) {
    risk += 15;
  }

  // +10 if last_score < 90 on any cert
  if (certifications.some((c) => c.last_score !== null && c.last_score < 90)) {
    risk += 10;
  }

  // +10 if attempts > 2 in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentAttemptCount = recentAttempts.filter(
    (a) => new Date(a.created_at) >= thirtyDaysAgo
  ).length;
  if (recentAttemptCount > 2) {
    risk += 10;
  }

  return Math.min(risk, 100);
};

export const useCertificationAnalytics = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["certification-analytics", filters],
    queryFn: async () => {
      // Fetch all coaches
      let coachesQuery = supabase.from("coaches").select("*").eq("status", "Active" as const);
      if (filters.teamId) {
        coachesQuery = coachesQuery.eq("team_id", filters.teamId);
      }
      if (filters.role) {
        coachesQuery = coachesQuery.eq("role", filters.role as "Coach" | "Director" | "OrgAdmin" | "VAULTHQ");
      }
      const { data: coaches, error: coachesError } = await coachesQuery;
      if (coachesError) throw coachesError;

      // Fetch all certifications
      let certsQuery = supabase.from("admin_certifications").select("*");
      if (filters.certType) {
        certsQuery = certsQuery.eq("cert_type", filters.certType as "Foundations" | "Performance" | "Catcher" | "Infield" | "Outfield");
      }
      if (filters.status) {
        certsQuery = certsQuery.eq("status", filters.status as "Active" | "Expiring" | "Expired" | "Locked");
      }
      const { data: certifications, error: certsError } = await certsQuery;
      if (certsError) throw certsError;

      // Fetch exam attempts for pass rate and risk calculation
      const dateRangeStart = new Date();
      dateRangeStart.setDate(dateRangeStart.getDate() - filters.dateRange);
      const { data: attempts, error: attemptsError } = await supabase
        .from("admin_exam_attempts")
        .select("*")
        .gte("created_at", dateRangeStart.toISOString());
      if (attemptsError) throw attemptsError;

      // Calculate KPIs
      const totalCoaches = coaches?.length || 0;
      const certifiedCoachIds = new Set(
        certifications?.filter((c) => c.status === "Active").map((c) => c.coach_id) || []
      );
      const compliancePercent = totalCoaches > 0 
        ? Math.round((certifiedCoachIds.size / totalCoaches) * 100) 
        : 0;

      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringIn30Days = certifications?.filter(
        (c) => c.expiration_date && 
               new Date(c.expiration_date) <= thirtyDaysFromNow &&
               ["Active", "Expiring"].includes(c.status)
      ).length || 0;

      const accessLocked = certifications?.filter(
        (c) => ["Expired", "Locked"].includes(c.status)
      ).length || 0;

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const recentAttempts = attempts?.filter(
        (a) => new Date(a.created_at) >= ninetyDaysAgo
      ) || [];
      const passRate90Days = recentAttempts.length > 0
        ? Math.round((recentAttempts.filter((a) => a.pass_fail).length / recentAttempts.length) * 100)
        : 0;

      // Status breakdown
      const statusBreakdown: StatusBreakdown = {
        Active: certifications?.filter((c) => c.status === "Active").length || 0,
        Expiring: certifications?.filter((c) => c.status === "Expiring").length || 0,
        Expired: certifications?.filter((c) => c.status === "Expired").length || 0,
        Locked: certifications?.filter((c) => c.status === "Locked").length || 0,
      };

      // Build coaches with risk
      const coachesWithRisk: CoachWithRisk[] = (coaches || []).map((coach) => {
        const coachCerts = certifications?.filter((c) => c.coach_id === coach.id) || [];
        const coachAttempts = attempts?.filter((a) => a.coach_id === coach.id) || [];
        
        return {
          id: coach.id,
          name: coach.name,
          email: coach.email,
          role: coach.role,
          status: coach.status,
          certifications: coachCerts.map((c) => ({
            cert_type: c.cert_type,
            status: c.status,
            expiration_date: c.expiration_date,
            last_score: c.last_score,
          })),
          riskIndex: calculateRiskIndex(
            coachCerts.map((c) => ({
              cert_type: c.cert_type,
              status: c.status,
              expiration_date: c.expiration_date,
              last_score: c.last_score,
            })),
            coachAttempts.map((a) => ({
              pass_fail: a.pass_fail,
              created_at: a.created_at,
              score: a.score,
            }))
          ),
        };
      });

      const avgRiskIndex = coachesWithRisk.length > 0
        ? Math.round(coachesWithRisk.reduce((acc, c) => acc + c.riskIndex, 0) / coachesWithRisk.length)
        : 0;

      const kpis: KPIData = {
        compliancePercent,
        expiringIn30Days,
        accessLocked,
        passRate90Days,
        avgRiskIndex,
      };

      return {
        kpis,
        statusBreakdown,
        coachesWithRisk: coachesWithRisk.sort((a, b) => b.riskIndex - a.riskIndex),
        totalCoaches,
      };
    },
  });
};

export const useExamPerformanceData = (dateRange: number) => {
  return useQuery({
    queryKey: ["exam-performance", dateRange],
    queryFn: async () => {
      const dateRangeStart = new Date();
      dateRangeStart.setDate(dateRangeStart.getDate() - dateRange);

      // Fetch attempts for trends
      const { data: attempts, error: attemptsError } = await supabase
        .from("admin_exam_attempts")
        .select("*")
        .gte("created_at", dateRangeStart.toISOString())
        .order("created_at", { ascending: true });
      if (attemptsError) throw attemptsError;

      // Fetch question results for hardest questions
      const { data: questionResults, error: qrError } = await supabase
        .from("question_results")
        .select("*, admin_exam_attempts!inner(created_at)")
        .gte("admin_exam_attempts.created_at", dateRangeStart.toISOString());
      if (qrError) throw qrError;

      // Calculate pass rate trend by week
      const weeklyData: Record<string, { passed: number; total: number }> = {};
      attempts?.forEach((attempt) => {
        const weekStart = new Date(attempt.created_at);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { passed: 0, total: 0 };
        }
        weeklyData[weekKey].total++;
        if (attempt.pass_fail) weeklyData[weekKey].passed++;
      });

      const passRateTrend = Object.entries(weeklyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
          date,
          passRate: data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0,
        }));

      // Score distribution
      const scoreRanges = ["0-59", "60-69", "70-79", "80-89", "90-100"];
      const scoreDistribution = scoreRanges.map((range) => {
        const [min, max] = range.split("-").map(Number);
        return {
          range,
          count: attempts?.filter((a) => a.score >= min && a.score <= max).length || 0,
        };
      });

      // Hardest questions
      const questionStats: Record<string, { incorrect: number; total: number }> = {};
      questionResults?.forEach((qr) => {
        if (!questionStats[qr.question_id]) {
          questionStats[qr.question_id] = { incorrect: 0, total: 0 };
        }
        questionStats[qr.question_id].total++;
        if (!qr.is_correct) questionStats[qr.question_id].incorrect++;
      });

      const hardestQuestions = Object.entries(questionStats)
        .map(([questionId, stats]) => ({
          questionId,
          incorrectCount: stats.incorrect,
          totalAttempts: stats.total,
          incorrectRate: Math.round((stats.incorrect / stats.total) * 100),
        }))
        .sort((a, b) => b.incorrectRate - a.incorrectRate)
        .slice(0, 10);

      return {
        passRateTrend,
        scoreDistribution,
        hardestQuestions,
      } as ExamPerformanceData;
    },
  });
};
