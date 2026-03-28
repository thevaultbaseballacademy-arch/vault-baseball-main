import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lessonId } = await req.json();
    if (!lessonId) throw new Error("lessonId is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get lesson details
    const { data: lesson, error: lessonErr } = await supabase
      .from("remote_lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (lessonErr || !lesson) throw new Error("Lesson not found");

    const sportType = lesson.sport_type || "baseball";
    const isSoftball = sportType === "softball";

    // Get athlete profile
    const { data: athleteProfile } = await supabase
      .from("profiles")
      .select("display_name, position, graduation_year")
      .eq("user_id", lesson.athlete_user_id)
      .single();

    // Get coach profile
    const { data: coachProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", lesson.coach_user_id)
      .single();

    // Get athlete's recent KPIs for context
    const { data: kpis } = await supabase
      .from("athlete_kpis")
      .select("kpi_name, kpi_value, kpi_unit, kpi_category")
      .eq("user_id", lesson.athlete_user_id)
      .order("recorded_at", { ascending: false })
      .limit(10);

    // Get previous lesson recaps for continuity
    const { data: prevLessons } = await supabase
      .from("remote_lessons")
      .select("ai_recap, ai_homework, scheduled_at, coach_notes")
      .eq("athlete_user_id", lesson.athlete_user_id)
      .eq("coach_user_id", lesson.coach_user_id)
      .eq("status", "completed")
      .not("ai_recap", "is", null)
      .order("scheduled_at", { ascending: false })
      .limit(3);

    const athleteName = athleteProfile?.display_name || "Athlete";
    const position = athleteProfile?.position || "Unknown";
    const coachName = coachProfile?.display_name || "Coach";

    const sportLabel = isSoftball ? "softball" : "baseball";
    const prompt = `You are a professional ${sportLabel} development coach AI assistant for Vault ${isSoftball ? "Softball" : "Baseball"}.

Generate a post-lesson recap and homework plan for this coaching session.

## Athlete Info
- Name: ${athleteName}
- Position: ${position}
- Graduation Year: ${athleteProfile?.graduation_year || "N/A"}

## Session Details
- Date: ${new Date(lesson.scheduled_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
- Duration: ${lesson.duration_minutes} minutes
- Coach: ${coachName}
- Athlete Notes: ${lesson.notes || "None"}
- Coach Notes: ${lesson.coach_notes || "None provided"}

## Athlete's Recent KPIs
${kpis?.length ? kpis.map((k: any) => `- ${k.kpi_name}: ${k.kpi_value} ${k.kpi_unit || ""}`).join("\n") : "No KPIs recorded yet"}

## Previous Lesson Context
${prevLessons?.length ? prevLessons.map((l: any) => `Previous recap: ${l.ai_recap?.substring(0, 200)}...\nPrevious homework: ${l.ai_homework?.substring(0, 200)}...`).join("\n---\n") : "This is the first lesson"}

## Instructions
Generate TWO sections:

**RECAP** - A concise, professional summary of the session covering:
- What was worked on based on coach notes
- Key observations and progress
- Strengths demonstrated
- Areas that need continued attention

**HOMEWORK** - Specific actionable items the athlete should work on before the next session:
- 3-5 specific drills or focus areas
- Daily/weekly frequency recommendations
- How each drill connects to what was covered in the lesson
- Any metrics to track

Keep the tone encouraging but direct. Use ${sportLabel}-specific terminology. Format with markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `You are Vault ${isSoftball ? "Softball" : "Baseball"}'s AI Development Coach. Provide detailed, actionable ${sportLabel} training recaps and homework.` },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_lesson_recap",
              description: "Generate structured lesson recap and homework",
              parameters: {
                type: "object",
                properties: {
                  recap: {
                    type: "string",
                    description: "Markdown-formatted lesson recap summary"
                  },
                  homework: {
                    type: "string",
                    description: "Markdown-formatted homework and drills for the athlete"
                  }
                },
                required: ["recap", "homework"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_lesson_recap" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits needed. Contact admin." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    let recap = "";
    let homework = "";

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      recap = parsed.recap;
      homework = parsed.homework;
    } else {
      // Fallback: use content directly
      const content = aiResult.choices?.[0]?.message?.content || "";
      const parts = content.split(/##\s*HOMEWORK/i);
      recap = parts[0]?.replace(/##\s*RECAP/i, "").trim() || content;
      homework = parts[1]?.trim() || "Work on the areas discussed during the session.";
    }

    // Save to database
    const { error: updateErr } = await supabase
      .from("remote_lessons")
      .update({
        ai_recap: recap,
        ai_homework: homework,
        recap_generated_at: new Date().toISOString(),
      })
      .eq("id", lessonId);

    if (updateErr) throw updateErr;

    // Notify athlete about the recap
    await supabase.from("notifications").insert({
      user_id: lesson.athlete_user_id,
      type: "lesson_recap",
      title: "Lesson Recap Ready",
      message: `${coachName} generated a recap and homework from your session. Check your lessons!`,
      actor_id: lesson.coach_user_id,
    });

    return new Response(JSON.stringify({ recap, homework }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lesson-recap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
