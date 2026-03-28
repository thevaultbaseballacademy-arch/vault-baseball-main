import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Award, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const SPECIALTIES_OPTIONS = ["Pitching", "Hitting", "Fielding", "Catching", "Strength", "Youth Development", "College Prep", "Speed & Agility"];

interface Props {
  userId: string;
}

const CoachMarketplaceSetup = ({ userId }: Props) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coachRecord, setCoachRecord] = useState<any>(null);
  const [profile, setProfile] = useState({
    tagline: "",
    bio: "",
    photo_url: "",
    specialties: [] as string[],
    playing_background: "",
    coaching_background: "",
    hourly_rate_cents: 10000,
    is_marketplace_active: false,
    location: "",
    years_experience: 0,
  });
  const [services, setServices] = useState<any[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Find coach record for this user
      const { data: coach } = await supabase
        .from("coaches")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!coach) {
        setLoading(false);
        return;
      }
      setCoachRecord(coach);

      // Load marketplace profile
      const { data: mp } = await supabase
        .from("coach_marketplace_profiles")
        .select("*")
        .eq("coach_id", coach.id)
        .maybeSingle();

      if (mp) {
        setProfileId(mp.id);
        setProfile({
          tagline: mp.tagline || "",
          bio: mp.bio || "",
          photo_url: mp.photo_url || "",
          specialties: mp.specialties || [],
          playing_background: mp.playing_background || "",
          coaching_background: mp.coaching_background || "",
          hourly_rate_cents: mp.hourly_rate_cents || 10000,
          is_marketplace_active: mp.is_marketplace_active || false,
          location: mp.location || "",
          years_experience: mp.years_experience || 0,
        });
      }

      // Load services
      const { data: svc } = await supabase
        .from("coach_services")
        .select("*")
        .eq("coach_id", coach.id)
        .order("created_at");

      setServices(svc || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!coachRecord) return;
    setSaving(true);

    try {
      const payload = {
        coach_id: coachRecord.id,
        user_id: userId,
        ...profile,
      };

      if (profileId) {
        await supabase.from("coach_marketplace_profiles").update(payload).eq("id", profileId);
      } else {
        const { data } = await supabase.from("coach_marketplace_profiles").insert(payload).select().single();
        if (data) setProfileId(data.id);
      }

      queryClient.invalidateQueries({ queryKey: ["marketplace-coaches"] });
      toast.success("Marketplace profile saved!");
    } catch (err: any) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  const addService = () => {
    setServices([
      ...services,
      {
        id: `new-${Date.now()}`,
        coach_id: coachRecord?.id,
        service_type: "live_lesson",
        title: "",
        description: "",
        duration_minutes: 30,
        price_cents: 5000,
        is_active: true,
        _isNew: true,
      },
    ]);
  };

  const saveService = async (svc: any) => {
    if (!coachRecord) return;
    const { id, _isNew, ...rest } = svc;

    try {
      if (_isNew) {
        const { data } = await supabase
          .from("coach_services")
          .insert({ ...rest, coach_id: coachRecord.id })
          .select()
          .single();
        if (data) {
          setServices((prev) => prev.map((s) => (s.id === id ? data : s)));
        }
      } else {
        await supabase.from("coach_services").update(rest).eq("id", id);
      }
      toast.success("Service saved!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteService = async (svc: any) => {
    if (svc._isNew) {
      setServices((prev) => prev.filter((s) => s.id !== svc.id));
      return;
    }
    await supabase.from("coach_services").delete().eq("id", svc.id);
    setServices((prev) => prev.filter((s) => s.id !== svc.id));
    toast.success("Service removed");
  };

  const toggleSpecialty = (s: string) => {
    setProfile((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter((x) => x !== s)
        : [...prev.specialties, s],
    }));
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading marketplace settings...</p>;

  if (!coachRecord) {
    return (
      <div className="text-center py-12">
        <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">You must be a registered coach to access marketplace settings.</p>
      </div>
    );
  }

  // Gate: Coach must be marketplace approved
  const isApproved = coachRecord.is_marketplace_approved === true;
  const isCertified = coachRecord.is_certified || coachRecord.is_bypass_certified;

  if (!isApproved) {
    const statusLabel = {
      applied: "Application Submitted",
      pending_review: "Under Review",
      certification_required: "Certification Required",
      certified: "Certified — Awaiting Approval",
      bypass_certified: "Certified — Awaiting Approval",
      approved: "Approved",
      rejected: "Application Not Approved",
      suspended: "Account Suspended",
    }[coachRecord.marketplace_status] || "Application Submitted";

    return (
      <div className="text-center py-12 space-y-4">
        <Lock className="w-12 h-12 text-muted-foreground mx-auto" />
        <h3 className="font-display text-lg text-foreground">MARKETPLACE ACCESS RESTRICTED</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {!isCertified
            ? "You must complete Vault Certification before accessing the marketplace. Complete your certification and wait for admin approval."
            : "Your profile is pending admin approval. Once approved, you'll be able to set up your marketplace profile and accept bookings."}
        </p>
        <Badge variant="outline">{statusLabel}</Badge>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg text-foreground">MARKETPLACE PROFILE</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Active on marketplace</span>
            <Switch
              checked={profile.is_marketplace_active}
              onCheckedChange={(v) => setProfile((p) => ({ ...p, is_marketplace_active: v }))}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Tagline</label>
            <Input
              placeholder="e.g. Elite Pitching Development Specialist"
              value={profile.tagline}
              onChange={(e) => setProfile((p) => ({ ...p, tagline: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Location</label>
            <Input
              placeholder="e.g. Austin, TX"
              value={profile.location}
              onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Photo URL</label>
            <Input
              placeholder="https://..."
              value={profile.photo_url}
              onChange={(e) => setProfile((p) => ({ ...p, photo_url: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Years of Experience</label>
            <Input
              type="number"
              value={profile.years_experience}
              onChange={(e) => setProfile((p) => ({ ...p, years_experience: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Hourly Rate ($)</label>
            <Input
              type="number"
              value={profile.hourly_rate_cents / 100}
              onChange={(e) => setProfile((p) => ({ ...p, hourly_rate_cents: Math.round(parseFloat(e.target.value) * 100) || 0 }))}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-foreground mb-2 block">Specialties</label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES_OPTIONS.map((s) => (
              <Badge
                key={s}
                variant={profile.specialties.includes(s) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleSpecialty(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-foreground mb-1 block">Bio</label>
          <Textarea
            placeholder="Tell athletes about yourself..."
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Coaching Background</label>
            <Textarea
              placeholder="Your coaching experience..."
              value={profile.coaching_background}
              onChange={(e) => setProfile((p) => ({ ...p, coaching_background: e.target.value }))}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Playing Background</label>
            <Textarea
              placeholder="Your playing career..."
              value={profile.playing_background}
              onChange={(e) => setProfile((p) => ({ ...p, playing_background: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <Button className="mt-4" onClick={handleSaveProfile} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      {/* Services Section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg text-foreground">YOUR SERVICES</h3>
          <Button variant="outline" size="sm" onClick={addService}>
            <Plus className="w-4 h-4 mr-1" />
            Add Service
          </Button>
        </div>

        <div className="space-y-4">
          {services.map((svc, idx) => (
            <div key={svc.id} className="border border-border rounded-lg p-4">
              <div className="grid md:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="text-xs text-muted-foreground">Type</label>
                  <Select
                    value={svc.service_type}
                    onValueChange={(v) => {
                      const updated = [...services];
                      updated[idx] = { ...svc, service_type: v };
                      setServices(updated);
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live_lesson">Live Lesson</SelectItem>
                      <SelectItem value="video_analysis">Video Analysis</SelectItem>
                      <SelectItem value="development_plan">Development Plan</SelectItem>
                      <SelectItem value="membership">Membership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Title</label>
                  <Input
                    value={svc.title}
                    onChange={(e) => {
                      const updated = [...services];
                      updated[idx] = { ...svc, title: e.target.value };
                      setServices(updated);
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Duration (min)</label>
                  <Input
                    type="number"
                    value={svc.duration_minutes || ""}
                    onChange={(e) => {
                      const updated = [...services];
                      updated[idx] = { ...svc, duration_minutes: parseInt(e.target.value) || null };
                      setServices(updated);
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Price ($)</label>
                  <Input
                    type="number"
                    value={(svc.price_cents || 0) / 100}
                    onChange={(e) => {
                      const updated = [...services];
                      updated[idx] = { ...svc, price_cents: Math.round(parseFloat(e.target.value) * 100) || 0 };
                      setServices(updated);
                    }}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs text-muted-foreground">Description</label>
                <Textarea
                  value={svc.description || ""}
                  onChange={(e) => {
                    const updated = [...services];
                    updated[idx] = { ...svc, description: e.target.value };
                    setServices(updated);
                  }}
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => saveService(svc)}>Save</Button>
                <Button size="sm" variant="destructive" onClick={() => deleteService(svc)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No services yet. Add your first service to appear on the marketplace.
            </p>
          )}
        </div>
      </div>

      {/* Platform Agreement Disclaimer */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5">
        <h3 className="font-display text-sm tracking-wide text-destructive mb-2 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          COACH PLATFORM AGREEMENT
        </h3>
        <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed">
          <li>• All coaching sessions, lessons, and services with Vault-connected athletes must be conducted exclusively through the Vault Baseball platform.</li>
          <li>• You are prohibited from soliciting, booking, or conducting sessions with Vault athletes outside of this platform.</li>
          <li>• A <strong className="text-foreground">70/30 revenue split</strong> (70% coach / 30% platform) applies to all services rendered through the marketplace.</li>
          <li>• Violations of this agreement may result in immediate removal from the Vault coaching network and forfeiture of all pending earnings.</li>
          <li>• All athlete data, progress reports, and communications remain the property of Vault Baseball and may not be used outside of this platform.</li>
        </ul>
        <p className="text-[10px] text-muted-foreground/70 mt-3">
          By activating your marketplace profile, you acknowledge and agree to these terms.
        </p>
      </div>
    </div>
  );
};

export default CoachMarketplaceSetup;
