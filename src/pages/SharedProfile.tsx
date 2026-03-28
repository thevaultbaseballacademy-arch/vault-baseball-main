import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Video, User, Ruler, Scale, Calendar } from "lucide-react";
import { format } from "date-fns";

interface SharedProfile {
  profile: {
    display_name: string | null;
    avatar_url: string | null;
    position: string | null;
    graduation_year: number | null;
    height_inches: number | null;
    weight_lbs: number | null;
    throwing_arm: string | null;
    batting_side: string | null;
  };
  kpis: Array<{
    kpi_name: string;
    kpi_category: string;
    kpi_value: number;
    kpi_unit: string | null;
    recorded_at: string;
  }> | null;
  goals: Array<{
    kpi_name: string;
    kpi_category: string;
    target_value: number;
    kpi_unit: string | null;
    is_achieved: boolean;
    target_date: string | null;
  }> | null;
  videos: Array<{
    title: string;
    video_url: string;
    thumbnail_url: string | null;
    description: string | null;
  }> | null;
  share_settings: {
    include_goals: boolean;
    include_stats: boolean;
    include_videos: boolean;
  };
}

const formatHeight = (inches: number | null) => {
  if (!inches) return null;
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
};

export default function SharedProfile() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<SharedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedProfile = async () => {
      if (!token) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      const { data: result, error: fetchError } = await supabase
        .rpc('get_shared_kpi_profile', { share_token: token });

      if (fetchError) {
        console.error('Error fetching shared profile:', fetchError);
        setError("Failed to load profile");
      } else if (!result || typeof result !== 'object') {
        setError("This share link is invalid or has expired");
      } else {
        setData(result as unknown as SharedProfile);
      }
      setLoading(false);
    };

    fetchSharedProfile();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold mb-2">Link Not Available</h2>
            <p className="text-muted-foreground">{error || "This share link is no longer valid"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, kpis, goals, videos, share_settings } = data;

  // Group KPIs by category
  const kpisByCategory = kpis?.reduce((acc, kpi) => {
    if (!acc[kpi.kpi_category]) acc[kpi.kpi_category] = [];
    acc[kpi.kpi_category].push(kpi);
    return acc;
  }, {} as Record<string, typeof kpis>) || {};

  // Get latest KPIs for each metric
  const latestKpis = Object.entries(kpisByCategory).map(([category, categoryKpis]) => {
    const latestByName: Record<string, (typeof kpis)[0]> = {};
    categoryKpis?.forEach(kpi => {
      if (!latestByName[kpi.kpi_name] || new Date(kpi.recorded_at) > new Date(latestByName[kpi.kpi_name].recorded_at)) {
        latestByName[kpi.kpi_name] = kpi;
      }
    });
    return { category, kpis: Object.values(latestByName) };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.display_name?.charAt(0) || <User className="h-10 w-10" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{profile.display_name || "Athlete"}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.position && (
                  <Badge variant="secondary">{profile.position}</Badge>
                )}
                {profile.graduation_year && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Class of {profile.graduation_year}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {profile.height_inches && (
                  <span className="flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    {formatHeight(profile.height_inches)}
                  </span>
                )}
                {profile.weight_lbs && (
                  <span className="flex items-center gap-1">
                    <Scale className="h-4 w-4" />
                    {profile.weight_lbs} lbs
                  </span>
                )}
                {profile.throwing_arm && (
                  <span>Throws: {profile.throwing_arm}</span>
                )}
                {profile.batting_side && (
                  <span>Bats: {profile.batting_side}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList>
            {share_settings.include_stats && <TabsTrigger value="stats">Performance Stats</TabsTrigger>}
            {share_settings.include_goals && <TabsTrigger value="goals">Goals</TabsTrigger>}
            {share_settings.include_videos && videos && videos.length > 0 && (
              <TabsTrigger value="videos">Highlights</TabsTrigger>
            )}
          </TabsList>

          {share_settings.include_stats && (
            <TabsContent value="stats" className="space-y-6">
              {latestKpis.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No performance data available
                  </CardContent>
                </Card>
              ) : (
                latestKpis.map(({ category, kpis: categoryKpis }) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {categoryKpis.map((kpi, idx) => (
                          <div key={idx} className="p-4 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">{kpi.kpi_name}</div>
                            <div className="text-2xl font-bold mt-1">
                              {kpi.kpi_value}
                              {kpi.kpi_unit && <span className="text-sm font-normal ml-1">{kpi.kpi_unit}</span>}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Recorded {format(new Date(kpi.recorded_at), 'MMM d, yyyy')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          )}

          {share_settings.include_goals && (
            <TabsContent value="goals" className="space-y-4">
              {!goals || goals.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No goals set
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {goals.map((goal, idx) => {
                    // Find latest KPI value for this goal
                    const latestValue = kpis?.find(k => k.kpi_name === goal.kpi_name && k.kpi_category === goal.kpi_category);
                    const progress = latestValue 
                      ? Math.min(100, (latestValue.kpi_value / goal.target_value) * 100)
                      : 0;

                    return (
                      <Card key={idx}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge variant="outline" className="mb-2">{goal.kpi_category}</Badge>
                              <h4 className="font-medium">{goal.kpi_name}</h4>
                            </div>
                            {goal.is_achieved && (
                              <Badge className="bg-green-500">Achieved</Badge>
                            )}
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">
                                {latestValue?.kpi_value || 0} / {goal.target_value} {goal.kpi_unit || ''}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                          {goal.target_date && (
                            <div className="text-xs text-muted-foreground mt-2">
                              Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          )}

          {share_settings.include_videos && videos && videos.length > 0 && (
            <TabsContent value="videos" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {videos.map((video, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        {video.thumbnail_url ? (
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Video className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <CardContent className="pt-4">
                        <h4 className="font-medium">{video.title}</h4>
                        {video.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                      </CardContent>
                    </a>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Shared via Vault Baseball</p>
        </div>
      </div>
    </div>
  );
}
