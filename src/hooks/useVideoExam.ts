import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VideoQuestion {
  id: string;
  video_url: string;
  certification_type: string;
  scenario_description: string | null;
  question_1: string;
  question_2: string;
  question_3: string;
  question_4: string;
  options_1: string[];
  options_2: string[];
  options_3: string[];
  options_4: string[];
  display_order: number;
}

export interface VideoExamAttempt {
  id: string;
  user_id: string;
  certification_type: string;
  answers: Record<string, Record<string, number>>;
  score: number | null;
  total_points: number | null;
  passed: boolean | null;
  completed_at: string | null;
  created_at: string;
}

export const useVideoQuestions = (certType: string | null) => {
  return useQuery({
    queryKey: ["video-questions", certType],
    queryFn: async () => {
      if (!certType) return [];
      const { data, error } = await supabase
        .from("video_questions")
        .select("id, video_url, certification_type, scenario_description, question_1, question_2, question_3, question_4, options_1, options_2, options_3, options_4, display_order")
        .eq("certification_type", certType)
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return (data || []).map((q: any) => ({
        ...q,
        options_1: typeof q.options_1 === "string" ? JSON.parse(q.options_1) : q.options_1,
        options_2: typeof q.options_2 === "string" ? JSON.parse(q.options_2) : q.options_2,
        options_3: typeof q.options_3 === "string" ? JSON.parse(q.options_3) : q.options_3,
        options_4: typeof q.options_4 === "string" ? JSON.parse(q.options_4) : q.options_4,
      })) as VideoQuestion[];
    },
    enabled: !!certType,
  });
};

export const useVideoExamAttempts = () => {
  return useQuery({
    queryKey: ["video-exam-attempts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("video_exam_attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as VideoExamAttempt[];
    },
  });
};

export const useSubmitVideoExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      certType,
      answers,
    }: {
      certType: string;
      answers: Record<string, Record<string, number>>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch correct answers server-side
      const { data: questions, error: qError } = await supabase
        .from("video_questions")
        .select("id, correct_answers")
        .eq("certification_type", certType)
        .eq("is_active", true);

      if (qError) throw qError;

      // Grade
      let score = 0;
      const totalPoints = (questions?.length || 0) * 4;

      questions?.forEach((q: any) => {
        const correct = typeof q.correct_answers === "string" ? JSON.parse(q.correct_answers) : q.correct_answers;
        const userAnswers = answers[q.id];
        if (!userAnswers) return;
        if (userAnswers.q1 === correct.q1) score++;
        if (userAnswers.q2 === correct.q2) score++;
        if (userAnswers.q3 === correct.q3) score++;
        if (userAnswers.q4 === correct.q4) score++;
      });

      const passed = totalPoints > 0 && (score / totalPoints) * 100 >= 80;

      const { data, error } = await supabase
        .from("video_exam_attempts")
        .insert({
          user_id: user.id,
          certification_type: certType,
          answers: answers as any,
          score,
          total_points: totalPoints,
          passed,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { score, totalPoints, passed, percentage: totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0 };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["video-exam-attempts"] });
      if (result.passed) {
        toast.success(`Video Certification Passed! ${result.score}/${result.totalPoints} (${result.percentage}%)`);
      } else {
        toast.error(`Score: ${result.percentage}%. Need 80% to pass. Keep studying!`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit video exam");
    },
  });
};
