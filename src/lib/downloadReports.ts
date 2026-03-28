import jsPDF from "jspdf";
import { format } from "date-fns";

// ── Shared helpers ──────────────────────────────────────────────

const BRAND = "THE VAULT";
const PAGE_W = 210; // A4
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

function header(doc: jsPDF, title: string, subtitle?: string) {
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(BRAND, MARGIN, 12);
  doc.text(format(new Date(), "MMMM d, yyyy"), PAGE_W - MARGIN, 12, { align: "right" });
  doc.setDrawColor(0);
  doc.line(MARGIN, 15, PAGE_W - MARGIN, 15);

  doc.setTextColor(0);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, MARGIN, 28);
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(subtitle, MARGIN, 35);
    doc.setTextColor(0);
  }
}

function sectionTitle(doc: jsPDF, y: number, text: string): number {
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(text, MARGIN, y);
  doc.setFont("helvetica", "normal");
  return y + 7;
}

function kv(doc: jsPDF, y: number, label: string, value: string | number | null | undefined): number {
  if (y > 270) { doc.addPage(); y = 20; }
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`${label}:`, MARGIN + 2, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(value ?? "—"), MARGIN + 55, y);
  return y + 5.5;
}

function wrappedText(doc: jsPDF, y: number, text: string, indent = 0): number {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(text, CONTENT_W - indent);
  for (const line of lines) {
    if (y > 275) { doc.addPage(); y = 20; }
    doc.text(line, MARGIN + indent, y);
    y += 4.5;
  }
  return y;
}

function footer(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`${BRAND}  •  Page ${i} of ${pageCount}  •  Confidential`, PAGE_W / 2, 290, { align: "center" });
  }
}

function safeName(name: string | null | undefined): string {
  return (name || "Athlete").split(" ").pop() || "Athlete";
}

function triggerDownload(doc: jsPDF, filename: string) {
  doc.save(filename);
}

// ── CSV helper ──────────────────────────────────────────────────

function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escCSV(val: unknown): string {
  const s = String(val ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}

// ── Athlete Development Report ──────────────────────────────────

interface DevReportData {
  displayName?: string | null;
  sport?: string | null;
  position?: string | null;
  graduationYear?: number | null;
  coachName?: string | null;
  dev?: {
    overall_score?: number;
    training_consistency?: number;
    skill_development?: number;
    work_ethic?: number;
    lessons_attended?: number;
    lessons_missed?: number;
    homework_completed?: number;
    homework_total?: number;
    weekly_focus?: string;
    strengths_summary?: string[];
    gaps_summary?: string[];
    top_priorities?: string[];
    readiness_score?: number;
    compliance_score?: number;
    improvement_status?: string;
  } | null;
  kpis?: { kpi_name: string; kpi_value: number; kpi_unit?: string; kpi_category: string; recorded_at: string }[];
  lessonCount?: number;
  programName?: string | null;
}

export function generateDevelopmentReport(d: DevReportData) {
  const doc = new jsPDF();
  const lastName = safeName(d.displayName);
  const dateStr = format(new Date(), "yyyy-MM-dd");

  header(doc, "DEVELOPMENT REPORT", d.displayName || "Athlete");

  let y = 44;
  y = kv(doc, y, "Sport", d.sport === "softball" ? "Softball" : "Baseball");
  y = kv(doc, y, "Position", d.position);
  y = kv(doc, y, "Grad Year", d.graduationYear);
  y = kv(doc, y, "Coach", d.coachName);
  y = kv(doc, y, "Active Program", d.programName);
  y = kv(doc, y, "Total Lessons", d.lessonCount ?? 0);

  if (d.dev) {
    y += 4;
    y = sectionTitle(doc, y, "Readiness Scores");
    y = kv(doc, y, "Overall Score", `${d.dev.overall_score ?? 0}/100`);
    y = kv(doc, y, "Training Consistency", `${d.dev.training_consistency ?? 0}%`);
    y = kv(doc, y, "Skill Development", `${d.dev.skill_development ?? 0}%`);
    y = kv(doc, y, "Work Ethic", `${d.dev.work_ethic ?? 0}%`);
    y = kv(doc, y, "Drill Compliance", `${d.dev.homework_completed ?? 0}/${d.dev.homework_total ?? 0}`);
    y = kv(doc, y, "Lessons Attended", d.dev.lessons_attended);
    y = kv(doc, y, "Lessons Missed", d.dev.lessons_missed);
    if (d.dev.improvement_status) y = kv(doc, y, "Trend", d.dev.improvement_status);
    if (d.dev.weekly_focus) y = kv(doc, y, "This Week's Focus", d.dev.weekly_focus);

    if (d.dev.strengths_summary?.length) {
      y += 3;
      y = sectionTitle(doc, y, "Top Strengths");
      for (const s of d.dev.strengths_summary) { y = wrappedText(doc, y, `• ${s}`, 4); }
    }
    if (d.dev.gaps_summary?.length) {
      y += 3;
      y = sectionTitle(doc, y, "Development Gaps");
      for (const g of d.dev.gaps_summary) { y = wrappedText(doc, y, `• ${g}`, 4); }
    }
  } else {
    y += 8;
    y = wrappedText(doc, y, "No development data available for this period.");
  }

  // KPI section
  if (d.kpis?.length) {
    y += 4;
    y = sectionTitle(doc, y, "KPI Scores");
    // Deduplicate: latest per kpi_name
    const latest = new Map<string, typeof d.kpis[0]>();
    for (const k of d.kpis) {
      if (!latest.has(k.kpi_name) || k.recorded_at > latest.get(k.kpi_name)!.recorded_at) {
        latest.set(k.kpi_name, k);
      }
    }
    for (const [, k] of latest) {
      y = kv(doc, y, k.kpi_name, `${k.kpi_value} ${k.kpi_unit || ""}`);
    }
  }

  footer(doc);
  triggerDownload(doc, `Vault_${lastName}_DevelopmentReport_${dateStr}.pdf`);
}

// ── Recruiting Profile ──────────────────────────────────────────

interface RecruitingData {
  displayName?: string | null;
  avatarUrl?: string | null;
  sport?: string | null;
  position?: string | null;
  graduationYear?: number | null;
  heightInches?: number | null;
  weightLbs?: number | null;
  throwingArm?: string | null;
  battingSide?: string | null;
  gpa?: string | null;
  satActScore?: string | null;
  intendedMajor?: string | null;
  divisionTarget?: string | null;
  schoolInterestList?: string[] | null;
  commitmentStatus?: string | null;
  verifiedStats?: Record<string, unknown> | null;
  kpis?: { kpi_name: string; kpi_value: number; kpi_unit?: string }[];
  coachRecommendation?: string | null;
  highlightClips?: { title: string; video_url: string }[];
}

export function generateRecruitingProfile(d: RecruitingData) {
  const doc = new jsPDF();
  const lastName = safeName(d.displayName);
  const dateStr = format(new Date(), "yyyy-MM-dd");

  header(doc, "RECRUITING PROFILE", d.displayName || "Athlete");

  let y = 44;
  y = kv(doc, y, "Sport", d.sport === "softball" ? "Softball" : "Baseball");
  y = kv(doc, y, "Position", d.position);
  y = kv(doc, y, "Grad Year", d.graduationYear);
  if (d.heightInches) {
    const ft = Math.floor(d.heightInches / 12);
    const inches = d.heightInches % 12;
    y = kv(doc, y, "Height", `${ft}'${inches}"`);
  }
  y = kv(doc, y, "Weight", d.weightLbs ? `${d.weightLbs} lbs` : null);
  y = kv(doc, y, "Throws", d.throwingArm);
  y = kv(doc, y, "Bats", d.battingSide);
  y = kv(doc, y, "Commitment", d.commitmentStatus || "Uncommitted");

  // Academics
  y += 3;
  y = sectionTitle(doc, y, "Academics");
  y = kv(doc, y, "GPA", d.gpa);
  y = kv(doc, y, "SAT/ACT", d.satActScore);
  y = kv(doc, y, "Intended Major", d.intendedMajor);
  y = kv(doc, y, "Division Target", d.divisionTarget);

  // School interest
  if (d.schoolInterestList?.length) {
    y += 3;
    y = sectionTitle(doc, y, "School Interest List");
    y = wrappedText(doc, y, d.schoolInterestList.join(", "), 2);
  }

  // Verified Stats / KPIs
  if (d.kpis?.length) {
    y += 3;
    y = sectionTitle(doc, y, "Verified Performance Stats");
    for (const k of d.kpis) {
      y = kv(doc, y, k.kpi_name, `${k.kpi_value} ${k.kpi_unit || ""}`);
    }
  }

  // Coach recommendation
  if (d.coachRecommendation) {
    y += 3;
    y = sectionTitle(doc, y, "Coach Recommendation");
    y = wrappedText(doc, y, d.coachRecommendation, 2);
  }

  // Highlights
  if (d.highlightClips?.length) {
    y += 3;
    y = sectionTitle(doc, y, "Highlight Clips");
    for (const clip of d.highlightClips) {
      y = wrappedText(doc, y, `• ${clip.title}: ${clip.video_url}`, 2);
    }
  }

  footer(doc);
  triggerDownload(doc, `Vault_${lastName}_RecruitingProfile_${dateStr}.pdf`);
}

// ── Lesson History PDF ──────────────────────────────────────────

interface LessonRow {
  date: string;
  coach: string;
  type: string;
  sport: string;
  duration?: string;
  skills?: string;
  notes?: string;
}

export function generateLessonHistoryPDF(athleteName: string, lessons: LessonRow[]) {
  const doc = new jsPDF();
  const lastName = safeName(athleteName);
  const dateStr = format(new Date(), "yyyy-MM-dd");

  header(doc, "LESSON HISTORY", athleteName);

  let y = 44;
  if (lessons.length === 0) {
    y = wrappedText(doc, y, "No lesson data available for this period.");
  } else {
    for (const l of lessons) {
      if (y > 255) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${l.date}  —  ${l.coach}`, MARGIN, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      y = wrappedText(doc, y, `Type: ${l.type}  |  Sport: ${l.sport}${l.duration ? `  |  Duration: ${l.duration}` : ""}`, 2);
      if (l.skills) y = wrappedText(doc, y, `Skills: ${l.skills}`, 2);
      if (l.notes) y = wrappedText(doc, y, `Notes: ${l.notes}`, 2);
      y += 4;
    }
  }

  footer(doc);
  triggerDownload(doc, `Vault_${lastName}_LessonHistory_${dateStr}.pdf`);
}

// ── Coach Roster Report ─────────────────────────────────────────

interface RosterAthleteRow {
  name: string;
  position?: string;
  readinessScore?: number;
  complianceRate?: number;
  lastLessonDate?: string;
  topPriority?: string;
  kpiSnapshot?: string;
}

export function generateRosterReport(coachName: string, athletes: RosterAthleteRow[]) {
  const doc = new jsPDF();
  const lastName = safeName(coachName);
  const dateStr = format(new Date(), "yyyy-MM-dd");

  header(doc, "ROSTER REPORT", coachName);

  let y = 44;
  y = kv(doc, y, "Total Athletes", athletes.length);
  y += 4;

  if (athletes.length === 0) {
    y = wrappedText(doc, y, "No assigned athletes.");
  } else {
    for (const a of athletes) {
      if (y > 250) { doc.addPage(); y = 20; }
      y = sectionTitle(doc, y, a.name);
      y = kv(doc, y, "Position", a.position);
      y = kv(doc, y, "Readiness", a.readinessScore != null ? `${a.readinessScore}/100` : "—");
      y = kv(doc, y, "Compliance", a.complianceRate != null ? `${a.complianceRate}%` : "—");
      y = kv(doc, y, "Last Lesson", a.lastLessonDate || "—");
      if (a.topPriority) y = kv(doc, y, "Priority", a.topPriority);
      if (a.kpiSnapshot) y = kv(doc, y, "KPI", a.kpiSnapshot);
      y += 4;
    }
  }

  footer(doc);
  triggerDownload(doc, `Vault_Coach_${lastName}_RosterReport_${dateStr}.pdf`);
}

// ── Coach Lesson CSV ────────────────────────────────────────────

export function generateCoachLessonCSV(
  coachName: string,
  lessons: { date: string; athlete: string; status: string; type: string; duration?: string; outcome?: string }[]
) {
  const dateStr = format(new Date(), "yyyy-MM-dd");
  const lastName = safeName(coachName);
  const rows = [
    "Date,Athlete,Status,Type,Duration,Outcome",
    ...lessons.map((l) =>
      [l.date, l.athlete, l.status, l.type, l.duration || "", l.outcome || ""].map(escCSV).join(",")
    ),
  ];
  downloadCSV(rows.join("\n"), `Vault_Coach_${lastName}_Lessons_${dateStr}.csv`);
}

// ── Owner CSV Exports ───────────────────────────────────────────

export function generateOwnerUserListCSV(
  users: { displayName: string; email: string; role: string; sport: string; joinDate: string; status: string }[]
) {
  const dateStr = format(new Date(), "yyyy-MM-dd");
  const rows = [
    "Name,Email,Role,Sport,Join Date,Status",
    ...users.map((u) =>
      [u.displayName, u.email, u.role, u.sport, u.joinDate, u.status].map(escCSV).join(",")
    ),
  ];
  downloadCSV(rows.join("\n"), `Vault_UserList_${dateStr}.csv`);
}

export function generateOwnerRevenueCSV(
  records: { period: string; product: string; amount: string; customer: string; date: string }[]
) {
  const dateStr = format(new Date(), "yyyy-MM-dd");
  const rows = [
    "Period,Product,Amount,Customer,Date",
    ...records.map((r) =>
      [r.period, r.product, r.amount, r.customer, r.date].map(escCSV).join(",")
    ),
  ];
  downloadCSV(rows.join("\n"), `Vault_Revenue_${dateStr}.csv`);
}

export function generateOwnerCoachEarningsCSV(
  records: { coachName: string; totalLessons: number; totalEarnings: string; avgRating: string; status: string }[]
) {
  const dateStr = format(new Date(), "yyyy-MM-dd");
  const rows = [
    "Coach,Total Lessons,Total Earnings,Avg Rating,Status",
    ...records.map((r) =>
      [r.coachName, String(r.totalLessons), r.totalEarnings, r.avgRating, r.status].map(escCSV).join(",")
    ),
  ];
  downloadCSV(rows.join("\n"), `Vault_CoachEarnings_${dateStr}.csv`);
}

export function generateAuditLogCSV(
  records: { timestamp: string; user: string; table: string; operation: string; details: string }[]
) {
  const dateStr = format(new Date(), "yyyy-MM-dd");
  const rows = [
    "Timestamp,User,Table,Operation,Details",
    ...records.map((r) =>
      [r.timestamp, r.user, r.table, r.operation, r.details].map(escCSV).join(",")
    ),
  ];
  downloadCSV(rows.join("\n"), `Vault_AuditLog_${dateStr}.csv`);
}

// ── Platform Analytics PDF (owner) ──────────────────────────────

interface PlatformAnalyticsData {
  totalUsers: number;
  totalAthletes: number;
  totalCoaches: number;
  totalParents: number;
  totalLessons: number;
  totalRevenueCents: number;
  avgReadiness: number;
  topPrograms?: string[];
}

export function generatePlatformAnalyticsPDF(d: PlatformAnalyticsData) {
  const doc = new jsPDF();
  const dateStr = format(new Date(), "yyyy-MM-dd");

  header(doc, "PLATFORM ANALYTICS", "Summary Report");

  let y = 44;
  y = sectionTitle(doc, y, "Users");
  y = kv(doc, y, "Total Users", d.totalUsers);
  y = kv(doc, y, "Athletes", d.totalAthletes);
  y = kv(doc, y, "Coaches", d.totalCoaches);
  y = kv(doc, y, "Parents", d.totalParents);

  y += 3;
  y = sectionTitle(doc, y, "Activity");
  y = kv(doc, y, "Total Lessons", d.totalLessons);
  y = kv(doc, y, "Avg Readiness", `${d.avgReadiness}/100`);

  y += 3;
  y = sectionTitle(doc, y, "Revenue");
  y = kv(doc, y, "Total Revenue", `$${(d.totalRevenueCents / 100).toFixed(2)}`);

  if (d.topPrograms?.length) {
    y += 3;
    y = sectionTitle(doc, y, "Top Programs");
    for (const p of d.topPrograms) {
      y = wrappedText(doc, y, `• ${p}`, 4);
    }
  }

  footer(doc);
  triggerDownload(doc, `Vault_PlatformAnalytics_${dateStr}.pdf`);
}
