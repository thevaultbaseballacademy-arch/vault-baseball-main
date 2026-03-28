import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  status: string;
  progress_percent: number;
  last_accessed_at: string | null;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  module_index: number;
  lesson_index: number;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
}

export function useCourseEnrollments(userId: string | undefined) {
  return useQuery({
    queryKey: ["course-enrollments", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("user_id", userId);
      
      if (error) throw error;
      return data as CourseEnrollment[];
    },
    enabled: !!userId,
  });
}

export function useCourseProgress(userId: string | undefined, courseId: string) {
  return useQuery({
    queryKey: ["course-progress", userId, courseId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("course_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId);
      
      if (error) throw error;
      return data as CourseProgress[];
    },
    enabled: !!userId && !!courseId,
  });
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: string }) => {
      const { data, error } = await supabase
        .from("course_enrollments")
        .insert({
          user_id: userId,
          course_id: courseId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-enrollments"] });
      toast({
        title: "Enrolled successfully!",
        description: "You can now start this training program.",
      });
    },
    onError: (error) => {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      courseId,
      moduleIndex,
      lessonIndex,
      completed,
    }: {
      userId: string;
      courseId: string;
      moduleIndex: number;
      lessonIndex: number;
      completed: boolean;
    }) => {
      const { data, error } = await supabase
        .from("course_progress")
        .upsert(
          {
            user_id: userId,
            course_id: courseId,
            module_index: moduleIndex,
            lesson_index: lessonIndex,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          },
          { onConflict: "user_id,course_id,module_index,lesson_index" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["course-progress", variables.userId, variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["course-enrollments"] });
    },
  });
}

export function useUpdateEnrollmentProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enrollmentId,
      progressPercent,
      completed,
    }: {
      enrollmentId: string;
      progressPercent: number;
      completed?: boolean;
    }) => {
      const updateData: Record<string, unknown> = {
        progress_percent: progressPercent,
        last_accessed_at: new Date().toISOString(),
      };
      
      if (completed) {
        updateData.completed_at = new Date().toISOString();
        updateData.status = "completed";
      }

      const { data, error } = await supabase
        .from("course_enrollments")
        .update(updateData)
        .eq("id", enrollmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-enrollments"] });
    },
  });
}

export function useUnenrollFromCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await supabase
        .from("course_enrollments")
        .delete()
        .eq("id", enrollmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-enrollments"] });
      toast({
        title: "Unenrolled",
        description: "You have been removed from this program.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
