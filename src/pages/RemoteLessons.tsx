import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Video, Calendar, Clock, ArrowLeft, Loader2, User, Plus, X, Phone } from "lucide-react";
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
import LiveVideoCall from "@/components/coaching/LiveVideoCall";

interface Coach {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  position: string | null;
}

interface RemoteLesson {
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

const RemoteLessons = () => {
  const [user, setUser] = useState<any>(null);
  const [isCoach, setIsCoach] = useState(false);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [lessons, setLessons] = useState<RemoteLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [lessonNotes, setLessonNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const { remainingLessons, refetch: refetchCredits } = useLessonCredits();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { navigate('/auth'); return; }
      setUser(session.user);
      checkCoachRole(session.user.id);
      fetchCoaches();
      fetchLessons(session.user.id);
      setLoading(false);
    });
  }, []);

  const checkCoachRole = async (userId: string) => {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'coach').maybeSingle();
    setIsCoach(!!data);
  };

  const fetchCoaches = async () => {
    // Use coach_marketplace_profiles (publicly readable for active coaches)
    const { data: marketplaceCoaches } = await supabase
      .from('coach_marketplace_profiles')
      .select('user_id')
      .eq('is_marketplace_active', true);

    if (!marketplaceCoaches?.length) return;
    const coachIds = marketplaceCoaches.map(r => r.user_id);
    
    const { data } = await supabase.rpc('get_public_profiles_by_ids', { user_ids: coachIds });
    setCoaches((data || []).map((p: any) => ({ user_id: p.user_id, display_name: p.display_name, avatar_url: p.avatar_url, position: p.player_position })));
  };

  const fetchLessons = async (currentUserId?: string) => {
    const uid = currentUserId || user?.id;
    if (!uid) return;

    const { data } = await supabase
      .from('remote_lessons')
      .select('*')
      .or(`coach_user_id.eq.${uid},athlete_user_id.eq.${uid}`)
      .order('scheduled_at', { ascending: true });

    setLessons(data || []);
  };

  const handleBook = async () => {
    if (!selectedCoach || !selectedDate || !selectedTime) {
      toast({ title: "Missing info", description: "Select a coach, date, and time", variant: "destructive" });
      return;
    }
    if (remainingLessons <= 0) {
      toast({ title: "No credits", description: "Purchase a lesson pack first", variant: "destructive" });
      return;
    }

    setBooking(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`).toISOString();
      
      const { error } = await supabase.from('remote_lessons').insert({
        coach_user_id: selectedCoach,
        athlete_user_id: user.id,
        scheduled_at: scheduledAt,
        notes: lessonNotes || null,
      });

      if (error) throw error;

      toast({ title: "Lesson booked!", description: "Your coach will confirm and share the video link." });
      setShowBooking(false);
      setSelectedCoach('');
      setSelectedDate('');
      setSelectedTime('');
      setLessonNotes('');
      fetchLessons(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setBooking(false);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
  };

  const handleCancel = async (lessonId: string) => {
    await supabase.from('remote_lessons').update({ status: 'cancelled' }).eq('id', lessonId);
    fetchLessons(user?.id);
    toast({ title: "Lesson cancelled" });
  };

  const getCoachName = (coachId: string) => coaches.find(c => c.user_id === coachId)?.display_name || 'Coach';
  const getMinDate = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; };
  const times = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

  const upcomingLessons = lessons.filter(l => l.status !== 'cancelled' && new Date(l.scheduled_at) >= new Date());
  const pastLessons = lessons.filter(l => l.status === 'cancelled' || new Date(l.scheduled_at) < new Date());

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
                <h1 className="text-3xl md:text-4xl font-display text-foreground mb-1">REMOTE LESSONS</h1>
                <p className="text-muted-foreground">1-on-1 coaching sessions via video call</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm">
                  {remainingLessons} credit{remainingLessons !== 1 ? 's' : ''} remaining
                </div>
                {!isCoach && (
                  <Button variant="vault" onClick={() => remainingLessons > 0 ? setShowBooking(true) : navigate('/lesson-packages')}>
                    <Plus className="w-4 h-4 mr-2" />
                    {remainingLessons > 0 ? 'Book Lesson' : 'Buy Credits'}
                  </Button>
                )}
              </div>
            </div>

            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming ({upcomingLessons.length})</TabsTrigger>
                <TabsTrigger value="past">Past ({pastLessons.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4 mt-4">
                {upcomingLessons.length === 0 ? (
                  <Card><CardContent className="p-8 text-center">
                    <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-display text-foreground mb-2">No Upcoming Lessons</h3>
                    <p className="text-muted-foreground mb-4">Book a lesson with a certified coach to get started.</p>
                    <Button variant="vault" onClick={() => remainingLessons > 0 ? setShowBooking(true) : navigate('/lesson-packages')}>
                      {remainingLessons > 0 ? 'Book a Lesson' : 'Get Lesson Credits'}
                    </Button>
                  </CardContent></Card>
                ) : (
                  upcomingLessons.map(lesson => (
                    <Card key={lesson.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {isCoach ? `Athlete Session` : getCoachName(lesson.coach_user_id)}
                              </p>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(lesson.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(lesson.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </span>
                                <span>{lesson.duration_minutes} min</span>
                              </div>
                              {lesson.notes && <p className="text-sm text-muted-foreground mt-1">"{lesson.notes}"</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                              lesson.status === 'confirmed' ? 'bg-green-500/10 text-green-600' :
                              lesson.status === 'scheduled' ? 'bg-yellow-500/10 text-yellow-600' :
                              'bg-muted text-muted-foreground'
                            }`}>{lesson.status}</span>
                            
                            <Button variant="vault" size="sm" onClick={() => handleStartLesson(lesson.id)}>
                              <Phone className="w-4 h-4 mr-1" /> {isCoach ? 'Start' : 'Join'}
                            </Button>
                            
                            <Button variant="ghost" size="sm" onClick={() => handleCancel(lesson.id)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4 mt-4">
                {pastLessons.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No past lessons yet.</p>
                ) : pastLessons.map(lesson => (
                  <Card key={lesson.id} className="opacity-60">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{new Date(lesson.scheduled_at).toLocaleDateString()}</span>
                        <span className="text-muted-foreground">with {getCoachName(lesson.coach_user_id)}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        lesson.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                      }`}>{lesson.status}</span>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Book Lesson Dialog */}
          <Dialog open={showBooking} onOpenChange={setShowBooking}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle className="font-display">Book a Remote Lesson</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Coach</Label>
                  <select value={selectedCoach} onChange={e => setSelectedCoach(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-foreground">
                    <option value="">Choose a coach...</option>
                    {coaches.map(c => <option key={c.user_id} value={c.user_id}>{c.display_name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" min={getMinDate()} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Time</Label>
                  <div className="grid grid-cols-5 gap-2 mt-1">
                    {times.map(t => (
                      <button key={t} onClick={() => setSelectedTime(t)} className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                        selectedTime === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}>
                        {parseInt(t) > 12 ? `${parseInt(t)-12}PM` : `${parseInt(t)}AM`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea value={lessonNotes} onChange={e => setLessonNotes(e.target.value)} placeholder="What would you like to work on?" rows={2} className="mt-1" />
                </div>
                <Button variant="vault" className="w-full" onClick={handleBook} disabled={booking}>
                  {booking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {booking ? 'Booking...' : 'Confirm Booking (1 credit)'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* In-App Live Lesson Dialog */}
          {activeLessonId && (
            <Dialog open={!!activeLessonId} onOpenChange={(open) => !open && setActiveLessonId(null)}>
              <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="p-4 pb-0">
                  <DialogTitle className="font-display flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    LIVE LESSON
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0 p-4 pt-2">
                  <LiveVideoCall
                    sessionId={activeLessonId}
                    userId={user?.id || ''}
                    isCoach={isCoach}
                    onEnd={() => setActiveLessonId(null)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RemoteLessons;
