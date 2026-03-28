import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, X, Loader2, Plus } from "lucide-react";
import type { Profile } from "@/types/profile";

interface EditProfileFormProps {
  profile: Profile;
  onProfileUpdated: (profile: Profile) => void;
}

const positions = [
  "Pitcher", "Catcher", "First Base", "Second Base", "Third Base",
  "Shortstop", "Left Field", "Center Field", "Right Field",
  "Designated Hitter", "Utility", "Two-Way Player"
];

const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 8 }, (_, i) => currentYear + i);

const EditProfileForm = ({ profile, onProfileUpdated }: EditProfileFormProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Basic info
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [position, setPosition] = useState(profile.position || "");
  const [graduationYear, setGraduationYear] = useState<string>(profile.graduation_year?.toString() || "");
  const [targetSchools, setTargetSchools] = useState<string[]>(profile.target_schools || []);
  const [newSchool, setNewSchool] = useState("");
  
  // Physical stats
  const [heightFeet, setHeightFeet] = useState<string>(profile.height_inches ? Math.floor(profile.height_inches / 12).toString() : "");
  const [heightInches, setHeightInches] = useState<string>(profile.height_inches ? (profile.height_inches % 12).toString() : "");
  const [weight, setWeight] = useState<string>(profile.weight_lbs?.toString() || "");
  const [throwingArm, setThrowingArm] = useState(profile.throwing_arm || "");
  const [battingSide, setBattingSide] = useState(profile.batting_side || "");
  const [sixtyYard, setSixtyYard] = useState<string>(profile.sixty_yard_dash?.toString() || "");
  
  // Social links
  const [twitterUrl, setTwitterUrl] = useState(profile.twitter_url || "");
  const [instagramUrl, setInstagramUrl] = useState(profile.instagram_url || "");
  const [youtubeUrl, setYoutubeUrl] = useState(profile.youtube_url || "");
  const [hudlUrl, setHudlUrl] = useState(profile.hudl_url || "");

  const addSchool = () => {
    if (newSchool.trim() && !targetSchools.includes(newSchool.trim())) {
      setTargetSchools([...targetSchools, newSchool.trim()]);
      setNewSchool("");
    }
  };

  const removeSchool = (school: string) => {
    setTargetSchools(targetSchools.filter(s => s !== school));
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Display name is required");
      return;
    }

    setSaving(true);

    try {
      const totalHeightInches = heightFeet && heightInches 
        ? (parseInt(heightFeet) * 12) + parseInt(heightInches)
        : null;

      const updateData = {
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        position: position || null,
        graduation_year: graduationYear ? parseInt(graduationYear) : null,
        target_schools: targetSchools.length > 0 ? targetSchools : null,
        height_inches: totalHeightInches,
        weight_lbs: weight ? parseInt(weight) : null,
        throwing_arm: throwingArm || null,
        batting_side: battingSide || null,
        sixty_yard_dash: sixtyYard ? parseFloat(sixtyYard) : null,
        twitter_url: twitterUrl.trim() || null,
        instagram_url: instagramUrl.trim() || null,
        youtube_url: youtubeUrl.trim() || null,
        hudl_url: hudlUrl.trim() || null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', profile.user_id);

      if (error) throw error;

      const updatedProfile: Profile = { ...profile, ...updateData };
      onProfileUpdated(updatedProfile);
      toast.success("Profile updated successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="w-4 h-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Customize your athlete profile to share with coaches and recruiters.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="physical">Physical Stats</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell coaches about yourself..."
                className="min-h-[80px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                  <SelectContent>
                    {positions.map(pos => (
                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Graduation Year</Label>
                <Select value={graduationYear} onValueChange={setGraduationYear}>
                  <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>
                    {graduationYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Schools</Label>
              <div className="flex gap-2">
                <Input
                  value={newSchool}
                  onChange={(e) => setNewSchool(e.target.value)}
                  placeholder="Add a school"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSchool(); }}}
                />
                <Button type="button" variant="secondary" onClick={addSchool}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {targetSchools.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {targetSchools.map(school => (
                    <Badge key={school} variant="secondary" className="gap-1 pr-1">
                      {school}
                      <button onClick={() => removeSchool(school)} className="ml-1 hover:bg-muted rounded p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="physical" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Height</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select value={heightFeet} onValueChange={setHeightFeet}>
                      <SelectTrigger><SelectValue placeholder="Feet" /></SelectTrigger>
                      <SelectContent>
                        {[4, 5, 6, 7].map(ft => (
                          <SelectItem key={ft} value={ft.toString()}>{ft} ft</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select value={heightInches} onValueChange={setHeightInches}>
                      <SelectTrigger><SelectValue placeholder="Inches" /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>{i} in</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Weight (lbs)</Label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="180"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Throwing Arm</Label>
                <Select value={throwingArm} onValueChange={setThrowingArm}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Right">Right</SelectItem>
                    <SelectItem value="Left">Left</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Batting Side</Label>
                <Select value={battingSide} onValueChange={setBattingSide}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Right">Right</SelectItem>
                    <SelectItem value="Left">Left</SelectItem>
                    <SelectItem value="Switch">Switch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>60-Yard Dash (seconds)</Label>
              <Input
                type="number"
                step="0.01"
                value={sixtyYard}
                onChange={(e) => setSixtyYard(e.target.value)}
                placeholder="6.80"
              />
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Twitter/X URL</Label>
              <Input
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="https://twitter.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label>YouTube Channel URL</Label>
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/@channel"
              />
            </div>
            <div className="space-y-2">
              <Label>Hudl Profile URL</Label>
              <Input
                value={hudlUrl}
                onChange={(e) => setHudlUrl(e.target.value)}
                placeholder="https://hudl.com/profile/..."
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileForm;
