import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfilePosts from "@/components/profile/ProfilePosts";
import HighlightVideos from "@/components/profile/HighlightVideos";
import AthleticStats from "@/components/profile/AthleticStats";
import AthleteKPIForm from "@/components/profile/AthleteKPIForm";
import RecruitingAssistant from "@/components/profile/RecruitingAssistant";
import { KPIShareManager } from "@/components/profile/KPIShareManager";
import { ConnectedGear } from "@/components/metrics/ConnectedGear";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trophy, FileText, GraduationCap, Video, Loader2, Bot, Award, Gauge, Share2, Link2, Radar } from "lucide-react";
import type { Profile } from "@/types/profile";

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);

      if (!userId) {
        setError("No profile ID provided");
        setLoading(false);
        return;
      }

      const isOwn = session?.user?.id === userId;

      // For own profile, fetch directly; for others, use privacy-aware function
      if (isOwn) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setError("Failed to load profile");
          setLoading(false);
          return;
        }

        if (!profileData) {
          setError("Profile not found");
          setLoading(false);
          return;
        }

        setProfile(profileData as Profile);
      } else {
        // Use privacy-aware function for other users' profiles
        const { data: profileData, error: profileError } = await supabase
          .rpc('get_profile_with_privacy', { target_user_id: userId });

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setError("Failed to load profile");
          setLoading(false);
          return;
        }

        if (!profileData) {
          setError("Profile not found");
          setLoading(false);
          return;
        }

        setProfile(profileData as unknown as Profile);
      }

      setLoading(false);
    };

    fetchData();
  }, [userId]);

  const isOwnProfile = currentUser?.id === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error || "Profile not found"}
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="text-primary hover:underline"
            >
              Go back
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <ProfileHeader 
            profile={profile} 
            isOwnProfile={isOwnProfile}
            currentUserId={currentUser?.id}
            onProfileUpdated={setProfile}
          />

          {/* Content Tabs */}
          <Tabs defaultValue="stats" className="mt-8">
            <TabsList className={`grid w-full bg-card border border-border ${isOwnProfile ? 'grid-cols-9' : 'grid-cols-6'}`}>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Training</span>
              </TabsTrigger>
              <TabsTrigger value="kpis" className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                <span className="hidden sm:inline">KPIs</span>
              </TabsTrigger>
              <TabsTrigger value="athletic" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Highlights</span>
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Posts</span>
              </TabsTrigger>
              <TabsTrigger value="recruiting" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline">Recruiting</span>
              </TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger value="gear" className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Gear</span>
                </TabsTrigger>
              )}
              {isOwnProfile && (
                <TabsTrigger value="share" className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </TabsTrigger>
              )}
              {isOwnProfile && (
                <TabsTrigger value="assistant" className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Coach</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="stats" className="mt-6">
              <ProfileStats userId={userId!} />
            </TabsContent>

            <TabsContent value="kpis" className="mt-6">
              <AthleteKPIForm userId={userId!} isOwnProfile={isOwnProfile} currentUserId={currentUser?.id} />
            </TabsContent>

            <TabsContent value="athletic" className="mt-6">
              <AthleticStats userId={userId!} isOwnProfile={isOwnProfile} />
            </TabsContent>

            <TabsContent value="videos" className="mt-6">
              <HighlightVideos userId={userId!} isOwnProfile={isOwnProfile} />
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              <ProfilePosts userId={userId!} currentUserId={currentUser?.id} />
            </TabsContent>

            <TabsContent value="recruiting" className="mt-6">
              <ProfilePosts userId={userId!} currentUserId={currentUser?.id} filterType="recruiting" />
            </TabsContent>

            {isOwnProfile && (
              <TabsContent value="gear" className="mt-6 space-y-6">
                <ConnectedGear userId={userId!} />
                <div className="flex justify-center">
                  <Link to="/device-metrics">
                    <Button variant="outline" className="gap-2">
                      <Radar className="w-4 h-4" />
                      View Full Device Metrics Dashboard
                    </Button>
                  </Link>
                </div>
              </TabsContent>
            )}

            {isOwnProfile && (
              <TabsContent value="share" className="mt-6">
                <KPIShareManager userId={userId!} />
              </TabsContent>
            )}

            {isOwnProfile && (
              <TabsContent value="assistant" className="mt-6">
                <RecruitingAssistant 
                  athleteContext={{
                    name: profile.display_name || undefined,
                    position: profile.position || undefined,
                    graduationYear: profile.graduation_year || undefined,
                    targetSchools: profile.target_schools || undefined,
                  }}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
