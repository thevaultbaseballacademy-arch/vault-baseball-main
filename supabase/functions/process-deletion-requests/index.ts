import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PROCESS-DELETION-REQUESTS] ${step}${detailsStr}`);
};

interface DeletionRequest {
  id: string;
  user_id: string;
  user_email: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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

    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    logStep('Starting data purge for approved deletion requests...');

    // Fetch all approved deletion requests
    const { data: requests, error: fetchError } = await supabaseAdmin
      .from('data_deletion_requests')
      .select('id, user_id, user_email')
      .eq('status', 'approved');

    if (fetchError) {
      logStep('Error fetching requests', fetchError);
      throw fetchError;
    }

    if (!requests || requests.length === 0) {
      logStep('No approved deletion requests to process');
      return new Response(
        JSON.stringify({ message: 'No approved requests to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep(`Processing approved deletion requests`, { count: requests.length });

    const results: { userId: string; success: boolean; error?: string }[] = [];

    for (const request of requests as DeletionRequest[]) {
      logStep(`Processing deletion for user`, { userId: request.user_id });
      
      try {
        // Delete data from all user-related tables in order (respecting foreign keys)
        const tablesToPurge = [
          // Dependent tables first
          { table: 'notification_analytics', column: 'user_id' },
          { table: 'notifications', column: 'user_id' },
          { table: 'community_likes', column: 'user_id' },
          { table: 'community_comments', column: 'user_id' },
          { table: 'community_posts', column: 'user_id' },
          { table: 'question_results', column: 'attempt_id', subquery: true },
          { table: 'certification_attempts', column: 'user_id' },
          { table: 'user_certifications', column: 'user_id' },
          { table: 'course_progress', column: 'user_id' },
          { table: 'course_enrollments', column: 'user_id' },
          { table: 'course_certificates', column: 'user_id' },
          { table: 'athlete_checkins', column: 'user_id' },
          { table: 'athlete_kpis', column: 'user_id' },
          { table: 'athlete_kpi_goals', column: 'user_id' },
          { table: 'athletic_stats', column: 'user_id' },
          { table: 'highlight_videos', column: 'user_id' },
          { table: 'kpi_share_tokens', column: 'user_id' },
          { table: 'coaching_sessions', column: 'user_id' },
          { table: 'coach_athlete_assignments', column: 'athlete_user_id' },
          { table: 'coach_kpi_comments', column: 'athlete_user_id' },
          { table: 'coach_alerts', column: 'athlete_user_id' },
          { table: 'schedule_assignments', column: 'athlete_user_id' },
          { table: 'user_purchases', column: 'user_id' },
          { table: 'user_sessions', column: 'user_id' },
          { table: 'push_tokens', column: 'user_id' },
          { table: 'mfa_backup_codes', column: 'user_id' },
          { table: 'notification_preferences', column: 'user_id' },
          { table: 'user_roles', column: 'user_id' },
          { table: 'profiles', column: 'user_id' },
        ];

        let deletedCount = 0;

        for (const { table, column } of tablesToPurge) {
          try {
            const { error: deleteError, count } = await supabaseAdmin
              .from(table)
              .delete({ count: 'exact' })
              .eq(column, request.user_id);

            if (deleteError) {
              logStep(`Warning: Could not delete from ${table}`, { error: deleteError.message });
            } else {
              deletedCount += count || 0;
              if (count && count > 0) {
                logStep(`Deleted records from ${table}`, { count });
              }
            }
          } catch (tableError) {
            logStep(`Warning: Error deleting from ${table}`, { error: tableError });
          }
        }

        // Also delete any coach-related data where user is a coach
        const coachTables = [
          { table: 'coach_athlete_assignments', column: 'coach_user_id' },
          { table: 'coach_kpi_comments', column: 'coach_user_id' },
          { table: 'coach_alerts', column: 'coach_user_id' },
          { table: 'custom_training_schedules', column: 'coach_user_id' },
        ];

        for (const { table, column } of coachTables) {
          try {
            const { error: deleteError } = await supabaseAdmin
              .from(table)
              .delete()
              .eq(column, request.user_id);

            if (deleteError) {
              logStep(`Warning: Could not delete coach data from ${table}`, { error: deleteError.message });
            }
          } catch (tableError) {
            logStep(`Warning: Error deleting coach data from ${table}`, { error: tableError });
          }
        }

        // Anonymize audit logs instead of deleting (for compliance)
        const { error: auditError } = await supabaseAdmin
          .from('audit_logs')
          .update({ 
            changed_by: null, 
            ip_address: 'DELETED',
            user_agent: 'DELETED'
          })
          .eq('changed_by', request.user_id);

        if (auditError) {
          logStep('Warning: Could not anonymize audit logs', { error: auditError.message });
        }

        // Mark the deletion request as completed
        const { error: updateError } = await supabaseAdmin
          .from('data_deletion_requests')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            admin_notes: `Automated purge completed. Deleted records from ${deletedCount} entries across all tables.`,
          })
          .eq('id', request.id);

        if (updateError) {
          logStep('Error updating request status', updateError);
          throw updateError;
        }

        logStep(`Successfully purged data for user`, { userId: request.user_id });
        results.push({ userId: request.user_id, success: true });

      } catch (userError: unknown) {
        const errorMessage = userError instanceof Error ? userError.message : String(userError);
        logStep(`Error processing user`, { userId: request.user_id, error: errorMessage });
        results.push({ 
          userId: request.user_id, 
          success: false, 
          error: errorMessage 
        });

        // Update request with error note
        await supabaseAdmin
          .from('data_deletion_requests')
          .update({
            admin_notes: `Automated purge failed: ${errorMessage}. Manual intervention required.`,
          })
          .eq('id', request.id);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    logStep(`Purge complete`, { success: successCount, failed: failCount });

    return new Response(
      JSON.stringify({
        message: 'Data purge completed',
        processed: requests.length,
        success: successCount,
        failed: failCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process deletion requests';
    logStep('Data purge error', { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
