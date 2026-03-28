import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TrialStatus {
  has_trial: boolean;
  trial_active?: boolean;
  trial_type?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  days_remaining?: number;
  is_expired?: boolean;
  converted?: boolean;
  converted_product?: string;
}

export const use22MTrialStatus = (userId?: string) => {
  return useQuery({
    queryKey: ["22m-trial-status", userId],
    queryFn: async (): Promise<TrialStatus> => {
      if (!userId) return { has_trial: false };

      const { data, error } = await supabase.rpc("get_athlete_trial_status" as any, {
        p_user_id: userId,
      });

      if (error) {
        console.error("Error fetching trial status:", error);
        return { has_trial: false };
      }

      return (data as unknown) as TrialStatus;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useActivate22MTrial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      tokenId,
    }: {
      userId: string;
      tokenId: string;
    }) => {
      // Insert trial record
      const { error: trialError } = await supabase
        .from("athlete_trials")
        .insert({
          user_id: userId,
          trial_type: "22m_founding_athlete",
          invite_token_id: tokenId,
        } as any);

      if (trialError) throw trialError;

      // Increment token usage
      const { error: usageError } = await supabase.rpc(
        "increment_22m_invite_usage" as any,
        { token_id: tokenId }
      );

      if (usageError) throw usageError;

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["22m-trial-status", variables.userId],
      });
    },
  });
};

export const useValidate22MToken = (token: string | null) => {
  return useQuery({
    queryKey: ["22m-invite-token", token],
    queryFn: async () => {
      if (!token) return null;

      const { data, error } = await (supabase.rpc as any)("validate_athlete_invite_token", { p_token: token });

      if (error) throw error;

      const result = data as { valid: boolean; token_id: string } | null;
      if (!result || !result.valid) return null;

      return { id: result.token_id, token, is_active: true, label: null };
    },
    enabled: !!token,
  });
};

export const useAdminTrials = () => {
  return useQuery({
    queryKey: ["admin-22m-trials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("athlete_trials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useExtendTrial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      trialId,
      additionalDays,
      adminId,
    }: {
      trialId: string;
      additionalDays: number;
      adminId: string;
    }) => {
      const { data: trial, error: fetchError } = await supabase
        .from("athlete_trials")
        .select("trial_end_date")
        .eq("id", trialId)
        .single();

      if (fetchError) throw fetchError;

      const currentEnd = new Date(trial.trial_end_date);
      const newEnd = new Date(currentEnd);
      newEnd.setDate(newEnd.getDate() + additionalDays);

      const { error } = await supabase
        .from("athlete_trials")
        .update({
          trial_end_date: newEnd.toISOString(),
          trial_active: true,
          extended_by: adminId,
          extended_at: new Date().toISOString(),
        } as any)
        .eq("id", trialId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-22m-trials"] });
    },
  });
};

export const useAdmin22MInvites = () => {
  return useQuery({
    queryKey: ["admin-22m-invites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("athlete_22m_invite_tokens")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreate22MInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      label,
      maxUses,
      expiresAt,
      createdBy,
    }: {
      label: string;
      maxUses: number;
      expiresAt?: string;
      createdBy: string;
    }) => {
      const { data, error } = await supabase
        .from("athlete_22m_invite_tokens")
        .insert({
          label,
          max_uses: maxUses,
          expires_at: expiresAt || null,
          created_by: createdBy,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-22m-invites"] });
    },
  });
};
