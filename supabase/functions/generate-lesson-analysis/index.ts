import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { feedbackId } = await req.json();
    if (!feedbackId) throw new Error("feedbackId required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch feedback
    const { data: feedback, error: fbErr } = await supabase
      .from("coach_lesson_feedback")
      .select("*")
      .eq("id", feedbackId)
      .single();

    if (fbErr || !feedback) throw new Error("Feedback not found");

    const sportType = feedback.sport_type || "baseball";
    const isSoftball = sportType === "softball";
    const sportLabel = isSoftball ? "softball" : "baseball";

    // Fetch athlete profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, position")
      .eq("user_id", feedback.athlete_user_id)
      .single();

    const athleteName = profile?.display_name || "the athlete";
    const position = profile?.position || "player";

    const prompt = `You are an elite ${sportLabel} development analyst. Based on the following coach feedback from a recent lesson, generate a concise development report.

Athlete: ${athleteName} (${position})
Sport: ${sportLabel}
Lesson Focus: ${feedback.lesson_focus || "General training"}
Strengths: ${feedback.strengths_observed || "Not specified"}
Areas to Improve: ${feedback.areas_for_improvement || "Not specified"}
Recommended Drills: ${JSON.stringify(feedback.recommended_drills || [])}
Next Focus: ${feedback.next_development_focus || "Not specified"}

Generate a report with these sections:
1. **Lesson Summary** - 2-3 sentences about what was covered and key takeaways
2. **Recommended Drills** - 3-5 specific ${sportLabel} drills with brief descriptions related to the lesson focus
3. **Weekly Homework** - Clear assignments for the player to complete before the next lesson (3 drill sets, progressions, mechanical focus points)

Keep it professional, motivating, and actionable. Use ${sportLabel} terminology appropriately.${isSoftball ? " Use fastpitch-specific mechanics and terminology where relevant (e.g., windmill mechanics, rise ball, drop ball, slap hitting)." : ""}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `You are an elite ${sportLabel} development analyst providing actionable post-lesson reports.` },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const aiSummary = aiData.choices?.[0]?.message?.content || "";

    // Update feedback with AI analysis
    await supabase
      .from("coach_lesson_feedback")
      .update({
        ai_summary: aiSummary,
        ai_generated_at: new Date().toISOString(),
        delivered_to_athlete: true,
        delivered_at: new Date().toISOString(),
      })
      .eq("id", feedbackId);

    // Send notification to athlete
    await supabase.from("notifications").insert({
      user_id: feedback.athlete_user_id,
      type: "coach_feedback",
      title: "AI Development Report Ready",
      message: "Your personalized development analysis from your latest lesson is now available.",
      actor_id: feedback.coach_user_id,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-lesson-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
