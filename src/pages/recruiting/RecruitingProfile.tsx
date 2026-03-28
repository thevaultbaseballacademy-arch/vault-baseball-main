import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Save, ArrowLeft, Video, School, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRecruitingProfile } from "@/hooks/useRecruitingProfile";
import { useSport } from "@/contexts/SportContext";

const DIVISIONS = ["D1", "D2", "D3", "NAIA", "JUCO"];

const RecruitingProfilePage = () => {
  const { profile, saveProfile, loading } = useRecruitingProfile();
  const { sport } = useSport();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    gpa: "",
    sat_score: "",
    act_score: "",
    ncaa_id: "",
    ncaa_eligibility_center: false,
    commitment_status: "uncommitted",
    committed_school: "",
    division_target: [] as string[],
    highlight_video_url: "",
    skills_video_url: "",
    academic_interests: "",
    extracurriculars: "",
    recruiting_notes: "",
    visibility: "private",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        gpa: profile.gpa?.toString() || "",
        sat_score: profile.sat_score?.toString() || "",
        act_score: profile.act_score?.toString() || "",
        ncaa_id: profile.ncaa_id || "",
        ncaa_eligibility_center: profile.ncaa_eligibility_center || false,
        commitment_status: profile.commitment_status || "uncommitted",
        committed_school: profile.committed_school || "",
        division_target: profile.division_target || [],
        highlight_video_url: profile.highlight_video_url || "",
        skills_video_url: profile.skills_video_url || "",
        academic_interests: profile.academic_interests || "",
        extracurriculars: profile.extracurriculars || "",
        recruiting_notes: profile.recruiting_notes || "",
        visibility: profile.visibility || "private",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfile({
        sport_type: sport,
        gpa: form.gpa ? parseFloat(form.gpa) : null,
        sat_score: form.sat_score ? parseInt(form.sat_score) : null,
        act_score: form.act_score ? parseInt(form.act_score) : null,
        ncaa_id: form.ncaa_id || null,
        ncaa_eligibility_center: form.ncaa_eligibility_center,
        commitment_status: form.commitment_status,
        committed_school: form.committed_school || null,
        division_target: form.division_target,
        highlight_video_url: form.highlight_video_url || null,
        skills_video_url: form.skills_video_url || null,
        academic_interests: form.academic_interests || null,
        extracurriculars: form.extracurriculars || null,
        recruiting_notes: form.recruiting_notes || null,
        visibility: form.visibility,
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleDivision = (div: string) => {
    setForm((f) => ({
      ...f,
      division_target: f.division_target.includes(div)
        ? f.division_target.filter((d) => d !== div)
        : [...f.division_target, div],
    }));
  };

  if (loading) {
    return <main className="min-h-screen bg-background"><Navbar /><div className="pt-24 pb-16 container mx-auto px-4"><div className="h-96 bg-secondary animate-pulse rounded-2xl max-w-3xl mx-auto" /></div></main>;
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/recruiting" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Recruiting Hub
          </Link>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-display text-foreground">RECRUITING PROFILE</h1>
                <p className="text-sm text-muted-foreground">Build your recruiting package</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Commitment Status */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-green-500" /> Commitment Status
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Status</Label>
                  <Select value={form.commitment_status} onValueChange={(v) => setForm((f) => ({ ...f, commitment_status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uncommitted">Uncommitted</SelectItem>
                      <SelectItem value="verbal_commit">Verbal Commit</SelectItem>
                      <SelectItem value="signed">Signed NLI</SelectItem>
                      <SelectItem value="enrolled">Enrolled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.commitment_status !== "uncommitted" && (
                  <div>
                    <Label>Committed School</Label>
                    <Input value={form.committed_school} onChange={(e) => setForm((f) => ({ ...f, committed_school: e.target.value }))} placeholder="School name" />
                  </div>
                )}
              </div>
            </div>

            {/* Academic Info */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
                <School className="w-4 h-4 text-blue-500" /> Academic Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>GPA</Label>
                  <Input type="number" step="0.01" min="0" max="5" value={form.gpa} onChange={(e) => setForm((f) => ({ ...f, gpa: e.target.value }))} placeholder="4.00" />
                </div>
                <div>
                  <Label>SAT Score</Label>
                  <Input type="number" min="400" max="1600" value={form.sat_score} onChange={(e) => setForm((f) => ({ ...f, sat_score: e.target.value }))} placeholder="1200" />
                </div>
                <div>
                  <Label>ACT Score</Label>
                  <Input type="number" min="1" max="36" value={form.act_score} onChange={(e) => setForm((f) => ({ ...f, act_score: e.target.value }))} placeholder="25" />
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>NCAA ID</Label>
                  <Input value={form.ncaa_id} onChange={(e) => setForm((f) => ({ ...f, ncaa_id: e.target.value }))} placeholder="NCAA ID number" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Checkbox checked={form.ncaa_eligibility_center} onCheckedChange={(v) => setForm((f) => ({ ...f, ncaa_eligibility_center: !!v }))} />
                  <Label className="cursor-pointer">Registered with NCAA Eligibility Center</Label>
                </div>
              </div>
              <div className="mt-4">
                <Label>Academic Interests / Intended Major</Label>
                <Input value={form.academic_interests} onChange={(e) => setForm((f) => ({ ...f, academic_interests: e.target.value }))} placeholder="e.g., Business, Kinesiology, Engineering" />
              </div>
              <div className="mt-4">
                <Label>Extracurriculars</Label>
                <Textarea value={form.extracurriculars} onChange={(e) => setForm((f) => ({ ...f, extracurriculars: e.target.value }))} placeholder="Leadership, community service, clubs..." rows={2} />
              </div>
            </div>

            {/* Division Targets */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-foreground mb-4">Target Divisions</h3>
              <div className="flex flex-wrap gap-2">
                {DIVISIONS.map((div) => (
                  <button
                    key={div}
                    onClick={() => toggleDivision(div)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      form.division_target.includes(div)
                        ? "border-green-500 bg-green-500/10 text-green-500"
                        : "border-border text-muted-foreground hover:border-foreground/20"
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>

            {/* Videos */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-500" /> Recruiting Videos
              </h3>
              <div className="grid gap-4">
                <div>
                  <Label>Highlight Video URL</Label>
                  <Input value={form.highlight_video_url} onChange={(e) => setForm((f) => ({ ...f, highlight_video_url: e.target.value }))} placeholder="YouTube or Hudl link" />
                </div>
                <div>
                  <Label>Skills / Workout Video URL</Label>
                  <Input value={form.skills_video_url} onChange={(e) => setForm((f) => ({ ...f, skills_video_url: e.target.value }))} placeholder="YouTube or Hudl link" />
                </div>
              </div>
            </div>

            {/* Visibility & Notes */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Profile Visibility</Label>
                  <Select value={form.visibility} onValueChange={(v) => setForm((f) => ({ ...f, visibility: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private (only me)</SelectItem>
                      <SelectItem value="coaches_only">Coaches Only</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Label>Notes</Label>
                <Textarea value={form.recruiting_notes} onChange={(e) => setForm((f) => ({ ...f, recruiting_notes: e.target.value }))} placeholder="Additional recruiting notes..." rows={3} />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Recruiting Profile"}
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default RecruitingProfilePage;
