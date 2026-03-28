import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Lead {
  id: string;
  athlete_name: string;
  parent_name: string | null;
  email: string;
  athlete_age: number | null;
  primary_position: string | null;
  lead_source: string | null;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  product_key: string;
  amount_cents: number;
  purchased_at: string;
  status: string;
  expires_at: string | null;
}

export interface OnboardingEntry {
  id: string;
  user_id: string | null;
  email: string;
  athlete_name: string | null;
  parent_name: string | null;
  athlete_goals: string | null;
  biggest_struggle: string | null;
  training_history: string | null;
  current_level: string | null;
  position: string | null;
  current_velocity: string | null;
  exit_velo: string | null;
  sixty_time: string | null;
  social_handle: string | null;
  product_purchased: string | null;
  created_at: string;
}

export interface AthleteProfile {
  user_id: string;
  display_name: string | null;
  email: string | null;
  position: string | null;
  graduation_year: number | null;
  created_at: string;
}

export interface CRMFilters {
  search: string;
  product: string;
  position: string;
  membershipStatus: string;
  dateFrom: string;
  dateTo: string;
}

const defaultFilters: CRMFilters = {
  search: "",
  product: "all",
  position: "all",
  membershipStatus: "all",
  dateFrom: "",
  dateTo: "",
};

export const useAdminCRM = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingEntry[]>([]);
  const [profiles, setProfiles] = useState<AthleteProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CRMFilters>(defaultFilters);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [leadsRes, purchasesRes, onboardingRes, profilesRes] = await Promise.all([
        supabase.from("lead_captures").select("*").order("created_at", { ascending: false }),
        supabase.rpc("list_all_purchases_for_admin"),
        supabase.from("athlete_onboarding").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, display_name, email, position, graduation_year, created_at").order("created_at", { ascending: false }),
      ]);
      if (leadsRes.data) setLeads(leadsRes.data);
      if (purchasesRes.data) setPurchases(purchasesRes.data as Purchase[]);
      if (onboardingRes.data) setOnboarding(onboardingRes.data as OnboardingEntry[]);
      if (profilesRes.data) setProfiles(profilesRes.data as AthleteProfile[]);
    } catch (err) {
      console.error("CRM fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const inDateRange = (dateStr: string) => {
    if (!filters.dateFrom && !filters.dateTo) return true;
    const d = new Date(dateStr);
    if (filters.dateFrom && d < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && d > new Date(filters.dateTo + "T23:59:59")) return false;
    return true;
  };

  const matchesSearch = (text: string | null | undefined) =>
    !filters.search || (text ?? "").toLowerCase().includes(filters.search.toLowerCase());

  const filteredLeads = useMemo(() =>
    leads.filter(l =>
      (matchesSearch(l.athlete_name) || matchesSearch(l.email)) &&
      (filters.position === "all" || l.primary_position === filters.position) &&
      inDateRange(l.created_at)
    ), [leads, filters]);

  const filteredPurchases = useMemo(() =>
    purchases.filter(p =>
      (filters.product === "all" || p.product_key === filters.product) &&
      (filters.membershipStatus === "all" || p.status === filters.membershipStatus) &&
      inDateRange(p.purchased_at)
    ), [purchases, filters]);

  const filteredOnboarding = useMemo(() =>
    onboarding.filter(o =>
      (matchesSearch(o.email)) &&
      (filters.position === "all" || o.position === filters.position) &&
      inDateRange(o.created_at)
    ), [onboarding, filters]);

  const filteredProfiles = useMemo(() =>
    profiles.filter(p =>
      (matchesSearch(p.display_name) || matchesSearch(p.email)) &&
      (filters.position === "all" || p.position === filters.position) &&
      inDateRange(p.created_at)
    ), [profiles, filters]);

  // KPI computations
  const kpis = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentLeads = leads.filter(l => new Date(l.created_at) >= thirtyDaysAgo).length;
    const guideSignups = onboarding.filter(o => o.product_purchased === "free_velocity_guide" || o.product_purchased === null).length;
    const chatQualified = onboarding.filter(o => o.athlete_goals && o.current_velocity).length;
    const activeMemberships = purchases.filter(p => p.status === "completed" && p.product_key?.includes("remote_training")).length;
    const totalRevenue = purchases.filter(p => p.status === "completed").reduce((s, p) => s + p.amount_cents, 0);
    return { recentLeads, guideSignups, chatQualified, totalPurchases: purchases.length, activeMemberships, totalRevenue, totalProfiles: profiles.length };
  }, [leads, purchases, onboarding, profiles]);

  const uniqueProducts = useMemo(() => [...new Set(purchases.map(p => p.product_key))], [purchases]);
  const uniquePositions = useMemo(() => {
    const all = [
      ...leads.map(l => l.primary_position),
      ...onboarding.map(o => o.position),
      ...profiles.map(p => p.position),
    ].filter(Boolean) as string[];
    return [...new Set(all)];
  }, [leads, onboarding, profiles]);

  const resetFilters = () => setFilters(defaultFilters);

  return {
    loading, filters, setFilters, resetFilters,
    leads: filteredLeads, purchases: filteredPurchases, onboarding: filteredOnboarding, profiles: filteredProfiles,
    kpis, uniqueProducts, uniquePositions,
  };
};
