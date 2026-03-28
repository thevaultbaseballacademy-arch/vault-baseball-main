import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Team {
  id: string;
  name: string;
  sport_type: string;
  age_group: string | null;
  season: string | null;
  description: string | null;
  logo_url: string | null;
  head_coach_user_id: string;
  max_roster_size: number;
  invite_code: string;
  is_active: boolean;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  jersey_number: string | null;
  position: string | null;
  status: string;
  joined_at: string;
}

export interface TeamAnnouncement {
  id: string;
  team_id: string;
  author_user_id: string;
  title: string;
  content: string;
  priority: string;
  pinned: boolean;
  created_at: string;
}

export interface TeamEvent {
  id: string;
  team_id: string;
  title: string;
  event_type: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  opponent: string | null;
  notes: string | null;
  is_cancelled: boolean;
  created_by: string;
  created_at: string;
}

export const useTeamManagement = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [announcements, setAnnouncements] = useState<TeamAnnouncement[]>([]);
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("teams").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setTeams((data as any[]) || []);
      if (!selectedTeamId && data && data.length > 0) {
        setSelectedTeamId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedTeamId]);

  const fetchTeamData = useCallback(async (teamId: string) => {
    try {
      const [membersRes, announcementsRes, eventsRes] = await Promise.all([
        supabase.from("team_members").select("*").eq("team_id", teamId).order("role"),
        supabase.from("team_announcements").select("*").eq("team_id", teamId).order("pinned", { ascending: false }).order("created_at", { ascending: false }),
        supabase.from("team_events").select("*").eq("team_id", teamId).gte("event_date", new Date().toISOString().split("T")[0]).order("event_date").limit(20),
      ]);
      setMembers((membersRes.data as any[]) || []);
      setAnnouncements((announcementsRes.data as any[]) || []);
      setEvents((eventsRes.data as any[]) || []);
    } catch (err) {
      console.error("Error fetching team data:", err);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, []);
  useEffect(() => { if (selectedTeamId) fetchTeamData(selectedTeamId); }, [selectedTeamId, fetchTeamData]);

  const createTeam = async (data: { name: string; sport_type: string; age_group?: string; season?: string; description?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: team, error } = await supabase.from("teams").insert({
      ...data, head_coach_user_id: user.id,
    } as any).select().single();
    if (error) throw error;
    toast({ title: "Team created", description: `${data.name} is ready to go!` });
    await fetchTeams();
    if (team) setSelectedTeamId(team.id);
  };

  const addMember = async (teamId: string, userId: string, role = "player", position?: string, jerseyNumber?: string) => {
    const { error } = await supabase.from("team_members").insert({
      team_id: teamId, user_id: userId, role, position, jersey_number: jerseyNumber,
    } as any);
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already on roster", variant: "destructive" });
      } else throw error;
      return;
    }
    toast({ title: "Player added" });
    await fetchTeamData(teamId);
  };

  const updateMember = async (memberId: string, updates: Partial<TeamMember>) => {
    const { error } = await supabase.from("team_members").update(updates as any).eq("id", memberId);
    if (error) throw error;
    if (selectedTeamId) await fetchTeamData(selectedTeamId);
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase.from("team_members").delete().eq("id", memberId);
    if (error) throw error;
    toast({ title: "Player removed" });
    if (selectedTeamId) await fetchTeamData(selectedTeamId);
  };

  const joinByCode = async (inviteCode: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: team } = await supabase.from("teams").select("id, name").eq("invite_code", inviteCode).eq("is_active", true).maybeSingle();
    if (!team) {
      toast({ title: "Invalid code", description: "No team found with that invite code.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("team_members").insert({
      team_id: (team as any).id, user_id: user.id, role: "player", status: "pending",
    } as any);
    if (error) {
      if (error.code === "23505") toast({ title: "Already on this team", variant: "destructive" });
      else throw error;
      return;
    }
    toast({ title: "Request sent", description: `You've requested to join ${(team as any).name}.` });
    await fetchTeams();
  };

  const createAnnouncement = async (teamId: string, title: string, content: string, priority = "normal") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("team_announcements").insert({
      team_id: teamId, author_user_id: user.id, title, content, priority,
    } as any);
    if (error) throw error;
    toast({ title: "Announcement posted" });
    await fetchTeamData(teamId);
  };

  const createEvent = async (teamId: string, data: Omit<TeamEvent, "id" | "team_id" | "created_by" | "created_at" | "is_cancelled">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("team_events").insert({
      ...data, team_id: teamId, created_by: user.id,
    } as any);
    if (error) throw error;
    toast({ title: "Event created" });
    await fetchTeamData(teamId);
  };

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const activeMembers = members.filter((m) => m.status === "active");
  const pendingMembers = members.filter((m) => m.status === "pending");

  return {
    teams, members, announcements, events, loading,
    selectedTeam, selectedTeamId, setSelectedTeamId,
    activeMembers, pendingMembers,
    createTeam, addMember, updateMember, removeMember,
    joinByCode, createAnnouncement, createEvent,
    refetch: fetchTeams, refetchTeamData: fetchTeamData,
  };
};
