/**
 * VAULT™ Device Data Parsers
 * 
 * Real CSV/JSON parsers for each supported device format.
 * All format knowledge is based on publicly documented export schemas
 * from each manufacturer's official documentation and user manuals.
 * No proprietary code or licensed content is reproduced.
 */

export interface ParsedRow {
  kpi_name: string;
  kpi_category: "pitching" | "hitting" | "throwing" | "running" | "biometric";
  kpi_value: number;
  kpi_unit: string;
  source: string;
  recorded_at?: string;
  notes?: string;
  raw_fields?: Record<string, string>;
}

export interface ParseResult {
  rows: ParsedRow[];
  errors: string[];
  deviceDetected: string | null;
  rowsParsed: number;
  rowsSkipped: number;
}

// ── Utility ──────────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += line[i];
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSVToRows(csv: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csv.trim().split("\n").filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]).map(h => h.replace(/^\uFEFF/, "").trim()); // strip BOM
  const rows = lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
  return { headers, rows };
}

function numOrNull(val: string | undefined): number | null {
  if (!val || val.trim() === "" || val === "-" || val === "N/A") return null;
  const n = parseFloat(val.replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

function detectDevice(headers: string[]): string | null {
  const h = headers.map(x => x.toLowerCase().replace(/\s/g, "_"));
  if (h.some(x => x.includes("spin_efficiency") || x.includes("spin_axis") || x.includes("horizontal_break"))) return "rapsodo";
  if (h.some(x => x.includes("plane_score") || x.includes("connection_score") || x.includes("rotation_score"))) return "blast_motion";
  if (h.some(x => x.includes("pfxx") || x.includes("pfxz") || x.includes("induced_vert_brk") || x.includes("plate_x"))) return "trackman";
  if (h.some(x => x.includes("hard_hit") || x.includes("statcast") || x === "bip_result")) return "hittrax";
  if (h.some(x => x.includes("swing_speed") || x.includes("power_transfer"))) return "diamond_kinetics";
  if (h.some(x => x.includes("max_velocity") || x === "reading_mph")) return "pocket_radar";
  return null;
}

// ── Rapsodo Pitching 2.0 ──────────────────────────────────────────────────────
// Export columns: Date, Time, Pitch Type, Velocity, Spin Rate, Spin Axis,
//   Spin Efficiency, True Spin, Horizontal Break, Vertical Break (Induced),
//   Vertical Break (Total), Release Height, Release Side, Extension
function parseRapsodoPitching(rows: Record<string, string>[], errors: string[]): ParsedRow[] {
  const out: ParsedRow[] = [];
  rows.forEach((row, i) => {
    const date = row["Date"] || row["date"] || undefined;
    const pitchType = row["Pitch Type"] || row["pitch_type"] || "";
    const noteStr = pitchType ? `${pitchType} pitch` : undefined;

    const fields: [string, string, string, "pitching"][] = [
      ["Velocity", "Fastball Velocity", "mph", "pitching"],
      ["Spin Rate", "Spin Rate", "rpm", "pitching"],
      ["Spin Efficiency", "Spin Efficiency", "%", "pitching"],
      ["Horizontal Break", "Horizontal Break", "in", "pitching"],
      ["Vertical Break (Induced)", "Induced Vertical Break", "in", "pitching"],
      ["Extension", "Release Extension", "ft", "pitching"],
    ];

    fields.forEach(([col, kpiName, unit, cat]) => {
      const v = numOrNull(row[col]);
      if (v !== null) {
        out.push({ kpi_name: kpiName, kpi_category: cat, kpi_value: v, kpi_unit: unit, source: "rapsodo_pitching", recorded_at: date, notes: noteStr, raw_fields: row });
      }
    });

    if (out.length === 0 && i === 0) errors.push("No recognized Rapsodo pitching columns found. Check export format.");
  });
  return out;
}

// ── Rapsodo Hitting 3.0 ───────────────────────────────────────────────────────
// Columns: Date, Exit Velocity, Launch Angle, Direction, Distance, Spin Rate
function parseRapsodoHitting(rows: Record<string, string>[], errors: string[]): ParsedRow[] {
  const out: ParsedRow[] = [];
  rows.forEach((row) => {
    const date = row["Date"] || row["date"] || undefined;
    const fields: [string, string, string, "hitting"][] = [
      ["Exit Velocity", "Exit Velocity", "mph", "hitting"],
      ["Launch Angle", "Launch Angle", "deg", "hitting"],
      ["Distance", "Distance", "ft", "hitting"],
      ["Spin Rate", "Spin Rate (Batted)", "rpm", "hitting"],
    ];
    fields.forEach(([col, kpiName, unit, cat]) => {
      const v = numOrNull(row[col]);
      if (v !== null) {
        out.push({ kpi_name: kpiName, kpi_category: cat, kpi_value: v, kpi_unit: unit, source: "rapsodo_hitting", recorded_at: date, raw_fields: row });
      }
    });
  });
  return out;
}

// ── Blast Motion (Blast Connect CSV export) ───────────────────────────────────
// Columns: Date, Bat Speed, Attack Angle, Time To Contact, On-Plane Efficiency,
//   Connection Score, Rotation Score, Power Index, Peak Hand Speed, Body Rotation
function parseBlastMotion(rows: Record<string, string>[], errors: string[]): ParsedRow[] {
  const out: ParsedRow[] = [];
  rows.forEach((row) => {
    const date = row["Date"] || row["Session Date"] || undefined;
    const fields: [string, string, string, "hitting"][] = [
      ["Bat Speed (mph)", "Bat Speed", "mph", "hitting"],
      ["Attack Angle (deg)", "Attack Angle", "deg", "hitting"],
      ["Time To Contact (sec)", "Time to Contact", "sec", "hitting"],
      ["On-Plane Efficiency (%)", "On-Plane Efficiency", "%", "hitting"],
      ["Connection Score", "Connection Score", "pts", "hitting"],
      ["Rotation Score", "Rotation Score", "pts", "hitting"],
      ["Power Index", "Power Index", "pts", "hitting"],
      ["Peak Hand Speed (mph)", "Peak Hand Speed", "mph", "hitting"],
      ["Body Rotation (rpm)", "Body Rotation", "rpm", "hitting"],
    ];
    // Also try without units in column name
    const altFields: [string, string, string, "hitting"][] = [
      ["Bat Speed", "Bat Speed", "mph", "hitting"],
      ["Attack Angle", "Attack Angle", "deg", "hitting"],
      ["Time To Contact", "Time to Contact", "sec", "hitting"],
      ["On-Plane Efficiency", "On-Plane Efficiency", "%", "hitting"],
      ["Connection Score", "Connection Score", "pts", "hitting"],
      ["Rotation Score", "Rotation Score", "pts", "hitting"],
      ["Power Index", "Power Index", "pts", "hitting"],
      ["Peak Hand Speed", "Peak Hand Speed", "mph", "hitting"],
    ];
    const toTry = [...fields, ...altFields];
    toTry.forEach(([col, kpiName, unit, cat]) => {
      const v = numOrNull(row[col]);
      if (v !== null) {
        out.push({ kpi_name: kpiName, kpi_category: cat, kpi_value: v, kpi_unit: unit, source: "blast_motion", recorded_at: date, raw_fields: row });
      }
    });
  });
  return out;
}

// ── TrackMan Baseball (CSV export from Coach app) ─────────────────────────────
// Columns: Date, Pitch Type, RelSpeed, SpinRate, SpinAxis, SpinEff, InducedVertBreak,
//   HorzBreak, PlateLocHeight, PlateLocSide, Extension, ExitSpeed, Angle, Distance
function parseTrackman(rows: Record<string, string>[], errors: string[]): ParsedRow[] {
  const out: ParsedRow[] = [];
  rows.forEach((row) => {
    const date = row["Date"] || row["date"] || undefined;
    const pitchType = row["Pitch Type"] || row["TaggedPitchType"] || "";

    const pitchFields: [string, string, string, "pitching"][] = [
      ["RelSpeed", "Fastball Velocity", "mph", "pitching"],
      ["SpinRate", "Spin Rate", "rpm", "pitching"],
      ["SpinEff", "Spin Efficiency", "%", "pitching"],
      ["InducedVertBreak", "Induced Vertical Break", "in", "pitching"],
      ["HorzBreak", "Horizontal Break", "in", "pitching"],
      ["Extension", "Release Extension", "ft", "pitching"],
    ];
    const hitFields: [string, string, string, "hitting"][] = [
      ["ExitSpeed", "Exit Velocity", "mph", "hitting"],
      ["Angle", "Launch Angle", "deg", "hitting"],
      ["Distance", "Distance", "ft", "hitting"],
    ];

    [...pitchFields, ...hitFields].forEach(([col, kpiName, unit, cat]) => {
      const v = numOrNull(row[col]);
      if (v !== null) {
        out.push({ kpi_name: kpiName, kpi_category: cat as any, kpi_value: v, kpi_unit: unit, source: "trackman", recorded_at: date, notes: pitchType || undefined, raw_fields: row });
      }
    });
  });
  return out;
}

// ── HitTrax ───────────────────────────────────────────────────────────────────
function parseHittrax(rows: Record<string, string>[], errors: string[]): ParsedRow[] {
  const out: ParsedRow[] = [];
  rows.forEach((row) => {
    const date = row["Date"] || row["date"] || undefined;
    const fields: [string, string, string, "hitting"][] = [
      ["Exit Velocity", "Exit Velocity", "mph", "hitting"],
      ["Launch Angle", "Launch Angle", "deg", "hitting"],
      ["Distance", "Distance", "ft", "hitting"],
      ["Hard Hit %", "Hard Hit %", "%", "hitting"],
    ];
    fields.forEach(([col, kpiName, unit, cat]) => {
      const v = numOrNull(row[col]);
      if (v !== null) {
        out.push({ kpi_name: kpiName, kpi_category: cat, kpi_value: v, kpi_unit: unit, source: "hittrax", recorded_at: date, raw_fields: row });
      }
    });
  });
  return out;
}

// ── Diamond Kinetics SwingTracker ─────────────────────────────────────────────
function parseDiamondKinetics(rows: Record<string, string>[], errors: string[]): ParsedRow[] {
  const out: ParsedRow[] = [];
  rows.forEach((row) => {
    const date = row["Date"] || row["date"] || undefined;
    const fields: [string, string, string, "hitting"][] = [
      ["Swing Speed", "Bat Speed", "mph", "hitting"],
      ["Power", "Power Index", "pts", "hitting"],
      ["Attack Angle", "Attack Angle", "deg", "hitting"],
      ["Hand Speed", "Peak Hand Speed", "mph", "hitting"],
      ["Power Transfer", "Power Transfer", "%", "hitting"],
    ];
    fields.forEach(([col, kpiName, unit, cat]) => {
      const v = numOrNull(row[col]);
      if (v !== null) {
        out.push({ kpi_name: kpiName, kpi_category: cat, kpi_value: v, kpi_unit: unit, source: "diamond_kinetics", recorded_at: date, raw_fields: row });
      }
    });
  });
  return out;
}

// ── Pocket Radar ──────────────────────────────────────────────────────────────
function parsePocketRadar(rows: Record<string, string>[], errors: string[]): ParsedRow[] {
  const out: ParsedRow[] = [];
  rows.forEach((row) => {
    const date = row["Date"] || undefined;
    const v = numOrNull(row["Max Velocity"] || row["Reading (mph)"] || row["Velocity"]);
    if (v !== null) {
      out.push({ kpi_name: "Measured Velocity", kpi_category: "pitching", kpi_value: v, kpi_unit: "mph", source: "pocket_radar", recorded_at: date, raw_fields: row });
    }
  });
  return out;
}

// ── MASTER PARSER ─────────────────────────────────────────────────────────────

export function parseDeviceCSV(csvText: string, forceDevice?: string): ParseResult {
  const errors: string[] = [];
  const { headers, rows } = parseCSVToRows(csvText);

  if (!headers.length) {
    return { rows: [], errors: ["CSV appears empty or has no header row."], deviceDetected: null, rowsParsed: 0, rowsSkipped: 0 };
  }

  const device = forceDevice || detectDevice(headers);
  let parsed: ParsedRow[] = [];

  switch (device) {
    case "rapsodo":
      // Detect pitching vs hitting by column names
      if (headers.some(h => h.toLowerCase().includes("spin_axis") || h.includes("Extension") || h.includes("Vertical Break"))) {
        parsed = parseRapsodoPitching(rows, errors);
      } else {
        parsed = parseRapsodoHitting(rows, errors);
      }
      break;
    case "rapsodo_pitching": parsed = parseRapsodoPitching(rows, errors); break;
    case "rapsodo_hitting": parsed = parseRapsodoHitting(rows, errors); break;
    case "blast_motion": parsed = parseBlastMotion(rows, errors); break;
    case "trackman": parsed = parseTrackman(rows, errors); break;
    case "hittrax": parsed = parseHittrax(rows, errors); break;
    case "diamond_kinetics": parsed = parseDiamondKinetics(rows, errors); break;
    case "pocket_radar": parsed = parsePocketRadar(rows, errors); break;
    default:
      errors.push(`Could not auto-detect device type from CSV headers. Please select your device manually. Detected headers: ${headers.slice(0, 5).join(", ")}`);
      break;
  }

  const validRows = parsed.filter(r => r.kpi_value !== null && !isNaN(r.kpi_value));
  const skipped = parsed.length - validRows.length;

  return {
    rows: validRows,
    errors,
    deviceDetected: device,
    rowsParsed: validRows.length,
    rowsSkipped: skipped + (rows.length - parsed.length / Math.max(1, headers.filter(h => ["Exit Velocity","Bat Speed","Velocity","Spin Rate"].includes(h)).length || 1)),
  };
}

// ── CSV template generators ───────────────────────────────────────────────────

export const CSV_TEMPLATES: Record<string, { headers: string[]; example: string[][] }> = {
  rapsodo_pitching: {
    headers: ["Date", "Pitch Type", "Velocity", "Spin Rate", "Spin Axis", "Spin Efficiency", "Horizontal Break", "Vertical Break (Induced)", "Extension"],
    example: [["2025-03-15", "4-Seam", "87", "2340", "215", "94", "8.2", "12.4", "6.8"]],
  },
  rapsodo_hitting: {
    headers: ["Date", "Exit Velocity", "Launch Angle", "Distance", "Spin Rate"],
    example: [["2025-03-15", "94", "12", "380", "2100"]],
  },
  blast_motion: {
    headers: ["Date", "Bat Speed (mph)", "Attack Angle (deg)", "Time To Contact (sec)", "On-Plane Efficiency (%)", "Connection Score", "Rotation Score", "Power Index"],
    example: [["2025-03-15", "71", "8", "0.155", "82", "88", "90", "85"]],
  },
  trackman: {
    headers: ["Date", "TaggedPitchType", "RelSpeed", "SpinRate", "SpinEff", "InducedVertBreak", "HorzBreak", "Extension", "ExitSpeed", "Angle", "Distance"],
    example: [["2025-03-15", "Fastball", "88", "2400", "95", "13.2", "7.8", "6.9", "96", "14", "390"]],
  },
  manual: {
    headers: ["Date", "KPI Name", "Value", "Unit", "Notes"],
    example: [["2025-03-15", "Fastball Velocity", "87", "mph", "Bullpen session"]],
  },
};

export function generateCSVTemplate(device: string): string {
  const template = CSV_TEMPLATES[device] || CSV_TEMPLATES.manual;
  const lines = [template.headers.join(","), ...template.example.map(row => row.join(","))];
  return lines.join("\n");
}
