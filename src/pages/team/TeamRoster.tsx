import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Users, UserPlus, Check, X, Shield,
  Loader2, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { supabase } from "@/integrations/supabase/client";

const POSITIONS = ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH", "UT"];
const ROLES = ["player", "captain", "assistant_coach", "manager"];

const TeamRoster = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get("id");
  const {
    selectedTeam, setSelectedTeamId, activeMembers, pendingMembers,
    addMember, updateMember, removeMember, refetchTeamData,
  } = useTeamManagement();

  useEffect(() => { if (teamId) setSelectedTeamId(teamId); }, [teamId]);

  const [showAdd, setShowAdd] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addPosition, setAddPosition] = useState("");
  const [addJersey, setAddJersey] = useState("");
  const [saving, setSaving] = useState(false);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, { display_name: string; avatar_url: string | null }>>({});

  // Fetch profiles for members
  useEffect(() => {
    const userIds = [...activeMembers, ...pendingMembers].map((m) => m.user_id);
    if (userIds.length === 0) return;
    supabase.rpc("get_public_profiles_by_ids", { user_ids: userIds }).then(({ data }) => {
      if (data) {
        const map: Record<string, any> = {};
        (data as any[]).forEach((p: any) => { map[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url }; });
        setMemberProfiles(map);
      }
    });
  }, [activeMembers, pendingMembers]);

  const handleAdd = async () => {
    if (!addEmail.trim() || !teamId) return;
    setSaving(true);
    try {
      const { data: profile } = await supabase.from("profiles").select("user_id").eq("email", addEmail.toLowerCase()).maybeSingle();
      if (!profile) {
        alert("No account found with that email.");
        return;
      }
      await addMember(teamId, (profile as any).user_id, "player", addPosition || undefined, addJersey || undefined);
      setShowAdd(false);
      setAddEmail("");
      setAddPosition("");
      setAddJersey("");
    } finally {
      setSaving(false);
    }
  };

  const approveMember = async (memberId: string) => {
    await updateMember(memberId, { status: "active" } as any);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/team")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Team Hub
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display text-foreground">ROSTER</h1>
              <p className="text-muted-foreground text-sm">{selectedTeam?.name} • {activeMembers.length} players</p>
            </div>
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button><UserPlus className="w-4 h-4 mr-2" /> Add Player</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Player to Roster</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Player Email *</Label>
                    <Input value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="player@example.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Position</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {POSITIONS.map((p) => (
                          <button key={p} onClick={() => setAddPosition(p)}
                            className={`px-2.5 py-1 rounded-lg text-xs ${
                              addPosition === p ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                            }`}>{p}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Jersey #</Label>
                      <Input value={addJersey} onChange={(e) => setAddJersey(e.target.value)} placeholder="e.g. 7" />
                    </div>
                  </div>
                  <Button onClick={handleAdd} disabled={saving || !addEmail.trim()} className="w-full">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Add to Roster
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Pending */}
          {pendingMembers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-widest text-amber-500 mb-3">Pending Approval ({pendingMembers.length})</h3>
              <div className="space-y-2">
                {pendingMembers.map((m) => {
                  const profile = memberProfiles[m.user_id];
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-4 bg-card border border-amber-500/20 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        {profile?.avatar_url ? <img src={profile.avatar_url} className="w-10 h-10 rounded-full object-cover" /> : <Users className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{profile?.display_name || "Player"}</p>
                        <p className="text-xs text-muted-foreground">Wants to join</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => approveMember(m.id)}>
                        <Check className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeMember(m.id)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Roster */}
          <div className="space-y-2">
            {activeMembers.length > 0 ? activeMembers.map((m, i) => {
              const profile = memberProfiles[m.user_id];
              return (
                <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {profile?.avatar_url ? <img src={profile.avatar_url} className="w-10 h-10 rounded-full object-cover" /> : <Users className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{profile?.display_name || "Player"}</p>
                    <div className="flex items-center gap-2">
                      {m.jersey_number && <span className="text-xs font-mono text-muted-foreground">#{m.jersey_number}</span>}
                      {m.position && <span className="text-xs px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">{m.position}</span>}
                      {m.role !== "player" && (
                        <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded capitalize">{m.role.replace("_", " ")}</span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {ROLES.filter((r) => r !== m.role).map((r) => (
                        <DropdownMenuItem key={r} onClick={() => updateMember(m.id, { role: r } as any)}>
                          Set as {r.replace("_", " ")}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem onClick={() => updateMember(m.id, { status: "injured" } as any)}>
                        Mark Injured
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => removeMember(m.id)}>
                        Remove from Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              );
            }) : (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No players on the roster yet.</p>
                <Button className="mt-4" onClick={() => setShowAdd(true)}><UserPlus className="w-4 h-4 mr-2" /> Add First Player</Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamRoster;
