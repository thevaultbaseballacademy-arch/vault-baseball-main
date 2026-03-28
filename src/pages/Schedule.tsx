import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Loader2, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AVAILABLE_TIMES = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];

const ELITE_PRODUCT_ID = "prod_Tgdd8gSJpkk33e";

interface Session {
  id: string;
  session_date: string;
  session_time: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  coach_name: string;
}

const Schedule = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isElite, setIsElite] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      checkSubscription();
      fetchSessions();
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check team whitelist first
      if (session.user?.email) {
        const { data: whitelistEntry } = await supabase
          .from("team_whitelist")
          .select("full_access")
          .eq("email", session.user.email.toLowerCase())
          .maybeSingle();
        
        if (whitelistEntry?.full_access) {
          setIsElite(true);
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      setIsElite(data?.subscribed || data?.product_id === ELITE_PRODUCT_ID);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('coaching_sessions')
        .select('*')
        .order('session_date', { ascending: true })
        .order('session_time', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select a date and time",
        variant: "destructive",
      });
      return;
    }

    setBooking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('coaching_sessions')
        .insert({
          user_id: user.id,
          session_date: selectedDate,
          session_time: selectedTime,
          notes: notes || null,
        });

      if (error) throw error;
      
      toast({
        title: "Session booked!",
        description: "Your coaching session has been scheduled.",
      });
      
      setShowBooking(false);
      setSelectedDate("");
      setSelectedTime("");
      setNotes("");
      fetchSessions();
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (sessionId: string) => {
    setCancelling(sessionId);
    try {
      const { error } = await supabase
        .from('coaching_sessions')
        .update({ status: 'cancelled' })
        .eq('id', sessionId);

      if (error) throw error;
      
      toast({
        title: "Session cancelled",
        description: "Your session has been cancelled.",
      });
      
      fetchSessions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCancelling(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 text-green-600';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600';
      case 'completed': return 'bg-accent/10 text-accent';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => s.status !== 'cancelled' && new Date(s.session_date) >= new Date());
  const pastSessions = sessions.filter(s => s.status === 'cancelled' || new Date(s.session_date) < new Date());

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-display text-foreground mb-2">
                  1-ON-1 COACHING
                </h1>
                <p className="text-muted-foreground">
                  Schedule your personal coaching sessions
                </p>
              </div>
              {isElite && (
                <Button variant="vault" onClick={() => setShowBooking(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Book Session
                </Button>
              )}
            </div>

            {/* Elite Access Required */}
            {!isElite && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border border-border rounded-2xl p-8 text-center"
              >
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-display text-foreground mb-2">Elite Membership Required</h2>
                <p className="text-muted-foreground mb-6">
                  1-on-1 coaching sessions are available exclusively for Elite members.
                </p>
                <Button variant="vault" onClick={() => navigate("/#pricing")}>
                  Upgrade to Elite
                </Button>
              </motion.div>
            )}

            {/* Booking Modal */}
            {showBooking && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-2xl p-6 md:p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display text-foreground">Book a Session</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowBooking(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      min={getMinDate()}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select Time
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {AVAILABLE_TIMES.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedTime === time
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-secondary text-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {formatTime(time)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What would you like to focus on?"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                  </div>

                  <Button
                    variant="vault"
                    className="w-full"
                    onClick={handleBook}
                    disabled={booking || !selectedDate || !selectedTime}
                  >
                    {booking ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Confirm Booking
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Upcoming Sessions */}
            {isElite && upcomingSessions.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-display text-foreground mb-6">Upcoming Sessions</h2>
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{formatDate(session.session_date)}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(session.session_time)}</span>
                            <span>•</span>
                            <span>{session.duration_minutes} min</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                        {session.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(session.id)}
                            disabled={cancelling === session.id}
                          >
                            {cancelling === session.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {isElite && upcomingSessions.length === 0 && !showBooking && (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-display text-foreground mb-2">No Upcoming Sessions</h2>
                <p className="text-muted-foreground mb-6">
                  Book your first 1-on-1 coaching session to get started.
                </p>
                <Button variant="vault" onClick={() => setShowBooking(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Book Session
                </Button>
              </div>
            )}

            {/* Past Sessions */}
            {isElite && pastSessions.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-display text-foreground mb-6">Past Sessions</h2>
                <div className="space-y-4">
                  {pastSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl opacity-60"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{formatDate(session.session_date)}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(session.session_time)}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Schedule;
