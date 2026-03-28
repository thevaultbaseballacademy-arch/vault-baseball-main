import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Loader2, Check, Calendar, Moon, Zap, 
  Activity, Brain, Heart, Dumbbell, ChevronLeft, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TRAINING_TYPES = [
  "Hitting", "Pitching", "Fielding", "Conditioning", "Strength", "Speed/Agility", "Rest Day"
];

interface CheckinData {
  training_completed: boolean;
  training_type: string;
  training_duration_minutes: number;
  training_intensity: number;
  sleep_hours: number;
  sleep_quality: number;
  soreness_level: number;
  energy_level: number;
  mood: number;
  stress_level: number;
  notes: string;
}

const defaultCheckin: CheckinData = {
  training_completed: false,
  training_type: "",
  training_duration_minutes: 60,
  training_intensity: 5,
  sleep_hours: 8,
  sleep_quality: 3,
  soreness_level: 3,
  energy_level: 3,
  mood: 3,
  stress_level: 3,
  notes: "",
};

const Checkin = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkin, setCheckin] = useState<CheckinData>(defaultCheckin);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [weekData, setWeekData] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/auth");
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchCheckin();
      fetchWeekData();
    }
  }, [user, selectedDate]);

  const fetchCheckin = async () => {
    try {
      const { data, error } = await supabase
        .from('athlete_checkins')
        .select('*')
        .eq('checkin_date', selectedDate)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setExistingId(data.id);
        setCheckin({
          training_completed: data.training_completed ?? false,
          training_type: data.training_type ?? "",
          training_duration_minutes: data.training_duration_minutes ?? 60,
          training_intensity: data.training_intensity ?? 5,
          sleep_hours: data.sleep_hours ?? 8,
          sleep_quality: data.sleep_quality ?? 3,
          soreness_level: data.soreness_level ?? 3,
          energy_level: data.energy_level ?? 3,
          mood: data.mood ?? 3,
          stress_level: data.stress_level ?? 3,
          notes: data.notes ?? "",
        });
      } else {
        setExistingId(null);
        setCheckin(defaultCheckin);
      }
    } catch (error) {
      console.error('Error fetching checkin:', error);
    }
  };

  const fetchWeekData = async () => {
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - 6);
    
    try {
      const { data, error } = await supabase
        .from('athlete_checkins')
        .select('checkin_date, mood, energy_level, training_completed')
        .gte('checkin_date', startDate.toISOString().split('T')[0])
        .lte('checkin_date', selectedDate)
        .order('checkin_date', { ascending: true });

      if (error) throw error;
      setWeekData(data || []);
    } catch (error) {
      console.error('Error fetching week data:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const checkinData = {
        user_id: user.id,
        checkin_date: selectedDate,
        ...checkin,
      };

      if (existingId) {
        const { error } = await supabase
          .from('athlete_checkins')
          .update(checkinData)
          .eq('id', existingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('athlete_checkins')
          .insert(checkinData);
        if (error) throw error;
      }

      toast({
        title: "Check-in saved!",
        description: "Your daily check-in has been recorded.",
      });
      
      fetchCheckin();
      fetchWeekData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    if (date <= new Date()) {
      setSelectedDate(date.toISOString().split('T')[0]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const RatingSelector = ({ 
    value, 
    onChange, 
    labels,
    icon: Icon 
  }: { 
    value: number; 
    onChange: (v: number) => void;
    labels: string[];
    icon: any;
  }) => (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            value === n 
              ? 'bg-accent text-accent-foreground scale-110' 
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
          }`}
        >
          {n}
        </button>
      ))}
      <span className="text-sm text-muted-foreground ml-2">
        {labels[value - 1]}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header with Date Navigation */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-display text-foreground mb-1">
                  DAILY CHECK-IN
                </h1>
                <p className="text-muted-foreground">Track your progress & recovery</p>
              </div>
            </div>

            {/* Date Selector */}
            <div className="flex items-center justify-center gap-4 py-4">
              <Button variant="ghost" size="sm" onClick={() => changeDate(-1)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl">
                <Calendar className="w-5 h-5 text-accent" />
                <span className="font-medium text-foreground">{formatDate(selectedDate)}</span>
                {isToday && (
                  <span className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">Today</span>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => changeDate(1)}
                disabled={isToday}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Week Overview */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Last 7 Days</h3>
              <div className="flex gap-2 justify-between">
                {Array.from({ length: 7 }).map((_, i) => {
                  const date = new Date(selectedDate);
                  date.setDate(date.getDate() - 6 + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const dayData = weekData.find(d => d.checkin_date === dateStr);
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex-1 p-2 rounded-xl text-center transition-all ${
                        dateStr === selectedDate 
                          ? 'bg-accent text-accent-foreground' 
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      <div className="text-xs text-inherit opacity-70">
                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className="text-lg font-display">{date.getDate()}</div>
                      {dayData && (
                        <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                          dayData.training_completed ? 'bg-green-500' : 'bg-muted'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Training Section */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-display text-foreground">Training</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Did you train today?</span>
                  <div className="flex gap-2">
                    <Button
                      variant={checkin.training_completed ? "vault" : "outline"}
                      size="sm"
                      onClick={() => setCheckin({ ...checkin, training_completed: true })}
                    >
                      <Check className="w-4 h-4 mr-1" /> Yes
                    </Button>
                    <Button
                      variant={!checkin.training_completed ? "vault" : "outline"}
                      size="sm"
                      onClick={() => setCheckin({ ...checkin, training_completed: false })}
                    >
                      Rest Day
                    </Button>
                  </div>
                </div>

                {checkin.training_completed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Training Type</label>
                      <div className="flex flex-wrap gap-2">
                        {TRAINING_TYPES.filter(t => t !== "Rest Day").map((type) => (
                          <button
                            key={type}
                            onClick={() => setCheckin({ ...checkin, training_type: type })}
                            className={`px-3 py-2 rounded-lg text-sm transition-all ${
                              checkin.training_type === type
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-secondary text-foreground hover:bg-secondary/80'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Duration (minutes)</label>
                        <input
                          type="number"
                          value={checkin.training_duration_minutes}
                          onChange={(e) => setCheckin({ ...checkin, training_duration_minutes: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground"
                          min="0"
                          max="480"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Intensity (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={checkin.training_intensity}
                          onChange={(e) => setCheckin({ ...checkin, training_intensity: parseInt(e.target.value) })}
                          className="w-full accent-accent"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Light</span>
                          <span className="font-medium text-foreground">{checkin.training_intensity}</span>
                          <span>Max Effort</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Recovery Section */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-display text-foreground">Recovery</h2>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Hours of Sleep</label>
                    <input
                      type="number"
                      step="0.5"
                      value={checkin.sleep_hours}
                      onChange={(e) => setCheckin({ ...checkin, sleep_hours: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground"
                      min="0"
                      max="24"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-3 block">Sleep Quality</label>
                    <RatingSelector
                      value={checkin.sleep_quality}
                      onChange={(v) => setCheckin({ ...checkin, sleep_quality: v })}
                      labels={["Poor", "Fair", "Good", "Great", "Excellent"]}
                      icon={Moon}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-3 block">Soreness Level</label>
                  <RatingSelector
                    value={checkin.soreness_level}
                    onChange={(v) => setCheckin({ ...checkin, soreness_level: v })}
                    labels={["None", "Mild", "Moderate", "Sore", "Very Sore"]}
                    icon={Activity}
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-3 block">Energy Level</label>
                  <RatingSelector
                    value={checkin.energy_level}
                    onChange={(v) => setCheckin({ ...checkin, energy_level: v })}
                    labels={["Exhausted", "Tired", "Normal", "Energized", "Peak"]}
                    icon={Zap}
                  />
                </div>
              </div>
            </div>

            {/* Wellness Section */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-display text-foreground">Wellness</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-3 block">Mood</label>
                  <RatingSelector
                    value={checkin.mood}
                    onChange={(v) => setCheckin({ ...checkin, mood: v })}
                    labels={["Low", "Down", "Neutral", "Good", "Great"]}
                    icon={Heart}
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-3 block">Stress Level</label>
                  <RatingSelector
                    value={checkin.stress_level}
                    onChange={(v) => setCheckin({ ...checkin, stress_level: v })}
                    labels={["None", "Low", "Moderate", "High", "Very High"]}
                    icon={Brain}
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Notes (optional)</label>
                  <textarea
                    value={checkin.notes}
                    onChange={(e) => setCheckin({ ...checkin, notes: e.target.value })}
                    placeholder="How are you feeling? Any observations?"
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              variant="vault"
              size="lg"
              className="w-full"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Check className="w-5 h-5 mr-2" />
              )}
              {existingId ? "Update Check-in" : "Save Check-in"}
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkin;
