import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, BarChart3, BookOpen, GraduationCap, Activity,
  Menu, X, MessageSquare, Dumbbell, Download, Brain,
  Shield, Globe, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "My Athletes",      path: "/parent",               icon: Users,         exact: true },
  { label: "Progress",         path: "/parent/progress",      icon: BarChart3 },
  { label: "AI Analytics",     path: "/parent/analytics",     icon: Brain,         badge: "AI" },
  { label: "Prospect Profile", path: "/parent/prospect",      icon: Star,          badge: "NEW" },
  { label: "Lessons",          path: "/parent/lessons",       icon: BookOpen },
  { label: "Training",         path: "/parent/training",      icon: Dumbbell },
  { label: "Wellness & Arm",   path: "/parent/wellness",      icon: Shield },
  { label: "Recruiting",       path: "/parent/recruiting",    icon: GraduationCap },
  { label: "Education Center", path: "/parent/education",     icon: BookOpen,      badge: "LEARN" },
  { label: "Messages",         path: "/parent/messages",      icon: MessageSquare },
  { label: "Downloads",        path: "/parent/downloads",     icon: Download },
];

const ParentDashboardLayout = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === "/parent";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border flex-col bg-card safe-top">
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-xl text-foreground">PARENT PORTAL</h2>
          <p className="text-xs text-muted-foreground mt-1">Your athlete's world — at a glance</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path, item.exact)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge className="text-[9px] bg-green-500/10 text-green-600 border-green-500/20 px-1.5 py-0">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <Link to="/state-of-game">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary transition-colors cursor-pointer">
              <Globe className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground">State of the Game™</span>
              <Badge className="text-[9px] bg-primary/10 text-primary border-0 ml-auto">Monthly</Badge>
            </div>
          </Link>
          <p className="text-[10px] text-muted-foreground text-center">Read-only · Data powered by coaches</p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border safe-top">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-display text-lg text-foreground">PARENT PORTAL</h2>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-1 border-t border-border bg-card max-h-96 overflow-y-auto"
            >
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.path, item.exact)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                  {item.badge && (
                    <Badge className="text-[9px] bg-green-500/10 text-green-600 border-0 ml-auto">{item.badge}</Badge>
                  )}
                </Link>
              ))}
              <Link to="/state-of-game" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                <Globe className="w-4 h-4 shrink-0" />
                State of the Game™
                <Badge className="text-[9px] bg-primary/10 text-primary border-0 ml-auto">Monthly</Badge>
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-0 min-w-0 pt-16 lg:pt-0 safe-bottom">
        <Outlet />
      </main>
    </div>
  );
};

export default ParentDashboardLayout;
