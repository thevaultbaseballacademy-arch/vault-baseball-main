import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[DATA-RETENTION-CLEANUP] ${step}${detailsStr}`);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Security: Validate request comes from authorized source
    const authHeader = req.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");
    
    // Allow if valid cron secret OR valid admin JWT
    let isAuthorized = false;
    
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      logStep("Authorized via cron secret");
      isAuthorized = true;
    } else if (authHeader?.startsWith("Bearer ")) {
      // Check if it's a valid admin user
      const supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseAuth.auth.getUser(token);
      
      if (userData?.user) {
        const supabaseService = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          { auth: { persistSession: false } }
        );
        const { data: roleData } = await supabaseService
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        if (roleData) {
          logStep("Authorized via admin JWT", { userId: userData.user.id });
          isAuthorized = true;
        }
      }
    }
    
    if (!isAuthorized) {
      logStep("Unauthorized access attempt");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    logStep("Starting data retention cleanup...");

    // Purge old user sessions (default: 90 days)
    const { data: sessionsDeleted, error: sessionsError } = await supabase.rpc(
      "purge_old_user_sessions",
      { retention_days: 90 }
    );

    if (sessionsError) {
      logStep("Error purging user sessions", sessionsError);
    } else {
      logStep(`Purged old user sessions`, { count: sessionsDeleted });
    }

    // Anonymize old audit IPs (default: 30 days)
    const { data: ipsAnonymized, error: ipsError } = await supabase.rpc(
      "anonymize_old_audit_ips",
      { days_threshold: 30 }
    );

    if (ipsError) {
      logStep("Error anonymizing audit IPs", ipsError);
    } else {
      logStep(`Anonymized old audit log IPs`, { count: ipsAnonymized });
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      sessions_deleted: sessionsDeleted ?? 0,
      ips_anonymized: ipsAnonymized ?? 0,
    };

    logStep("Data retention cleanup completed", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("Data retention cleanup failed", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
