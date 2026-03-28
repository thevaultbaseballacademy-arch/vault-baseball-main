import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Download, FileText, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParentPortal } from "@/hooks/useParentPortal";
import jsPDF from "jspdf";
import { format } from "date-fns";

const ParentDownloads = () => {
  const [searchParams] = useSearchParams();
  const athleteId = searchParams.get("athlete");
  const { activeLinks, fetchAthleteData, athleteData } = useParentPortal();
  const [generatingProgress, setGeneratingProgress] = useState(false);
  const [generatingLessons, setGeneratingLessons] = useState(false);

  const selectedLink = athleteId
    ? activeLinks.find((l) => l.athlete_user_id === athleteId)
    : activeLinks[0];
  const currentAthleteId = selectedLink?.athlete_user_id;

  useEffect(() => {
    if (currentAthleteId && !athleteData[currentAthleteId]) fetchAthleteData(currentAthleteId);
  }, [currentAthleteId]);

  const data = currentAthleteId ? athleteData[currentAthleteId] : null;
  const profile = data?.profile;
  const dev = data?.development_score;
  const lessons = data?.recent_lessons || [];
  const lastName = (profile?.display_name || "Athlete").split(" ").pop() || "Athlete";
  const dateStr = format(new Date(), "yyyy-MM-dd");

  const downloadProgressPDF = async () => {
    setGeneratingProgress(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Development Progress Report", 20, 25);
      doc.setFontSize(11);
      doc.text(`Athlete: ${profile?.display_name || "—"}`, 20, 35);
      doc.text(`Position: ${profile?.position || "—"}`, 20, 42);
      doc.text(`Sport: ${profile?.sport_type === "softball" ? "Softball" : "Baseball"}`, 20, 49);
      doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, 20, 56);

      if (dev) {
        doc.setFontSize(14);
        doc.text("Readiness Scores", 20, 72);
        doc.setFontSize(10);
        doc.text(`Overall Score: ${dev.overall_score}/100`, 25, 82);
        doc.text(`Training Consistency: ${dev.training_consistency}%`, 25, 89);
        doc.text(`Skill Development: ${dev.skill_development}%`, 25, 96);
        doc.text(`Work Ethic: ${dev.work_ethic}%`, 25, 103);
        doc.text(`Lessons Attended: ${dev.lessons_attended}`, 25, 110);
        doc.text(`Lessons Missed: ${dev.lessons_missed}`, 25, 117);
        doc.text(`Homework Completed: ${dev.homework_completed}/${dev.homework_total}`, 25, 124);
        if (dev.weekly_focus) {
          doc.text(`This Week's Focus: ${dev.weekly_focus}`, 25, 131);
        }
        if (dev.strengths_summary?.length) {
          doc.text(`Strengths: ${dev.strengths_summary.join(", ")}`, 25, 138);
        }
        if (dev.top_priorities?.length) {
          doc.text(`Priorities: ${dev.top_priorities.join(", ")}`, 25, 145);
        }
      }

      doc.save(`Vault_${lastName}_DevelopmentReport_${dateStr}.pdf`);
    } finally {
      setGeneratingProgress(false);
    }
  };

  const downloadLessonsPDF = async () => {
    setGeneratingLessons(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Lesson Summary History", 20, 25);
      doc.setFontSize(11);
      doc.text(`Athlete: ${profile?.display_name || "—"}`, 20, 35);
      doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, 20, 42);

      let y = 58;
      if (lessons.length === 0) {
        doc.text("No lesson summaries available yet.", 20, y);
      } else {
        for (const lesson of lessons) {
          if (y > 260) { doc.addPage(); y = 20; }
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          const dateLabel = format(new Date(lesson.created_at), "MMM d, yyyy");
          doc.text(`${dateLabel} — ${lesson.lesson_focus || "Training Session"}`, 20, y);
          y += 7;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          if (lesson.ai_summary) {
            const lines = doc.splitTextToSize(`Summary: ${lesson.ai_summary}`, 170);
            doc.text(lines, 25, y);
            y += lines.length * 4.5;
          }
          if (lesson.strengths_observed) {
            const lines = doc.splitTextToSize(`Strengths: ${lesson.strengths_observed}`, 170);
            doc.text(lines, 25, y);
            y += lines.length * 4.5;
          }
          if (lesson.areas_for_improvement) {
            const lines = doc.splitTextToSize(`Working On: ${lesson.areas_for_improvement}`, 170);
            doc.text(lines, 25, y);
            y += lines.length * 4.5;
          }
          y += 6;
        }
      }

      doc.save(`Vault_${lastName}_LessonSummaries_${dateStr}.pdf`);
    } finally {
      setGeneratingLessons(false);
    }
  };

  if (!currentAthleteId) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <Download className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Link an athlete to access downloads.</p>
        <Link to="/parent" className="text-primary text-sm hover:underline mt-2 inline-block">Go to My Athletes</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Download className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">DOWNLOADS</h1>
          <p className="text-sm text-muted-foreground">{profile?.display_name}'s reports</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-display text-foreground">Progress Report</h3>
              <p className="text-xs text-muted-foreground">Development scores, readiness, and priorities</p>
            </div>
          </div>
          <Button onClick={downloadProgressPDF} disabled={generatingProgress || !dev} className="w-full">
            {generatingProgress ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Download className="w-4 h-4 mr-2" /> Download PDF</>}
          </Button>
          {!dev && <p className="text-xs text-muted-foreground text-center">No development data available yet.</p>}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="font-display text-foreground">Lesson Summaries</h3>
              <p className="text-xs text-muted-foreground">All post-lesson coach feedback</p>
            </div>
          </div>
          <Button onClick={downloadLessonsPDF} disabled={generatingLessons || lessons.length === 0} className="w-full">
            {generatingLessons ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Download className="w-4 h-4 mr-2" /> Download PDF</>}
          </Button>
          {lessons.length === 0 && <p className="text-xs text-muted-foreground text-center">No lesson summaries yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default ParentDownloads;
