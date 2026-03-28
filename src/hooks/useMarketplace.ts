import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MarketplaceCoach {
  id: string;
  coach_id: string;
  user_id: string;
  tagline: string | null;
  bio: string | null;
  photo_url: string | null;
  specialties: string[];
  playing_background: string | null;
  coaching_background: string | null;
  hourly_rate_cents: number;
  is_marketplace_active: boolean;
  location: string | null;
  years_experience: number | null;
  avg_rating: number;
  total_reviews: number;
  total_sessions: number;
  // joined from coaches table
  coach_name?: string;
  coach_email?: string;
  coach_status?: string;
  is_certified?: boolean;
  is_bypass_certified?: boolean;
  is_staff?: boolean;
  is_marketplace_approved?: boolean;
  marketplace_status?: string;
}

export interface CoachService {
  id: string;
  coach_id: string;
  service_type: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  price_cents: number;
  is_active: boolean;
}

export interface MarketplaceBooking {
  id: string;
  athlete_user_id: string;
  coach_id: string;
  service_id: string;
  scheduled_at: string | null;
  status: string;
  amount_cents: number;
  platform_fee_cents: number;
  coach_payout_cents: number;
  notes: string | null;
  video_call_link: string | null;
  recording_url: string | null;
  athlete_notes: string | null;
  coach_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachReview {
  id: string;
  booking_id: string;
  coach_id: string;
  athlete_user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

const PLATFORM_FEE_PERCENT = 30;

export const useMarketplaceCoaches = (filters?: { specialty?: string; search?: string }) => {
  return useQuery({
    queryKey: ["marketplace-coaches", filters],
    queryFn: async () => {
      // Query marketplace profiles joined with coaches — only approved coaches
      let query = supabase
        .from("coach_marketplace_profiles")
        .select(`
          *,
          coaches:coach_id (
            name,
            email,
            status,
            is_certified,
            is_bypass_certified,
            is_staff,
            is_marketplace_approved,
            marketplace_status
          )
        `)
        .eq("is_marketplace_active", true);

      const { data, error } = await query.order("avg_rating", { ascending: false });
      if (error) throw error;

      let results = (data || [])
        .map((item: any) => ({
          ...item,
          coach_name: item.coaches?.name,
          coach_email: item.coaches?.email,
          coach_status: item.coaches?.status,
          is_certified: item.coaches?.is_certified,
          is_bypass_certified: item.coaches?.is_bypass_certified,
          is_staff: item.coaches?.is_staff,
          is_marketplace_approved: item.coaches?.is_marketplace_approved,
          marketplace_status: item.coaches?.marketplace_status,
        }))
        // CRITICAL PROTECTION: Only show coaches who meet ALL requirements:
        // 1. Admin has approved marketplace access
        // 2. Status is "approved"
        // 3. Coach is certified (Vault Certified, Vault Staff, OR Eddie Certified)
        .filter((c: any) => {
          const isApproved = c.is_marketplace_approved === true;
          const hasApprovedStatus = c.marketplace_status === "approved";
          const isCertified = c.is_certified === true || c.is_bypass_certified === true || c.is_staff === true;
          return isApproved && hasApprovedStatus && isCertified;
        });

      // Client-side filtering
      if (filters?.specialty) {
        results = results.filter((c: any) =>
          c.specialties?.some((s: string) =>
            s.toLowerCase().includes(filters.specialty!.toLowerCase())
          )
        );
      }
      if (filters?.search) {
        const term = filters.search.toLowerCase();
        results = results.filter(
          (c: any) =>
            c.coach_name?.toLowerCase().includes(term) ||
            c.tagline?.toLowerCase().includes(term) ||
            c.location?.toLowerCase().includes(term) ||
            c.specialties?.some((s: string) => s.toLowerCase().includes(term))
        );
      }

      return results as MarketplaceCoach[];
    },
  });
};

export const useCoachProfile = (coachId: string) => {
  return useQuery({
    queryKey: ["marketplace-coach", coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_marketplace_profiles")
        .select(`
          *,
          coaches:coach_id (
            name,
            email,
            status,
            is_certified,
            is_bypass_certified,
            is_staff,
            is_marketplace_approved,
            marketplace_status
          )
        `)
        .eq("coach_id", coachId)
        .single();

      if (error) throw error;
      const coach = data as any;
      return {
        ...data,
        coach_name: coach.coaches?.name,
        coach_email: coach.coaches?.email,
        coach_status: coach.coaches?.status,
        is_certified: coach.coaches?.is_certified,
        is_bypass_certified: coach.coaches?.is_bypass_certified,
        is_staff: coach.coaches?.is_staff,
        is_marketplace_approved: coach.coaches?.is_marketplace_approved,
        marketplace_status: coach.coaches?.marketplace_status,
      } as MarketplaceCoach;
    },
    enabled: !!coachId,
  });
};

export const useCoachServices = (coachId: string) => {
  return useQuery({
    queryKey: ["coach-services", coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_services")
        .select("*")
        .eq("coach_id", coachId)
        .eq("is_active", true);

      if (error) throw error;
      return data as CoachService[];
    },
    enabled: !!coachId,
  });
};

export const useCoachReviews = (coachId: string) => {
  return useQuery({
    queryKey: ["coach-reviews", coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_reviews")
        .select("*")
        .eq("coach_id", coachId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CoachReview[];
    },
    enabled: !!coachId,
  });
};

export const useMyBookings = () => {
  return useQuery({
    queryKey: ["my-marketplace-bookings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("marketplace_bookings")
        .select(`
          *,
          coach_services:service_id (
            title,
            service_type,
            duration_minutes
          ),
          coaches:coach_id (
            name
          )
        `)
        .eq("athlete_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCoachBookings = (coachId: string) => {
  return useQuery({
    queryKey: ["coach-marketplace-bookings", coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_bookings")
        .select(`
          *,
          coach_services:service_id (
            title,
            service_type,
            duration_minutes
          )
        `)
        .eq("coach_id", coachId)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!coachId,
  });
};

export const useCoachEarnings = (coachId: string) => {
  return useQuery({
    queryKey: ["coach-earnings", coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_earnings")
        .select("*")
        .eq("coach_id", coachId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!coachId,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      coach_id,
      service_id,
      scheduled_at,
      amount_cents,
      notes,
    }: {
      coach_id: string;
      service_id: string;
      scheduled_at: string;
      amount_cents: number;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated — you must create a Vault Baseball account to book sessions.");

      // Verify the athlete has a profile (registered user)
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("You must complete your profile before booking a session. Please visit your Dashboard first.");

      const platform_fee_cents = Math.round(amount_cents * (PLATFORM_FEE_PERCENT / 100));
      const coach_payout_cents = amount_cents - platform_fee_cents;

      const { data, error } = await supabase
        .from("marketplace_bookings")
        .insert({
          athlete_user_id: user.id,
          coach_id,
          service_id,
          scheduled_at,
          amount_cents,
          platform_fee_cents,
          coach_payout_cents,
          notes,
          status: "confirmed",
        })
        .select()
        .single();

      if (error) throw error;

      // Create earnings record
      await supabase.from("marketplace_earnings").insert({
        coach_id,
        booking_id: data.id,
        total_amount_cents: amount_cents,
        platform_fee_cents,
        coach_amount_cents: coach_payout_cents,
        status: "pending",
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-marketplace-bookings"] });
      toast.success("Session booked successfully!");
    },
    onError: (error) => {
      toast.error(`Booking failed: ${error.message}`);
    },
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      booking_id,
      coach_id,
      rating,
      review_text,
    }: {
      booking_id: string;
      coach_id: string;
      rating: number;
      review_text?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("coach_reviews")
        .insert({
          booking_id,
          coach_id,
          athlete_user_id: user.id,
          rating,
          review_text,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["coach-reviews", variables.coach_id] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-coach", variables.coach_id] });
      toast.success("Review submitted!");
    },
    onError: (error) => {
      toast.error(`Failed to submit review: ${error.message}`);
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, coach_notes }: { id: string; status: string; coach_notes?: string }) => {
      const updates: any = { status };
      if (coach_notes !== undefined) updates.coach_notes = coach_notes;

      const { data, error } = await supabase
        .from("marketplace_bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update earnings status when completed
      if (status === "completed") {
        await supabase
          .from("marketplace_earnings")
          .update({ status: "available" })
          .eq("booking_id", id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-marketplace-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["coach-marketplace-bookings"] });
      toast.success("Booking updated");
    },
  });
};
