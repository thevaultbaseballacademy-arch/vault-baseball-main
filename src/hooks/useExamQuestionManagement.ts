import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type ExamQuestion = Tables<"exam_questions">;
export type ExamQuestionInsert = TablesInsert<"exam_questions">;
export type ExamQuestionUpdate = TablesUpdate<"exam_questions">;

export const CERT_TYPES = ["Foundations", "Performance", "Catcher", "Infield", "Outfield", "Softball Hitting Foundations", "Softball Hitting Performance", "Softball Slap Specialist", "Catcher Specialist", "Infield Specialist", "Outfield Specialist"] as const;
export type CertType = typeof CERT_TYPES[number];

export const QUESTION_TYPES = ["standard", "scenario", "multi_step", "kpi", "video"] as const;
export type QuestionType = typeof QUESTION_TYPES[number];

export const DIFFICULTY_LEVELS = ["standard", "advanced", "elite"] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export const useExamQuestionManagement = (certTypeFilter?: CertType) => {
  const queryClient = useQueryClient();

  const { data: questions, isLoading } = useQuery({
    queryKey: ["exam-questions", certTypeFilter],
    queryFn: async () => {
      let query = supabase
        .from("exam_questions")
        .select("*")
        .order("question_id", { ascending: true });

      if (certTypeFilter) {
        query = query.eq("cert_type", certTypeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ExamQuestion[];
    },
  });

  const createQuestion = useMutation({
    mutationFn: async (question: ExamQuestionInsert) => {
      const { data, error } = await supabase
        .from("exam_questions")
        .insert(question)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-questions"] });
      toast.success("Question added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add question: ${error.message}`);
    },
  });

  const updateQuestion = useMutation({
    mutationFn: async ({ id, ...updates }: ExamQuestionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("exam_questions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-questions"] });
      toast.success("Question updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update question: ${error.message}`);
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("exam_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-questions"] });
      toast.success("Question deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete question: ${error.message}`);
    },
  });

  const importQuestions = useMutation({
    mutationFn: async (questions: ExamQuestionInsert[]) => {
      const { data, error } = await supabase
        .from("exam_questions")
        .upsert(questions, { onConflict: "question_id" })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["exam-questions"] });
      toast.success(`Imported ${data.length} questions successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to import questions: ${error.message}`);
    },
  });

  const getQuestionStats = (): Record<CertType, number> => {
    if (!questions) {
      return CERT_TYPES.reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {} as Record<CertType, number>);
    }
    
    return CERT_TYPES.reduce((acc, type) => {
      acc[type] = questions.filter(q => q.cert_type === type).length;
      return acc;
    }, {} as Record<CertType, number>);
  };

  return {
    questions,
    isLoading,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    importQuestions,
    getQuestionStats,
  };
};
