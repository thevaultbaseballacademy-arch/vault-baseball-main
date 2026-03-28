import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CalendarDays, Clock, User, CheckCircle2, ArrowRight,
  Loader2, ChevronLeft
} from "lucide-react";
import { format, isBefore, startOfDay, isToday } from "date-fns";

const SESSION_TYPES = [
  { value: "private_lesson", label: "Private Lesson", duration: 60, description: "1-on-1 focused softball development session" },
  { value: "athlete_evaluation", label: "Athlete Evaluation", duration: 45, description: "Full softball assessment with development plan" },
  { value: "remote_session", label: "Remote Development Session", duration: 45, description: "Virtual softball coaching via video call" },
];

const SOFTBALL_POSITIONS = [
  "Pitcher", "Catcher", "1B", "2B", "SS", "3B", "OF", "DP/Flex", "Utility"
];

const TIME_SLOTS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
];

const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface CoachOption {
  user_id: string;
  name: string;
}

type Step = "coach" | "datetime" | "form" | "confirm";

const SoftballLessonBooking = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("coach");
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);

  const [selectedCoach, setSelectedCoach] = useState<CoachOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType, setSessionType] = useState("private_lesson");
  const [athleteName, setAthleteName] = useState("");
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [athleteAge, setAthleteAge] = useState("");
  const [position, setPosition] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [coachAvailability, setCoachAvailability] = useState<any[]>([]);

  // Fetch softball coaches only
  useEffect(() => {
    const fetchCoaches = async () => {
      setLoadingCoaches(true);
      const { data: coachRecords } = await supabase
        .from("coaches")
        .select("user_id, name, specialties")
        .eq("status", "Active")
        .not("user_id", "is", null);

      if (coachRecords) {
        const softballCoaches = coachRecords.filter(c => {
          const specs = (c.specialties || []).map((s: string) => s.toLowerCase());
          return specs.some((s: string) =>
            s.includes("softball") || s.includes("fastpitch") ||
            s.includes("windmill") || s.includes("slap")
          );
        });

        const mapped: CoachOption[] = softballCoaches.map(c => ({
          user_id: c.user_id!,
          name: c.name,
        }));
        setCoaches(mapped);
      }
      setLoadingCoaches(false);
    };
    fetchCoaches();
  }, []);

  // Fetch coach availability
  useEffect(() => {
    if (!selectedCoach) return;
    const fetchAvailability = async () => {
      const { data } = await supabase
        .from("coach_availability")
        .select("*")
        .eq("coach_user_id", selectedCoach.user_id)
        .eq("is_active", true);
      setCoachAvailability(data || []);
    };
    fetchAvailability();
  }, [selectedCoach]);

  const availableDays = useMemo(() => {
    const days = new Set<number>();
    coachAvailability.forEach(a => days.add(a.day_of_week));
    return days;
  }, [coachAvailability]);

  const hasCoachAvailability = coachAvailability.length > 0;

  const availableDayLabel = useMemo(() => {
    return Array.from(availableDays).sort().map(d => WEEKDAY_LABELS[d]).join(", ");
  }, [availableDays]);

  // Fetch booked slots for selected date
  const fetchBookedSlots = async () => {
    if (!selectedCoach || !selectedDate) return;
    setLoadingAvailability(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const { data } = await supabase
      .from("session_bookings")
      .select("session_time")
      .eq("coach_user_id", selectedCoach.user_id)
      .eq("session_date", dateStr)
      .in("status", ["pending", "confirmed"]);
    setBookedSlots((data || []).map(d => d.session_time));
    setLoadingAvailability(false);
  };

  useEffect(() => {
    fetchBookedSlots();
  }, [selectedDate, selectedCoach]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    const dayAvailability = coachAvailability.filter(a => a.day_of_week === dayOfWeek);

    let slots = TIME_SLOTS;
    if (dayAvailability.length > 0) {
      slots = TIME_SLOTS.filter(slot => {
        const [hourStr, period] = slot.split(" ");
        let hour = parseInt(hourStr.split(":")[0]);
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;
        const slotTime = `${hour.toString().padStart(2, "0")}:00`;
        return dayAvailability.some((a: any) => slotTime >= a.start_time && slotTime < a.end_time);
      });
    }

    if (isToday(selectedDate)) {
      const now = new Date();
      slots = slots.filter(slot => {
        const [hourStr, period] = slot.split(" ");
        let hour = parseInt(hourStr.split(":")[0]);
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;
        return hour > now.getHours();
      });
    }

    return slots.filter(slot => !bookedSlots.includes(slot));
  }, [selectedDate, bookedSlots, coachAvailability]);

  // Pre-fill user info
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setEmail(session.user.email || "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", session.user.id)
          .single();
        if (profile?.display_name) setAthleteName(profile.display_name);
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async () => {
    if (!selectedCoach || !selectedDate || !selectedTime || !athleteName || !email) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("session_bookings").insert({
      coach_user_id: selectedCoach.user_id,
      coach_name: selectedCoach.name,
      athlete_name: athleteName,
      parent_name: parentName || null,
      email,
      phone: phone || null,
      athlete_age: athleteAge ? parseInt(athleteAge) : null,
      primary_position: position || null,
      session_type: sessionType,
      session_date: format(selectedDate, "yyyy-MM-dd"),
      session_time: selectedTime,
      duration_minutes: SESSION_TYPES.find(s => s.value === sessionType)?.duration || 60,
      sport_type: "softball",
    } as any);

    setSubmitting(false);
    if (error) {
      if (error.message?.includes("duplicate") || error.code === "23505") {
        toast({ title: "Slot already taken", description: "Please choose another time.", variant: "destructive" });
        fetchBookedSlots();
        setSelectedTime("");
        setStep("datetime");
      } else {
        toast({ title: "Booking failed", description: error.message, variant: "destructive" });
      }
    } else {
      setStep("confirm");
      toast({ title: "Softball session booked!" });
    }
  };

  const selectedSessionType = SESSION_TYPES.find(s => s.value === sessionType);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <p className="text-xs font-display tracking-[0.3em] text-muted-foreground mb-2">VAULT SOFTBALL</p>
            <h1 className="text-3xl md:text-4xl font-display tracking-tight text-foreground">
              BOOK A SOFTBALL SESSION
            </h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xl">
              Connect with a certified Vault softball coach for private lessons, evaluations, or remote development sessions.
            </p>
          </motion.div>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-8 text-xs font-display tracking-[0.15em]">
            {(["coach", "datetime", "form", "confirm"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span className={step === s ? "text-foreground" : "text-muted-foreground"}>
                  {["COACH", "DATE/TIME", "DETAILS", "CONFIRMED"][i]}
                </span>
                {i < 3 && <ArrowRight className="w-3 h-3 text-muted-foreground/40" />}
              </div>
            ))}
          </div>

          {/* STEP 1: Session Type + Coach */}
          {step === "coach" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div>
                <h2 className="text-xs font-display tracking-[0.2em] text-muted-foreground mb-4">SESSION TYPE</h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {SESSION_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setSessionType(type.value)}
                      className={`border p-4 text-left transition-colors ${
                        sessionType === type.value
                          ? "border-foreground bg-foreground/5"
                          : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <p className="font-display text-sm text-foreground">{type.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">{type.duration} min</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xs font-display tracking-[0.2em] text-muted-foreground mb-4">SELECT SOFTBALL COACH</h2>
                {loadingCoaches ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : coaches.length === 0 ? (
                  <Card className="border-border"><CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No softball coaches currently available. Check back soon.</p>
                  </CardContent></Card>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {coaches.map(coach => (
                      <button
                        key={coach.user_id}
                        onClick={() => {
                          setSelectedCoach(coach);
                          setSelectedDate(undefined);
                          setSelectedTime("");
                          setBookedSlots([]);
                          setStep("datetime");
                        }}
                        className="border border-border p-5 text-left hover:border-foreground/30 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-foreground/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-foreground/50" />
                            </div>
                            <div>
                              <p className="font-display text-foreground">{coach.name}</p>
                              <p className="text-xs text-muted-foreground">Softball Coach</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Date & Time */}
          {step === "datetime" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Button variant="ghost" size="sm" onClick={() => setStep("coach")} className="text-muted-foreground mb-2">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-foreground/10 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-display text-sm">{selectedCoach?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedSessionType?.label} · {selectedSessionType?.duration} min</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xs font-display tracking-[0.2em] text-muted-foreground mb-3">SELECT DATE</h2>
                  <Card className="border-border">
                    <CardContent className="p-3">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => { setSelectedDate(date); setSelectedTime(""); }}
                        disabled={(date) => {
                          const isPast = isBefore(date, startOfDay(new Date())) && !isToday(date);
                          const isUnavailable = hasCoachAvailability && !availableDays.has(date.getDay());
                          return isPast || isUnavailable;
                        }}
                        className="pointer-events-auto"
                      />
                    </CardContent>
                  </Card>
                  {hasCoachAvailability && (
                    <p className="text-xs text-muted-foreground mt-2">Availability: {availableDayLabel}</p>
                  )}
                </div>

                <div>
                  <h2 className="text-xs font-display tracking-[0.2em] text-muted-foreground mb-3">
                    {selectedDate
                      ? `AVAILABLE TIMES — ${format(selectedDate, "MMM d")}`
                      : "SELECT A DATE FIRST"}
                  </h2>
                  {selectedDate ? (
                    loadingAvailability ? (
                      <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
                    ) : availableTimeSlots.length === 0 ? (
                      <Card className="border-border"><CardContent className="py-8 text-center">
                        <p className="text-muted-foreground text-sm">No available times for this date.</p>
                      </CardContent></Card>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {availableTimeSlots.map(time => (
                          <button
                            key={time}
                            onClick={() => { setSelectedTime(time); setStep("form"); }}
                            className={`border p-3 text-sm font-display transition-colors ${
                              selectedTime === time
                                ? "border-foreground bg-foreground/5"
                                : "border-border hover:border-foreground/30"
                            }`}
                          >
                            <Clock className="w-3 h-3 inline mr-1" />{time}
                          </button>
                        ))}
                      </div>
                    )
                  ) : (
                    <Card className="border-border"><CardContent className="py-8 text-center">
                      <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Pick a date to see times.</p>
                    </CardContent></Card>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Lead Capture */}
          {step === "form" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-lg">
              <Button variant="ghost" size="sm" onClick={() => setStep("datetime")} className="text-muted-foreground mb-2">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>

              <div className="p-4 border border-border bg-card mb-4">
                <p className="text-xs text-muted-foreground font-display tracking-[0.15em]">BOOKING SUMMARY</p>
                <p className="font-display text-sm mt-1">{selectedCoach?.name} · {selectedSessionType?.label}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-display tracking-[0.15em] text-muted-foreground">ATHLETE NAME *</label>
                  <Input value={athleteName} onChange={e => setAthleteName(e.target.value)} placeholder="Full name" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-display tracking-[0.15em] text-muted-foreground">PARENT/GUARDIAN NAME</label>
                  <Input value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Optional" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-display tracking-[0.15em] text-muted-foreground">EMAIL *</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-display tracking-[0.15em] text-muted-foreground">PHONE</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Optional" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-display tracking-[0.15em] text-muted-foreground">AGE</label>
                    <Input type="number" value={athleteAge} onChange={e => setAthleteAge(e.target.value)} placeholder="Age" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-display tracking-[0.15em] text-muted-foreground">POSITION</label>
                    <Select value={position} onValueChange={setPosition}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {SOFTBALL_POSITIONS.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                className="w-full font-display tracking-[0.1em]"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                CONFIRM SOFTBALL SESSION
              </Button>
            </motion.div>
          )}

          {/* STEP 4: Confirmation */}
          {step === "confirm" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 max-w-md mx-auto">
              <div className="w-16 h-16 bg-foreground/5 border border-border flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-foreground" />
              </div>
              <h2 className="text-2xl font-display tracking-tight text-foreground mb-2">SESSION CONFIRMED</h2>
              <p className="text-muted-foreground text-sm mb-1">
                {selectedCoach?.name} · {selectedSessionType?.label}
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
              </p>
              <p className="text-xs text-muted-foreground mb-8">
                A confirmation will be sent to {email}. When it's time, join from your dashboard — same live video system used across all Vault sessions.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate("/softball")}>Back to Softball</Button>
                <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default SoftballLessonBooking;
