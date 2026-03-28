import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Video, Users, Calendar, Clock, FileText, MessageSquare,
  CheckCircle2, BookOpen, TrendingUp, Loader2, Send, Eye, Camera, Mic, MicOff, VideoOff, SwitchCamera, CalendarPlus, Brain, ChevronDown, ChevronUp, Phone
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { LessonFeedbackForm } from "@/components/coach/LessonFeedbackForm";
import { useToast } from "@/hooks/use-toast";
import LiveVideoCall from "@/components/coaching/LiveVideoCall";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

interface Lesson {
  id: string;
  athlete_user_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  coach_notes: string | null;
  video_call_link: string | null;
  athlete_name?: string;
  ai_recap?: string | null;
  ai_homework?: string | null;
  recap_generated_at?: string | null;
}

interface GroupSessionRow {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  max_participants: number;
  status: string;
  focus_area: string | null;
  video_call_link: string | null;
  enrolled_count: number;
}

interface CourseProgressRow {
  user_id: string;
  course_id: string;
  progress_percent: number;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  athlete_name?: string;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-yellow-500/10 text-yellow-600",
  confirmed: "bg-blue-500/10 text-blue-600",
  completed: "bg-green-500/10 text-green-600",
  cancelled: "bg-destructive/10 text-destructive",
};
function downloadLessonICS(lesson: Lesson) {
  const start = new Date(lesson.scheduled_at);
  const end = new Date(start.getTime() + lesson.duration_minutes * 60000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Vault Baseball//Lessons//EN",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:Vault Lesson - ${lesson.athlete_name || "Athlete"}`,
    `DESCRIPTION:${lesson.notes || "Remote coaching session"}${lesson.video_call_link ? "\\nJoin: " + lesson.video_call_link : ""}`,
    lesson.video_call_link ? `URL:${lesson.video_call_link}` : "",
    `UID:${lesson.id}@vault-baseball.com`, "STATUS:CONFIRMED",
    "BEGIN:VALARM", "TRIGGER:-PT15M", "ACTION:DISPLAY", "DESCRIPTION:Vault lesson in 15 minutes", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vault-lesson-${start.toISOString().split("T")[0]}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export const CoachLessonMonitor = ({ coachUserId }: { coachUserId: string }) => {
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [groupSessions, setGroupSessions] = useState<GroupSessionRow[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgressRow[]>([]);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [coachNotes, setCoachNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cameraTestOpen, setCameraTestOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraMuted, setCameraMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [generatingRecap, setGeneratingRecap] = useState<string | null>(null);
  const [expandedRecap, setExpandedRecap] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startCameraTest = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setCameraStream(stream);
      setCameraMuted(false);
      setCameraOff(false);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({ title: "Camera error", description: "Could not access camera/microphone. Check permissions.", variant: "destructive" });
    }
  }, [facingMode, toast]);

  const stopCameraTest = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  const handleCameraTestOpen = async () => {
    setCameraTestOpen(true);
    // Start after dialog renders
    setTimeout(() => startCameraTest(), 300);
  };

  const handleCameraTestClose = () => {
    stopCameraTest();
    setCameraTestOpen(false);
  };

  const toggleCameraMute = () => {
    if (cameraStream) {
      cameraStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      setCameraMuted(m => !m);
    }
  };

  const toggleCameraVideo = () => {
    if (cameraStream) {
      cameraStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      setCameraOff(v => !v);
    }
  };

  const switchCameraFacing = async () => {
    stopCameraTest();
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setCameraStream(stream);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({ title: "Camera switch failed", variant: "destructive" });
    }
  };

  // Attach stream to video element when ref or stream changes
  useEffect(() => {
    if (cameraVideoRef.current && cameraStream) {
      cameraVideoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, cameraTestOpen]);

  useEffect(() => {
    if (coachUserId) fetchAll();
  }, [coachUserId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.allSettled([fetchLessons(), fetchGroupSessions(), fetchCourseProgress()]);
    } catch (err) {
      console.error("Error in fetchAll:", err);
    }
    setLoading(false);
  };

  const fetchLessons = async () => {
    console.log("[CoachLessonMonitor] Fetching lessons for coach:", coachUserId);
    const { data, error } = await supabase
      .from("remote_lessons")
      .select("*")
      .eq("coach_user_id", coachUserId)
      .order("scheduled_at", { ascending: false });

    console.log("[CoachLessonMonitor] Result:", { data, error, count: data?.length });

    if (error) {
      console.error("Error fetching coach lessons:", error);
      setLessons([]);
      return;
    }

    if (!data?.length) { setLessons([]); return; }

    const athleteIds = [...new Set(data.map((l: any) => l.athlete_user_id))];
    const { data: profiles } = await supabase.rpc("get_public_profiles_by_ids", { user_ids: athleteIds });
    const nameMap = new Map((profiles || []).map((p: any) => [p.user_id, p.display_name]));

    setLessons(data.map((l: any) => ({
      ...l,
      athlete_name: nameMap.get(l.athlete_user_id) || "Athlete",
    })));
  };

  const fetchGroupSessions = async () => {
    const { data: sessionsData, error: sessionsError } = await supabase
      .from("group_sessions")
      .select("*")
      .eq("coach_user_id", coachUserId)
      .order("scheduled_at", { ascending: false });

    if (sessionsError) {
      console.error("Error fetching group sessions:", sessionsError);
      setGroupSessions([]);
      return;
    }

    if (!sessionsData?.length) { setGroupSessions([]); return; }

    const { data: enrollments } = await supabase
      .from("group_session_enrollments")
      .select("session_id");

    const countMap = new Map<string, number>();
    (enrollments || []).forEach((e: any) => {
      countMap.set(e.session_id, (countMap.get(e.session_id) || 0) + 1);
    });

    setGroupSessions((sessionsData as any[]).map((s: any) => ({
      ...s,
      enrolled_count: countMap.get(s.id) || 0,
    })));
  };

  const fetchCourseProgress = async () => {
    // Get assigned athletes
    const { data: assignments } = await supabase
      .from("coach_athlete_assignments")
      .select("athlete_user_id")
      .eq("coach_user_id", coachUserId)
      .eq("is_active", true)
      .eq("athlete_approved", true);

    const athleteIds = assignments?.map((a) => a.athlete_user_id) || [];
    if (!athleteIds.length) { setCourseProgress([]); return; }

    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select("*")
      .in("user_id", athleteIds)
      .order("enrolled_at", { ascending: false });

    if (!enrollments?.length) { setCourseProgress([]); return; }

    const { data: profiles } = await supabase.rpc("get_public_profiles_by_ids", { user_ids: athleteIds });
    const nameMap = new Map((profiles || []).map((p: any) => [p.user_id, p.display_name]));

    setCourseProgress(enrollments.map((e) => ({
      ...e,
      athlete_name: nameMap.get(e.user_id) || "Athlete",
    })));
  };

  const handleSaveNotes = async (lessonId: string) => {
    await (supabase.from("remote_lessons" as any) as any)
      .update({ coach_notes: coachNotes })
      .eq("id", lessonId);
    toast({ title: "Notes saved" });
    setEditingNotes(null);
    setCoachNotes("");
    fetchLessons();
  };

  const handleUpdateStatus = async (lessonId: string, newStatus: string) => {
    await (supabase.from("remote_lessons" as any) as any)
      .update({ status: newStatus })
      .eq("id", lessonId);
    toast({ title: `Lesson marked as ${newStatus}` });
    fetchLessons();
  };

  const handleGenerateRecap = async (lessonId: string) => {
    setGeneratingRecap(lessonId);
    try {
      const { data, error } = await supabase.functions.invoke("lesson-recap", {
        body: { lessonId },
      });
      if (error) throw error;
      toast({ title: "Recap generated!", description: "AI recap and homework are ready." });
      setExpandedRecap(lessonId);
      fetchLessons();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to generate recap", variant: "destructive" });
    } finally {
      setGeneratingRecap(null);
    }
  };
  const handleGroupStatus = async (sessionId: string, newStatus: string) => {
    await (supabase.from("group_sessions" as any) as any)
      .update({ status: newStatus })
      .eq("id", sessionId);
    toast({ title: `Session marked as ${newStatus}` });
    fetchGroupSessions();
  };

  const filteredLessons = statusFilter === "all"
    ? lessons
    : lessons.filter((l) => l.status === statusFilter);

  const upcomingLessons = lessons.filter((l) => l.status !== "cancelled" && l.status !== "completed" && new Date(l.scheduled_at) >= new Date());
  const completedLessons = lessons.filter((l) => l.status === "completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const exportScheduleCSV = () => {
    const upcoming = lessons.filter(l => l.status !== "cancelled" && new Date(l.scheduled_at) >= new Date());
    if (upcoming.length === 0) {
      toast({ title: "No upcoming lessons to export", variant: "destructive" });
      return;
    }
    const header = "Date,Time,Athlete,Duration (min),Status,Notes\n";
    const rows = upcoming.map(l => {
      const d = new Date(l.scheduled_at);
      return `"${d.toLocaleDateString()}","${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}","${l.athlete_name || ""}",${l.duration_minutes},"${l.status}","${(l.notes || "").replace(/"/g, '""')}"`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vault-schedule-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Schedule exported as CSV" });
  };

  return (
    <div className="space-y-6">
      {/* Header with Camera Test & Export */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-display text-xl text-foreground">LESSONS & MONITORING</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportScheduleCSV} className="gap-2">
            <FileText className="w-4 h-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleCameraTestOpen} className="gap-2">
            <Camera className="w-4 h-4" /> Test Camera
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Total Lessons</span>
            </div>
            <p className="text-2xl font-display text-foreground">{lessons.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Upcoming</span>
            </div>
            <p className="text-2xl font-display text-foreground">{upcomingLessons.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-display text-foreground">{completedLessons.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Group Sessions</span>
            </div>
            <p className="text-2xl font-display text-foreground">{groupSessions.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lessons" className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="lessons">1-on-1 Lessons</TabsTrigger>
          <TabsTrigger value="groups">Group Sessions</TabsTrigger>
          <TabsTrigger value="courses">Course Progress</TabsTrigger>
        </TabsList>

        {/* 1-on-1 Lessons Tab */}
        <TabsContent value="lessons" className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-card border-border">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{filteredLessons.length} lessons</span>
          </div>

          {filteredLessons.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-display text-foreground mb-2">No Lessons Yet</h3>
                <p className="text-sm text-muted-foreground">When athletes book lessons with you, they'll appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLessons.map((lesson, idx) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-accent">
                              {lesson.athlete_name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{lesson.athlete_name}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(lesson.scheduled_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(lesson.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                              </span>
                              <span>{lesson.duration_minutes} min</span>
                            </div>
                            {lesson.notes && <p className="text-xs text-muted-foreground mt-1 italic">Athlete: "{lesson.notes}"</p>}
                            {lesson.coach_notes && (
                              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Coach notes: {lesson.coach_notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={statusColors[lesson.status] || "bg-muted text-muted-foreground"}>
                            {lesson.status}
                          </Badge>

                          {lesson.status !== "cancelled" && lesson.status !== "completed" && (
                            <Button
                              variant="vault"
                              size="sm"
                              onClick={() => setActiveLessonId(lesson.id)}
                              className="gap-1"
                            >
                              <Phone className="w-3 h-3" /> Start Lesson
                            </Button>
                          )}

                          {lesson.video_call_link && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={lesson.video_call_link} target="_blank" rel="noopener noreferrer">
                                <Video className="w-3 h-3 mr-1" /> External Link
                              </a>
                            </Button>
                          )}

                          <Button variant="outline" size="sm" onClick={() => downloadLessonICS(lesson)} title="Add to Calendar">
                            <CalendarPlus className="w-3 h-3" />
                          </Button>

                          <Button variant="outline" size="sm" onClick={() => { setEditingNotes(lesson.id); setCoachNotes(lesson.coach_notes || ""); }}>
                            <MessageSquare className="w-3 h-3 mr-1" /> Notes
                          </Button>

                          {lesson.status === "confirmed" && new Date(lesson.scheduled_at) < new Date() && (
                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(lesson.id, "completed")} className="text-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                            </Button>
                          )}

                          {lesson.status === "scheduled" && (
                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(lesson.id, "confirmed")} className="text-blue-600">
                              Confirm
                            </Button>
                          )}

                          {(lesson.status === "completed" || (lesson.status === "confirmed" && new Date(lesson.scheduled_at) < new Date())) && (
                            <>
                              <Button
                                variant={lesson.ai_recap ? "outline" : "vault"}
                                size="sm"
                                onClick={() => lesson.ai_recap ? setExpandedRecap(expandedRecap === lesson.id ? null : lesson.id) : handleGenerateRecap(lesson.id)}
                                disabled={generatingRecap === lesson.id}
                                className="gap-1"
                              >
                                {generatingRecap === lesson.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Brain className="w-3 h-3" />
                                )}
                                {lesson.ai_recap ? (expandedRecap === lesson.id ? "Hide Recap" : "View Recap") : "AI Recap"}
                              </Button>
                              <LessonFeedbackForm
                                lessonId={lesson.id}
                                athleteUserId={lesson.athlete_user_id}
                                athleteName={lesson.athlete_name || "Athlete"}
                                coachUserId={coachUserId}
                                onSubmitted={() => fetchLessons()}
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expanded AI Recap */}
                      {expandedRecap === lesson.id && lesson.ai_recap && (
                        <div className="mt-3 pt-3 border-t border-border space-y-3">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <h4 className="text-xs font-display text-primary mb-2 flex items-center gap-1">
                              <Brain className="w-3 h-3" /> SESSION RECAP
                            </h4>
                            <div className="prose prose-sm max-w-none text-foreground text-xs">
                              <ReactMarkdown>{lesson.ai_recap}</ReactMarkdown>
                            </div>
                          </div>
                          {lesson.ai_homework && (
                            <div className="bg-primary/5 rounded-lg p-3">
                              <h4 className="text-xs font-display text-primary mb-2 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> HOMEWORK & NEXT STEPS
                              </h4>
                              <div className="prose prose-sm max-w-none text-foreground text-xs">
                                <ReactMarkdown>{lesson.ai_homework}</ReactMarkdown>
                              </div>
                            </div>
                          )}
                          {!lesson.ai_recap && (
                            <Button
                              variant="vault"
                              size="sm"
                              onClick={() => handleGenerateRecap(lesson.id)}
                              disabled={generatingRecap === lesson.id}
                              className="w-full"
                            >
                              {generatingRecap === lesson.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
                              Regenerate AI Recap
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Group Sessions Tab */}
        <TabsContent value="groups" className="space-y-4">
          {groupSessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-display text-foreground mb-2">No Group Sessions</h3>
                <p className="text-sm text-muted-foreground">Create group sessions from the Group Sessions page.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {groupSessions.map((session, idx) => (
                <motion.div key={session.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground">{session.title}</h4>
                            {session.focus_area && (
                              <Badge variant="secondary" className="capitalize">{session.focus_area}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(session.scheduled_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(session.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </span>
                            <span>{session.duration_minutes} min</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {session.enrolled_count}/{session.max_participants}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[session.status] || "bg-muted text-muted-foreground"}>
                            {session.status}
                          </Badge>
                          {session.video_call_link && (
                            <Button variant="vault" size="sm" asChild>
                              <a href={session.video_call_link} target="_blank" rel="noopener noreferrer">
                                <Video className="w-3 h-3 mr-1" /> Join
                              </a>
                            </Button>
                          )}
                          {session.status === "scheduled" && new Date(session.scheduled_at) < new Date() && (
                            <Button variant="outline" size="sm" onClick={() => handleGroupStatus(session.id, "completed")} className="text-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Course Progress Monitoring */}
        <TabsContent value="courses" className="space-y-4">
          {courseProgress.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-display text-foreground mb-2">No Course Data</h3>
                <p className="text-sm text-muted-foreground">Assigned athletes' course enrollments will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {courseProgress.map((cp, idx) => (
                <motion.div key={`${cp.user_id}-${cp.course_id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{cp.athlete_name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{cp.course_id.replace(/-/g, " ")}</p>
                            <p className="text-xs text-muted-foreground">Enrolled {new Date(cp.enrolled_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <Progress value={cp.progress_percent} className="w-24 h-2" />
                            <span className={`text-sm font-medium ${cp.progress_percent >= 100 ? "text-green-500" : "text-foreground"}`}>
                              {cp.progress_percent}%
                            </span>
                          </div>
                          <Badge className={cp.status === "completed" ? "bg-green-500/10 text-green-600" : cp.status === "active" ? "bg-blue-500/10 text-blue-600" : "bg-muted text-muted-foreground"}>
                            {cp.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Coach Notes Dialog */}
      <Dialog open={!!editingNotes} onOpenChange={() => setEditingNotes(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Lesson Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Your notes about this lesson</Label>
              <Textarea
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                placeholder="Development observations, areas to improve, follow-up plans..."
                rows={4}
                className="mt-1"
              />
            </div>
            <Button variant="vault" className="w-full" onClick={() => editingNotes && handleSaveNotes(editingNotes)}>
              <Send className="w-4 h-4 mr-2" /> Save Notes
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Camera Test Dialog */}
      <Dialog open={cameraTestOpen} onOpenChange={(open) => { if (!open) handleCameraTestClose(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Camera className="w-5 h-5" /> Camera & Mic Test
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {cameraOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <VideoOff className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              {!cameraStream && !cameraOff && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button
                variant={cameraMuted ? "destructive" : "outline"}
                size="sm"
                onClick={toggleCameraMute}
                className="gap-2"
              >
                {cameraMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {cameraMuted ? "Unmute" : "Mute"}
              </Button>
              <Button
                variant={cameraOff ? "destructive" : "outline"}
                size="sm"
                onClick={toggleCameraVideo}
                className="gap-2"
              >
                {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                {cameraOff ? "Turn On" : "Turn Off"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={switchCameraFacing}
                className="gap-2"
              >
                <SwitchCamera className="w-4 h-4" /> Flip
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              If you can see yourself and hear audio feedback, your camera and mic are working correctly.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* In-App Live Lesson Video Call */}
      {activeLessonId && (
        <Dialog open={!!activeLessonId} onOpenChange={(open) => !open && setActiveLessonId(null)}>
          <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle className="font-display flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                LIVE LESSON
                {(() => {
                  const lesson = lessons.find(l => l.id === activeLessonId);
                  return lesson ? ` — ${lesson.athlete_name}` : '';
                })()}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 min-h-0 p-4 pt-2">
              <LiveVideoCall
                sessionId={activeLessonId}
                userId={coachUserId}
                isCoach={true}
                onEnd={() => {
                  setActiveLessonId(null);
                  fetchAll();
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CoachLessonMonitor;
