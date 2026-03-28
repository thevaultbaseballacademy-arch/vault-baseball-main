import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SPECIALTIES = [
  "Pitching",
  "Hitting",
  "Catching",
  "Infield Defense",
  "Outfield Defense",
  "Strength & Conditioning",
  "Arm Care",
  "Velocity Development",
];

interface CoachApplicationFormProps {
  user: any;
  inviteValid: boolean | null;
  inviteTokenId: string | null;
  defaultName: string;
  defaultEmail: string;
  onSubmitted: () => void;
  onAutoApproved: () => void;
}

const CoachApplicationForm = ({
  user,
  inviteValid,
  inviteTokenId,
  defaultName,
  defaultEmail,
  onSubmitted,
  onAutoApproved,
}: CoachApplicationFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [playingExperience, setPlayingExperience] = useState("");
  const [coachingExperience, setCoachingExperience] = useState("");
  const [organization, setOrganization] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [message, setMessage] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { toast } = useToast();

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${user.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("coach-applications").upload(path, file);
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    // Store the path only - admins will use signed URLs to access
    return path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      let resumeUrl: string | null = null;
      let videoUrl: string | null = null;

      if (resumeFile) resumeUrl = await uploadFile(resumeFile, "resumes");
      if (videoFile) videoUrl = await uploadFile(videoFile, "videos");

      if (inviteValid && inviteTokenId) {
        const { error: reqError } = await supabase
          .from("coach_registration_requests")
          .insert({
            user_id: user.id,
            full_name: fullName,
            email,
            phone: phone || null,
            location: location || null,
            specialties: selectedSpecialties,
            playing_experience: playingExperience || null,
            coaching_experience: coachingExperience || null,
            organization: organization || null,
            social_media: socialMedia || null,
            message: message || null,
            resume_url: resumeUrl,
            video_sample_url: videoUrl,
            invite_token_id: inviteTokenId,
            status: "approved",
            reviewed_at: new Date().toISOString(),
          } as any);
        if (reqError) throw reqError;

        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role: "coach" });
        if (roleError) throw roleError;

        await supabase.rpc("increment_invite_usage" as any, { token_id: inviteTokenId });
        await supabase.from("coach_onboarding").insert({ user_id: user.id });

        toast({ title: "Welcome, Coach!", description: "Your coach access has been activated." });
        onAutoApproved();
        return;
      }

      const { error } = await supabase
        .from("coach_registration_requests")
        .insert({
          user_id: user.id,
          full_name: fullName,
          email,
          phone: phone || null,
          location: location || null,
          specialties: selectedSpecialties,
          playing_experience: playingExperience || null,
          coaching_experience: coachingExperience || null,
          organization: organization || null,
          social_media: socialMedia || null,
          message: message || null,
          resume_url: resumeUrl,
          video_sample_url: videoUrl,
          status: "applied",
        } as any);

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Our team will review your application to determine if you are a good fit.",
      });
      onSubmitted();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({ title: "Error", description: error.message || "Failed to submit", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border p-6 md:p-8 space-y-6">
      <h2 className="text-xl font-display tracking-wide text-foreground">COACH APPLICATION</h2>

      {/* Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>

      {/* Phone & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-5555" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
        </div>
      </div>

      {/* Specialties */}
      <div className="space-y-3">
        <Label>Coaching Specialties *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SPECIALTIES.map((s) => (
            <label
              key={s}
              className={`flex items-center gap-2 p-2.5 border cursor-pointer transition-colors text-sm ${
                selectedSpecialties.includes(s)
                  ? "border-foreground bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-muted-foreground"
              }`}
            >
              <Checkbox
                checked={selectedSpecialties.includes(s)}
                onCheckedChange={() => toggleSpecialty(s)}
                className="sr-only"
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-2">
        <Label htmlFor="playingExp">Playing Experience</Label>
        <Textarea
          id="playingExp"
          value={playingExperience}
          onChange={(e) => setPlayingExperience(e.target.value)}
          placeholder="Describe your playing background (high school, college, professional, etc.)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coachingExp">Coaching Experience</Label>
        <Textarea
          id="coachingExp"
          value={coachingExperience}
          onChange={(e) => setCoachingExperience(e.target.value)}
          placeholder="Describe your coaching background, years of experience, and notable achievements"
          rows={3}
        />
      </div>

      {/* Organization & Social */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="org">Current Organization or Facility</Label>
          <Input id="org" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="e.g. Elite Baseball Academy" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="social">Social Media / Website</Label>
          <Input id="social" value={socialMedia} onChange={(e) => setSocialMedia(e.target.value)} placeholder="@handle or URL" />
        </div>
      </div>

      {/* File uploads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Coaching Resume (optional)</Label>
          <div className="border border-dashed border-border p-4 text-center">
            {resumeFile ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground truncate">{resumeFile.name}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setResumeFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-1 text-muted-foreground text-sm">
                <Upload className="w-5 h-5" />
                <span>Upload PDF or DOC</span>
                <input type="file" className="sr-only" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Coaching Video Sample (optional)</Label>
          <div className="border border-dashed border-border p-4 text-center">
            {videoFile ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground truncate">{videoFile.name}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setVideoFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-1 text-muted-foreground text-sm">
                <Upload className="w-5 h-5" />
                <span>Upload MP4 or MOV</span>
                <input type="file" className="sr-only" accept=".mp4,.mov,.avi" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Why Vault */}
      <div className="space-y-2">
        <Label htmlFor="message">Why do you want to coach inside Vault?</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your coaching philosophy and why you want to be part of the Vault ecosystem..."
          rows={4}
        />
      </div>

      <Button
        type="submit"
        variant="vault"
        size="lg"
        className="w-full"
        disabled={submitting || !fullName || !email || selectedSpecialties.length === 0}
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Submitting...
          </>
        ) : inviteValid ? (
          "Activate Coach Access"
        ) : (
          "Submit Coach Application"
        )}
      </Button>

      {!inviteValid && (
        <p className="text-xs text-muted-foreground text-center">
          Applications are reviewed by the Vault team. You will be contacted with next steps.
        </p>
      )}
    </form>
  );
};

export default CoachApplicationForm;
