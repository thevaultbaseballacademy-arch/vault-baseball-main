import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { DataSource, DeviceRegistryEntry, DeviceSyncLog } from "@/types/deviceMetrics";

// ── Types ──────────────────────────────────────────────────────────

export interface KPIIngestionInput {
  kpi_name: string;
  kpi_category: string;
  kpi_value: number;
  kpi_unit?: string;
  source: DataSource;
  recorded_at?: string;
  notes?: string;
  session_id?: string;
  recorded_by?: string;
}

export interface BulkIngestionResult {
  imported: number;
  failed: number;
  errors: string[];
}

// ── KPI Category / Name Presets by Source ──────────────────────────

export const SOURCE_KPI_PRESETS: Record<string, Array<{
  name: string;
  category: string;
  unit: string;
}>> = {
  pocket_radar: [
    { name: "Fastball Velocity", category: "pitching", unit: "mph" },
    { name: "Changeup Velocity", category: "pitching", unit: "mph" },
    { name: "Throwing Velocity", category: "throwing", unit: "mph" },
    { name: "Exit Velocity", category: "hitting", unit: "mph" },
  ],
  blast_motion: [
    { name: "Bat Speed", category: "hitting", unit: "mph" },
    { name: "Attack Angle", category: "hitting", unit: "deg" },
    { name: "Time to Contact", category: "hitting", unit: "sec" },
    { name: "On-Plane Efficiency", category: "hitting", unit: "%" },
    { name: "Connection Score", category: "hitting", unit: "pts" },
    { name: "Rotation Score", category: "hitting", unit: "pts" },
    { name: "Power Index", category: "hitting", unit: "pts" },
  ],
  rapsodo_pitching: [
    { name: "Fastball Velocity", category: "pitching", unit: "mph" },
    { name: "Spin Rate", category: "pitching", unit: "rpm" },
    { name: "Spin Efficiency", category: "pitching", unit: "%" },
    { name: "Horizontal Break", category: "pitching", unit: "in" },
    { name: "Vertical Break", category: "pitching", unit: "in" },
    { name: "Release Extension", category: "pitching", unit: "ft" },
  ],
  rapsodo_hitting: [
    { name: "Exit Velocity", category: "hitting", unit: "mph" },
    { name: "Launch Angle", category: "hitting", unit: "deg" },
    { name: "Distance", category: "hitting", unit: "ft" },
    { name: "Spin Rate (Batted)", category: "hitting", unit: "rpm" },
  ],
  hittrax: [
    { name: "Exit Velocity", category: "hitting", unit: "mph" },
    { name: "Launch Angle", category: "hitting", unit: "deg" },
    { name: "Distance", category: "hitting", unit: "ft" },
    { name: "Hard Hit %", category: "hitting", unit: "%" },
  ],
  trackman: [
    { name: "Fastball Velocity", category: "pitching", unit: "mph" },
    { name: "Spin Rate", category: "pitching", unit: "rpm" },
    { name: "Exit Velocity", category: "hitting", unit: "mph" },
    { name: "Launch Angle", category: "hitting", unit: "deg" },
    { name: "Distance", category: "hitting", unit: "ft" },
  ],
  diamond_kinetics: [
    { name: "Bat Speed", category: "hitting", unit: "mph" },
    { name: "Hand Speed", category: "hitting", unit: "mph" },
    { name: "Power Transfer", category: "hitting", unit: "%" },
    { name: "Attack Angle", category: "hitting", unit: "deg" },
  ],
  manual: [
    { name: "Fastball Velocity", category: "pitching", unit: "mph" },
    { name: "Exit Velocity", category: "hitting", unit: "mph" },
    { name: "Bat Speed", category: "hitting", unit: "mph" },
    { name: "Spin Rate", category: "pitching", unit: "rpm" },
    { name: "Pop Time", category: "catching", unit: "sec" },
    { name: "60-Yard Dash", category: "running", unit: "sec" },
    { name: "Throwing Velocity", category: "throwing", unit: "mph" },
  ],
};

// ── Hook ────────────────────────────────────────────────────────────

export const useDeviceIngestion = () => {
  const [registry, setRegistry] = useState<DeviceRegistryEntry[]>([]);
  const [syncLogs, setSyncLogs] = useState<DeviceSyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [regRes, logRes] = await Promise.all([
        supabase.from("device_registry").select("*").eq("is_active", true).order("priority_order"),
        supabase.from("device_sync_logs").select("*").order("created_at", { ascending: false }).limit(20),
      ]);
      setRegistry((regRes.data as any[]) || []);
      setSyncLogs((logRes.data as any[]) || []);
    } catch (err) {
      console.error("Error fetching device data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Single KPI Ingestion ──────────────────────────────────────

  const ingestKPI = async (input: KPIIngestionInput): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.from("athlete_kpis").insert({
      user_id: user.id,
      kpi_name: input.kpi_name,
      kpi_category: input.kpi_category,
      kpi_value: input.kpi_value,
      kpi_unit: input.kpi_unit || null,
      source: input.source,
      recorded_at: input.recorded_at || new Date().toISOString(),
      recorded_by: input.recorded_by || user.id,
      session_id: input.session_id || null,
      notes: input.notes || null,
    });

    if (error) {
      console.error("KPI ingestion error:", error);
      return false;
    }

    // Log the sync
    await supabase.from("device_sync_logs").insert({
      user_id: user.id,
      device_type: input.source,
      sync_type: input.source === "manual" ? "manual" : "api_import",
      records_imported: 1,
      sync_status: "completed",
      completed_at: new Date().toISOString(),
    } as any);

    return true;
  };

  // ── Bulk KPI Ingestion (CSV or batch) ─────────────────────────

  const ingestBulk = async (
    inputs: KPIIngestionInput[],
    source: DataSource
  ): Promise<BulkIngestionResult> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { imported: 0, failed: inputs.length, errors: ["Not authenticated"] };

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    // Log sync start
    const { data: syncLog } = await supabase.from("device_sync_logs").insert({
      user_id: user.id,
      device_type: source,
      sync_type: source === "csv_import" ? "csv_import" : "api_import",
      sync_status: "in_progress",
    } as any).select().single();

    // Insert in batches of 50
    for (let i = 0; i < inputs.length; i += 50) {
      const batch = inputs.slice(i, i + 50).map(inp => ({
        user_id: user.id,
        kpi_name: inp.kpi_name,
        kpi_category: inp.kpi_category,
        kpi_value: inp.kpi_value,
        kpi_unit: inp.kpi_unit || null,
        source: inp.source || source,
        recorded_at: inp.recorded_at || new Date().toISOString(),
        recorded_by: inp.recorded_by || user.id,
        notes: inp.notes || null,
      }));

      const { error } = await supabase.from("athlete_kpis").insert(batch);
      if (error) {
        failed += batch.length;
        errors.push(`Batch ${Math.floor(i / 50) + 1}: ${error.message}`);
      } else {
        imported += batch.length;
      }
    }

    // Update sync log
    if (syncLog) {
      await supabase.from("device_sync_logs").update({
        records_imported: imported,
        records_failed: failed,
        sync_status: failed > 0 ? "completed" : "completed",
        error_message: errors.length > 0 ? errors.join("; ") : null,
        completed_at: new Date().toISOString(),
      } as any).eq("id", syncLog.id);
    }

    await fetchData();
    return { imported, failed, errors };
  };

  // ── Quick Manual Entry (coach radar gun reading) ──────────────

  const quickManualEntry = async (
    kpiName: string,
    category: string,
    value: number,
    unit: string,
    deviceSource: DataSource = "manual"
  ) => {
    const success = await ingestKPI({
      kpi_name: kpiName,
      kpi_category: category,
      kpi_value: value,
      kpi_unit: unit,
      source: deviceSource,
    });

    if (success) {
      toast({
        title: "Reading saved",
        description: `${kpiName}: ${value} ${unit} — Source: ${deviceSource}`,
      });
    }
    return success;
  };

  // ── CSV Parser ────────────────────────────────────────────────

  const parseCSV = (csvText: string, source: DataSource): KPIIngestionInput[] => {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const results: KPIIngestionInput[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim());
      if (cols.length < 2) continue;

      // Try to detect columns: name, value, unit, category, date
      const nameIdx = headers.findIndex(h => ["name", "kpi", "metric", "stat"].includes(h));
      const valueIdx = headers.findIndex(h => ["value", "reading", "result", "speed", "velocity"].includes(h));
      const unitIdx = headers.findIndex(h => ["unit", "units"].includes(h));
      const catIdx = headers.findIndex(h => ["category", "type", "cat"].includes(h));
      const dateIdx = headers.findIndex(h => ["date", "recorded_at", "time", "timestamp"].includes(h));

      const name = nameIdx >= 0 ? cols[nameIdx] : cols[0];
      const value = valueIdx >= 0 ? parseFloat(cols[valueIdx]) : parseFloat(cols[1]);
      if (isNaN(value)) continue;

      results.push({
        kpi_name: name,
        kpi_category: catIdx >= 0 ? cols[catIdx] : "general",
        kpi_value: value,
        kpi_unit: unitIdx >= 0 ? cols[unitIdx] : undefined,
        source,
        recorded_at: dateIdx >= 0 ? cols[dateIdx] : undefined,
      });
    }

    return results;
  };

  return {
    registry,
    syncLogs,
    loading,
    ingestKPI,
    ingestBulk,
    quickManualEntry,
    parseCSV,
    refetch: fetchData,
  };
};
