import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PitchCount {
  id: string;
  user_id: string;
  session_date: string;
  session_type: string;
  pitch_count: number;
  innings_pitched: number | null;
  pitch_types: Record<string, number>;
  max_velocity: number | null;
  avg_velocity: number | null;
  pain_reported: boolean;
  pain_location: string | null;
  pain_level: number | null;
  notes: string | null;
  created_at: string;
}

export interface ArmCareLog {
  id: string;
  user_id: string;
  log_date: string;
  exercises_completed: string[];
  band_work_minutes: number;
  stretching_minutes: number;
  icing_minutes: number;
  arm_feeling: number | null;
  rom_score: number | null;
  notes: string | null;
}

export interface InjuryReport {
  id: string;
  user_id: string;
  injury_date: string;
  body_part: string;
  injury_type: string;
  severity: number;
  description: string | null;
  treatment: string | null;
  is_resolved: boolean;
  resolved_date: string | null;
  days_missed: number;
  cleared_by_medical: boolean;
}

export interface WorkloadRule {
  id: string;
  age_min: number;
  age_max: number;
  max_pitches_per_game: number;
  max_pitches_per_week: number;
  max_innings_per_week: number;
  required_rest_days_after_high: number;
  high_pitch_threshold: number;
  notes: string | null;
  sport_type: string;
}

export const useWorkloadHealth = () => {
  const [pitchCounts, setPitchCounts] = useState<PitchCount[]>([]);
  const [armCareLogs, setArmCareLogs] = useState<ArmCareLog[]>([]);
  const [injuries, setInjuries] = useState<InjuryReport[]>([]);
  const [rules, setRules] = useState<WorkloadRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const since = thirtyDaysAgo.toISOString().split("T")[0];

      const [pcRes, acRes, injRes, rulesRes] = await Promise.all([
        supabase.from("pitch_counts").select("*").eq("user_id", session.user.id)
          .gte("session_date", since).order("session_date", { ascending: false }),
        supabase.from("arm_care_logs").select("*").eq("user_id", session.user.id)
          .gte("log_date", since).order("log_date", { ascending: false }),
        supabase.from("injury_reports").select("*").eq("user_id", session.user.id)
          .order("injury_date", { ascending: false }).limit(20),
        supabase.from("workload_rules").select("*").order("age_min"),
      ]);

      setPitchCounts((pcRes.data as any[]) || []);
      setArmCareLogs((acRes.data as any[]) || []);
      setInjuries((injRes.data as any[]) || []);
      setRules((rulesRes.data as any[]) || []);
    } catch (err) {
      console.error("Error fetching workload data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addPitchCount = async (data: Omit<PitchCount, "id" | "user_id" | "created_at">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("pitch_counts").insert({ ...data, user_id: user.id } as any);
    if (error) throw error;
    toast({ title: "Pitch count logged", description: `${data.pitch_count} pitches recorded.` });
    await fetchAll();
  };

  const addArmCareLog = async (data: Omit<ArmCareLog, "id" | "user_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("arm_care_logs").upsert(
      { ...data, user_id: user.id } as any,
      { onConflict: "user_id,log_date" }
    );
    if (error) throw error;
    toast({ title: "Arm care logged", description: "Recovery protocol saved." });
    await fetchAll();
  };

  const addInjuryReport = async (data: Omit<InjuryReport, "id" | "user_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("injury_reports").insert({ ...data, user_id: user.id } as any);
    if (error) throw error;
    toast({ title: "Injury reported", description: "Report saved. Take care of yourself!" });
    await fetchAll();
  };

  const resolveInjury = async (injuryId: string) => {
    const { error } = await supabase.from("injury_reports").update({
      is_resolved: true,
      resolved_date: new Date().toISOString().split("T")[0],
    } as any).eq("id", injuryId);
    if (error) throw error;
    toast({ title: "Injury resolved" });
    await fetchAll();
  };

  // Computed stats
  const weeklyPitches = pitchCounts
    .filter((pc) => {
      const d = new Date(pc.session_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    })
    .reduce((sum, pc) => sum + pc.pitch_count, 0);

  const activeInjuries = injuries.filter((i) => !i.is_resolved);

  const armCareStreak = (() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];
      if (armCareLogs.find((l) => l.log_date === dateStr)) {
        streak++;
      } else break;
    }
    return streak;
  })();

  return {
    pitchCounts, armCareLogs, injuries, rules, loading,
    addPitchCount, addArmCareLog, addInjuryReport, resolveInjury,
    weeklyPitches, activeInjuries, armCareStreak, refetch: fetchAll,
  };
};
