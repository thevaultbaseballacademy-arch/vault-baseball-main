import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, Target, Calendar, BookOpen, PenTool, Clock, UserCircle, ChevronLeft, Menu, X, Download } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { to: "/coach", label: "My Athletes", icon: Users, end: true },
  { to: "/coach/kpis", label: "KPI Tracker", icon: Target },
  { to: "/coach/lessons", label: "Lessons", icon: Calendar },
  { to: "/coach/assignments", label: "Assignments", icon: BookOpen },
  { to: "/coach/create", label: "Create Content", icon: PenTool },
  { to: "/coach/schedule", label: "Schedule", icon: Clock },
  { to: "/coach/downloads", label: "Downloads", icon: Download },
  { to: "/coach/profile", label: "My Profile", icon: UserCircle },
];

const CoachDashboardLayout = () => {
  const { user, isCoach, isOwner, isLoading } = useRoleAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch pending video review count for badge
  const { data: pendingVideoCount } = useQuery({
    queryKey: ["coach-pending-videos", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("remote_lessons")
        .select("id", { count: "exact", head: true })
        .eq("coach_user_id", user!.id)
        .eq("status", "pending_review");
      if (error) return 0;
      return count || 0;
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (!isCoach && !isOwner)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="w-56 shrink-0 border-r border-border bg-card hidden md:flex flex-col">
          <div className="p-4 border-b border-border">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-3 h-3" />
              Back to site
            </button>
            <h1 className="text-lg font-display text-foreground mt-2 tracking-wide">COACH HQ</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Dashboard</p>
          </div>
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {label === "Lessons" && (pendingVideoCount ?? 0) > 0 && (
                  <Badge variant="destructive" className="ml-auto text-[9px] px-1.5 py-0 h-4 min-w-[18px] flex items-center justify-center">
                    {pendingVideoCount}
                  </Badge>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile nav toggle */}
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav overlay */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-base transition-colors ${
                    isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoachDashboardLayout;
