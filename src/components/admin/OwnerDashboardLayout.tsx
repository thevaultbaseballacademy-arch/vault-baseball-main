import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { Loader2, DollarSign, Users, FileCheck, FolderOpen, Brain, Settings, BarChart3, ScrollText, ChevronLeft, HeartPulse, Wrench } from "lucide-react";
import { Navigate } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: BarChart3, end: true },
  { to: "/admin/revenue", label: "Revenue", icon: DollarSign },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/content/queue", label: "Approval Queue", icon: FileCheck },
  { to: "/admin/content", label: "Content", icon: FolderOpen },
  { to: "/admin/intelligence", label: "Intelligence", icon: Brain },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/health", label: "Health", icon: HeartPulse },
  { to: "/admin/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/admin/audit", label: "Audit Log", icon: ScrollText },
];

const OwnerDashboardLayout = () => {
  const { user, can, isLoading } = useRoleAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !can("view_platform_settings")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-3 h-3" />
            Back to site
          </button>
          <h1 className="text-lg font-display text-foreground mt-2 tracking-wide">VAULT OS</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Owner Dashboard</p>
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
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex overflow-x-auto px-2 py-1.5 gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-[10px] shrink-0 transition-colors ${
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboardLayout;
