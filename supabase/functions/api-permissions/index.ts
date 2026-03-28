import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Permission matrix (server-side mirror of src/lib/permissions.ts).
 * Must stay in sync — any permission added client-side must exist here.
 */
const OWNER_PERMISSIONS = new Set([
  "view_revenue_dashboard", "view_subscription_data", "view_ltv_retention_metrics",
  "view_conversion_tracking", "manage_pricing", "manage_subscription_tiers",
  "process_payouts", "view_coach_earnings", "manage_commission_splits",
  "export_financial_reports", "view_stripe_integration",
  "view_intelligence_rules", "edit_intelligence_rules", "edit_kpi_thresholds",
  "edit_recommendation_logic", "edit_scoring_systems", "edit_automation_triggers",
  "view_platform_settings", "edit_platform_settings", "manage_feature_flags",
  "toggle_sport_modules", "view_all_users", "assign_roles", "deactivate_accounts",
  "override_any_account", "view_audit_log", "view_platform_analytics",
  "approve_content", "reject_content", "edit_any_drill", "edit_any_program",
  "edit_any_course", "edit_kpi_definitions", "publish_content",
  // Inherits coach + athlete
  "view_assigned_athletes", "view_athlete_kpis", "view_athlete_progress",
  "view_athlete_lesson_history", "message_athlete",
  "manage_own_schedule", "edit_own_availability", "submit_post_lesson_notes",
  "assign_drills_to_athlete", "assign_programs_to_athlete", "conduct_video_review",
  "create_drill_draft", "create_program_draft", "suggest_kpi_edit", "edit_own_draft_content",
  "edit_own_profile", "view_own_profile", "view_own_lesson_count",
  "view_own_lessons", "view_own_drills", "view_own_programs", "view_own_courses",
  "view_own_kpis", "view_own_progress", "book_lesson", "message_own_coach",
]);

const ADMIN_PERMISSIONS = new Set([
  "view_platform_settings", "edit_platform_settings", "manage_feature_flags",
  "toggle_sport_modules", "view_all_users", "assign_roles", "deactivate_accounts",
  "override_any_account", "view_audit_log", "view_platform_analytics",
  "approve_content", "reject_content", "edit_any_drill", "edit_any_program",
  "edit_any_course", "edit_kpi_definitions", "publish_content",
  "view_intelligence_rules",
  "view_assigned_athletes", "view_athlete_kpis", "view_athlete_progress",
  "view_athlete_lesson_history", "message_athlete",
  "manage_own_schedule", "edit_own_availability", "submit_post_lesson_notes",
  "assign_drills_to_athlete", "assign_programs_to_athlete", "conduct_video_review",
  "create_drill_draft", "create_program_draft", "suggest_kpi_edit", "edit_own_draft_content",
  "edit_own_profile", "view_own_profile", "view_own_lesson_count",
  "view_own_lessons", "view_own_drills", "view_own_programs", "view_own_courses",
  "view_own_kpis", "view_own_progress", "book_lesson", "message_own_coach",
]);

const COACH_PERMISSIONS = new Set([
  "view_assigned_athletes", "view_athlete_kpis", "view_athlete_progress",
  "view_athlete_lesson_history", "message_athlete",
  "manage_own_schedule", "edit_own_availability", "submit_post_lesson_notes",
  "assign_drills_to_athlete", "assign_programs_to_athlete", "conduct_video_review",
  "create_drill_draft", "create_program_draft", "suggest_kpi_edit", "edit_own_draft_content",
  "edit_own_profile", "view_own_profile", "view_own_lesson_count",
  "view_own_lessons", "view_own_courses",
]);

const ATHLETE_PERMISSIONS = new Set([
  "view_own_profile", "edit_own_profile", "view_own_lessons", "view_own_drills",
  "view_own_programs", "view_own_courses", "view_own_kpis", "view_own_progress",
  "book_lesson", "message_own_coach",
]);

const PARENT_PERMISSIONS = new Set([
  "view_child_profile", "view_child_lessons", "view_child_progress",
  "view_child_kpis", "view_post_lesson_summaries", "message_child_coach",
]);

const COACH_HARD_BLOCKS = new Set([
  "view_revenue_dashboard", "view_subscription_data", "manage_pricing",
  "view_coach_earnings", "edit_intelligence_rules", "edit_kpi_thresholds",
  "manage_feature_flags", "assign_roles", "view_platform_analytics",
  "approve_content", "reject_content", "publish_content",
  "deactivate_accounts", "override_any_account",
]);

const PERMISSION_MATRIX: Record<string, Set<string>> = {
  owner: OWNER_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  coach: COACH_PERMISSIONS,
  athlete: ATHLETE_PERMISSIONS,
  parent: PARENT_PERMISSIONS,
};

function hasPermission(roles: string[], permission: string): boolean {
  const hasElevated = roles.some((r) => r === "owner" || r === "admin");
  if (!hasElevated && roles.includes("coach") && COACH_HARD_BLOCKS.has(permission)) {
    return false;
  }
  return roles.some((role) => PERMISSION_MATRIX[role]?.has(permission));
}

/** Route → required permission mapping */
const ROUTE_PERMISSIONS: Record<string, string> = {
  // Admin financial
  "GET /admin/revenue": "view_revenue_dashboard",
  "GET /admin/subscriptions": "view_subscription_data",
  "GET /admin/analytics": "view_platform_analytics",
  "PUT /admin/pricing": "manage_pricing",
  // Intelligence
  "GET /admin/intelligence": "view_intelligence_rules",
  "PUT /admin/intelligence": "edit_intelligence_rules",
  "PUT /admin/kpis/thresholds": "edit_kpi_thresholds",
  // Platform
  "PUT /admin/features": "manage_feature_flags",
  "PUT /users/role": "assign_roles",
  "GET /admin/users": "view_all_users",
  // Content
  "POST /content/approve": "approve_content",
  // Coach (data-isolated)
  "GET /coach/athletes": "view_assigned_athletes",
  "GET /coach/lessons": "view_athlete_lesson_history",
  "PUT /content/drills": "edit_own_draft_content",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[API-PERMISSIONS] ${step}${detailsStr}`);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const body = await req.json();
    const { action, params } = body as { action: string; params?: Record<string, unknown> };

    logStep("Request received", { action });

    // ── Authenticate ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    logStep("Authenticated", { userId });

    // ── Load roles ──
    const supabaseService = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: roleRows } = await supabaseService
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const roles: string[] = (roleRows || []).map((r: { role: string }) => r.role);

    // Also check team_whitelist
    const { data: userData } = await supabaseAuth.auth.getUser();
    const email = userData?.user?.email;
    if (email) {
      const { data: tw } = await supabaseService
        .from("team_whitelist")
        .select("admin_access, full_access")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (tw?.admin_access && tw?.full_access && !roles.includes("owner")) {
        roles.push("owner");
      }
      if (tw?.admin_access && !tw?.full_access && !roles.includes("admin")) {
        roles.push("admin");
      }
    }

    logStep("Roles loaded", { roles });

    // ── Map action to required permission ──
    const requiredPermission = ROUTE_PERMISSIONS[action];
    if (!requiredPermission) {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Permission check ──
    if (!hasPermission(roles, requiredPermission)) {
      logStep("ACCESS DENIED", { userId, action, requiredPermission, roles });

      // Log to access_denied_logs
      await supabaseService.from("access_denied_logs").insert({
        user_id: userId,
        attempted_route: action,
        attempted_permission: requiredPermission,
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null,
        user_agent: req.headers.get("user-agent") || null,
      });

      return new Response(
        JSON.stringify({ error: "Forbidden", required: requiredPermission }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Permission granted", { action, requiredPermission });

    // ── Data isolation for coach queries ──
    const isCoachOnly = roles.includes("coach") && !roles.includes("owner") && !roles.includes("admin");

    if (action === "GET /coach/athletes") {
      // CRITICAL: always filter by requesting coach's user ID
      const { data, error } = await supabaseService
        .from("coach_athlete_assignments")
        .select("athlete_user_id, is_active, athlete_approved, created_at")
        .eq("coach_user_id", userId)
        .eq("is_active", true);

      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "GET /coach/lessons") {
      const { data, error } = await supabaseService
        .from("remote_lessons")
        .select("*")
        .eq("coach_user_id", userId)
        .order("scheduled_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "PUT /content/drills") {
      const drillId = params?.drillId as string;
      if (!drillId) {
        return new Response(JSON.stringify({ error: "drillId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Coaches can only edit their own drafts; owners/admins can edit any
      if (isCoachOnly) {
        const { data: drill } = await supabaseService
          .from("drills")
          .select("created_by")
          .eq("id", drillId)
          .maybeSingle();

        if (!drill || drill.created_by !== userId) {
          await supabaseService.from("access_denied_logs").insert({
            user_id: userId,
            attempted_route: action,
            attempted_permission: "edit_own_draft_content (ownership check failed)",
            ip_address: req.headers.get("x-forwarded-for") || null,
            user_agent: req.headers.get("user-agent") || null,
          });
          return new Response(JSON.stringify({ error: "Cannot edit another coach's content" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify({ authorized: true, drillId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "GET /admin/revenue") {
      // Owner-only revenue data
      const { data, error } = await supabaseService
        .from("user_purchases")
        .select("product_key, amount_cents, purchased_at, status")
        .order("purchased_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "GET /admin/users") {
      const { data, error } = await supabaseService
        .from("profiles")
        .select("user_id, display_name, email, sport_type, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "PUT /users/role") {
      const targetUserId = params?.userId as string;
      const role = params?.role as string;
      const removeRole = params?.remove as boolean;

      if (!targetUserId || !role) {
        return new Response(JSON.stringify({ error: "userId and role required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (removeRole) {
        const { error } = await supabaseService
          .from("user_roles")
          .delete()
          .eq("user_id", targetUserId)
          .eq("role", role);
        if (error) throw error;
      } else {
        const { error } = await supabaseService
          .from("user_roles")
          .insert({ user_id: targetUserId, role });
        if (error) throw error;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generic success for permission-only checks
    return new Response(JSON.stringify({ authorized: true, action }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("Error", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
