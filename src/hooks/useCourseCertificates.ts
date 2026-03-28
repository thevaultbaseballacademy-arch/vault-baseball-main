import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CourseCertificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  course_title: string;
  recipient_name: string;
  issued_at: string;
  completion_date: string;
  created_at: string;
}

export const useCourseCertificates = (userId?: string) => {
  return useQuery({
    queryKey: ["course-certificates", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("course_certificates" as any)
        .select("*")
        .eq("user_id", userId)
        .order("issued_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as CourseCertificate[];
    },
    enabled: !!userId,
  });
};

export const useCertificateForCourse = (userId?: string, courseId?: string) => {
  return useQuery({
    queryKey: ["course-certificate", userId, courseId],
    queryFn: async () => {
      if (!userId || !courseId) return null;
      
      const { data, error } = await supabase
        .from("course_certificates" as any)
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle();
      
      if (error) throw error;
      return data as unknown as CourseCertificate | null;
    },
    enabled: !!userId && !!courseId,
  });
};

const sendCertificateEmail = async (
  email: string,
  recipientName: string,
  courseTitle: string,
  certificateNumber: string,
  completionDate: string
) => {
  try {
    const verifyUrl = `${window.location.origin}/verify-course-certificate?number=${certificateNumber}`;
    
    const { error } = await supabase.functions.invoke("send-course-certificate-email", {
      body: {
        email,
        recipientName,
        courseTitle,
        certificateNumber,
        completionDate,
        verifyUrl,
      },
    });

    if (error) {
      console.error("Error sending certificate email:", error);
    } else {
      console.log("Certificate email sent successfully");
    }
  } catch (error) {
    console.error("Error invoking email function:", error);
  }
};

export const useGenerateCertificate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      courseId,
      courseTitle,
      recipientName,
      completionDate,
    }: {
      userId: string;
      courseId: string;
      courseTitle: string;
      recipientName: string;
      completionDate: string;
    }) => {
      // Check if certificate already exists
      const { data: existing } = await supabase
        .from("course_certificates" as any)
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle();
      
      if (existing) {
        throw new Error("Certificate already exists for this course");
      }
      
      const { data, error } = await supabase
        .from("course_certificates" as any)
        .insert({
          user_id: userId,
          course_id: courseId,
          course_title: courseTitle,
          recipient_name: recipientName,
          completion_date: completionDate,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const certificate = data as unknown as CourseCertificate;
      
      // Get user email and send notification
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        await sendCertificateEmail(
          user.email,
          recipientName,
          courseTitle,
          certificate.certificate_number,
          completionDate
        );
      }
      
      return certificate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["course-certificate"] });
      toast.success("Certificate generated! Check your email for confirmation.");
    },
    onError: (error) => {
      console.error("Error generating certificate:", error);
      toast.error(error.message || "Failed to generate certificate");
    },
  });
};

export const useVerifyCertificate = () => {
  return useMutation({
    mutationFn: async (certificateNumber: string) => {
      const { data, error } = await supabase
        .rpc("verify_course_certificate", { cert_number: certificateNumber });
      
      if (error) throw error;
      return data as {
        valid: boolean;
        message?: string;
        certificate_number?: string;
        course_title?: string;
        recipient_name?: string;
        issued_at?: string;
        completion_date?: string;
      };
    },
  });
};
