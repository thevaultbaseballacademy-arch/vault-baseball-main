import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { lesson_feedback_id } = await req.json();
    if (!lesson_feedback_id) throw new Error("lesson_feedback_id required");

    // Get the lesson feedback
    const { data: feedback, error: fbError } = await supabase
      .from("coach_lesson_feedback")
      .select("*")
      .eq("id", lesson_feedback_id)
      .single();

    if (fbError || !feedback) throw new Error("Feedback not found");

    // Get athlete profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", feedback.athlete_user_id)
      .single();

    // Get coach name
    const { data: coach } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", feedback.coach_user_id)
      .single();

    // Build parent-friendly summary from coach feedback
    const athleteName = profile?.display_name || "Your athlete";
    const coachName = coach?.display_name || "Coach";
    
    const strengths = feedback.strengths_observed || "general skills";
    const improvements = feedback.areas_for_improvement || "continued practice";
    const focus = feedback.lesson_focus || "training session";
    const nextFocus = feedback.next_development_focus || "building on today's progress";

    const summary = `${athleteName} completed a ${focus} session with ${coachName}. ` +
      `Strengths shown: ${strengths}. ` +
      `Areas to work on: ${improvements}. ` +
      `Next focus: ${nextFocus}.`;

    // Update the feedback with the parent-facing AI summary
    const { error: updateError } = await supabase
      .from("coach_lesson_feedback")
      .update({
        ai_summary: summary,
        ai_generated_at: new Date().toISOString(),
        delivered_to_athlete: true,
        delivered_at: new Date().toISOString(),
      })
      .eq("id", lesson_feedback_id);

    if (updateError) throw updateError;

    // Check if parent link exists and notify
    const { data: parentLinks } = await supabase
      .from("parent_athlete_links")
      .select("parent_user_id")
      .eq("athlete_user_id", feedback.athlete_user_id)
      .eq("status", "active");

    if (parentLinks && parentLinks.length > 0) {
      // Notify each linked parent
      const notifications = parentLinks.map((link) => ({
        user_id: link.parent_user_id,
        type: "lesson_summary",
        title: "New lesson summary available",
        message: `${athleteName} completed a lesson with ${coachName}. View the summary in your parent dashboard.`,
        actor_id: feedback.coach_user_id,
      }));

      await supabase.from("notifications").insert(notifications);
    }

    return new Response(JSON.stringify({ success: true, summary }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error generating parent summary:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
