import { useState } from "react";
import { Download, FileText, Users, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  generateDevelopmentReport,
  generateRecruitingProfile,
  generateLessonHistoryPDF,
} from "@/lib/downloadReports";

const AthleteDownloads = () => {
  const [genDev, setGenDev] = useState(false);
  const [genRecruit, setGenRecruit] = useState(false);
  const [genLessons, setGenLessons] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
  });

  const { data: devScore } = useQuery({
    queryKey: ["my-dev-score", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("athlete_development_scores").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: kpis } = useQuery({
    queryKey: ["my-kpis", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("athlete_kpis").select("*").eq("user_id", user!.id).order("recorded_at", { ascending: false }).limit(100);
      return data || [];
    },
  });

  const { data: recruiting } = useQuery({
    queryKey: ["my-recruiting", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("recruiting_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: lessons } = useQuery({
    queryKey: ["my-lesson-feedback", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("coach_lesson_feedback").select("*").eq("athlete_user_id", user!.id).order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const { data: highlights } = useQuery({
    queryKey: ["my-highlights", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("highlight_videos").select("title, video_url").eq("user_id", user!.id).limit(20);
      return data || [];
    },
  });

  const { data: coachData } = useQuery({
    queryKey: ["my-coach-data", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: assignments } = await supabase.from("coach_athlete_assignments").select("coach_user_id").eq("athlete_user_id", user!.id).eq("is_active", true);
      if (!assignments?.length) return { name: null, map: new Map<string, string>() };
      const coachIds = assignments.map(a => a.coach_user_id);
      const { data: profiles } = await supabase.rpc("get_public_profiles_by_ids", { user_ids: coachIds });
      const map = new Map((profiles || []).map((p: any) => [p.user_id, p.display_name]));
      return { name: map.values().next().value || null, map };
    },
  });

  const coachName = coachData?.name || null;

  const handleDevReport = async () => {
    setGenDev(true);
    try {
      generateDevelopmentReport({
        displayName: profile?.display_name,
        sport: profile?.sport_type,
        position: profile?.position,
        graduationYear: profile?.graduation_year,
        coachName,
        dev: devScore,
        kpis: kpis as any,
        lessonCount: lessons?.length,
      });
      toast.success("Development report downloaded");
    } catch { toast.error("Failed to generate report"); }
    finally { setGenDev(false); }
  };

  const handleRecruitingProfile = async () => {
    setGenRecruit(true);
    try {
      generateRecruitingProfile({
        displayName: profile?.display_name,
        sport: profile?.sport_type,
        position: profile?.position,
        graduationYear: profile?.graduation_year,
        heightInches: profile?.height_inches,
        weightLbs: profile?.weight_lbs,
        throwingArm: profile?.throwing_arm,
        battingSide: profile?.batting_side,
        gpa: recruiting?.gpa != null ? String(recruiting.gpa) : null,
        satActScore: recruiting?.act_score != null ? String(recruiting.act_score) : null,
        intendedMajor: recruiting?.intended_major,
        divisionTarget: Array.isArray(recruiting?.division_target) ? recruiting.division_target.join(", ") : (recruiting?.division_target as string) || null,
        schoolInterestList: Array.isArray(recruiting?.school_interest_list) ? recruiting.school_interest_list as string[] : null,
        commitmentStatus: recruiting?.commitment_status,
        kpis: kpis?.slice(0, 20) as any,
        coachRecommendation: null,
        highlightClips: highlights as any,
      });
      toast.success("Recruiting profile downloaded");
    } catch { toast.error("Failed to generate profile"); }
    finally { setGenRecruit(false); }
  };

  const handleLessonHistory = async () => {
    setGenLessons(true);
    try {
      const rows = (lessons || []).map((l: any) => ({
        date: format(new Date(l.created_at), "MMM d, yyyy"),
        coach: coachData?.map?.get(l.coach_user_id) || "Coach",
        type: l.sport_type || "Training",
        sport: l.sport_type === "softball" ? "Softball" : "Baseball",
        skills: l.lesson_focus || "",
        notes: l.ai_summary || l.strengths_observed || "",
      }));
      generateLessonHistoryPDF(profile?.display_name || "Athlete", rows);
      toast.success("Lesson history downloaded");
    } catch { toast.error("Failed to generate lesson history"); }
    finally { setGenLessons(false); }
  };

  const cards = [
    {
      title: "Development Report",
      desc: "KPI scores, readiness, strengths, and development gaps",
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
      onClick: handleDevReport,
      loading: genDev,
      disabled: !profile,
    },
    {
      title: "Recruiting Profile",
      desc: "Stats, academics, highlights, and coach recommendations",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      onClick: handleRecruitingProfile,
      loading: genRecruit,
      disabled: !profile,
    },
    {
      title: "Lesson History",
      desc: "All lesson feedback, skills covered, and coach notes",
      icon: BookOpen,
      color: "text-green-500",
      bg: "bg-green-500/10",
      onClick: handleLessonHistory,
      loading: genLessons,
      disabled: !lessons?.length,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Download className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display tracking-wide">DOWNLOADS</h1>
          <p className="text-sm text-muted-foreground">Export your reports and data</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.title} className="overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <c.icon className={`w-5 h-5 ${c.color}`} />
                </div>
                <div>
                  <h3 className="font-display text-foreground text-sm">{c.title}</h3>
                  <p className="text-[11px] text-muted-foreground">{c.desc}</p>
                </div>
              </div>
              <Button onClick={c.onClick} disabled={c.loading || c.disabled} className="w-full" size="sm">
                {c.loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" /> Download PDF</>
                )}
              </Button>
              {c.disabled && !c.loading && (
                <p className="text-[10px] text-muted-foreground text-center">No data available yet</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AthleteDownloads;
