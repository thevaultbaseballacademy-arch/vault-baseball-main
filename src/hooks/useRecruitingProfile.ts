import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RecruitingProfile {
  id: string;
  user_id: string;
  sport_type: string;
  gpa: number | null;
  sat_score: number | null;
  act_score: number | null;
  ncaa_id: string | null;
  ncaa_eligibility_center: boolean;
  commitment_status: string;
  committed_school: string | null;
  committed_at: string | null;
  division_target: string[];
  highlight_video_url: string | null;
  skills_video_url: string | null;
  academic_interests: string | null;
  extracurriculars: string | null;
  references_contacts: any[];
  recruiting_notes: string | null;
  visibility: string;
}

export interface ShowcaseEvent {
  id: string;
  user_id: string;
  event_name: string;
  event_type: string;
  organization: string | null;
  location: string | null;
  event_date: string | null;
  event_end_date: string | null;
  status: string;
  results: string | null;
  notes: string | null;
  cost_cents: number | null;
  created_at: string;
}

export interface RecruitingContact {
  id: string;
  user_id: string;
  school_name: string;
  division: string | null;
  coach_name: string | null;
  coach_title: string | null;
  coach_email: string | null;
  coach_phone: string | null;
  contact_status: string;
  interest_level: string;
  last_contact_date: string | null;
  next_follow_up: string | null;
  notes: string | null;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  user_id: string;
  item_key: string;
  item_label: string;
  category: string;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
}

const DEFAULT_CHECKLIST = [
  { key: "profile_complete", label: "Complete athletic profile (height, weight, position, stats)", category: "Profile" },
  { key: "highlight_video", label: "Upload highlight video (2-4 min, best plays)", category: "Profile" },
  { key: "skills_video", label: "Upload skills/workout video", category: "Profile" },
  { key: "academic_info", label: "Add GPA and test scores", category: "Academics" },
  { key: "ncaa_eligibility", label: "Register with NCAA Eligibility Center", category: "Academics" },
  { key: "transcript_ready", label: "Have unofficial transcript ready to send", category: "Academics" },
  { key: "target_schools", label: "Build target school list (10-20 schools)", category: "Research" },
  { key: "division_fit", label: "Assess realistic division fit based on metrics", category: "Research" },
  { key: "coach_contacts", label: "Find coaching staff contact info for targets", category: "Research" },
  { key: "intro_email", label: "Send introductory email to college coaches", category: "Outreach" },
  { key: "follow_up", label: "Follow up with coaches who haven't responded", category: "Outreach" },
  { key: "camp_attendance", label: "Register for at least one showcase or camp", category: "Showcases" },
  { key: "showcase_schedule", label: "Build showcase calendar for the year", category: "Showcases" },
  { key: "unofficial_visit", label: "Schedule an unofficial campus visit", category: "Visits" },
  { key: "reference_letters", label: "Get reference letters from coaches/teachers", category: "Materials" },
];

export const useRecruitingProfile = () => {
  const [profile, setProfile] = useState<RecruitingProfile | null>(null);
  const [showcases, setShowcases] = useState<ShowcaseEvent[]>([]);
  const [contacts, setContacts] = useState<RecruitingContact[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;

      const [profileRes, showcaseRes, contactRes, checklistRes] = await Promise.all([
        supabase.from("recruiting_profiles").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("showcase_events").select("*").eq("user_id", userId).order("event_date", { ascending: true }),
        supabase.from("recruiting_contacts").select("*").eq("user_id", userId).order("school_name"),
        supabase.from("recruiting_checklist").select("*").eq("user_id", userId),
      ]);

      setProfile((profileRes.data as any) || null);
      setShowcases((showcaseRes.data as any[]) || []);
      setContacts((contactRes.data as any[]) || []);

      // If no checklist items, seed defaults
      const existingChecklist = (checklistRes.data as any[]) || [];
      if (existingChecklist.length === 0) {
        const items = DEFAULT_CHECKLIST.map((c) => ({
          user_id: userId,
          item_key: c.key,
          item_label: c.label,
          category: c.category,
          is_completed: false,
        }));
        const { data: seeded } = await supabase.from("recruiting_checklist").insert(items as any).select();
        setChecklist((seeded as any[]) || []);
      } else {
        setChecklist(existingChecklist);
      }
    } catch (err) {
      console.error("Error loading recruiting data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const saveProfile = async (data: Partial<RecruitingProfile>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    if (profile) {
      const { error } = await supabase.from("recruiting_profiles").update(data as any).eq("id", profile.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("recruiting_profiles").insert({ ...data, user_id: session.user.id } as any);
      if (error) throw error;
    }
    await fetchAll();
    toast({ title: "Recruiting profile saved" });
  };

  const addShowcase = async (data: Partial<ShowcaseEvent>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { error } = await supabase.from("showcase_events").insert({ ...data, user_id: session.user.id } as any);
    if (error) throw error;
    await fetchAll();
    toast({ title: "Showcase event added" });
  };

  const updateShowcase = async (id: string, data: Partial<ShowcaseEvent>) => {
    const { error } = await supabase.from("showcase_events").update(data as any).eq("id", id);
    if (error) throw error;
    await fetchAll();
  };

  const deleteShowcase = async (id: string) => {
    const { error } = await supabase.from("showcase_events").delete().eq("id", id);
    if (error) throw error;
    await fetchAll();
    toast({ title: "Showcase event removed" });
  };

  const addContact = async (data: Partial<RecruitingContact>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { error } = await supabase.from("recruiting_contacts").insert({ ...data, user_id: session.user.id } as any);
    if (error) throw error;
    await fetchAll();
    toast({ title: "Contact added" });
  };

  const updateContact = async (id: string, data: Partial<RecruitingContact>) => {
    const { error } = await supabase.from("recruiting_contacts").update(data as any).eq("id", id);
    if (error) throw error;
    await fetchAll();
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from("recruiting_contacts").delete().eq("id", id);
    if (error) throw error;
    await fetchAll();
    toast({ title: "Contact removed" });
  };

  const toggleChecklistItem = async (itemId: string, completed: boolean) => {
    const { error } = await supabase.from("recruiting_checklist").update({
      is_completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
    } as any).eq("id", itemId);
    if (error) throw error;
    setChecklist((prev) =>
      prev.map((c) => c.id === itemId ? { ...c, is_completed: completed, completed_at: completed ? new Date().toISOString() : null } : c)
    );
  };

  const readinessScore = checklist.length > 0
    ? Math.round((checklist.filter((c) => c.is_completed).length / checklist.length) * 100)
    : 0;

  return {
    profile, showcases, contacts, checklist, loading, readinessScore,
    saveProfile, addShowcase, updateShowcase, deleteShowcase,
    addContact, updateContact, deleteContact, toggleChecklistItem,
    refetch: fetchAll,
  };
};
