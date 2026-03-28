import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Users, Plus, Shield, Calendar, Megaphone,
  ChevronRight, Copy, Check, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { useToast } from "@/hooks/use-toast";

const TeamHub = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    teams, selectedTeam, selectedTeamId, setSelectedTeamId,
    activeMembers, pendingMembers, announcements, events,
    loading, createTeam, joinByCode,
  } = useTeamManagement();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", sport_type: "baseball", age_group: "", season: "", description: "" });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await createTeam(form);
      setShowCreate(false);
      setForm({ name: "", sport_type: "baseball", age_group: "", season: "", description: "" });
    } finally {
      setSaving(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setSaving(true);
    try {
      await joinByCode(joinCode.trim());
      setShowJoin(false);
      setJoinCode("");
    } finally {
      setSaving(false);
    }
  };

  const copyInvite = () => {
    if (selectedTeam?.invite_code) {
      navigator.clipboard.writeText(selectedTeam.invite_code);
      setCopied(true);
      toast({ title: "Invite code copied!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-secondary animate-pulse rounded-2xl" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-display text-foreground mb-1">TEAM HUB</h1>
                <p className="text-muted-foreground">Manage rosters, events, and team communication</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={showJoin} onOpenChange={setShowJoin}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Join Team</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Join a Team</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground mb-4">Enter the invite code from your coach.</p>
                    <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="e.g. a1b2c3d4" />
                    <Button onClick={handleJoin} disabled={saving || !joinCode.trim()} className="w-full mt-3">
                      {saving ? "Joining..." : "Join Team"}
                    </Button>
                  </DialogContent>
                </Dialog>
                <Dialog open={showCreate} onOpenChange={setShowCreate}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Create Team</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create a Team</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Team Name *</Label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 16U Elite" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Sport</Label>
                          <div className="flex gap-2 mt-1.5">
                            {["baseball", "softball"].map((s) => (
                              <button key={s} onClick={() => setForm({ ...form, sport_type: s })}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm capitalize ${
                                  form.sport_type === s ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                                }`}>{s === "baseball" ? "⚾ Baseball" : "🥎 Softball"}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>Age Group</Label>
                          <Input value={form.age_group} onChange={(e) => setForm({ ...form, age_group: e.target.value })} placeholder="e.g. 16U" />
                        </div>
                      </div>
                      <div>
                        <Label>Season</Label>
                        <Input value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} placeholder="e.g. Spring 2026" />
                      </div>
                      <Button onClick={handleCreate} disabled={saving || !form.name.trim()} className="w-full">
                        {saving ? "Creating..." : "Create Team"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Team Selector */}
            {teams.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {teams.map((t) => (
                  <button key={t.id} onClick={() => setSelectedTeamId(t.id)}
                    className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                      selectedTeamId === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}>{t.name}</button>
                ))}
              </div>
            )}

            {selectedTeam ? (
              <>
                {/* Team Header */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Shield className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-display text-foreground">{selectedTeam.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedTeam.sport_type === "softball" ? "🥎" : "⚾"} {selectedTeam.age_group || ""} • {selectedTeam.season || ""}
                        </p>
                      </div>
                    </div>
                    <button onClick={copyInvite}
                      className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-xl text-xs text-muted-foreground hover:text-foreground transition">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="font-mono">{selectedTeam.invite_code}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-card border border-border rounded-2xl p-4 text-center">
                    <Users className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-display text-foreground">{activeMembers.length}</p>
                    <p className="text-xs text-muted-foreground">Roster</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4 text-center">
                    <Calendar className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-display text-foreground">{events.length}</p>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4 text-center">
                    <Megaphone className="w-5 h-5 mx-auto mb-2 text-amber-500" />
                    <p className="text-2xl font-display text-foreground">{announcements.length}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                </div>

                {/* Pending Members */}
                {pendingMembers.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-widest text-amber-500 mb-2">{pendingMembers.length} Pending Join Request(s)</p>
                    <Link to={`/team/roster?id=${selectedTeamId}`} className="text-sm text-primary hover:underline">Review →</Link>
                  </div>
                )}

                {/* Navigation Cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Link to={`/team/roster?id=${selectedTeamId}`}>
                    <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all group">
                      <Users className="w-8 h-8 text-primary mb-3" />
                      <h3 className="font-display text-foreground mb-1">Roster</h3>
                      <p className="text-xs text-muted-foreground">Manage players, positions, and jersey numbers</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition" />
                    </div>
                  </Link>
                  <Link to={`/team/schedule?id=${selectedTeamId}`}>
                    <div className="bg-card border border-border rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
                      <Calendar className="w-8 h-8 text-blue-500 mb-3" />
                      <h3 className="font-display text-foreground mb-1">Schedule</h3>
                      <p className="text-xs text-muted-foreground">Games, practices, and tournaments</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition" />
                    </div>
                  </Link>
                  <Link to={`/team/announcements?id=${selectedTeamId}`}>
                    <div className="bg-card border border-border rounded-2xl p-6 hover:border-amber-500/30 transition-all group">
                      <Megaphone className="w-8 h-8 text-amber-500 mb-3" />
                      <h3 className="font-display text-foreground mb-1">Announcements</h3>
                      <p className="text-xs text-muted-foreground">Post updates and team communications</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition" />
                    </div>
                  </Link>
                  <Link to={`/team/analytics?id=${selectedTeamId}`}>
                    <div className="bg-card border border-border rounded-2xl p-6 hover:border-green-500/30 transition-all group">
                      <Settings className="w-8 h-8 text-green-500 mb-3" />
                      <h3 className="font-display text-foreground mb-1">Team Analytics</h3>
                      <p className="text-xs text-muted-foreground">Aggregate performance and attendance</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition" />
                    </div>
                  </Link>
                </div>

                {/* Upcoming Events Preview */}
                {events.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-display text-foreground mb-4">Upcoming</h3>
                    <div className="space-y-2">
                      {events.slice(0, 4).map((ev) => (
                        <div key={ev.id} className={`flex items-center gap-3 p-3 rounded-xl ${ev.is_cancelled ? "bg-red-500/5 line-through" : "bg-secondary"}`}>
                          <div className="w-10 text-center shrink-0">
                            <p className="text-xs text-muted-foreground">{new Date(ev.event_date).toLocaleDateString("en-US", { month: "short" })}</p>
                            <p className="text-lg font-display text-foreground">{new Date(ev.event_date).getDate()}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{ev.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {ev.start_time && `${ev.start_time}`}{ev.location && ` • ${ev.location}`}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                            ev.event_type === "game" ? "bg-primary/10 text-primary" :
                            ev.event_type === "tournament" ? "bg-amber-500/10 text-amber-500" :
                            "bg-secondary text-muted-foreground"
                          }`}>{ev.event_type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="font-display text-xl text-foreground mb-2">No Teams Yet</h3>
                <p className="text-muted-foreground text-sm mb-6">Create a team or join one with an invite code.</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => setShowJoin(true)}>Join Team</Button>
                  <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" /> Create Team</Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamHub;
