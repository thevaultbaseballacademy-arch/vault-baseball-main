import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, Clock, ArrowLeft, Loader2, Video, Plus, MapPin, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLessonCredits } from "@/hooks/useLessonCredits";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface GroupSession {
  id: string;
  coach_user_id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  max_participants: number;
  video_call_link: string | null;
  focus_area: string | null;
  skill_level: string;
  status: string;
  price_credits: number;
  enrolled_count?: number;
  is_enrolled?: boolean;
}

const GroupSessions = () => {
  const [user, setUser] = useState<any>(null);
  const [isCoach, setIsCoach] = useState(false);
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [newSession, setNewSession] = useState({ title: '', description: '', date: '', time: '', duration: '90', maxParticipants: '10', focusArea: 'general', skillLevel: 'all', videoLink: '' });
  const [creating, setCreating] = useState(false);
  const { remainingLessons } = useLessonCredits();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { navigate('/auth'); return; }
      setUser(session.user);
      checkCoachRole(session.user.id);
      fetchSessions(session.user.id);
      setLoading(false);
    });
  }, []);

  const checkCoachRole = async (userId: string) => {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'coach').maybeSingle();
    setIsCoach(!!data);
  };

  const fetchSessions = async (userId: string) => {
    const { data: sessionsData } = await (supabase.from('group_sessions' as any) as any).select('*').order('scheduled_at');
    
    const { data: enrollments } = await (supabase.from('group_session_enrollments' as any) as any).select('session_id, athlete_user_id');
    
    const enriched = (sessionsData || []).map((s: any) => {
      const sessionEnrollments = (enrollments || []).filter((e: any) => e.session_id === s.id);
      return {
        ...s,
        enrolled_count: sessionEnrollments.length,
        is_enrolled: sessionEnrollments.some((e: any) => e.athlete_user_id === userId),
      };
    });
    
    setSessions(enriched);
  };

  const handleCreate = async () => {
    if (!newSession.title || !newSession.date || !newSession.time) {
      toast({ title: "Missing info", description: "Fill in all required fields", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const scheduledAt = new Date(`${newSession.date}T${newSession.time}`).toISOString();
      await (supabase.from('group_sessions' as any) as any).insert({
        coach_user_id: user.id,
        title: newSession.title,
        description: newSession.description || null,
        scheduled_at: scheduledAt,
        duration_minutes: parseInt(newSession.duration),
        max_participants: parseInt(newSession.maxParticipants),
        focus_area: newSession.focusArea,
        skill_level: newSession.skillLevel,
        video_call_link: newSession.videoLink || null,
      });
      toast({ title: "Session created!" });
      setShowCreate(false);
      setNewSession({ title: '', description: '', date: '', time: '', duration: '90', maxParticipants: '10', focusArea: 'general', skillLevel: 'all', videoLink: '' });
      fetchSessions(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleEnroll = async (session: GroupSession) => {
    if (remainingLessons < session.price_credits) {
      toast({ title: "Not enough credits", description: "Purchase a lesson pack first", variant: "destructive" });
      return;
    }
    setEnrolling(session.id);
    try {
      await (supabase.from('group_session_enrollments' as any) as any).insert({
        session_id: session.id,
        athlete_user_id: user.id,
      });
      toast({ title: "Enrolled!", description: `You're signed up for ${session.title}` });
      fetchSessions(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setEnrolling(null);
    }
  };

  const handleUnenroll = async (sessionId: string) => {
    await (supabase.from('group_session_enrollments' as any) as any).delete().eq('session_id', sessionId).eq('athlete_user_id', user.id);
    toast({ title: "Unenrolled" });
    fetchSessions(user.id);
  };

  const upcomingSessions = sessions.filter(s => s.status !== 'cancelled' && new Date(s.scheduled_at) >= new Date());
  const pastSessions = sessions.filter(s => new Date(s.scheduled_at) < new Date());
  const getMinDate = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; };

  const focusColors: Record<string, string> = {
    pitching: 'bg-blue-500/10 text-blue-600',
    hitting: 'bg-orange-500/10 text-orange-600',
    fielding: 'bg-green-500/10 text-green-600',
    general: 'bg-primary/10 text-primary',
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-display text-foreground mb-1">GROUP SESSIONS</h1>
                <p className="text-muted-foreground">Train alongside other athletes with expert coaches</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm">
                  {remainingLessons} credit{remainingLessons !== 1 ? 's' : ''}
                </div>
                {isCoach && (
                  <Button variant="vault" onClick={() => setShowCreate(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Create Session
                  </Button>
                )}
              </div>
            </div>

            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming">Available ({upcomingSessions.length})</TabsTrigger>
                <TabsTrigger value="past">Past ({pastSessions.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4 mt-4">
                {upcomingSessions.length === 0 ? (
                  <Card><CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-display text-foreground mb-2">No Group Sessions Available</h3>
                    <p className="text-muted-foreground">Check back soon for upcoming group training sessions.</p>
                  </CardContent></Card>
                ) : upcomingSessions.map(session => (
                  <Card key={session.id} className={`overflow-hidden ${session.is_enrolled ? 'border-primary' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-display text-foreground">{session.title}</h3>
                            {session.focus_area && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${focusColors[session.focus_area] || focusColors.general}`}>
                                {session.focus_area}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground capitalize">
                              {session.skill_level}
                            </span>
                          </div>
                          {session.description && <p className="text-sm text-muted-foreground mb-3">{session.description}</p>}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                              {new Date(session.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                              {new Date(session.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                            <span>{session.duration_minutes} min</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />
                              {session.enrolled_count}/{session.max_participants} spots
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {session.is_enrolled ? (
                            <>
                              {session.video_call_link && (
                                <Button variant="vault" size="sm" asChild>
                                  <a href={session.video_call_link} target="_blank" rel="noopener noreferrer">
                                    <Video className="w-4 h-4 mr-1" /> Join
                                  </a>
                                </Button>
                              )}
                              <Button variant="outline" size="sm" onClick={() => handleUnenroll(session.id)}>
                                Leave
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="vault"
                              size="sm"
                              onClick={() => handleEnroll(session)}
                              disabled={enrolling === session.id || (session.enrolled_count || 0) >= session.max_participants}
                            >
                              {enrolling === session.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                              {(session.enrolled_count || 0) >= session.max_participants ? 'Full' :
                                `Enroll (${session.price_credits} credit${session.price_credits !== 1 ? 's' : ''})`}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="past" className="space-y-4 mt-4">
                {pastSessions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No past sessions.</p>
                ) : pastSessions.map(s => (
                  <Card key={s.id} className="opacity-60"><CardContent className="p-4 flex items-center justify-between">
                    <div><span className="font-medium text-foreground">{s.title}</span>
                    <span className="text-sm text-muted-foreground ml-3">{new Date(s.scheduled_at).toLocaleDateString()}</span></div>
                    <span className="text-xs text-muted-foreground capitalize">{s.status}</span>
                  </CardContent></Card>
                ))}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Create Session Dialog */}
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle className="font-display">Create Group Session</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={newSession.title} onChange={e => setNewSession(p => ({...p, title: e.target.value}))} placeholder="e.g. Pitching Mechanics Workshop" className="mt-1" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={newSession.description} onChange={e => setNewSession(p => ({...p, description: e.target.value}))} placeholder="What will athletes learn?" rows={2} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Date *</Label><Input type="date" min={getMinDate()} value={newSession.date} onChange={e => setNewSession(p => ({...p, date: e.target.value}))} className="mt-1" /></div>
                  <div><Label>Time *</Label><Input type="time" value={newSession.time} onChange={e => setNewSession(p => ({...p, time: e.target.value}))} className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Duration (min)</Label><Input type="number" value={newSession.duration} onChange={e => setNewSession(p => ({...p, duration: e.target.value}))} className="mt-1" /></div>
                  <div><Label>Max Participants</Label><Input type="number" value={newSession.maxParticipants} onChange={e => setNewSession(p => ({...p, maxParticipants: e.target.value}))} className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Focus Area</Label>
                    <select value={newSession.focusArea} onChange={e => setNewSession(p => ({...p, focusArea: e.target.value}))}
                      className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-foreground">
                      <option value="general">General</option>
                      <option value="pitching">Pitching</option>
                      <option value="hitting">Hitting</option>
                      <option value="fielding">Fielding</option>
                    </select>
                  </div>
                  <div>
                    <Label>Skill Level</Label>
                    <select value={newSession.skillLevel} onChange={e => setNewSession(p => ({...p, skillLevel: e.target.value}))}
                      className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-foreground">
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Video Call Link (Zoom, Meet, etc.)</Label>
                  <Input value={newSession.videoLink} onChange={e => setNewSession(p => ({...p, videoLink: e.target.value}))} placeholder="https://zoom.us/j/..." className="mt-1" />
                </div>
                <Button variant="vault" className="w-full" onClick={handleCreate} disabled={creating}>
                  {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {creating ? 'Creating...' : 'Create Session'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GroupSessions;
