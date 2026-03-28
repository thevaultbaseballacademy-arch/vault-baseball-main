import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type AdminCertification = Tables<"admin_certifications">;
export type AdminCertificationInsert = TablesInsert<"admin_certifications">;
export type AdminCertificationUpdate = TablesUpdate<"admin_certifications">;

export const ADMIN_CERT_TYPES = ["Foundations", "Performance", "Catcher", "Infield", "Outfield"] as const;
export const ADMIN_CERT_STATUSES = ["Active", "Expiring", "Expired", "Locked"] as const;

export type AdminCertType = typeof ADMIN_CERT_TYPES[number];
export type AdminCertStatus = typeof ADMIN_CERT_STATUSES[number];

export interface CertificationWithCoach extends AdminCertification {
  coaches: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  } | null;
}

interface CertificationFilters {
  certType?: AdminCertType;
  status?: AdminCertStatus;
}

export const useCertificationManagement = (filters?: CertificationFilters) => {
  const queryClient = useQueryClient();

  const { data: certifications, isLoading } = useQuery({
    queryKey: ["admin-certifications", filters],
    queryFn: async () => {
      let query = supabase
        .from("admin_certifications")
        .select(`
          *,
          coaches (
            id,
            name,
            email,
            role,
            status
          )
        `)
        .order("updated_at", { ascending: false });

      if (filters?.certType) {
        query = query.eq("cert_type", filters.certType);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CertificationWithCoach[];
    },
  });

  const createCertification = useMutation({
    mutationFn: async (cert: AdminCertificationInsert) => {
      const { data, error } = await supabase
        .from("admin_certifications")
        .insert(cert)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      toast.success("Certification added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add certification: ${error.message}`);
    },
  });

  const updateCertification = useMutation({
    mutationFn: async ({ id, ...updates }: AdminCertificationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("admin_certifications")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      toast.success("Certification updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update certification: ${error.message}`);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AdminCertStatus }) => {
      const { data, error } = await supabase
        .from("admin_certifications")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      toast.success(`Certification status updated to ${data.status}`);
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const deleteCertification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("admin_certifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certifications"] });
      toast.success("Certification deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete certification: ${error.message}`);
    },
  });

  const getStatusCounts = (): Record<AdminCertStatus, number> => {
    const counts: Record<AdminCertStatus, number> = {
      Active: 0,
      Expiring: 0,
      Expired: 0,
      Locked: 0,
    };

    if (certifications) {
      certifications.forEach((cert) => {
        if (counts[cert.status as AdminCertStatus] !== undefined) {
          counts[cert.status as AdminCertStatus]++;
        }
      });
    }

    return counts;
  };

  return {
    certifications,
    isLoading,
    createCertification,
    updateCertification,
    updateStatus,
    deleteCertification,
    getStatusCounts,
  };
};
