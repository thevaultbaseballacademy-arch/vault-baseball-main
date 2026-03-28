import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────

export interface WorkloadEntry {
  id: string;
  athlete_user_id: string;
  record_date: string;
  pitch_count: number | null;
  throwing_count: number | null;
  training_minutes: number | null;
  lesson_minutes: number | null;
  drill_sets_completed: number | null;
  soreness_level: number | null;
  sleep_hours: number | null;
  readiness_score: number | null;
  recovery_status: string | null;
  overuse_flag: boolean | null;
  overuse_alert: string | null;
  sport_type: string;
  created_at: string;
}

export interface WorkloadThreshold {
  id: string;
  age_group: string;
  sport_type: string;
  max_pitches_per_day: number | null;
  max_pitches_per_week: number | null;
  max_training_minutes_per_week: number | null;
  required_rest_days_after: Record<string, number> | null;
  position: string | null;
  owner_configurable: boolean | null;
}

export interface TournamentEvent {
  id: string;
  athlete_user_id: string;
  tournament_name: string;
  start_date: string;
  end_date: string;
  sport_type: string;
  is_active: boolean;
  total_pitches_thrown: number;
  total_games_played: number;
  notes: string | null;
}

export interface TournamentGame {
  id: string;
  tournament_id: string;
  athlete_user_id: string;
  game_number: number;
  game_date: string;
  game_time: string | null;
  pitches_thrown: number;
  innings_pitched: number | null;
  pitch_types: Record<string, number>;
  max_velocity: number | null;
  rest_hours_since_last: number | null;
  safe_to_pitch: boolean;
  safe_to_pitch_reason: string | null;
  pain_reported: boolean;
  pain_location: string | null;
  pain_level: number | null;
  notes: string | null;
}

export type RiskLevel = "green" | "yellow" | "red";

export interface WorkloadAlerts {
  riskLevel: RiskLevel;
  messages: string[];
  coachAlert: boolean;
  parentAlert: boolean;
  lockPitching: boolean;
}

export interface WeeklyStats {
  totalPitches: number;
  totalThrows: number;
  totalTrainingMinutes: number;
  avgSoreness: number;
  avgSleep: number;
  avgReadiness: number;
  trainingLoadScore: number;
  recoveryScore: number;
  daysWithActivity: number;
}

// ── Default Thresholds ──────────────────────────────────────────────

const DEFAULT_THRESHOLDS: Record<string, { daily: number; weekly: number }> = {
  "10U_baseball": { daily: 50, weekly: 75 },
  "12U_baseball": { daily: 65, weekly: 100 },
  "14U_baseball": { daily: 75, weekly: 125 },
  "16U_baseball": { daily: 90, weekly: 150 },
  "18U_baseball": { daily: 105, weekly: 175 },
  "College_baseball": { daily: 120, weekly: 200 },
  "10U_softball": { daily: 50, weekly: 150 },
  "12U_softball": { daily: 50, weekly: 150 },
  "14U_softball": { daily: 75, weekly: 200 },
  "16U_softball": { daily: 100, weekly: 250 },
  "18U_softball": { daily: 100, weekly: 250 },
  "College_softball": { daily: 120, weekly: 300 },
};

// ── Hook ────────────────────────────────────────────────────────────

export const useWorkloadManagement = () => {
  const [entries, setEntries] = useState<WorkloadEntry[]>([]);
  const [thresholds, setThresholds] = useState<WorkloadThreshold[]>([]);
  const [tournaments, setTournaments] = useState<TournamentEvent[]>([]);
  const [tournamentGames, setTournamentGames] = useState<TournamentGame[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // ── Fetch Data ──────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const uid = session.user.id;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const since = thirtyDaysAgo.toISOString().split("T")[0];

      const [entriesRes, threshRes, tournRes, gamesRes] = await Promise.all([
        supabase.from("workload_records").select("*")
          .eq("athlete_user_id", uid)
          .gte("record_date", since)
          .order("record_date", { ascending: false }),
        supabase.from("workload_thresholds").select("*")
          .order("age_group"),
        supabase.from("tournament_events").select("*")
          .eq("athlete_user_id", uid)
          .order("start_date", { ascending: false })
          .limit(10),
        supabase.from("tournament_games").select("*")
          .eq("athlete_user_id", uid)
          .order("game_date", { ascending: false })
          .limit(50),
      ]);

      setEntries((entriesRes.data as any[]) || []);
      setThresholds((threshRes.data as any[]) || []);
      setTournaments((tournRes.data as any[]) || []);
      setTournamentGames((gamesRes.data as any[]) || []);
    } catch (err) {
      console.error("Error fetching workload data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Log Daily Entry ─────────────────────────────────────────────

  const logDailyEntry = async (data: {
    record_date: string;
    pitch_count: number;
    throwing_count: number;
    training_minutes: number;
    lesson_minutes: number;
    drill_sets_completed: number;
    soreness_level: number;
    sleep_hours: number;
    readiness_score: number;
    sport_type: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Compute recovery status & overuse
    const recovery = computeRecoveryStatus(data.soreness_level, data.sleep_hours, data.readiness_score);
    const overuse = data.pitch_count > 0 ? checkOveruse(data.pitch_count, data.sport_type) : { flag: false, alert: null };

    const { error } = await supabase.from("workload_records").upsert({
      athlete_user_id: user.id,
      record_date: data.record_date,
      pitch_count: data.pitch_count,
      throwing_count: data.throwing_count,
      training_minutes: data.training_minutes,
      lesson_minutes: data.lesson_minutes,
      drill_sets_completed: data.drill_sets_completed,
      soreness_level: data.soreness_level,
      sleep_hours: data.sleep_hours,
      readiness_score: data.readiness_score,
      recovery_status: recovery,
      overuse_flag: overuse.flag,
      overuse_alert: overuse.alert,
      sport_type: data.sport_type,
    } as any, { onConflict: "athlete_user_id,record_date" });

    if (error) throw error;
    toast({ title: "Workload logged", description: `${data.record_date} entry saved.` });
    await fetchAll();
  };

  // ── Tournament Management ───────────────────────────────────────

  const createTournament = async (data: {
    tournament_name: string;
    start_date: string;
    end_date: string;
    sport_type: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("tournament_events").insert({
      athlete_user_id: user.id,
      ...data,
    } as any);

    if (error) throw error;
    toast({ title: "Tournament created", description: data.tournament_name });
    await fetchAll();
  };

  const logTournamentGame = async (tournamentId: string, data: {
    game_date: string;
    pitches_thrown: number;
    innings_pitched: number | null;
    pitch_types: Record<string, number>;
    max_velocity: number | null;
    pain_reported: boolean;
    pain_location: string | null;
    pain_level: number | null;
    notes: string | null;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get existing games for this tournament to calculate rest hours + game number
    const existingGames = tournamentGames
      .filter(g => g.tournament_id === tournamentId)
      .sort((a, b) => new Date(b.game_date).getTime() - new Date(a.game_date).getTime());

    const gameNumber = existingGames.length + 1;
    const lastGame = existingGames[0];
    let restHours: number | null = null;
    if (lastGame?.game_time) {
      restHours = Math.round((Date.now() - new Date(lastGame.game_time).getTime()) / 3600000 * 10) / 10;
    }

    // Determine safe-to-pitch
    const totalTournamentPitches = existingGames.reduce((s, g) => s + (g.pitches_thrown || 0), 0) + data.pitches_thrown;
    const { safe, reason } = evaluateSafeToPitch(totalTournamentPitches, restHours, data.pain_reported);

    const { error } = await supabase.from("tournament_games").insert({
      tournament_id: tournamentId,
      athlete_user_id: user.id,
      game_number: gameNumber,
      game_date: data.game_date,
      game_time: new Date().toISOString(),
      pitches_thrown: data.pitches_thrown,
      innings_pitched: data.innings_pitched,
      pitch_types: data.pitch_types,
      max_velocity: data.max_velocity,
      rest_hours_since_last: restHours,
      safe_to_pitch: safe,
      safe_to_pitch_reason: reason,
      pain_reported: data.pain_reported,
      pain_location: data.pain_location,
      pain_level: data.pain_level,
      notes: data.notes,
    } as any);

    if (error) throw error;

    // Update tournament totals
    await supabase.from("tournament_events").update({
      total_pitches_thrown: totalTournamentPitches,
      total_games_played: gameNumber,
    } as any).eq("id", tournamentId);

    toast({ title: "Game logged", description: `Game ${gameNumber} — ${data.pitches_thrown} pitches` });
    await fetchAll();
  };

  // ── Calculation Helpers ─────────────────────────────────────────

  const computeRecoveryStatus = (soreness: number, sleep: number, readiness: number): string => {
    const score = (10 - soreness * 2) + (sleep >= 8 ? 3 : sleep >= 6 ? 1 : -1) + readiness;
    if (score >= 10) return "good";
    if (score >= 6) return "monitor";
    return "rest";
  };

  const checkOveruse = (dailyPitches: number, sportType: string): { flag: boolean; alert: string | null } => {
    // Simple check — the full weekly check is in weeklyStats computation
    const maxDaily = sportType === "softball" ? 100 : 105;
    if (dailyPitches > maxDaily) {
      return { flag: true, alert: `Daily pitch count (${dailyPitches}) exceeds safe threshold` };
    }
    return { flag: false, alert: null };
  };

  const evaluateSafeToPitch = (
    totalPitches: number, restHours: number | null, painReported: boolean
  ): { safe: boolean; reason: string } => {
    if (painReported) return { safe: false, reason: "Pain reported — rest recommended" };
    if (totalPitches > 150) return { safe: false, reason: `Tournament pitch total (${totalPitches}) exceeds safe limit` };
    if (restHours !== null && restHours < 12) return { safe: false, reason: `Only ${restHours.toFixed(1)}h rest — minimum 12h recommended` };
    if (totalPitches > 100) return { safe: true, reason: "Approaching limit — monitor closely" };
    return { safe: true, reason: "Within safe range" };
  };

  // ── Weekly Stats (rolling 7-day) ────────────────────────────────

  const weeklyStats = useMemo((): WeeklyStats => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recent = entries.filter(e => new Date(e.record_date) >= weekAgo);

    const totalPitches = recent.reduce((s, e) => s + (e.pitch_count || 0), 0);
    const totalThrows = recent.reduce((s, e) => s + (e.throwing_count || 0) + (e.pitch_count || 0), 0);
    const totalTrainingMinutes = recent.reduce((s, e) => s + (e.training_minutes || 0) + (e.lesson_minutes || 0), 0);

    const sorenessEntries = recent.filter(e => e.soreness_level != null);
    const avgSoreness = sorenessEntries.length > 0
      ? sorenessEntries.reduce((s, e) => s + (e.soreness_level || 0), 0) / sorenessEntries.length : 0;

    const sleepEntries = recent.filter(e => e.sleep_hours != null);
    const avgSleep = sleepEntries.length > 0
      ? sleepEntries.reduce((s, e) => s + (e.sleep_hours || 0), 0) / sleepEntries.length : 0;

    const readinessEntries = recent.filter(e => e.readiness_score != null);
    const avgReadiness = readinessEntries.length > 0
      ? readinessEntries.reduce((s, e) => s + (e.readiness_score || 0), 0) / readinessEntries.length : 0;

    // Training Load Score: weighted composite (0-100)
    const pitchLoad = Math.min(totalPitches / 200, 1) * 40;
    const volumeLoad = Math.min(totalTrainingMinutes / 600, 1) * 30;
    const intensityLoad = (avgSoreness / 5) * 30;
    const trainingLoadScore = Math.round(pitchLoad + volumeLoad + intensityLoad);

    // Recovery Score (0-100)
    const sleepScore = Math.min(avgSleep / 9, 1) * 40;
    const sorenessScore = ((5 - avgSoreness) / 5) * 30;
    const readinessScoreCalc = (avgReadiness / 10) * 30;
    const recoveryScore = Math.round(sleepScore + sorenessScore + readinessScoreCalc);

    return {
      totalPitches,
      totalThrows,
      totalTrainingMinutes,
      avgSoreness: Math.round(avgSoreness * 10) / 10,
      avgSleep: Math.round(avgSleep * 10) / 10,
      avgReadiness: Math.round(avgReadiness * 10) / 10,
      trainingLoadScore,
      recoveryScore,
      daysWithActivity: recent.filter(e => (e.pitch_count || 0) + (e.training_minutes || 0) > 0).length,
    };
  }, [entries]);

  // ── Alert System ────────────────────────────────────────────────

  const getAlerts = useCallback((ageGroup: string, sportType: string): WorkloadAlerts => {
    const key = `${ageGroup}_${sportType}`;
    const limits = DEFAULT_THRESHOLDS[key] || { daily: 100, weekly: 175 };
    const messages: string[] = [];
    let riskLevel: RiskLevel = "green";
    let coachAlert = false;
    let parentAlert = false;
    let lockPitching = false;

    const todayEntry = entries[0];

    // Weekly pitch check
    if (weeklyStats.totalPitches > limits.weekly) {
      riskLevel = "red";
      messages.push(`Weekly pitch count (${weeklyStats.totalPitches}) exceeds ${limits.weekly} limit`);
      coachAlert = true;
      parentAlert = true;
      lockPitching = true;
    } else if (weeklyStats.totalPitches > limits.weekly * 0.8) {
      riskLevel = "yellow";
      messages.push(`Approaching weekly pitch limit (${weeklyStats.totalPitches}/${limits.weekly})`);
    }

    // Daily check
    if (todayEntry?.pitch_count && todayEntry.pitch_count > limits.daily) {
      riskLevel = "red";
      messages.push(`Today's pitches (${todayEntry.pitch_count}) exceed daily limit of ${limits.daily}`);
      coachAlert = true;
      lockPitching = true;
    }

    // Recovery check
    if (weeklyStats.recoveryScore < 30) {
      if (riskLevel !== "red") riskLevel = "red";
      messages.push("Recovery score critically low — rest day enforced");
      coachAlert = true;
      parentAlert = true;
      lockPitching = true;
    } else if (weeklyStats.recoveryScore < 50) {
      if (riskLevel === "green") riskLevel = "yellow";
      messages.push("Recovery below optimal — reduce intensity recommended");
    }

    // Soreness check
    if (weeklyStats.avgSoreness >= 4) {
      if (riskLevel !== "red") riskLevel = "red";
      messages.push("High average soreness — rest recommended");
      coachAlert = true;
      parentAlert = true;
    } else if (weeklyStats.avgSoreness >= 3) {
      if (riskLevel === "green") riskLevel = "yellow";
      messages.push("Elevated soreness levels — monitor closely");
    }

    // Sleep check
    if (weeklyStats.avgSleep < 6) {
      if (riskLevel === "green") riskLevel = "yellow";
      messages.push("Insufficient sleep — averaging under 6 hours");
    }

    if (messages.length === 0) {
      messages.push("All metrics within safe range — train as planned");
    }

    return { riskLevel, messages, coachAlert, parentAlert, lockPitching };
  }, [entries, weeklyStats]);

  // ── Tournament "Safe to Pitch" ──────────────────────────────────

  const getTournamentPitchStatus = useCallback((tournamentId: string) => {
    const games = tournamentGames
      .filter(g => g.tournament_id === tournamentId)
      .sort((a, b) => new Date(a.game_date).getTime() - new Date(b.game_date).getTime());

    const totalPitches = games.reduce((s, g) => s + (g.pitches_thrown || 0), 0);
    const lastGame = games[games.length - 1];

    let restHoursSinceLast: number | null = null;
    if (lastGame?.game_time) {
      restHoursSinceLast = Math.round((Date.now() - new Date(lastGame.game_time).getTime()) / 3600000 * 10) / 10;
    }

    const hasPainInAnyGame = games.some(g => g.pain_reported);
    const { safe, reason } = evaluateSafeToPitch(totalPitches, restHoursSinceLast, hasPainInAnyGame);

    return {
      totalPitches,
      gamesPlayed: games.length,
      restHoursSinceLast,
      safeToPitch: safe,
      reason,
      games,
    };
  }, [tournamentGames]);

  // ── Pitching Order Suggestion ───────────────────────────────────
  // This would rank multiple athletes — simplified for single-athlete view

  const getThresholdForAgeGroup = useCallback((ageGroup: string, sportType: string): WorkloadThreshold | null => {
    return thresholds.find(t =>
      t.age_group === ageGroup &&
      t.sport_type === sportType &&
      t.position === "pitcher"
    ) || null;
  }, [thresholds]);

  return {
    entries,
    thresholds,
    tournaments,
    tournamentGames,
    loading,
    weeklyStats,
    logDailyEntry,
    createTournament,
    logTournamentGame,
    getAlerts,
    getTournamentPitchStatus,
    getThresholdForAgeGroup,
    refetch: fetchAll,
  };
};
