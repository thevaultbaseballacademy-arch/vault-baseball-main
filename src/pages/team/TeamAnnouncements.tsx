import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Megaphone, Plus, Loader2, Pin, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTeamManagement } from "@/hooks/useTeamManagement";

const PRIORITIES = ["normal", "important", "urgent"] as const;

const TeamAnnouncements = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get("id");
  const { selectedTeam, setSelectedTeamId, announcements, createAnnouncement } = useTeamManagement();

  useEffect(() => { if (teamId) setSelectedTeamId(teamId); }, [teamId]);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", priority: "normal" });

  const handleSave = async () => {
    if (!form.title || !form.content || !teamId) return;
    setSaving(true);
    try {
      await createAnnouncement(teamId, form.title, form.content, form.priority);
      setOpen(false);
      setForm({ title: "", content: "", priority: "normal" });
    } finally {
      setSaving(false);
    }
  };

  const priorityStyles: Record<string, string> = {
    normal: "border-border",
    important: "border-amber-500/30 bg-amber-500/5",
    urgent: "border-red-500/30 bg-red-500/5",
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
              <h1 className="text-3xl font-display text-foreground">ANNOUNCEMENTS</h1>
              <p className="text-muted-foreground text-sm">{selectedTeam?.name} team communications</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> New Post</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Post Announcement</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title *</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" />
                  </div>
                  <div>
                    <Label>Message *</Label>
                    <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                      rows={4} className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm resize-none"
                      placeholder="Write your announcement..." />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <div className="flex gap-2 mt-1.5">
                      {PRIORITIES.map((p) => (
                        <button key={p} onClick={() => setForm({ ...form, priority: p })}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs capitalize transition-all ${
                            form.priority === p
                              ? p === "urgent" ? "bg-destructive text-destructive-foreground"
                                : p === "important" ? "bg-amber-500 text-white"
                                : "bg-primary text-primary-foreground"
                              : "bg-secondary text-foreground"
                          }`}>{p}</button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleSave} disabled={saving || !form.title || !form.content} className="w-full">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Post Announcement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {announcements.length > 0 ? announcements.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`bg-card border rounded-2xl p-5 ${priorityStyles[a.priority]}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {a.pinned && <Pin className="w-3.5 h-3.5 text-primary" />}
                    {a.priority === "urgent" && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                    <h3 className="font-display text-foreground">{a.title}</h3>
                    {a.priority !== "normal" && (
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        a.priority === "urgent" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                      }`}>{a.priority}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.content}</p>
              </motion.div>
            )) : (
              <div className="text-center py-16 text-muted-foreground">
                <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No announcements yet.</p>
                <Button className="mt-4" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Post First Announcement</Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamAnnouncements;
