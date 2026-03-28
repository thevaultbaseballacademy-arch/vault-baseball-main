import { useState } from "react";
import { Gift, Loader2, Search, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AthleteResult {
  user_id: string;
  display_name: string;
  email: string;
}

const CompLessonCredits = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<AthleteResult[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [granting, setGranting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    setSelectedAthlete(null);
    setSuccess(false);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, email")
        .or(`display_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults((data as AthleteResult[]) || []);
      
      if (!data?.length) {
        toast({ title: "No athletes found", description: "Try a different search term", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Search failed", description: error.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const handleGrant = async () => {
    if (!selectedAthlete) return;
    setGranting(true);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("lesson_credits" as any) as any).insert({
        user_id: selectedAthlete.user_id,
        total_lessons: 1,
        used_lessons: 0,
        purchased_at: new Date().toISOString(),
        credit_type: "comp",
        granted_by: user?.id || null,
        granted_reason: "Coach comp lesson grant",
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: "Lesson granted!",
        description: `1 comp lesson granted to ${selectedAthlete.display_name}`,
      });
      setSelectedAthlete(null);
      setSearchResults([]);
      setSearchTerm("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to grant lessons", variant: "destructive" });
    } finally {
      setGranting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
      <h3 className="text-lg font-display text-foreground flex items-center gap-2">
        <Gift className="w-5 h-5 text-accent" />
        Comp Lesson Credits
      </h3>
      <p className="text-sm text-muted-foreground">
        Grant free lesson credits to any athlete. Search by name or email.
      </p>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search athlete name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button variant="outline" onClick={handleSearch} disabled={searching || !searchTerm.trim()}>
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {/* Results */}
      {searchResults.length > 0 && !selectedAthlete && (
        <div className="border border-border rounded-xl divide-y divide-border max-h-48 overflow-y-auto">
          {searchResults.map((athlete) => (
            <button
              key={athlete.user_id}
              onClick={() => setSelectedAthlete(athlete)}
              className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-foreground text-sm">{athlete.display_name}</p>
                <p className="text-xs text-muted-foreground">{athlete.email}</p>
              </div>
              <span className="text-xs text-accent">Select</span>
            </button>
          ))}
        </div>
      )}

      {/* Selected athlete + grant form */}
      {selectedAthlete && (
        <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{selectedAthlete.display_name}</p>
              <p className="text-sm text-muted-foreground">{selectedAthlete.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedAthlete(null)}>
              Change
            </Button>
          </div>

          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label>Lessons</Label>
              <p className="text-sm font-medium text-foreground">1 Comp Lesson</p>
            </div>

            <Button variant="vault" onClick={handleGrant} disabled={granting}>
              {granting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Gift className="w-4 h-4 mr-2" />
              )}
              Grant 1 Comp Lesson
            </Button>
          </div>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          Lessons granted successfully
        </div>
      )}
    </div>
  );
};

export default CompLessonCredits;
