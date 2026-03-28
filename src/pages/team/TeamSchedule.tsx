import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Calendar, Plus, Loader2, MapPin, Swords
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTeamManagement } from "@/hooks/useTeamManagement";

const EVENT_TYPES = ["practice", "game", "scrimmage", "tournament", "meeting", "other"] as const;
const EVENT_ICONS: Record<string, string> = {
  practice: "🏋️", game: "⚾", scrimmage: "🔄", tournament: "🏆", meeting: "📋", other: "📌",
};

const TeamSchedule = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get("id");
  const { selectedTeam, setSelectedTeamId, events, createEvent } = useTeamManagement();

  useEffect(() => { if (teamId) setSelectedTeamId(teamId); }, [teamId]);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", event_type: "practice" as string, event_date: "",
    start_time: "", end_time: "", location: "", opponent: "", notes: "",
  });

  const handleSave = async () => {
    if (!form.title || !form.event_date || !teamId) return;
    setSaving(true);
    try {
      await createEvent(teamId, form as any);
      setOpen(false);
      setForm({ title: "", event_type: "practice", event_date: "", start_time: "", end_time: "", location: "", opponent: "", notes: "" });
    } finally {
      setSaving(false);
    }
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
              <h1 className="text-3xl font-display text-foreground">SCHEDULE</h1>
              <p className="text-muted-foreground text-sm">{selectedTeam?.name} upcoming events</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Add Event</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Add Team Event</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title *</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Practice @ Main Field" />
                  </div>
                  <div>
                    <Label>Event Type</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {EVENT_TYPES.map((t) => (
                        <button key={t} onClick={() => setForm({ ...form, event_type: t })}
                          className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                            form.event_type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                          }`}>{EVENT_ICONS[t]} {t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Date *</Label>
                      <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
                    </div>
                    <div>
                      <Label>Start Time</Label>
                      <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Location</Label>
                      <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Field name or address" />
                    </div>
                    <div>
                      <Label>Opponent</Label>
                      <Input value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} placeholder="vs. Team Name" />
                    </div>
                  </div>
                  <Button onClick={handleSave} disabled={saving || !form.title || !form.event_date} className="w-full">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Add Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {events.length > 0 ? events.map((ev, i) => (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`bg-card border rounded-2xl p-5 ${ev.is_cancelled ? "border-red-500/20 opacity-60" : "border-border"}`}>
                <div className="flex items-start gap-4">
                  <div className="w-14 text-center shrink-0 bg-secondary rounded-xl p-2">
                    <p className="text-xs text-muted-foreground">{new Date(ev.event_date).toLocaleDateString("en-US", { month: "short" })}</p>
                    <p className="text-2xl font-display text-foreground">{new Date(ev.event_date).getDate()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(ev.event_date).toLocaleDateString("en-US", { weekday: "short" })}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{EVENT_ICONS[ev.event_type]}</span>
                      <h3 className={`font-display text-foreground ${ev.is_cancelled ? "line-through" : ""}`}>{ev.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        ev.event_type === "game" ? "bg-primary/10 text-primary" :
                        ev.event_type === "tournament" ? "bg-amber-500/10 text-amber-500" :
                        "bg-secondary text-muted-foreground"
                      }`}>{ev.event_type}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {ev.start_time && <span>🕐 {ev.start_time}{ev.end_time ? ` – ${ev.end_time}` : ""}</span>}
                      {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>}
                      {ev.opponent && <span className="flex items-center gap-1"><Swords className="w-3 h-3" />vs {ev.opponent}</span>}
                    </div>
                    {ev.notes && <p className="text-sm text-muted-foreground mt-2">{ev.notes}</p>}
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-16 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No upcoming events.</p>
                <Button className="mt-4" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add First Event</Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamSchedule;
