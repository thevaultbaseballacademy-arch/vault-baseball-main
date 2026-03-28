import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, ArrowLeft, Trash2, Mail, Phone, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRecruitingProfile, RecruitingContact } from "@/hooks/useRecruitingProfile";

const CONTACT_STATUSES = [
  { value: "researched", label: "Researched" },
  { value: "emailed", label: "Emailed" },
  { value: "replied", label: "Replied" },
  { value: "called", label: "Called" },
  { value: "visited", label: "Visited" },
  { value: "offered", label: "Offered" },
  { value: "declined", label: "Declined" },
];

const INTEREST_LEVELS = [
  { value: "unknown", label: "Unknown", color: "bg-muted text-muted-foreground" },
  { value: "low", label: "Low", color: "bg-red-500/10 text-red-500" },
  { value: "medium", label: "Medium", color: "bg-amber-500/10 text-amber-500" },
  { value: "high", label: "High", color: "bg-green-500/10 text-green-500" },
  { value: "mutual", label: "Mutual", color: "bg-primary/10 text-primary" },
];

const RecruitingContacts = () => {
  const { contacts, addContact, updateContact, deleteContact, loading } = useRecruitingProfile();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    school_name: "", division: "", coach_name: "", coach_title: "",
    coach_email: "", coach_phone: "", contact_status: "researched",
    interest_level: "unknown", notes: "",
  });
  const [filter, setFilter] = useState("all");

  const handleAdd = async () => {
    if (!form.school_name.trim()) return;
    await addContact({
      school_name: form.school_name,
      division: form.division || null,
      coach_name: form.coach_name || null,
      coach_title: form.coach_title || null,
      coach_email: form.coach_email || null,
      coach_phone: form.coach_phone || null,
      contact_status: form.contact_status,
      interest_level: form.interest_level,
      notes: form.notes || null,
    });
    setForm({ school_name: "", division: "", coach_name: "", coach_title: "", coach_email: "", coach_phone: "", contact_status: "researched", interest_level: "unknown", notes: "" });
    setShowAdd(false);
  };

  const filtered = filter === "all" ? contacts : contacts.filter((c) => c.interest_level === filter);
  const statusCounts = CONTACT_STATUSES.map((s) => ({
    ...s,
    count: contacts.filter((c) => c.contact_status === s.value).length,
  }));

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/recruiting" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Recruiting Hub
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h1 className="text-2xl font-display text-foreground">COLLEGE CONTACTS</h1>
                <p className="text-sm text-muted-foreground">{contacts.length} schools tracked</p>
              </div>
            </div>
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add School</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add College Contact</DialogTitle></DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>School Name *</Label><Input value={form.school_name} onChange={(e) => setForm((f) => ({ ...f, school_name: e.target.value }))} placeholder="University name" /></div>
                    <div><Label>Division</Label><Select value={form.division} onValueChange={(v) => setForm((f) => ({ ...f, division: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="D1">D1</SelectItem><SelectItem value="D2">D2</SelectItem><SelectItem value="D3">D3</SelectItem><SelectItem value="NAIA">NAIA</SelectItem><SelectItem value="JUCO">JUCO</SelectItem></SelectContent></Select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Coach Name</Label><Input value={form.coach_name} onChange={(e) => setForm((f) => ({ ...f, coach_name: e.target.value }))} /></div>
                    <div><Label>Title</Label><Input value={form.coach_title} onChange={(e) => setForm((f) => ({ ...f, coach_title: e.target.value }))} placeholder="Head Coach, Recruiting Coordinator" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Email</Label><Input type="email" value={form.coach_email} onChange={(e) => setForm((f) => ({ ...f, coach_email: e.target.value }))} /></div>
                    <div><Label>Phone</Label><Input value={form.coach_phone} onChange={(e) => setForm((f) => ({ ...f, coach_phone: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Status</Label><Select value={form.contact_status} onValueChange={(v) => setForm((f) => ({ ...f, contact_status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CONTACT_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>Interest Level</Label><Select value={form.interest_level} onValueChange={(v) => setForm((f) => ({ ...f, interest_level: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{INTEREST_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
                  <Button onClick={handleAdd} className="w-full">Add Contact</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Pipeline overview */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {statusCounts.filter((s) => s.count > 0).map((s) => (
              <div key={s.value} className="bg-card border border-border rounded-lg px-3 py-2 text-center shrink-0">
                <p className="text-lg font-display text-foreground">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[{ value: "all", label: "All" }, ...INTEREST_LEVELS].map((l) => (
              <button
                key={l.value}
                onClick={() => setFilter(l.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  filter === l.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Contact List */}
          <div className="space-y-2">
            {filtered.map((contact) => {
              const interestInfo = INTEREST_LEVELS.find((l) => l.value === contact.interest_level);
              return (
                <motion.div key={contact.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                      <School className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground truncate">{contact.school_name}</p>
                        {contact.division && <span className="text-xs px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">{contact.division}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${interestInfo?.color || ""}`}>{interestInfo?.label}</span>
                      </div>
                      {contact.coach_name && (
                        <p className="text-xs text-muted-foreground">{contact.coach_name}{contact.coach_title ? ` — ${contact.coach_title}` : ""}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        {contact.coach_email && (
                          <a href={`mailto:${contact.coach_email}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {contact.coach_email}
                          </a>
                        )}
                        {contact.coach_phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {contact.coach_phone}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground capitalize">Status: {contact.contact_status}</span>
                        {contact.next_follow_up && (
                          <span className="text-xs text-amber-500">Follow up: {new Date(contact.next_follow_up).toLocaleDateString()}</span>
                        )}
                      </div>
                      {contact.notes && <p className="text-xs text-muted-foreground mt-1 italic">{contact.notes}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => deleteContact(contact.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {contacts.length === 0 && !loading && (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No college contacts yet. Start building your target school list.</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default RecruitingContacts;
