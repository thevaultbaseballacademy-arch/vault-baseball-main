import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } }
    );

    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { report_id, athlete_name, age, position, metrics } = await req.json();

    if (!metrics) throw new Error("Missing metrics data");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI service not configured");

    // Build context from coach-entered metrics
    const metricSections = [];
    if (metrics.pitch_velocity?.length) {
      metricSections.push(`Pitch Velocity Progress: ${metrics.pitch_velocity.map((p: any) => `Week ${p.week}: ${p.value} MPH`).join(", ")}`);
    }
    if (metrics.exit_velocity?.length) {
      metricSections.push(`Exit Velocity Progress: ${metrics.exit_velocity.map((p: any) => `Week ${p.week}: ${p.value} MPH`).join(", ")}`);
    }
    if (metrics.sprint_speed?.length) {
      metricSections.push(`Sprint Speed (60yd): ${metrics.sprint_speed.map((p: any) => `Week ${p.week}: ${p.value}s`).join(", ")}`);
    }
    if (metrics.bat_speed?.length) {
      metricSections.push(`Bat Speed: ${metrics.bat_speed.map((p: any) => `Week ${p.week}: ${p.value} MPH`).join(", ")}`);
    }
    if (metrics.pop_time?.length) {
      metricSections.push(`Pop Time: ${metrics.pop_time.map((p: any) => `Week ${p.week}: ${p.value}s`).join(", ")}`);
    }

    const prompt = `You are VAULT Baseball's AI development analyst assisting a coach. Review the following athlete progress data entered by the coach and provide accuracy validation, insights, and a parent-friendly summary.

ATHLETE: ${athlete_name || "Athlete"}
AGE: ${age || "Unknown"}
POSITION: ${position || "Unknown"}

COACH-ENTERED METRICS:
${metricSections.join("\n")}

COACH NOTES: ${metrics.coach_notes || "None provided"}
STRENGTHS OBSERVED: ${metrics.strengths_observed || "None provided"}
AREAS FOR IMPROVEMENT: ${metrics.areas_of_improvement || "None provided"}

Validate these numbers for age-appropriateness. Flag any metrics that seem unusually high or low. Provide projections and a summary a parent can understand.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an elite baseball development analyst. Provide structured, honest, and encouraging feedback for coaches and parents." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_report_analysis",
              description: "Submit the AI analysis of the coach's progress report",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "2-3 paragraph parent-friendly summary of the athlete's progress, written in encouraging but honest tone"
                  },
                  accuracy_notes: {
                    type: "string",
                    description: "Notes on data accuracy - flag any metrics that seem unusual for the athlete's age/position. Confirm if numbers look realistic."
                  },
                  projections: {
                    type: "object",
                    properties: {
                      velocity_ceiling: { type: "string", description: "Projected velocity potential based on current trajectory" },
                      timeline: { type: "string", description: "Expected timeline for reaching next milestone" },
                      development_tier: { type: "string", enum: ["Foundation", "Development", "Recruiting Ready", "Elite"] }
                    },
                    required: ["velocity_ceiling", "timeline", "development_tier"]
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 specific recommendations for continued development"
                  },
                  confidence_score: {
                    type: "integer",
                    description: "1-100 confidence in the accuracy of the reported metrics based on age-appropriateness"
                  }
                },
                required: ["summary", "accuracy_notes", "projections", "recommendations", "confidence_score"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "submit_report_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Service is busy. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis service error");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let analysis;
    if (toolCall?.function?.arguments) {
      analysis = JSON.parse(toolCall.function.arguments);
    } else {
      analysis = {
        summary: "Analysis could not be generated at this time. The coach's observations and metrics are recorded.",
        accuracy_notes: "Manual review recommended.",
        projections: { velocity_ceiling: "Pending analysis", timeline: "Pending", development_tier: "Development" },
        recommendations: ["Continue current training program", "Schedule follow-up assessment"],
        confidence_score: 50,
      };
    }

    // Update the report with AI analysis if report_id provided
    if (report_id) {
      await supabaseAdmin
        .from("athlete_progress_reports")
        .update({
          ai_summary: analysis.summary,
          ai_accuracy_notes: analysis.accuracy_notes,
          ai_projections: analysis.projections,
          ai_recommendations: analysis.recommendations,
        })
        .eq("id", report_id)
        .eq("coach_user_id", user.id);
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Report analysis error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
