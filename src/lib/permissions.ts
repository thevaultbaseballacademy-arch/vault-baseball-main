/**
 * Vault OS — Role-Based Permission System
 *
 * Roles:  owner | admin | coach | athlete | parent
 * Permissions are declarative — never hardcode role checks inline.
 * Always use `hasPermission(roles, "permission.name")`.
 */

export type VaultRole = "owner" | "admin" | "coach" | "athlete" | "parent";

// ─── PERMISSION DEFINITIONS ───────────────────────────────────────────
export type Permission =
  // ── Owner-only: Financial ──
  | "view_revenue_dashboard"
  | "view_subscription_data"
  | "view_ltv_retention_metrics"
  | "view_conversion_tracking"
  | "manage_pricing"
  | "manage_subscription_tiers"
  | "process_payouts"
  | "view_coach_earnings"
  | "manage_commission_splits"
  | "export_financial_reports"
  | "view_stripe_integration"
  // ── Owner-only: Intelligence Engine ──
  | "view_intelligence_rules"
  | "edit_intelligence_rules"
  | "edit_kpi_thresholds"
  | "edit_recommendation_logic"
  | "edit_scoring_systems"
  | "edit_automation_triggers"
  // ── Owner-only: Platform ──
  | "view_platform_settings"
  | "edit_platform_settings"
  | "manage_feature_flags"
  | "toggle_sport_modules"
  | "view_all_users"
  | "assign_roles"
  | "deactivate_accounts"
  | "override_any_account"
  | "view_audit_log"
  | "view_platform_analytics"
  // ── Owner-only: Content (full) ──
  | "approve_content"
  | "reject_content"
  | "edit_any_drill"
  | "edit_any_program"
  | "edit_any_course"
  | "edit_kpi_definitions"
  | "publish_content"
  // ── Coach: Athlete management ──
  | "view_assigned_athletes"
  | "view_athlete_kpis"
  | "view_athlete_progress"
  | "view_athlete_lesson_history"
  | "message_athlete"
  // ── Coach: Lesson delivery ──
  | "manage_own_schedule"
  | "edit_own_availability"
  | "submit_post_lesson_notes"
  | "assign_drills_to_athlete"
  | "assign_programs_to_athlete"
  | "conduct_video_review"
  // ── Coach: Content creation (drafts only) ──
  | "create_drill_draft"
  | "create_program_draft"
  | "suggest_kpi_edit"
  | "edit_own_draft_content"
  // ── Coach: Profile ──
  | "edit_own_profile"
  | "view_own_lesson_count"
  // ── Athlete ──
  | "view_own_profile"
  | "view_own_lessons"
  | "view_own_drills"
  | "view_own_programs"
  | "view_own_courses"
  | "view_own_kpis"
  | "view_own_progress"
  | "book_lesson"
  | "message_own_coach"
  // ── Parent ──
  | "view_child_profile"
  | "view_child_lessons"
  | "view_child_progress"
  | "view_child_kpis"
  | "view_post_lesson_summaries"
  | "message_child_coach"
  // ── Dashboard access (routing) ──
  | "dashboard.owner"
  | "dashboard.admin"
  | "dashboard.coach"
  | "dashboard.athlete"
  | "dashboard.parent";

// ─── OWNER PERMISSIONS ────────────────────────────────────────────────
// Owner has EVERY permission in the system.
const OWNER_PERMISSIONS: readonly Permission[] = [
  // Financial
  "view_revenue_dashboard", "view_subscription_data", "view_ltv_retention_metrics",
  "view_conversion_tracking", "manage_pricing", "manage_subscription_tiers",
  "process_payouts", "view_coach_earnings", "manage_commission_splits",
  "export_financial_reports", "view_stripe_integration",
  // Intelligence
  "view_intelligence_rules", "edit_intelligence_rules", "edit_kpi_thresholds",
  "edit_recommendation_logic", "edit_scoring_systems", "edit_automation_triggers",
  // Platform
  "view_platform_settings", "edit_platform_settings", "manage_feature_flags",
  "toggle_sport_modules", "view_all_users", "assign_roles", "deactivate_accounts",
  "override_any_account", "view_audit_log", "view_platform_analytics",
  // Content (full)
  "approve_content", "reject_content", "edit_any_drill", "edit_any_program",
  "edit_any_course", "edit_kpi_definitions", "publish_content",
  // Owner also inherits all coach operational permissions
  "view_assigned_athletes", "view_athlete_kpis", "view_athlete_progress",
  "view_athlete_lesson_history", "message_athlete",
  "manage_own_schedule", "edit_own_availability", "submit_post_lesson_notes",
  "assign_drills_to_athlete", "assign_programs_to_athlete", "conduct_video_review",
  "create_drill_draft", "create_program_draft", "suggest_kpi_edit", "edit_own_draft_content",
  "edit_own_profile", "view_own_lesson_count",
  // Owner inherits athlete self-service
  "view_own_profile", "view_own_lessons", "view_own_drills", "view_own_programs",
  "view_own_courses", "view_own_kpis", "view_own_progress", "book_lesson", "message_own_coach",
  // Dashboards
  "dashboard.owner", "dashboard.admin", "dashboard.coach", "dashboard.athlete",
];

// ─── ADMIN PERMISSIONS ────────────────────────────────────────────────
// Admin mirrors owner EXCEPT financials and intelligence editing.
const ADMIN_PERMISSIONS: readonly Permission[] = [
  // Platform (operational)
  "view_platform_settings", "edit_platform_settings", "manage_feature_flags",
  "toggle_sport_modules", "view_all_users", "assign_roles", "deactivate_accounts",
  "override_any_account", "view_audit_log", "view_platform_analytics",
  // Content (full)
  "approve_content", "reject_content", "edit_any_drill", "edit_any_program",
  "edit_any_course", "edit_kpi_definitions", "publish_content",
  // Intelligence (read-only)
  "view_intelligence_rules",
  // Coach ops
  "view_assigned_athletes", "view_athlete_kpis", "view_athlete_progress",
  "view_athlete_lesson_history", "message_athlete",
  "manage_own_schedule", "edit_own_availability", "submit_post_lesson_notes",
  "assign_drills_to_athlete", "assign_programs_to_athlete", "conduct_video_review",
  "create_drill_draft", "create_program_draft", "suggest_kpi_edit", "edit_own_draft_content",
  "edit_own_profile", "view_own_lesson_count",
  // Athlete self-service
  "view_own_profile", "view_own_lessons", "view_own_drills", "view_own_programs",
  "view_own_courses", "view_own_kpis", "view_own_progress", "book_lesson", "message_own_coach",
  // Dashboards
  "dashboard.admin", "dashboard.coach", "dashboard.athlete",
];

// ─── COACH PERMISSIONS ────────────────────────────────────────────────
const COACH_PERMISSIONS: readonly Permission[] = [
  // Athlete management (own athletes only — scoped at query level)
  "view_assigned_athletes", "view_athlete_kpis", "view_athlete_progress",
  "view_athlete_lesson_history", "message_athlete",
  // Lesson delivery
  "manage_own_schedule", "edit_own_availability", "submit_post_lesson_notes",
  "assign_drills_to_athlete", "assign_programs_to_athlete", "conduct_video_review",
  // Content creation (drafts — requires owner approval to publish)
  "create_drill_draft", "create_program_draft", "suggest_kpi_edit", "edit_own_draft_content",
  // Profile
  "edit_own_profile", "view_own_profile", "view_own_lesson_count",
  // Self-service
  "view_own_lessons", "view_own_courses",
  // Dashboard
  "dashboard.coach",
];

// ─── ATHLETE PERMISSIONS ──────────────────────────────────────────────
const ATHLETE_PERMISSIONS: readonly Permission[] = [
  "view_own_profile", "edit_own_profile",
  "view_own_lessons", "view_own_drills", "view_own_programs",
  "view_own_courses", "view_own_kpis", "view_own_progress",
  "book_lesson", "message_own_coach",
  "dashboard.athlete",
];

// ─── PARENT PERMISSIONS ──────────────────────────────────────────────
const PARENT_PERMISSIONS: readonly Permission[] = [
  "view_child_profile", "view_child_lessons", "view_child_progress",
  "view_child_kpis", "view_post_lesson_summaries", "message_child_coach",
  "dashboard.parent",
];

// ─── PERMISSION MATRIX ───────────────────────────────────────────────
const PERMISSION_MATRIX: Record<VaultRole, ReadonlySet<Permission>> = {
  owner: new Set(OWNER_PERMISSIONS),
  admin: new Set(ADMIN_PERMISSIONS),
  coach: new Set(COACH_PERMISSIONS),
  athlete: new Set(ATHLETE_PERMISSIONS),
  parent: new Set(PARENT_PERMISSIONS),
};

// ─── COACH HARD BLOCKS ──────────────────────────────────────────────
// These are explicitly denied to coaches even if somehow injected.
// Used for defence-in-depth validation.
const COACH_HARD_BLOCKS: ReadonlySet<Permission> = new Set([
  "view_revenue_dashboard",
  "view_subscription_data",
  "manage_pricing",
  "view_coach_earnings",
  "edit_intelligence_rules",
  "edit_kpi_thresholds",
  "manage_feature_flags",
  "assign_roles",
  "view_platform_analytics",
  "approve_content",
  "reject_content",
  "publish_content",
  "deactivate_accounts",
  "override_any_account",
]);

/**
 * Check if any of the user's roles grant the requested permission.
 * Enforces coach hard blocks as a defence-in-depth layer.
 *
 * This is the ONLY function that should be used for access control.
 */
export function hasPermission(userRoles: VaultRole[], permission: Permission): boolean {
  // Defence-in-depth: if the ONLY roles are coach (no owner/admin),
  // hard-block denied permissions regardless of any future matrix edits.
  const hasElevated = userRoles.some((r) => r === "owner" || r === "admin");
  if (!hasElevated && userRoles.includes("coach") && COACH_HARD_BLOCKS.has(permission)) {
    return false;
  }

  return userRoles.some((role) => PERMISSION_MATRIX[role]?.has(permission));
}

/**
 * Get the highest-priority role for routing/UI decisions.
 * Priority: owner > admin > coach > athlete > parent
 */
export function getPrimaryRole(userRoles: VaultRole[]): VaultRole | null {
  const priority: VaultRole[] = ["owner", "admin", "coach", "athlete", "parent"];
  for (const role of priority) {
    if (userRoles.includes(role)) return role;
  }
  return null;
}

/**
 * Get the default dashboard route for a given primary role.
 */
export function getDashboardRoute(role: VaultRole | null): string {
  switch (role) {
    case "owner": return "/owner";
    case "admin": return "/admin";
    case "coach": return "/coach-dashboard";
    case "parent": return "/parent";
    case "athlete":
    default:
      return "/dashboard";
  }
}

/**
 * All permissions for a given set of roles (union).
 */
export function getAllPermissions(userRoles: VaultRole[]): Permission[] {
  const perms = new Set<Permission>();
  for (const role of userRoles) {
    PERMISSION_MATRIX[role]?.forEach((p) => perms.add(p));
  }
  // Apply coach hard blocks
  const hasElevated = userRoles.some((r) => r === "owner" || r === "admin");
  if (!hasElevated && userRoles.includes("coach")) {
    COACH_HARD_BLOCKS.forEach((p) => perms.delete(p));
  }
  return Array.from(perms);
}
