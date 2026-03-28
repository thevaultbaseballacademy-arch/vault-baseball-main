import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Shield, 
  Video, 
  Award, 
  Globe, 
  Users, 
  Lock, 
  Loader2,
  Eye,
  EyeOff,
  User,
  Mail,
  Ruler
} from "lucide-react";

type PrivacyLevel = 'public' | 'coaches_only' | 'private';

const privacyOptions: { value: PrivacyLevel; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'public', label: 'Public', icon: <Globe className="w-4 h-4" />, description: 'Anyone can view' },
  { value: 'coaches_only', label: 'Coaches Only', icon: <Users className="w-4 h-4" />, description: 'Only your assigned coaches' },
  { value: 'private', label: 'Private', icon: <Lock className="w-4 h-4" />, description: 'Only you can view' },
];

const PrivacySettings = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    });
  }, [navigate]);

  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['highlight-videos', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('highlight_videos')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data || []).map((v: any) => ({ 
        id: v.id as string, 
        title: v.title as string, 
        privacy_level: (v.privacy_level || 'public') as PrivacyLevel 
      }));
    },
    enabled: !!user?.id,
  });

  const { data: stats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['athletic-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('athletic_stats')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data || []).map((s: any) => ({ 
        id: s.id as string, 
        stat_name: s.stat_name as string, 
        stat_type: s.stat_type as string, 
        privacy_level: (s.privacy_level || 'public') as PrivacyLevel 
      }));
    },
    enabled: !!user?.id,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile-privacy', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return {
        bio_privacy: ((data as any).bio_privacy || 'public') as PrivacyLevel,
        contact_privacy: ((data as any).contact_privacy || 'public') as PrivacyLevel,
        physical_stats_privacy: ((data as any).physical_stats_privacy || 'public') as PrivacyLevel,
      };
    },
    enabled: !!user?.id,
  });

  const updateProfilePrivacy = useMutation({
    mutationFn: async ({ field, value }: { field: string; value: PrivacyLevel }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value } as any)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-privacy', user?.id] });
      toast.success('Profile privacy updated');
    },
    onError: () => toast.error('Failed to update profile privacy'),
  });

  const setAllProfilePrivacy = useMutation({
    mutationFn: async (privacy: PrivacyLevel) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          bio_privacy: privacy,
          contact_privacy: privacy,
          physical_stats_privacy: privacy 
        } as any)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-privacy', user?.id] });
      toast.success('All profile sections updated');
    },
    onError: () => toast.error('Failed to update profile privacy'),
  });

  const updateAllVideos = useMutation({
    mutationFn: async (privacy: PrivacyLevel) => {
      const { error } = await supabase
        .from('highlight_videos')
        .update({ privacy_level: privacy } as any)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlight-videos', user?.id] });
      toast.success('All videos updated');
    },
    onError: () => toast.error('Failed to update videos'),
  });

  const updateAllStats = useMutation({
    mutationFn: async (privacy: PrivacyLevel) => {
      const { error } = await supabase
        .from('athletic_stats')
        .update({ privacy_level: privacy } as any)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletic-stats', user?.id] });
      toast.success('All stats updated');
    },
    onError: () => toast.error('Failed to update stats'),
  });

  const updateStatsByType = useMutation({
    mutationFn: async ({ statType, privacy }: { statType: string; privacy: PrivacyLevel }) => {
      const { error } = await supabase
        .from('athletic_stats')
        .update({ privacy_level: privacy } as any)
        .eq('user_id', user.id)
        .eq('stat_type', statType);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletic-stats', user?.id] });
      toast.success('Stats updated');
    },
    onError: () => toast.error('Failed to update stats'),
  });

  const getPrivacySummary = (items: { privacy_level: PrivacyLevel }[]) => {
    const counts = items.reduce((acc, item) => {
      acc[item.privacy_level] = (acc[item.privacy_level] || 0) + 1;
      return acc;
    }, {} as Record<PrivacyLevel, number>);
    
    return Object.entries(counts).map(([level, count]) => ({
      level: level as PrivacyLevel,
      count,
    }));
  };

  const statTypes = [...new Set(stats.map(s => s.stat_type))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/account")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Account
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display text-foreground">Privacy Settings</h1>
                <p className="text-muted-foreground">Control who can see your profile content</p>
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Quick Privacy Controls
                </CardTitle>
                <CardDescription>
                  Update privacy for all items at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-lg border border-border bg-muted/30">
                    <p className="text-sm font-medium text-foreground mb-2">Make Everything Public</p>
                    <p className="text-xs text-muted-foreground mb-3">All your videos and stats will be visible to everyone</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => {
                        updateAllVideos.mutate('public');
                        updateAllStats.mutate('public');
                      }}
                    >
                      <Globe className="w-4 h-4" />
                      Set All Public
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-muted/30">
                    <p className="text-sm font-medium text-foreground mb-2">Make Everything Private</p>
                    <p className="text-xs text-muted-foreground mb-3">Only you will be able to see your content</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => {
                        updateAllVideos.mutate('private');
                        updateAllStats.mutate('private');
                      }}
                    >
                      <Lock className="w-4 h-4" />
                      Set All Private
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Privacy */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>
                      Control visibility of your profile sections
                    </CardDescription>
                  </div>
                  <Select onValueChange={(v) => setAllProfilePrivacy.mutate(v as PrivacyLevel)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Set all..." />
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
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Bio Privacy */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Bio & About</p>
                          <p className="text-sm text-muted-foreground">Your personal description</p>
                        </div>
                      </div>
                      <Select 
                        value={profile?.bio_privacy || 'public'} 
                        onValueChange={(v) => updateProfilePrivacy.mutate({ field: 'bio_privacy', value: v as PrivacyLevel })}
                      >
                        <SelectTrigger className="w-[130px]">
                          <div className="flex items-center gap-2">
                            {privacyOptions.find(o => o.value === (profile?.bio_privacy || 'public'))?.icon}
                            <span>{privacyOptions.find(o => o.value === (profile?.bio_privacy || 'public'))?.label}</span>
                          </div>
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

                    {/* Contact Privacy */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Contact & Social</p>
                          <p className="text-sm text-muted-foreground">Email, graduation year, social links</p>
                        </div>
                      </div>
                      <Select 
                        value={profile?.contact_privacy || 'public'} 
                        onValueChange={(v) => updateProfilePrivacy.mutate({ field: 'contact_privacy', value: v as PrivacyLevel })}
                      >
                        <SelectTrigger className="w-[130px]">
                          <div className="flex items-center gap-2">
                            {privacyOptions.find(o => o.value === (profile?.contact_privacy || 'public'))?.icon}
                            <span>{privacyOptions.find(o => o.value === (profile?.contact_privacy || 'public'))?.label}</span>
                          </div>
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

                    {/* Physical Stats Privacy */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                      <div className="flex items-center gap-3">
                        <Ruler className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Physical Stats</p>
                          <p className="text-sm text-muted-foreground">Height, weight, throwing arm, etc.</p>
                        </div>
                      </div>
                      <Select 
                        value={profile?.physical_stats_privacy || 'public'} 
                        onValueChange={(v) => updateProfilePrivacy.mutate({ field: 'physical_stats_privacy', value: v as PrivacyLevel })}
                      >
                        <SelectTrigger className="w-[130px]">
                          <div className="flex items-center gap-2">
                            {privacyOptions.find(o => o.value === (profile?.physical_stats_privacy || 'public'))?.icon}
                            <span>{privacyOptions.find(o => o.value === (profile?.physical_stats_privacy || 'public'))?.label}</span>
                          </div>
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
                )}
              </CardContent>
            </Card>

            {/* Highlight Videos Privacy */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-primary" />
                      Highlight Videos
                    </CardTitle>
                    <CardDescription>
                      {videos.length} video{videos.length !== 1 ? 's' : ''} in your profile
                    </CardDescription>
                  </div>
                  {videos.length > 0 && (
                    <Select onValueChange={(v) => updateAllVideos.mutate(v as PrivacyLevel)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Set all..." />
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
                </div>
              </CardHeader>
              <CardContent>
                {videosLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No highlight videos uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getPrivacySummary(videos).map(({ level, count }) => {
                        const option = privacyOptions.find(o => o.value === level);
                        return (
                          <div key={level} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm">
                            {option?.icon}
                            <span>{count} {option?.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Manage individual video privacy from your{' '}
                      <Button variant="link" className="p-0 h-auto" onClick={() => navigate(`/profile/${user?.id}`)}>
                        profile page
                      </Button>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Athletic Stats Privacy */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Athletic Stats
                    </CardTitle>
                    <CardDescription>
                      {stats.length} stat{stats.length !== 1 ? 's' : ''} in your profile
                    </CardDescription>
                  </div>
                  {stats.length > 0 && (
                    <Select onValueChange={(v) => updateAllStats.mutate(v as PrivacyLevel)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Set all..." />
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
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : stats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No athletic stats added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getPrivacySummary(stats).map(({ level, count }) => {
                        const option = privacyOptions.find(o => o.value === level);
                        return (
                          <div key={level} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm">
                            {option?.icon}
                            <span>{count} {option?.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {statTypes.length > 1 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground">By Category</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {statTypes.map((type) => {
                            const typeStats = stats.filter(s => s.stat_type === type);
                            return (
                              <div key={type} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                                <div>
                                  <p className="text-sm font-medium capitalize">{type}</p>
                                  <p className="text-xs text-muted-foreground">{typeStats.length} stats</p>
                                </div>
                                <Select onValueChange={(v) => updateStatsByType.mutate({ statType: type, privacy: v as PrivacyLevel })}>
                                  <SelectTrigger className="w-[110px] h-8">
                                    <SelectValue placeholder="Set..." />
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
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      Manage individual stat privacy from your{' '}
                      <Button variant="link" className="p-0 h-auto" onClick={() => navigate(`/profile/${user?.id}`)}>
                        profile page
                      </Button>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy Info */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base">Privacy Levels Explained</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {privacyOptions.map((option) => (
                    <div key={option.value} className="flex items-start gap-3">
                      <div className="mt-0.5 text-muted-foreground">{option.icon}</div>
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacySettings;
