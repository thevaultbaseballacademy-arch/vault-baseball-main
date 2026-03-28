import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CoachPayout {
  id: string;
  coach_id: string;
  amount_cents: number;
  currency: string;
  description: string | null;
  stripe_transfer_id: string | null;
  status: string;
  processed_at: string | null;
  processed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachWithPayout {
  id: string;
  name: string;
  email: string;
  stripe_account_id: string | null;
  status: string;
  role: string;
}

export const useCoachPayouts = () => {
  const queryClient = useQueryClient();

  // Fetch all payouts
  const { data: payouts, isLoading: payoutsLoading } = useQuery({
    queryKey: ["coach-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_payouts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CoachPayout[];
    },
  });

  // Fetch coaches eligible for payouts (with stripe_account_id)
  const { data: eligibleCoaches, isLoading: coachesLoading } = useQuery({
    queryKey: ["coaches-for-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("id, name, email, stripe_account_id, status, role")
        .eq("status", "Active")
        .order("name");

      if (error) throw error;
      return data as CoachWithPayout[];
    },
  });

  // Process a payout
  const processPayout = useMutation({
    mutationFn: async ({
      coach_id,
      amount_cents,
      description,
    }: {
      coach_id: string;
      amount_cents: number;
      description?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("process-coach-payout", {
        body: { coach_id, amount_cents, description },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-payouts"] });
      toast.success("Payout processed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Payout failed: ${error.message}`);
    },
  });

  // Update coach Stripe account ID
  const updateStripeAccount = useMutation({
    mutationFn: async ({
      coach_id,
      stripe_account_id,
    }: {
      coach_id: string;
      stripe_account_id: string;
    }) => {
      const { data, error } = await supabase
        .from("coaches")
        .update({ stripe_account_id })
        .eq("id", coach_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches-for-payouts"] });
      toast.success("Stripe account linked successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to link Stripe account: ${error.message}`);
    },
  });

  // Get total payouts by coach
  const getCoachPayoutTotal = (coachId: string) => {
    return (
      payouts
        ?.filter((p) => p.coach_id === coachId && p.status === "completed")
        .reduce((sum, p) => sum + p.amount_cents, 0) || 0
    );
  };

  return {
    payouts,
    eligibleCoaches,
    isLoading: payoutsLoading || coachesLoading,
    processPayout,
    updateStripeAccount,
    getCoachPayoutTotal,
  };
};
