import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CertificationType } from "@/lib/certificationPricing";

export interface CertificationDefinition {
  id: string;
  certification_type: CertificationType;
  name: string;
  description: string;
  passing_score: number;
  question_count: number;
  validity_months: number;
  price_cents: number;
  is_required: boolean;
  prerequisites: CertificationType[];
}

export interface UserCertification {
  id: string;
  user_id: string;
  certification_type: CertificationType;
  status: 'active' | 'expired' | 'revoked';
  issued_at: string;
  expires_at: string;
  score: number;
  attempt_id: string | null;
  certificate_number: string | null;
}

// Exam question interface - does NOT include correct_answer_index
export interface ExamQuestion {
  id: string;
  question_text: string;
  options: string[];
  section: string;
  is_scenario: boolean;
  display_order: number;
}

// Admin/coach question interface - includes answer for management
export interface CertificationQuestion {
  id: string;
  certification_type: CertificationType;
  section: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation: string | null;
  is_scenario: boolean;
  display_order: number;
}

export interface CertificationAttempt {
  id: string;
  user_id: string;
  certification_type: CertificationType;
  started_at: string;
  completed_at: string | null;
  answers: Record<string, number>;
  score: number | null;
  passed: boolean | null;
  question_ids: string[];
}

// Fetch all certification definitions
export const useCertificationDefinitions = () => {
  return useQuery({
    queryKey: ['certification-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certification_definitions')
        .select('*')
        .order('is_required', { ascending: false });

      if (error) throw error;
      return data as CertificationDefinition[];
    },
  });
};

// Fetch user's certifications
export const useUserCertifications = () => {
  return useQuery({
    queryKey: ['user-certifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_certifications')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserCertification[];
    },
  });
};

// Fetch exam questions using secure RPC (no answers exposed)
export const useExamQuestions = (certType: CertificationType | null) => {
  return useQuery({
    queryKey: ['exam-questions', certType],
    queryFn: async () => {
      if (!certType) return [];

      const { data, error } = await supabase.rpc('get_exam_questions', {
        p_certification_type: certType as any,
        p_limit: 40
      });

      if (error) throw error;
      
      // Parse options from JSONB
      return (data || []).map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      })) as ExamQuestion[];
    },
    enabled: !!certType,
    staleTime: 0, // Always refetch to get randomized questions
    gcTime: 0, // Don't cache exam questions
  });
};

// Legacy hook for admin question management (with answers)
export const useCertificationQuestions = (certType: CertificationType | null) => {
  return useQuery({
    queryKey: ['certification-questions', certType],
    queryFn: async () => {
      if (!certType) return [];

      const { data, error } = await supabase
        .from('certification_questions')
        .select('*')
        .eq('certification_type', certType as any)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      
      // Parse options from JSONB
      return (data || []).map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      })) as CertificationQuestion[];
    },
    enabled: !!certType,
  });
};

// Start an exam attempt
export const useStartExamAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ certType, questionIds }: { certType: CertificationType; questionIds: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create attempt with the question IDs from the exam
      const { data, error } = await supabase
        .from('certification_attempts')
        .insert({
          user_id: user.id,
          certification_type: certType as any,
          question_ids: questionIds,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as CertificationAttempt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification-attempts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start exam');
    },
  });
};

// Grade exam using secure edge function
export const useSubmitExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      attemptId, 
      answers, 
      questions,
      certType,
      certificationName,
    }: { 
      attemptId: string; 
      answers: Record<string, number>;
      questions: ExamQuestion[];
      certType: CertificationType;
      certificationName: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const questionIds = questions.map(q => q.id);

      // Call edge function for secure grading (passingScore/validityMonths looked up server-side)
      const { data, error } = await supabase.functions.invoke('process-exam-submission', {
        body: {
          attemptId,
          answers,
          questionIds,
          certType,
          certificationName,
        },
      });

      if (error) {
        console.error('Exam submission error:', error);
        throw new Error(error.message || 'Failed to submit exam');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return { 
        score: data.score, 
        passed: data.passed, 
        correct: data.correct, 
        total: data.total,
        certificateNumber: data.certificateNumber,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['user-certifications'] });
      queryClient.invalidateQueries({ queryKey: ['certification-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-certifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-exam-attempts'] });
      
      if (result.passed) {
        toast.success(`Congratulations! You passed with ${result.score}%! Check your email.`);
      } else {
        toast.error(`Score: ${result.score}%. Keep studying and try again!`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit exam');
    },
  });
};

// Bulk import questions (admin only)
export const useBulkImportQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questions: Omit<CertificationQuestion, 'id'>[]) => {
      const { data, error } = await supabase
        .from('certification_questions')
        .insert(questions.map(q => ({
          ...q,
          options: JSON.stringify(q.options),
        })) as any)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['certification-questions'] });
      toast.success(`Imported ${data.length} questions successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to import questions');
    },
  });
};

// Check if user has prerequisite certifications
export const useCheckPrerequisites = (certType: CertificationType | null, definitions: CertificationDefinition[], userCerts: UserCertification[]) => {
  if (!certType || !definitions.length) return { canTake: false, missing: [] };

  const definition = definitions.find(d => d.certification_type === certType);
  if (!definition) return { canTake: false, missing: [] };

  const prerequisites = definition.prerequisites || [];
  const activeCerts = userCerts.filter(c => c.status === 'active' && new Date(c.expires_at) > new Date());
  const activeCertTypes = activeCerts.map(c => c.certification_type);

  const missing = prerequisites.filter(p => !activeCertTypes.includes(p));

  return {
    canTake: missing.length === 0,
    missing,
  };
};
