import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Coach = Tables<"coaches">;
export type CoachInsert = TablesInsert<"coaches">;
export type CoachUpdate = TablesUpdate<"coaches">;

export const useCoachManagement = () => {
  const queryClient = useQueryClient();

  const { data: coaches, isLoading } = useQuery({
    queryKey: ["admin-coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Coach[];
    },
  });

  const createCoach = useMutation({
    mutationFn: async (coach: CoachInsert) => {
      const { data, error } = await supabase
        .from("coaches")
        .insert(coach)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coaches"] });
      toast.success("Coach added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add coach: ${error.message}`);
    },
  });

  const updateCoach = useMutation({
    mutationFn: async ({ id, ...updates }: CoachUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("coaches")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coaches"] });
      toast.success("Coach updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update coach: ${error.message}`);
    },
  });

  const toggleCoachStatus = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
      const { data, error } = await supabase
        .from("coaches")
        .update({ status: newStatus })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-coaches"] });
      toast.success(`Coach ${data.status === "Active" ? "activated" : "suspended"} successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to update coach status: ${error.message}`);
    },
  });

  const deleteCoach = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("coaches")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coaches"] });
      toast.success("Coach deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete coach: ${error.message}`);
    },
  });

  return {
    coaches,
    isLoading,
    createCoach,
    updateCoach,
    toggleCoachStatus,
    deleteCoach,
  };
};
