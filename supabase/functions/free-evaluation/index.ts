import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { athlete_name, email, parent_email, age, position, current_velocity, video_type } = await req.json();

    if (!athlete_name || !email || !age || !position) {
      throw new Error("Missing required fields: athlete_name, email, age, position");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI service not configured");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Build evaluation prompt
    const prompt = `You are VAULT Baseball's athlete evaluation system. Analyze the following athlete profile and provide a development evaluation.

ATHLETE PROFILE:
- Name: ${athlete_name}
- Age: ${age}
- Position: ${position}
- Current Velocity: ${current_velocity || "Not provided"}
- Video Type: ${video_type || "general"}

Provide a comprehensive evaluation. Be specific, actionable, and encouraging while being honest about areas for improvement.`;

    // Call Lovable AI with tool calling for structured output
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an elite baseball development analyst. Provide structured athlete evaluations." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_evaluation",
              description: "Submit the athlete development evaluation results",
              parameters: {
                type: "object",
                properties: {
                  development_score: {
                    type: "integer",
                    description: "Overall development score from 1-100 based on age, position, and current metrics"
                  },
                  development_tier: {
                    type: "string",
                    enum: ["Foundation", "Development", "Recruiting Ready", "Elite"],
                    description: "Current development stage"
                  },
                  velocity_potential: {
                    type: "string",
                    description: "Estimated velocity ceiling and timeline (e.g., '82-86 MPH by age 17')"
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 identified strengths based on profile"
                  },
                  improvement_areas: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 areas for immediate improvement"
                  },
                  recommended_program: {
                    type: "string",
                    enum: ["Vault Development Assessment", "Vault Velocity System", "Vault Remote Training"],
                    description: "Best-fit program recommendation"
                  },
                  recommendation_reason: {
                    type: "string",
                    description: "Why this program is recommended (2-3 sentences)"
                  },
                  key_metrics_to_track: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 KPIs this athlete should focus on tracking"
                  },
                  summary: {
                    type: "string",
                    description: "2-3 sentence overall assessment summary"
                  }
                },
                required: ["development_score", "development_tier", "velocity_potential", "strengths", "improvement_areas", "recommended_program", "recommendation_reason", "key_metrics_to_track", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "submit_evaluation" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Service is busy. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI evaluation service error");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let evaluation;
    if (toolCall?.function?.arguments) {
      evaluation = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback if tool calling doesn't work
      evaluation = {
        development_score: 65,
        development_tier: "Development",
        velocity_potential: "Evaluation requires video analysis for accurate projection",
        strengths: ["Commitment to improvement", "Age-appropriate development window"],
        improvement_areas: ["Submit video for detailed mechanical analysis", "Establish baseline metrics"],
        recommended_program: "Vault Development Assessment",
        recommendation_reason: "A detailed video assessment will provide the specific mechanical feedback needed to create a targeted development plan.",
        key_metrics_to_track: ["Pitch Velocity", "Exit Velocity", "Sprint Speed"],
        summary: "Based on the profile provided, this athlete shows potential for significant development. A detailed video assessment is recommended for precise mechanical analysis.",
      };
    }

    // Save lead to database
    const { error: insertError } = await supabaseAdmin
      .from("evaluation_leads")
      .insert({
        athlete_name,
        email,
        phone: parent_email || null,
        age,
        position,
        current_velocity: current_velocity || null,
        video_type: video_type || "general",
        development_score: evaluation.development_score,
        ai_feedback: evaluation,
        status: "completed",
      });

    if (insertError) {
      console.error("Failed to save lead:", insertError);
    }

    return new Response(JSON.stringify({ evaluation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Evaluation failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
