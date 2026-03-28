import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Loader2, Video, Calendar, MessageCircle,
  BarChart3, Clock, Target, BookOpen, Play, User,
  ChevronRight, Trophy, Zap, FileText, MonitorPlay, Columns2, Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CoachingMessenger from "@/components/coaching/CoachingMessenger";
import LiveVideoCall from "@/components/coaching/LiveVideoCall";
import VideoComparison from "@/components/coaching/VideoComparison";
import VideoAnalysisPanel from "@/components/coaching/VideoAnalysisPanel";
import { formatDistanceToNow } from "date-fns";

interface Session {
  id: string;
  coach_user_id: string;
  athlete_user_id: string;
  scheduled_at: string;
  duration_minutes: number;
  video_call_link: string | null;
  status: string;
  notes: string | null;
  coach_notes: string | null;
}

interface CoachProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  position: string | null;
}

const RemoteTrainingHub = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [recordings, setRecordings] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate("/auth"); return; }
      setUser(session.user);

      // Fetch assigned coach
      const { data: assignment } = await supabase
        .from("coach_athlete_assignments")
        .select("coach_user_id")
        .eq("athlete_user_id", session.user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (assignment) {
        const { data: profile } = await supabase.rpc("get_public_profile", { target_user_id: assignment.coach_user_id });
        if (profile && (profile as any[])[0]) {
          const p = (profile as any[])[0];
          setCoach({ user_id: p.user_id, display_name: p.display_name, avatar_url: p.avatar_url, position: p.player_position });
        }
      }

      // Fetch sessions
      const { data: sessionsData } = await supabase
        .from("remote_lessons")
        .select("*")
        .eq("athlete_user_id", session.user.id)
        .order("scheduled_at", { ascending: false });
      if (sessionsData) setSessions(sessionsData as Session[]);

      // Fetch recordings
      const { data: recs } = await supabase
        .from("session_recordings")
        .select("*")
        .eq("athlete_user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (recs) setRecordings(recs);

      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) navigate("/auth");
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const upcomingSessions = sessions.filter((s) => s.status === "scheduled" && new Date(s.scheduled_at) > new Date());
  const pastSessions = sessions.filter((s) => s.status === "completed" || new Date(s.scheduled_at) <= new Date());
  const nextSession = upcomingSessions[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button variant="ghost" className="mb-4" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Hero header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 border border-primary/20 text-primary text-[10px] font-display tracking-[0.2em] mb-3">
                  REMOTE TRAINING
                </span>
                <h1 className="text-3xl md:text-4xl font-display text-foreground">YOUR TRAINING HUB</h1>
                <p className="text-muted-foreground mt-1">Structured development. Live coaching. Measured progress.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/remote-lessons")}>
                  <Calendar className="w-4 h-4 mr-2" /> Book Session
                </Button>
                <Button variant="vault" onClick={() => setActiveTab("messages")}>
                  <MessageCircle className="w-4 h-4 mr-2" /> Message Coach
                </Button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Upcoming Sessions", value: upcomingSessions.length, icon: Calendar, color: "text-primary" },
                { label: "Completed Sessions", value: pastSessions.length, icon: Trophy, color: "text-accent" },
                { label: "Session Recordings", value: recordings.length, icon: Play, color: "text-primary" },
                { label: "Assigned Coach", value: coach?.display_name || "None", icon: User, color: "text-muted-foreground" },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                    <span className="text-[11px] text-muted-foreground">{s.label}</span>
                  </div>
                  <p className="text-xl font-display text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Next session card */}
            {nextSession && (
              <div className="bg-card border border-primary/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-xs font-display tracking-widest text-primary">NEXT SESSION</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-display text-foreground">
                      {new Date(nextSession.scheduled_at).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(nextSession.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · {nextSession.duration_minutes} min
                    </p>
                    {nextSession.notes && <p className="text-xs text-muted-foreground mt-1">Focus: {nextSession.notes}</p>}
                  </div>
                  <Button variant="vault" onClick={() => { setActiveSessionId(nextSession.id); setActiveTab("live"); }}>
                    <MonitorPlay className="w-4 h-4 mr-2" /> Join Live Session
                  </Button>
                </div>
              </div>
            )}

            {/* Main tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {activeSessionId && <TabsTrigger value="live">Live Session</TabsTrigger>}
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="compare"><Columns2 className="w-3 h-3 mr-1" /> Compare</TabsTrigger>
                <TabsTrigger value="ai-analysis"><Brain className="w-3 h-3 mr-1" /> AI Analysis</TabsTrigger>
                <TabsTrigger value="recordings">Recordings</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
              </TabsList>

              {/* LIVE SESSION */}
              <TabsContent value="live" className="mt-6 space-y-4">
                {activeSessionId && user && (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-xl text-foreground">LIVE COACHING SESSION</h2>
                      <div className="flex gap-2">
                        <Button
                          variant={showComparison ? "vault" : "outline"}
                          size="sm"
                          onClick={() => setShowComparison(!showComparison)}
                        >
                          <Columns2 className="w-3 h-3 mr-1" /> {showComparison ? "Hide Compare" : "Compare"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setActiveSessionId(null); setActiveTab("sessions"); }}>
                          <ArrowLeft className="w-3 h-3 mr-1" /> Back
                        </Button>
                      </div>
                    </div>
                    <LiveVideoCall
                      sessionId={activeSessionId}
                      userId={user.id}
                      isCoach={false}
                      onEnd={() => { setActiveSessionId(null); setActiveTab("sessions"); }}
                    />
                    {showComparison && (
                      <VideoComparison
                        sessionId={activeSessionId}
                        userId={user.id}
                        isCoach={false}
                        onClose={() => setShowComparison(false)}
                      />
                    )}
                    <p className="text-xs text-muted-foreground text-center">
                      Position your camera so your coach can see your full mechanics. Use a tripod for best results.
                    </p>
                  </>
                )}
              </TabsContent>

              {/* COMPARE (standalone) */}
              <TabsContent value="compare" className="mt-6 space-y-4">
                <h2 className="font-display text-xl text-foreground">MECHANICS COMPARISON</h2>
                <p className="text-sm text-muted-foreground">
                  Load two videos side by side to compare mechanics. Use session recordings, highlight clips, or upload reference footage.
                </p>
                {user && (
                  <VideoComparison
                    sessionId="compare-standalone"
                    userId={user.id}
                    isCoach={false}
                  />
                )}
              </TabsContent>

              {/* AI ANALYSIS */}
              <TabsContent value="ai-analysis" className="mt-6">
                <h2 className="font-display text-xl text-foreground mb-1">AI DEVELOPMENT ANALYSIS</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a video of your mechanics. Vault AI will break down every phase and prepare focus areas before your next coaching session.
                </p>
                {user && <VideoAnalysisPanel userId={user.id} />}
              </TabsContent>

              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Coach card */}
                {coach && (
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-display text-sm text-muted-foreground mb-3">YOUR COACH</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-display text-primary">{coach.display_name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-display text-lg text-foreground">{coach.display_name}</p>
                        {coach.position && <p className="text-sm text-muted-foreground capitalize">{coach.position} Specialist</p>}
                      </div>
                      <Button variant="outline" size="sm" className="ml-auto" onClick={() => setActiveTab("messages")}>
                        <MessageCircle className="w-3 h-3 mr-1" /> Message
                      </Button>
                    </div>
                  </div>
                )}

                {/* Recent sessions */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-display text-sm text-muted-foreground mb-4">RECENT SESSIONS</h3>
                  {pastSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No completed sessions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {pastSessions.slice(0, 5).map((s) => (
                        <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div>
                            <p className="text-sm text-foreground">{new Date(s.scheduled_at).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">{s.duration_minutes} min · {s.status}</p>
                          </div>
                          {s.coach_notes && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <FileText className="w-3 h-3" /> Notes
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Book a Session", desc: "Schedule your next training", icon: Calendar, onClick: () => navigate("/remote-lessons") },
                    { label: "View Programs", desc: "Access training courses", icon: BookOpen, onClick: () => navigate("/courses") },
                    { label: "Track Progress", desc: "KPIs and development data", icon: BarChart3, onClick: () => setActiveTab("progress") },
                  ].map((a) => (
                    <button key={a.label} onClick={a.onClick} className="bg-card border border-border rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors group">
                      <a.icon className="w-5 h-5 text-primary mb-2" />
                      <p className="text-sm font-medium text-foreground">{a.label}</p>
                      <p className="text-xs text-muted-foreground">{a.desc}</p>
                    </button>
                  ))}
                </div>
              </TabsContent>

              {/* SESSIONS */}
              <TabsContent value="sessions" className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl text-foreground">ALL SESSIONS</h2>
                  <Button variant="vault" size="sm" onClick={() => navigate("/remote-lessons")}>
                    <Calendar className="w-3 h-3 mr-1" /> Book New
                  </Button>
                </div>

                {sessions.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No sessions scheduled yet.</p>
                    <Button variant="vault" className="mt-4" onClick={() => navigate("/remote-lessons")}>Book Your First Session</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((s) => {
                      const isPast = new Date(s.scheduled_at) <= new Date();
                      return (
                        <div key={s.id} className={`bg-card border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isPast ? "border-border" : "border-primary/20"}`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                                s.status === "completed" ? "bg-accent/10 text-accent" :
                                s.status === "scheduled" ? "bg-primary/10 text-primary" :
                                "bg-muted text-muted-foreground"
                              }`}>{s.status}</span>
                              <p className="text-sm font-medium text-foreground">
                                {new Date(s.scheduled_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(s.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · {s.duration_minutes} min
                            </p>
                            {s.coach_notes && <p className="text-xs text-muted-foreground mt-1 italic">"{s.coach_notes}"</p>}
                          </div>
                          {!isPast && (
                            <Button variant="vault" size="sm" onClick={() => { setActiveSessionId(s.id); setActiveTab("live"); }}>
                              <MonitorPlay className="w-3 h-3 mr-1" /> Join Live
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* RECORDINGS */}
              <TabsContent value="recordings" className="mt-6">
                <h2 className="font-display text-xl text-foreground mb-4">SESSION RECORDINGS</h2>
                {recordings.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <Play className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No recordings yet. Recordings from coaching sessions will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recordings.map((r: any) => (
                      <div key={r.id} className="bg-card border border-border rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Play className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {r.duration_seconds && <p className="text-xs text-muted-foreground">{Math.round(r.duration_seconds / 60)} min</p>}
                        {r.notes && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
                        <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                          <a href={r.recording_url} target="_blank" rel="noopener noreferrer">Watch Recording</a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* MESSAGES */}
              <TabsContent value="messages" className="mt-6">
                <div className="bg-card border border-border rounded-xl overflow-hidden h-[500px]">
                  <CoachingMessenger userId={user?.id} defaultPartnerId={coach?.user_id} />
                </div>
              </TabsContent>

              {/* PROGRESS */}
              <TabsContent value="progress" className="mt-6 space-y-4">
                <h2 className="font-display text-xl text-foreground">DEVELOPMENT TRACKING</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => navigate("/device-metrics")} className="bg-card border border-border rounded-xl p-6 text-left hover:bg-secondary/50 transition-colors">
                    <BarChart3 className="w-6 h-6 text-primary mb-3" />
                    <p className="font-display text-foreground">Performance Metrics</p>
                    <p className="text-xs text-muted-foreground mt-1">Velocity, exit velo, spin rates, and more</p>
                  </button>
                  <button onClick={() => navigate("/profile")} className="bg-card border border-border rounded-xl p-6 text-left hover:bg-secondary/50 transition-colors">
                    <Target className="w-6 h-6 text-primary mb-3" />
                    <p className="font-display text-foreground">KPI Goals</p>
                    <p className="text-xs text-muted-foreground mt-1">Set targets and track development goals</p>
                  </button>
                  <button onClick={() => navigate("/checkin")} className="bg-card border border-border rounded-xl p-6 text-left hover:bg-secondary/50 transition-colors">
                    <Clock className="w-6 h-6 text-primary mb-3" />
                    <p className="font-display text-foreground">Daily Check-ins</p>
                    <p className="text-xs text-muted-foreground mt-1">Log training, recovery, and readiness</p>
                  </button>
                  <button onClick={() => navigate("/courses")} className="bg-card border border-border rounded-xl p-6 text-left hover:bg-secondary/50 transition-colors">
                    <BookOpen className="w-6 h-6 text-primary mb-3" />
                    <p className="font-display text-foreground">Training Programs</p>
                    <p className="text-xs text-muted-foreground mt-1">Structured course content and certifications</p>
                  </button>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RemoteTrainingHub;
