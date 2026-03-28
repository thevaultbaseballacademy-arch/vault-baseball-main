import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildSystemPrompt(videoType: string): string {
  const pitchingChecks = `
PITCHING BIOMECHANICS — analyze each checkpoint with estimated angle/measurement where possible:
1. Stride Length — measure as % of height, ideal 77-87%. Note foot landing position relative to rubber.
2. Hip Rotation Timing — assess pelvis rotation initiation vs trunk. Flag early/late hip-to-shoulder separation.
3. Arm Slot — estimate arm angle at release (overhand ~75-85°, 3/4 ~55-70°, sidearm ~30-45°). Note consistency.
4. Shoulder Tilt — measure lateral trunk tilt at ball release. Ideal 25-35° for fastball. Note if excessive or insufficient.
5. Release Point — assess extension, height relative to head, consistency across reps.
6. Lead Leg Block — evaluate front leg firmness at release. Knee extension angle (straighter = more force transfer).
7. Glove Side — assess glove arm tuck/pull timing. Flag "flying open" or collapsing.
8. Back Hip Drive — evaluate hip load and drive. Note if weight stays back or leaks forward early.
9. Trunk Rotation Sequence — kinetic chain timing: hips → trunk → arm. Flag sequencing breaks.
10. Deceleration — assess follow-through safety. Flag recoil, abrupt stops, or arm drag patterns.`;

  const hittingChecks = `
HITTING BIOMECHANICS — analyze each checkpoint with estimated angle/measurement where possible:
1. Hip Separation — measure max hip-shoulder separation angle. Elite range: 40-60°. Note timing relative to foot plant.
2. Balance — evaluate weight distribution throughout swing. Center of gravity shift. Flag falling off or lunging.
3. Barrel Path — assess bat path angle through the zone. Length of time in hitting zone. Uppercut vs level vs chop.
4. Swing Plane — evaluate attack angle. Ideal -5° to +15° for line drives. Flag steep chops or extreme uppercuts.
5. Head Movement — measure head drift from load to contact. Minimal movement = elite tracking. Flag excessive drift.
6. Load Mechanics — assess weight shift, hand position at load, timing trigger.
7. Stride & Foot Plant — stride length, direction (open/closed), timing relative to pitch recognition.
8. Hand Path — inside track vs casting. Hands-to-ball efficiency. Bat lag position.
9. Contact Point — assess contact location relative to body. Out front for pull, deep for oppo.
10. Extension & Follow-Through — post-contact extension, two-hand vs one-hand finish, bat wrap.`;

  const fieldingChecks = `
FIELDING BIOMECHANICS — analyze each checkpoint:
1. Footwork — pre-pitch ready position, first step reaction, approach angles.
2. Arm Slot — throwing arm angle, consistency, release point.
3. Transfer Speed — glove-to-hand exchange quickness and efficiency.
4. Throwing Accuracy — arm path, follow-through direction, ball flight line.
5. Body Control — athletic position, balance during play, recovery movements.
6. Field Position — reads, angles, first step direction.
7. Receiving — soft hands, glove presentation, funnel technique.`;

  const checks = videoType === "pitching" ? pitchingChecks : videoType === "hitting" ? hittingChecks : fieldingChecks;

  return `You are VAULT MOTION ANALYSIS — an elite AI biomechanics system designed for competitive baseball athletes. You function as a professional sports biomechanics lab, analyzing movement with the rigor of Driveline, Rapsodo, and KinaTrax systems.

ANALYSIS PROTOCOL:
${checks}

OUTPUT FORMAT — You must call the submit_analysis function with this structure. Be extremely specific with measurements, angles, and positional descriptions. Reference body landmarks (knee, hip, shoulder, elbow, wrist). Every note should be actionable.

For the biomechanics_data field, provide estimated measurements for each checkpoint as an object with:
- "checkpoint": name of the biomechanical checkpoint
- "measurement": estimated value with unit (e.g., "82° arm slot", "78% stride length", "45° hip separation")
- "rating": 1-10 score
- "status": "optimal" | "acceptable" | "needs_work" | "injury_risk"
- "detail": specific observation with body landmarks
- "correction": what to change if not optimal

For the body_angles field, provide key joint angles observed:
- "joint": name (e.g., "lead_knee_at_release", "elbow_at_cocking", "hip_shoulder_separation_max")
- "angle_degrees": estimated angle
- "optimal_range": the ideal range for this measurement
- "assessment": "within_range" | "below" | "above"

This analysis will be shown to the athlete and their coach before a live training session. Be direct, technical, and actionable. Think like the best pitching/hitting coach in the country using motion capture data.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { analysisId } = await req.json();
    if (!analysisId) throw new Error("Missing analysisId");

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: analysis, error: fetchErr } = await adminClient
      .from("video_analyses")
      .select("*")
      .eq("id", analysisId)
      .single();

    if (fetchErr || !analysis) throw new Error("Analysis not found");
    if (analysis.user_id !== user.id) throw new Error("Access denied");

    await adminClient.from("video_analyses").update({ status: "processing" }).eq("id", analysisId);

    const videoType = analysis.video_type || "pitching";
    const systemPrompt = buildSystemPrompt(videoType);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Perform a full Vault Motion Analysis on this ${videoType} video. Analyze every biomechanical checkpoint with estimated angles and measurements. This athlete is preparing for a live coaching session. Video: ${analysis.video_url}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_analysis",
              description: "Submit the complete biomechanical motion analysis",
              parameters: {
                type: "object",
                properties: {
                  overall_grade: { type: "string", enum: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"] },
                  summary: { type: "string", description: "2-3 sentence executive summary" },
                  strengths: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        area: { type: "string" },
                        detail: { type: "string" },
                        impact: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["area", "detail", "impact"],
                    },
                  },
                  areas_for_improvement: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        area: { type: "string" },
                        detail: { type: "string" },
                        priority: { type: "string", enum: ["critical", "important", "minor"] },
                        drill_recommendation: { type: "string" },
                      },
                      required: ["area", "detail", "priority", "drill_recommendation"],
                    },
                  },
                  biomechanics_data: {
                    type: "array",
                    description: "Detailed biomechanical checkpoint measurements",
                    items: {
                      type: "object",
                      properties: {
                        checkpoint: { type: "string" },
                        measurement: { type: "string" },
                        rating: { type: "number", minimum: 1, maximum: 10 },
                        status: { type: "string", enum: ["optimal", "acceptable", "needs_work", "injury_risk"] },
                        detail: { type: "string" },
                        correction: { type: "string" },
                      },
                      required: ["checkpoint", "measurement", "rating", "status", "detail", "correction"],
                    },
                  },
                  body_angles: {
                    type: "array",
                    description: "Key joint angles measured during analysis",
                    items: {
                      type: "object",
                      properties: {
                        joint: { type: "string" },
                        angle_degrees: { type: "number" },
                        optimal_range: { type: "string" },
                        assessment: { type: "string", enum: ["within_range", "below", "above"] },
                      },
                      required: ["joint", "angle_degrees", "optimal_range", "assessment"],
                    },
                  },
                  mechanical_breakdown: {
                    type: "object",
                    description: "Legacy phase-by-phase breakdown with ratings",
                  },
                  velocity_potential_notes: { type: "string" },
                  injury_risk_flags: { type: "array", items: { type: "string" } },
                  pre_session_focus_areas: { type: "array", items: { type: "string" } },
                  kinetic_chain_score: {
                    type: "number",
                    description: "Overall kinetic chain efficiency score 1-100",
                  },
                  efficiency_rating: {
                    type: "string",
                    description: "Overall movement efficiency: elite, advanced, developing, beginner",
                    enum: ["elite", "advanced", "developing", "beginner"],
                  },
                },
                required: [
                  "overall_grade", "summary", "strengths", "areas_for_improvement",
                  "biomechanics_data", "body_angles", "mechanical_breakdown",
                  "velocity_potential_notes", "injury_risk_flags", "pre_session_focus_areas",
                  "kinetic_chain_score", "efficiency_rating",
                ],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      await adminClient.from("video_analyses").update({ status: "error" }).eq("id", analysisId);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    let analysisResult;

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      analysisResult = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } else {
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = {
          summary: content, overall_grade: "N/A", strengths: [], areas_for_improvement: [],
          biomechanics_data: [], body_angles: [], mechanical_breakdown: {},
          velocity_potential_notes: "", injury_risk_flags: [], pre_session_focus_areas: [],
          kinetic_chain_score: 0, efficiency_rating: "developing",
        };
      }
    }

    await adminClient
      .from("video_analyses")
      .update({ status: "completed", ai_analysis: analysisResult })
      .eq("id", analysisId);

    return new Response(JSON.stringify({ success: true, analysis: analysisResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-video error:", e);
    return new Response(
      JSON.stringify({ error: "An error occurred during video analysis. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
