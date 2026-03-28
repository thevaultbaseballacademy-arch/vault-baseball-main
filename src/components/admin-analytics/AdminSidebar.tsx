import { NavLink, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  FileCheck, 
  ClipboardList,
  ChevronLeft,
  Shield,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Certification Analytics",
    path: "/admin/certification-analytics",
    icon: BarChart3,
  },
  {
    label: "Coaches",
    path: "/admin/coaches",
    icon: Users,
  },
  {
    label: "Payouts",
    path: "/admin/payouts",
    icon: DollarSign,
  },
  {
    label: "Exams",
    path: "/admin/exams",
    icon: ClipboardList,
  },
  {
    label: "Certifications",
    path: "/admin/certifications",
    icon: FileCheck,
  },
];

export const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-xl tracking-wide">Admin</h2>
            <p className="text-xs text-muted-foreground">VAULT™ Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <NavLink
          to="/"
          className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </NavLink>
      </div>
    </aside>
  );
};
