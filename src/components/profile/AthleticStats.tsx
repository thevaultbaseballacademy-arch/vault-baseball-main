import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Award, Plus, Loader2, Trash2, TrendingUp, Target, Percent, Globe, Users, Lock } from "lucide-react";

type PrivacyLevel = 'public' | 'coaches_only' | 'private';

interface AthleticStat {
  id: string;
  user_id: string;
  stat_type: string;
  stat_name: string;
  stat_value: string;
  season: string | null;
  verified: boolean;
  privacy_level: PrivacyLevel;
  created_at: string;
}

interface AthleticStatsProps {
  userId: string;
  isOwnProfile: boolean;
}

const statTypes = [
  { value: "hitting", label: "Hitting", icon: TrendingUp },
  { value: "pitching", label: "Pitching", icon: Target },
  { value: "fielding", label: "Fielding", icon: Percent },
  { value: "speed", label: "Speed/Athletic", icon: Award },
];

const hittingStats = ["Batting Average", "On-Base %", "Slugging %", "OPS", "Home Runs", "RBIs", "Stolen Bases", "Exit Velocity", "Bat Speed"];
const pitchingStats = ["ERA", "WHIP", "Strikeouts", "Wins", "Saves", "Fastball Velo", "Curveball Velo", "Changeup Velo", "K/9", "BB/9"];
const fieldingStats = ["Fielding %", "Put Outs", "Assists", "Errors", "Range Factor", "Pop Time"];
const speedStats = ["60-Yard Dash", "Home to First", "Vertical Jump", "Broad Jump", "Pro Agility"];

const getStatOptions = (type: string) => {
  switch (type) {
    case "hitting": return hittingStats;
    case "pitching": return pitchingStats;
    case "fielding": return fieldingStats;
    case "speed": return speedStats;
    default: return [];
  }
};

const privacyOptions: { value: PrivacyLevel; label: string; icon: React.ReactNode }[] = [
  { value: 'public', label: 'Public', icon: <Globe className="w-3 h-3" /> },
  { value: 'coaches_only', label: 'Coaches', icon: <Users className="w-3 h-3" /> },
  { value: 'private', label: 'Private', icon: <Lock className="w-3 h-3" /> },
];

const currentYear = new Date().getFullYear();
const seasons = Array.from({ length: 5 }, (_, i) => `${currentYear - i}`);

const AthleticStats = ({ userId, isOwnProfile }: AthleticStatsProps) => {
  const [addOpen, setAddOpen] = useState(false);
  const [statType, setStatType] = useState("");
  const [statName, setStatName] = useState("");
  const [statValue, setStatValue] = useState("");
  const [season, setSeason] = useState("");
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('public');
  const queryClient = useQueryClient();

  const { data: stats = [], isLoading } = useQuery({
    queryKey: ['athletic-stats', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('athletic_stats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(stat => ({
        ...stat,
        privacy_level: (stat as any).privacy_level || 'public'
      })) as AthleticStat[];
    }
  });

  const addStat = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('athletic_stats')
        .insert({
          user_id: userId,
          stat_type: statType,
          stat_name: statName,
          stat_value: statValue,
          season: season || null,
          privacy_level: privacyLevel
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletic-stats', userId] });
      toast.success("Stat added!");
      setAddOpen(false);
      setStatType("");
      setStatName("");
      setStatValue("");
      setSeason("");
      setPrivacyLevel('public');
    },
    onError: () => toast.error("Failed to add stat"),
  });

  const updatePrivacy = useMutation({
    mutationFn: async ({ statId, privacy }: { statId: string; privacy: PrivacyLevel }) => {
      const { error } = await supabase
        .from('athletic_stats')
        .update({ privacy_level: privacy } as any)
        .eq('id', statId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletic-stats', userId] });
      toast.success("Privacy updated");
    },
    onError: () => toast.error("Failed to update privacy"),
  });

  const updateAllPrivacy = useMutation({
    mutationFn: async (privacy: PrivacyLevel) => {
      const { error } = await supabase
        .from('athletic_stats')
        .update({ privacy_level: privacy } as any)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletic-stats', userId] });
      toast.success("All stats updated");
    },
    onError: () => toast.error("Failed to update stats"),
  });

  const deleteStat = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('athletic_stats').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletic-stats', userId] });
      toast.success("Stat removed");
    },
    onError: () => toast.error("Failed to remove stat"),
  });

  const groupedStats = stats.reduce((acc, stat) => {
    if (!acc[stat.stat_type]) acc[stat.stat_type] = [];
    acc[stat.stat_type].push(stat);
    return acc;
  }, {} as Record<string, AthleticStat[]>);

  const getPrivacyIcon = (privacy: PrivacyLevel) => {
    const option = privacyOptions.find(o => o.value === privacy);
    return option?.icon || <Globe className="w-3 h-3" />;
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Athletic Stats & Achievements
        </CardTitle>
        {isOwnProfile && (
          <div className="flex items-center gap-2">
            {stats.length > 1 && (
              <Select onValueChange={(v) => updateAllPrivacy.mutate(v as PrivacyLevel)}>
                <SelectTrigger className="w-auto h-8 text-xs gap-1">
                  <span>Set All</span>
                </SelectTrigger>
                <SelectContent>
                  {privacyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Stat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Athletic Stat</DialogTitle>
                  <DialogDescription>Add your performance metrics for recruiters to see.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={statType} onValueChange={(v) => { setStatType(v); setStatName(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {statTypes.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {statType && (
                    <div className="space-y-2">
                      <Label>Stat</Label>
                      <Select value={statName} onValueChange={setStatName}>
                        <SelectTrigger><SelectValue placeholder="Select stat" /></SelectTrigger>
                        <SelectContent>
                          {getStatOptions(statType).map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      value={statValue}
                      onChange={(e) => setStatValue(e.target.value)}
                      placeholder="e.g., .350, 92 mph, 6.8s"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Season (optional)</Label>
                      <Select value={season} onValueChange={setSeason}>
                        <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
                        <SelectContent>
                          {seasons.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Privacy</Label>
                      <Select value={privacyLevel} onValueChange={(v) => setPrivacyLevel(v as PrivacyLevel)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {privacyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                {option.icon}
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => addStat.mutate()} 
                    disabled={!statType || !statName || !statValue || addStat.isPending}
                  >
                    {addStat.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Stat
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {stats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No stats added yet</p>
            {isOwnProfile && <p className="text-sm mt-1">Add your athletic achievements to impress recruiters</p>}
          </div>
        ) : (
          <div className="space-y-6">
            {statTypes.map(type => {
              const typeStats = groupedStats[type.value];
              if (!typeStats || typeStats.length === 0) return null;
              const Icon = type.icon;
              
              return (
                <div key={type.value}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 text-primary" />
                    <h4 className="font-medium text-foreground">{type.label}</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {typeStats.map(stat => (
                      <div 
                        key={stat.id} 
                        className="group relative p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-muted-foreground">{stat.stat_name}</p>
                          {isOwnProfile ? (
                            <Select 
                              value={stat.privacy_level} 
                              onValueChange={(v) => updatePrivacy.mutate({ statId: stat.id, privacy: v as PrivacyLevel })}
                            >
                              <SelectTrigger className="w-auto h-5 px-1 text-xs border-0 bg-transparent hover:bg-muted">
                                {getPrivacyIcon(stat.privacy_level)}
                              </SelectTrigger>
                              <SelectContent>
                                {privacyOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                      {option.icon}
                                      <span>{option.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-muted-foreground">{getPrivacyIcon(stat.privacy_level)}</span>
                          )}
                        </div>
                        <p className="text-xl font-bold text-foreground">{stat.stat_value}</p>
                        {stat.season && <p className="text-xs text-muted-foreground mt-1">{stat.season}</p>}
                        {isOwnProfile && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteStat.mutate(stat.id)}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AthleticStats;
