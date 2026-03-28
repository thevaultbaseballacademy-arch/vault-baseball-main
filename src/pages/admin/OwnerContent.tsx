import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FolderOpen, BookOpen, Target, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OwnerContent = () => {
  const navigate = useNavigate();

  const { data: submissionCounts } = useQuery({
    queryKey: ["content-counts"],
    queryFn: async () => {
      const statuses = ["draft", "pending", "approved", "rejected"];
      const counts: Record<string, number> = {};
      for (const s of statuses) {
        const { count } = await supabase
          .from("content_submissions")
          .select("*", { count: "exact", head: true })
          .eq("status", s);
        counts[s] = count || 0;
      }
      return counts;
    },
  });

  const sections = [
    {
      title: "DRILL DATABASE",
      icon: Dumbbell,
      description: "Manage all drills across sports. Edit, publish/unpublish, assign to programs.",
      stats: `${submissionCounts?.approved || 0} approved drills`,
      color: "text-emerald-400",
    },
    {
      title: "PROGRAM SYSTEM",
      icon: Target,
      description: "Create modular programs with drill sequences, KPI targets, and age groups.",
      stats: "Assignable to athletes or groups",
      color: "text-blue-400",
    },
    {
      title: "COURSE SYSTEM",
      icon: BookOpen,
      description: "Manage courses, add softball categories, set access levels and recommendations.",
      stats: "Free / subscriber / purchasable",
      color: "text-purple-400",
    },
    {
      title: "KPI DEFINITIONS",
      icon: Target,
      description: "Define categories, scoring scales, threshold levels, and update triggers.",
      stats: "Below Standard → Developing → Proficient → Elite",
      color: "text-amber-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground">CONTENT</h1>
          <p className="text-sm text-muted-foreground">Full content management</p>
        </div>
        <button
          onClick={() => navigate("/admin/content/queue")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
        >
          Approval Queue
          {(submissionCounts?.pending || 0) > 0 && (
            <span className="ml-1 bg-primary-foreground text-primary px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              {submissionCounts?.pending}
            </span>
          )}
        </button>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Drafts", count: submissionCounts?.draft || 0, color: "text-muted-foreground" },
          { label: "Pending", count: submissionCounts?.pending || 0, color: "text-amber-400" },
          { label: "Approved", count: submissionCounts?.approved || 0, color: "text-emerald-400" },
          { label: "Rejected", count: submissionCounts?.rejected || 0, color: "text-destructive" },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <p className={`text-xl font-display ${color}`}>{count}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Content sections */}
      <div className="grid md:grid-cols-2 gap-4">
        {sections.map(({ title, icon: Icon, description, stats, color }) => (
          <div key={title} className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`w-5 h-5 ${color}`} />
              <h2 className="text-sm font-display text-foreground">{title}</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{description}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stats}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerContent;
