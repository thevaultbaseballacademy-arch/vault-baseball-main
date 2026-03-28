import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lessonId, feedbackId } = await req.json();
    if (!lessonId && !feedbackId) throw new Error("lessonId or feedbackId required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ─── Get feedback data ───────────────────────────────────────────────
    let feedback: any;
    if (feedbackId) {
      const { data } = await supabase.from("coach_lesson_feedback").select("*").eq("id", feedbackId).single();
      feedback = data;
    } else {
      const { data } = await supabase.from("coach_lesson_feedback").select("*").eq("lesson_id", lessonId).order("created_at", { ascending: false }).limit(1).single();
      feedback = data;
    }

    if (!feedback) {
      return new Response(JSON.stringify({ skipped: true, reason: "No feedback found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sportType = feedback.sport_type || "baseball";
    const isSoftball = sportType === "softball";
    const athleteUserId = feedback.athlete_user_id;
    const coachUserId = feedback.coach_user_id;

    // ─── Gather context ──────────────────────────────────────────────────
    const [profileRes, kpisRes, historyRes, progressionRes] = await Promise.all([
      supabase.from("profiles").select("display_name, position, sport_type").eq("user_id", athleteUserId).single(),
      supabase.from("athlete_kpis").select("kpi_name, kpi_value, kpi_unit, kpi_category").eq("user_id", athleteUserId).order("recorded_at", { ascending: false }).limit(20),
      supabase.from("lesson_outcomes").select("skill_category, weaknesses_noted, created_at").eq("athlete_user_id", athleteUserId).eq("sport_type", sportType).order("created_at", { ascending: false }).limit(20),
      supabase.from("skill_progression").select("*").eq("athlete_user_id", athleteUserId),
    ]);

    const profile = profileRes.data;
    const kpis = kpisRes.data || [];
    const priorOutcomes = historyRes.data || [];
    const currentProgression = progressionRes.data || [];

    // ─── STEP 1: AI extraction ───────────────────────────────────────────
    const prompt = `You are a ${isSoftball ? "fastpitch softball" : "baseball"} development intelligence engine.

Athlete: ${profile?.display_name || "Athlete"} (${profile?.position || "Unknown"})
Sport: ${sportType}
Lesson Focus: ${feedback.lesson_focus || "General"}
Strengths: ${feedback.strengths_observed || "Not noted"}
Areas to Improve: ${feedback.areas_for_improvement || "Not noted"}
Coach Drills: ${JSON.stringify(feedback.recommended_drills || [])}
Next Focus: ${feedback.next_development_focus || "Not specified"}
Current KPIs: ${kpis.length ? kpis.map((k: any) => `${k.kpi_name}: ${k.kpi_value} ${k.kpi_unit || ""}`).join(", ") : "None"}
Prior session weaknesses (last 5): ${priorOutcomes.slice(0, 5).flatMap((o: any) => o.weaknesses_noted || []).join(", ") || "None"}

Extract:
1. The primary skill_category worked on (e.g., "pitching", "hitting", "fielding", "baserunning", "conditioning")
2. Up to 3 strengths (short phrases)
3. Up to 3 weaknesses/gaps (short phrases)
4. Up to 3 drills to auto-assign
5. KPI score adjustments: for each skill area worked on, suggest a score delta (-5 to +10) reflecting session quality
6. Injury risk flags if any (e.g., "pitcher arm fatigue", "overuse risk")
7. One-line weekly focus
8. If a weakness has appeared in 3+ prior sessions, flag it as a "persistent_weakness"`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Extract structured development intelligence. Return valid JSON only." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_intelligence",
            description: "Extract structured development insights from lesson feedback",
            parameters: {
              type: "object",
              properties: {
                skill_category: { type: "string", description: "Primary skill category" },
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } },
                auto_drills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { title: { type: "string" }, category: { type: "string" } },
                    required: ["title", "category"],
                    additionalProperties: false,
                  },
                },
                kpi_adjustments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      skill_name: { type: "string" },
                      skill_category: { type: "string" },
                      score_delta: { type: "integer", description: "-5 to +10" },
                    },
                    required: ["skill_name", "skill_category", "score_delta"],
                    additionalProperties: false,
                  },
                },
                injury_flags: { type: "array", items: { type: "string" } },
                persistent_weaknesses: { type: "array", items: { type: "string" } },
                suggested_programs: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { title: { type: "string" }, reason: { type: "string" } },
                    required: ["title", "reason"],
                    additionalProperties: false,
                  },
                },
                weekly_focus: { type: "string" },
              },
              required: ["skill_category", "strengths", "weaknesses", "auto_drills", "kpi_adjustments", "weekly_focus"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_intelligence" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI error:", status);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("No structured response from AI");

    const intel = JSON.parse(toolCall.function.arguments);

    // ─── STEP 1: Store lesson outcome ────────────────────────────────────
    const sessionNumber = priorOutcomes.filter((o: any) => o.skill_category === intel.skill_category).length + 1;

    const { data: outcome } = await supabase.from("lesson_outcomes").insert({
      lesson_id: feedback.lesson_id,
      feedback_id: feedback.id,
      athlete_user_id: athleteUserId,
      coach_user_id: coachUserId,
      sport_type: sportType,
      skill_category: intel.skill_category || "general",
      strengths_noted: intel.strengths || [],
      weaknesses_noted: intel.weaknesses || [],
      coach_notes: feedback.strengths_observed,
      drills_assigned: (intel.auto_drills || []).map((d: any) => d.title),
      kpi_updates: intel.kpi_adjustments || [],
      injury_flags: intel.injury_flags || [],
      session_number: sessionNumber,
    }).select("id").single();

    // ─── STEP 2: Update skill progression & KPIs ─────────────────────────
    const kpiAdjustments = intel.kpi_adjustments || [];
    for (const adj of kpiAdjustments) {
      const existing = currentProgression.find((p: any) => p.skill_name === adj.skill_name);
      const prevScore = existing?.current_score || 50;
      const newScore = Math.max(0, Math.min(100, prevScore + adj.score_delta));
      const trend = adj.score_delta > 0 ? "improving" : adj.score_delta < 0 ? "declining" : "stable";

      await supabase.from("skill_progression").upsert({
        athlete_user_id: athleteUserId,
        sport_type: sportType,
        skill_name: adj.skill_name,
        skill_category: adj.skill_category,
        current_score: newScore,
        previous_score: prevScore,
        sessions_count: (existing?.sessions_count || 0) + 1,
        last_session_at: new Date().toISOString(),
        trend,
      }, { onConflict: "athlete_user_id,skill_name" });
    }

    // ─── STEP 1 continued: Auto-assign drills as homework ────────────────
    if (intel.auto_drills?.length > 0) {
      const homeworkItems = intel.auto_drills.map((drill: any, i: number) => ({
        lesson_id: feedback.lesson_id,
        feedback_id: feedback.id,
        athlete_user_id: athleteUserId,
        coach_user_id: coachUserId,
        title: `[AI] ${drill.title}`,
        category: drill.category || "drill",
        sort_order: 100 + i,
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      }));
      await supabase.from("player_homework").insert(homeworkItems);
    }

    // ─── STEP 3: Pattern detection & recommendations ─────────────────────
    const recommendations: any[] = [];
    const outcomeId = outcome?.id;

    // 3a. Persistent weakness → recommend course/program
    const persistentWeaknesses = intel.persistent_weaknesses || [];
    if (persistentWeaknesses.length > 0) {
      // Also do our own check: count weakness appearances across prior outcomes
      const weaknessCounts: Record<string, number> = {};
      for (const o of priorOutcomes) {
        for (const w of (o.weaknesses_noted || [])) {
          const key = (w as string).toLowerCase();
          weaknessCounts[key] = (weaknessCounts[key] || 0) + 1;
        }
      }

      for (const pw of persistentWeaknesses) {
        recommendations.push({
          athlete_user_id: athleteUserId,
          sport_type: sportType,
          recommendation_type: "course",
          title: `Course recommended: Address persistent ${pw}`,
          reason: `"${pw}" has been flagged across multiple sessions. A structured course may help.`,
          source_outcome_ids: outcomeId ? [outcomeId] : [],
          priority: "high",
          metadata: { weakness: pw, sessions_seen: weaknessCounts[pw.toLowerCase()] || 3 },
        });
      }
    }

    // 3b. Suggested programs from AI
    for (const prog of (intel.suggested_programs || [])) {
      recommendations.push({
        athlete_user_id: athleteUserId,
        sport_type: sportType,
        recommendation_type: "program",
        title: prog.title,
        reason: prog.reason,
        source_outcome_ids: outcomeId ? [outcomeId] : [],
        priority: "medium",
      });
    }

    // 3c. Injury risk alerts
    const injuryFlags = intel.injury_flags || [];
    if (injuryFlags.length > 0) {
      for (const flag of injuryFlags) {
        recommendations.push({
          athlete_user_id: athleteUserId,
          sport_type: sportType,
          recommendation_type: "injury_alert",
          title: `⚠️ Injury Risk: ${flag}`,
          reason: `Flagged during ${sportType} lesson. Coach and parent should review.`,
          source_outcome_ids: outcomeId ? [outcomeId] : [],
          priority: "critical",
          metadata: { flag },
        });
      }

      // Notify coach about injury risk
      await supabase.from("notifications").insert({
        user_id: coachUserId,
        type: "injury_alert",
        title: "⚠️ Injury Risk Detected",
        message: `${profile?.display_name || "Athlete"}: ${injuryFlags.join(", ")}. Review immediately.`,
        actor_id: athleteUserId,
      });

      // Notify athlete (parent will see via athlete account)
      await supabase.from("notifications").insert({
        user_id: athleteUserId,
        type: "injury_alert",
        title: "⚠️ Health Flag from Coach",
        message: `Your coach flagged: ${injuryFlags.join(", ")}. Please discuss at next session.`,
        actor_id: coachUserId,
      });
    }

    // Insert all recommendations
    if (recommendations.length > 0) {
      await supabase.from("development_recommendations").insert(recommendations);
    }

    // ─── STEP 4: Update feedback record & notifications ──────────────────
    await supabase.from("coach_lesson_feedback").update({
      ai_recommended_drills: intel.auto_drills || [],
      ai_homework: intel.suggested_programs || [],
    } as any).eq("id", feedback.id);

    // Activity feed
    await supabase.from("activity_feed").insert({
      user_id: athleteUserId,
      activity_type: "intelligence_update",
      title: `Development insights updated from ${isSoftball ? "softball" : "baseball"} lesson`,
      description: intel.weekly_focus,
      metadata: {
        strengths: intel.strengths,
        weaknesses: intel.weaknesses,
        sport_type: sportType,
        feedback_id: feedback.id,
        outcome_id: outcomeId,
        kpi_adjustments: intel.kpi_adjustments,
        injury_flags: injuryFlags,
        persistent_weaknesses: persistentWeaknesses,
      },
    });

    // Athlete notification
    await supabase.from("notifications").insert({
      user_id: athleteUserId,
      type: "intelligence_update",
      title: "Development Plan Updated",
      message: `New drills and focus areas from your ${isSoftball ? "softball" : "baseball"} lesson. ${injuryFlags.length > 0 ? "⚠️ Health flag raised." : ""} Weekly focus: ${intel.weekly_focus}`,
      actor_id: coachUserId,
    });

    // Coach notification for program suggestions
    if (intel.suggested_programs?.length > 0 || persistentWeaknesses.length > 0) {
      await supabase.from("notifications").insert({
        user_id: coachUserId,
        type: "program_suggestion",
        title: "Review Development Recommendations",
        message: `${recommendations.length} recommendation(s) generated for ${profile?.display_name || "athlete"} after ${sportType} lesson.`,
        actor_id: athleteUserId,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      outcome_id: outcomeId,
      drills_assigned: intel.auto_drills?.length || 0,
      kpi_updates: kpiAdjustments.length,
      recommendations_created: recommendations.length,
      injury_flags: injuryFlags.length,
      persistent_weaknesses: persistentWeaknesses.length,
      weekly_focus: intel.weekly_focus,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("post-lesson-intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
