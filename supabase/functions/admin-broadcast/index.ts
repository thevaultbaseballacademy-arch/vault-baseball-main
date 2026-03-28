import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_TITLE_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 2000;
const VALID_TYPES = ["course_update", "coach_message", "announcement"];

interface BroadcastPayload {
  title: string;
  message: string;
  type: string;
}

function validateBroadcastPayload(payload: unknown): { valid: boolean; error?: string; payload?: BroadcastPayload } {
  if (typeof payload !== "object" || payload === null) {
    return { valid: false, error: "Payload must be an object" };
  }

  const p = payload as Record<string, unknown>;

  // Validate title
  if (typeof p.title !== "string") {
    return { valid: false, error: "Title must be a string" };
  }
  const title = p.title.trim();
  if (title.length === 0) {
    return { valid: false, error: "Title cannot be empty" };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: `Title must be ${MAX_TITLE_LENGTH} characters or less` };
  }

  // Validate message
  if (typeof p.message !== "string") {
    return { valid: false, error: "Message must be a string" };
  }
  const message = p.message.trim();
  if (message.length === 0) {
    return { valid: false, error: "Message cannot be empty" };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` };
  }

  // Validate type
  if (typeof p.type !== "string") {
    return { valid: false, error: "Type must be a string" };
  }
  const type = p.type.trim();
  if (!VALID_TYPES.includes(type)) {
    return { valid: false, error: `Type must be one of: ${VALID_TYPES.join(", ")}` };
  }

  return { 
    valid: true, 
    payload: { title, message, type } 
  };
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[ADMIN-BROADCAST] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid authentication");
    }

    logStep("User authenticated", { userId: userData.user.id });

    // Check if user is admin
    const { data: adminRole, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !adminRole) {
      throw new Error("Admin access required");
    }

    logStep("Admin verified");

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

    const validation = validateBroadcastPayload(rawPayload);
    if (!validation.valid) {
      logStep("Validation failed", { error: validation.error });
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = validation.payload!;
    logStep("Received validated payload", payload);

    // Get all users with notification preferences enabled for this type
    const preferenceColumn = getPreferenceColumn(payload.type);
    
    // First get all users
    const { data: allProfiles, error: profilesError } = await supabaseClient
      .from("profiles")
      .select("user_id");

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    logStep("Found profiles", { count: allProfiles?.length || 0 });

    // Get users who have opted out of this notification type
    const { data: optedOutUsers } = await supabaseClient
      .from("notification_preferences")
      .select("user_id")
      .eq(preferenceColumn, false);

    const optedOutIds = new Set((optedOutUsers || []).map((u) => u.user_id));
    
    // Filter to users who haven't opted out
    const targetUsers = (allProfiles || []).filter(
      (p) => !optedOutIds.has(p.user_id) && p.user_id !== userData.user.id
    );

    logStep("Target users after filtering", { count: targetUsers.length });

    if (targetUsers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, notifiedCount: 0, message: "No users to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create notifications for all target users
    const notifications = targetUsers.map((user) => ({
      user_id: user.user_id,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      actor_id: userData.user.id,
      is_read: false,
    }));

    // Insert in batches of 100 to avoid payload limits
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const { data: insertedBatch, error: insertError } = await supabaseClient
        .from("notifications")
        .insert(batch)
        .select("id, user_id");

      if (insertError) {
        logStep("Error inserting batch", { error: insertError, batchStart: i });
      } else if (insertedBatch) {
        insertedCount += insertedBatch.length;
        
        // Track delivered analytics events
        const analyticsEvents = insertedBatch.map((notification: { id: string; user_id: string }) => ({
          notification_id: notification.id,
          user_id: notification.user_id,
          event_type: "delivered",
          metadata: { type: payload.type, broadcast: true }
        }));

        const { error: analyticsError } = await supabaseClient
          .from("notification_analytics")
          .insert(analyticsEvents);

        if (analyticsError) {
          logStep("Error tracking analytics", analyticsError);
        }
      }
    }

    logStep("Notifications created", { insertedCount });

    return new Response(
      JSON.stringify({
        success: true,
        notifiedCount: insertedCount,
        message: `Broadcast sent to ${insertedCount} users`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function getPreferenceColumn(type: string): string {
  switch (type) {
    case "course_update":
      return "course_updates";
    case "coach_message":
      return "coach_messages";
    default:
      return "course_updates"; // Default to course_updates for announcements
  }
}
