import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const reminderWindows = [
      { type: "24h", minMs: 23 * 60 * 60 * 1000, maxMs: 25 * 60 * 60 * 1000 },
      { type: "1h", minMs: 50 * 60 * 1000, maxMs: 70 * 60 * 1000 },
      { type: "30min", minMs: 25 * 60 * 1000, maxMs: 35 * 60 * 1000 },
    ];

    let totalSent = 0;

    for (const window of reminderWindows) {
      const windowStart = new Date(now.getTime() + window.minMs);
      const windowEnd = new Date(now.getTime() + window.maxMs);

      // Find upcoming lessons in this window
      const { data: lessons, error } = await supabase
        .from("remote_lessons")
        .select("id, coach_user_id, athlete_user_id, scheduled_at, duration_minutes, notes")
        .in("status", ["scheduled", "confirmed"])
        .gte("scheduled_at", windowStart.toISOString())
        .lte("scheduled_at", windowEnd.toISOString());

      if (error) {
        console.error(`Error fetching lessons for ${window.type}:`, error);
        continue;
      }

      for (const lesson of lessons || []) {
        const userIds = [lesson.coach_user_id, lesson.athlete_user_id].filter(Boolean);
        const scheduledTime = new Date(lesson.scheduled_at);
        const timeLabel = scheduledTime.toLocaleString("en-US", {
          month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
          hour12: true, timeZone: "America/New_York"
        });

        for (const userId of userIds) {
          // Check if already sent
          const { data: existing } = await supabase
            .from("lesson_reminders")
            .select("id")
            .eq("lesson_id", lesson.id)
            .eq("user_id", userId)
            .eq("reminder_type", window.type)
            .eq("channel", "in_app")
            .limit(1);

          if (existing && existing.length > 0) continue;

          const isCoach = userId === lesson.coach_user_id;
          const reminderLabel = window.type === "24h" ? "tomorrow" : window.type === "1h" ? "in 1 hour" : "in 30 minutes";

          // Create in-app notification
          await supabase.from("notifications").insert({
            user_id: userId,
            type: "lesson_reminder",
            title: `Lesson ${reminderLabel}`,
            message: `Your ${isCoach ? "coaching" : ""} session is ${reminderLabel} at ${timeLabel}.`,
            actor_id: isCoach ? lesson.athlete_user_id : lesson.coach_user_id,
          });

          // Track reminder — use upsert to avoid duplicates
          const { error: trackErr } = await supabase.from("lesson_reminders").upsert({
            lesson_id: lesson.id,
            user_id: userId,
            reminder_type: window.type,
            channel: "in_app",
          }, { onConflict: "lesson_id,user_id,reminder_type,channel", ignoreDuplicates: true });

          totalSent++;
        }
      }
    }

    // Also check for overdue feedback (completed lessons > 24h without feedback)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const { data: overdueLessons } = await supabase
      .from("remote_lessons")
      .select("id, coach_user_id, athlete_user_id, scheduled_at")
      .eq("status", "completed")
      .lte("scheduled_at", twentyFourHoursAgo.toISOString())
      .gte("scheduled_at", new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString());

    if (overdueLessons && overdueLessons.length > 0) {
      const lessonIds = overdueLessons.map(l => l.id);
      const { data: existingFeedback } = await supabase
        .from("coach_lesson_feedback")
        .select("lesson_id")
        .in("lesson_id", lessonIds);

      const feedbackLessonIds = new Set((existingFeedback || []).map(f => f.lesson_id));

      for (const lesson of overdueLessons) {
        if (feedbackLessonIds.has(lesson.id)) continue;

        // Check if reminder already sent
        const { data: existing } = await supabase
          .from("lesson_reminders")
          .select("id")
          .eq("lesson_id", lesson.id)
          .eq("user_id", lesson.coach_user_id)
          .eq("reminder_type", "feedback_overdue")
          .eq("channel", "in_app")
          .limit(1);

        if (existing && existing.length > 0) continue;

        await supabase.from("notifications").insert({
          user_id: lesson.coach_user_id,
          type: "feedback_reminder",
          title: "Lesson feedback overdue",
          message: "Please submit feedback for your completed lesson. Athletes are waiting for their development report.",
          actor_id: lesson.coach_user_id,
        });

        await supabase.from("lesson_reminders").upsert({
          lesson_id: lesson.id,
          user_id: lesson.coach_user_id,
          reminder_type: "feedback_overdue",
          channel: "in_app",
        }, { onConflict: "lesson_id,user_id,reminder_type,channel", ignoreDuplicates: true });

        totalSent++;
      }
    }

    return new Response(JSON.stringify({ success: true, remindersSent: totalSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lesson-reminders error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
