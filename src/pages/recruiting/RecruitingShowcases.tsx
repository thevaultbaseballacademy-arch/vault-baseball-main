import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, ArrowLeft, MapPin, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRecruitingProfile, ShowcaseEvent } from "@/hooks/useRecruitingProfile";

const EVENT_TYPES = [
  { value: "showcase", label: "Showcase" },
  { value: "camp", label: "Camp" },
  { value: "combine", label: "Combine" },
  { value: "tournament", label: "Tournament" },
  { value: "tryout", label: "Tryout" },
  { value: "visit", label: "Campus Visit" },
];

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-blue-500/10 text-blue-500",
  registered: "bg-green-500/10 text-green-500",
  attended: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const RecruitingShowcases = () => {
  const { showcases, addShowcase, updateShowcase, deleteShowcase, loading } = useRecruitingProfile();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ event_name: "", event_type: "showcase", organization: "", location: "", event_date: "", status: "planned", notes: "", cost_cents: "" });

  const handleAdd = async () => {
    if (!form.event_name.trim()) return;
    await addShowcase({
      event_name: form.event_name,
      event_type: form.event_type,
      organization: form.organization || null,
      location: form.location || null,
      event_date: form.event_date || null,
      status: form.status,
      notes: form.notes || null,
      cost_cents: form.cost_cents ? parseInt(form.cost_cents) * 100 : null,
    });
    setForm({ event_name: "", event_type: "showcase", organization: "", location: "", event_date: "", status: "planned", notes: "", cost_cents: "" });
    setShowAdd(false);
  };

  const upcoming = showcases.filter((s) => s.event_date && new Date(s.event_date) >= new Date());
  const past = showcases.filter((s) => !s.event_date || new Date(s.event_date) < new Date());

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/recruiting" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Recruiting Hub
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-2xl font-display text-foreground">SHOWCASE TRACKER</h1>
                <p className="text-sm text-muted-foreground">{showcases.length} events tracked</p>
              </div>
            </div>
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Event</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Showcase / Event</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Event Name *</Label><Input value={form.event_name} onChange={(e) => setForm((f) => ({ ...f, event_name: e.target.value }))} placeholder="Perfect Game Showcase" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Type</Label><Select value={form.event_type} onValueChange={(v) => setForm((f) => ({ ...f, event_type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EVENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="planned">Planned</SelectItem><SelectItem value="registered">Registered</SelectItem><SelectItem value="attended">Attended</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div>
                  </div>
                  <div><Label>Organization</Label><Input value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))} placeholder="Perfect Game, Prep Baseball Report..." /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="City, State" /></div>
                    <div><Label>Date</Label><Input type="date" value={form.event_date} onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))} /></div>
                  </div>
                  <div><Label>Cost ($)</Label><Input type="number" value={form.cost_cents} onChange={(e) => setForm((f) => ({ ...f, cost_cents: e.target.value }))} placeholder="250" /></div>
                  <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
                  <Button onClick={handleAdd} className="w-full">Add Event</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Upcoming</h3>
              <div className="space-y-2">
                {upcoming.map((s) => (
                  <EventCard key={s.id} event={s} onDelete={deleteShowcase} onUpdate={updateShowcase} />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Past / No Date</h3>
              <div className="space-y-2">
                {past.map((s) => (
                  <EventCard key={s.id} event={s} onDelete={deleteShowcase} onUpdate={updateShowcase} />
                ))}
              </div>
            </div>
          )}

          {showcases.length === 0 && !loading && (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No events tracked yet. Add your first showcase or camp.</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
};

const EventCard = ({ event, onDelete, onUpdate }: { event: ShowcaseEvent; onDelete: (id: string) => void; onUpdate: (id: string, data: Partial<ShowcaseEvent>) => void }) => {
  const typeLabel = EVENT_TYPES.find((t) => t.value === event.event_type)?.label || event.event_type;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <MapPin className="w-4 h-4 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-foreground truncate">{event.event_name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[event.status] || ""}`}>{event.status}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {typeLabel}
          {event.organization ? ` • ${event.organization}` : ""}
          {event.location ? ` • ${event.location}` : ""}
        </p>
        {event.event_date && (
          <p className="text-xs text-muted-foreground mt-0.5">{new Date(event.event_date).toLocaleDateString()}</p>
        )}
        {event.results && <p className="text-xs text-foreground mt-1">Results: {event.results}</p>}
        {event.notes && <p className="text-xs text-muted-foreground mt-1 italic">{event.notes}</p>}
      </div>
      <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => onDelete(event.id)}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};

export default RecruitingShowcases;
