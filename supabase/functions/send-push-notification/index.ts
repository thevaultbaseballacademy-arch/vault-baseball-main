import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation constants
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_TITLE_LENGTH = 200;
const MAX_BODY_LENGTH = 1000;
const MAX_TARGET_USERS = 1000;
const VALID_TYPES = ["course_update", "community_mention", "community_like", "community_comment", "coach_message"] as const;

type NotificationType = typeof VALID_TYPES[number];

interface PushNotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  targetUserIds?: string[];
  broadcast?: boolean;
}

function validatePushPayload(payload: unknown): { valid: boolean; error?: string; payload?: PushNotificationPayload } {
  if (typeof payload !== "object" || payload === null) {
    return { valid: false, error: "Payload must be an object" };
  }

  const p = payload as Record<string, unknown>;

  // Validate type
  if (typeof p.type !== "string" || !VALID_TYPES.includes(p.type as NotificationType)) {
    return { valid: false, error: `type must be one of: ${VALID_TYPES.join(", ")}` };
  }

  // Validate title
  if (typeof p.title !== "string") {
    return { valid: false, error: "title must be a string" };
  }
  const title = p.title.trim();
  if (title.length === 0) {
    return { valid: false, error: "title cannot be empty" };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: `title must be ${MAX_TITLE_LENGTH} characters or less` };
  }

  // Validate body
  if (typeof p.body !== "string") {
    return { valid: false, error: "body must be a string" };
  }
  const body = p.body.trim();
  if (body.length === 0) {
    return { valid: false, error: "body cannot be empty" };
  }
  if (body.length > MAX_BODY_LENGTH) {
    return { valid: false, error: `body must be ${MAX_BODY_LENGTH} characters or less` };
  }

  // Validate data (optional)
  let data: Record<string, string> | undefined;
  if (p.data !== undefined) {
    if (typeof p.data !== "object" || p.data === null || Array.isArray(p.data)) {
      return { valid: false, error: "data must be an object" };
    }
    data = {};
    for (const [key, value] of Object.entries(p.data as Record<string, unknown>)) {
      if (typeof key !== "string" || key.length > 100) {
        return { valid: false, error: "data keys must be strings (max 100 characters)" };
      }
      if (typeof value !== "string" || value.length > 500) {
        return { valid: false, error: "data values must be strings (max 500 characters)" };
      }
      data[key] = value;
    }
  }

  // Validate targetUserIds (optional)
  let targetUserIds: string[] | undefined;
  if (p.targetUserIds !== undefined) {
    if (!Array.isArray(p.targetUserIds)) {
      return { valid: false, error: "targetUserIds must be an array" };
    }
    if (p.targetUserIds.length > MAX_TARGET_USERS) {
      return { valid: false, error: `Maximum ${MAX_TARGET_USERS} target users allowed` };
    }
    for (const id of p.targetUserIds) {
      if (typeof id !== "string" || !UUID_REGEX.test(id)) {
        return { valid: false, error: "Each targetUserId must be a valid UUID" };
      }
    }
    targetUserIds = p.targetUserIds as string[];
  }

  // Validate broadcast (optional)
  let broadcast: boolean | undefined;
  if (p.broadcast !== undefined) {
    if (typeof p.broadcast !== "boolean") {
      return { valid: false, error: "broadcast must be a boolean" };
    }
    broadcast = p.broadcast;
  }

  return {
    valid: true,
    payload: {
      type: p.type as NotificationType,
      title,
      body,
      data,
      targetUserIds,
      broadcast,
    }
  };
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-PUSH] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Authentication: Require valid user JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logStep("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      logStep("Invalid JWT", { error: claimsError?.message });
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authenticatedUserId = claimsData.claims.sub;
    logStep("Authenticated user", { userId: authenticatedUserId });

    // Use service role for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse and validate payload
    let rawPayload: unknown;
    try {
      rawPayload = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validatePushPayload(rawPayload);
    if (!validation.valid) {
      logStep("Validation failed", { error: validation.error });
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = validation.payload!;
    logStep("Received validated payload", { type: payload.type, broadcast: payload.broadcast });

    // For broadcast notifications, check if user is admin
    if (payload.broadcast) {
      const { data: roleData } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", authenticatedUserId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        logStep("Broadcast attempted by non-admin", { userId: authenticatedUserId });
        return new Response(
          JSON.stringify({ error: "Only admins can send broadcast notifications" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get target user IDs based on notification type and preferences
    let userIds: string[] = payload.targetUserIds || [];

    if (payload.broadcast) {
      // Get all users who have enabled this notification type
      const preferenceColumn = getPreferenceColumn(payload.type);
      
      const { data: preferences, error: prefError } = await supabaseClient
        .from("notification_preferences")
        .select("user_id")
        .eq(preferenceColumn, true);

      if (prefError) {
        logStep("Error fetching preferences", prefError);
      } else if (preferences) {
        userIds = preferences.map((p: { user_id: string }) => p.user_id);
      }
    } else if (userIds.length > 0) {
      // Filter by user preferences for targeted notifications
      const preferenceColumn = getPreferenceColumn(payload.type);
      
      const { data: preferences } = await supabaseClient
        .from("notification_preferences")
        .select("user_id")
        .in("user_id", userIds)
        .eq(preferenceColumn, true);

      if (preferences) {
        userIds = preferences.map((p: { user_id: string }) => p.user_id);
      }
    }

    logStep("Target users", { count: userIds.length });

    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No users to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get push tokens for these users
    const { data: tokens, error: tokenError } = await supabaseClient
      .from("push_tokens")
      .select("token, platform, user_id")
      .in("user_id", userIds);

    if (tokenError) {
      throw new Error(`Error fetching tokens: ${tokenError.message}`);
    }

    logStep("Found tokens", { count: tokens?.length || 0 });

    // In a production app, you would send these to APNs (iOS) and FCM (Android)
    // For now, we'll store the notification in the database for in-app display
    const notificationsToInsert = userIds.map((userId) => ({
      user_id: userId,
      title: payload.title,
      message: payload.body,
      type: payload.type,
      actor_id: payload.data?.actorId || authenticatedUserId,
      post_id: payload.data?.postId || null,
      is_read: false,
    }));

    // Insert notifications (ignore duplicates)
    const { data: insertedNotifications, error: insertError } = await supabaseClient
      .from("notifications")
      .insert(notificationsToInsert)
      .select("id, user_id");

    if (insertError) {
      logStep("Error inserting notifications", insertError);
    }

    // Track delivered analytics events
    if (insertedNotifications && insertedNotifications.length > 0) {
      const analyticsEvents = insertedNotifications.map((notification: { id: string; user_id: string }) => ({
        notification_id: notification.id,
        user_id: notification.user_id,
        event_type: "delivered",
        metadata: { type: payload.type }
      }));

      const { error: analyticsError } = await supabaseClient
        .from("notification_analytics")
        .insert(analyticsEvents);

      if (analyticsError) {
        logStep("Error tracking analytics", analyticsError);
      } else {
        logStep("Tracked delivery events", { count: analyticsEvents.length });
      }
    }

    // Return success without exposing device tokens
    return new Response(
      JSON.stringify({
        success: true,
        notificationsSent: insertedNotifications?.length || 0,
        tokensFound: tokens?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function getPreferenceColumn(type: string): string {
  switch (type) {
    case "course_update":
      return "course_updates";
    case "community_mention":
      return "community_mentions";
    case "community_like":
      return "community_likes";
    case "community_comment":
      return "community_comments";
    case "coach_message":
      return "coach_messages";
    default:
      return "course_updates";
  }
}
