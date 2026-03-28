import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, Users, Shield, UserCheck,
  Search, Plus, Check, BarChart3, Link2, Video, Award, Clock,
  FileText, Database, Trash2, Lightbulb, Activity, UserPlus,
  ChevronRight, Settings, Bell, BookOpen, Heart, Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BroadcastPanel from "@/components/admin/BroadcastPanel";
import NotificationAnalytics from "@/components/admin/NotificationAnalytics";
import CoachAthleteAssignments from "@/components/admin/CoachAthleteAssignments";
import CourseVideoManager from "@/components/admin/CourseVideoManager";
import CertificationQuestionManager from "@/components/admin/CertificationQuestionManager";
import CertificationExpirationManager from "@/components/admin/CertificationExpirationManager";
import AuditLogViewer from "@/components/admin/AuditLogViewer";
import DataRetentionPanel from "@/components/admin/DataRetentionPanel";
import DeletionRequestsManager from "@/components/admin/DeletionRequestsManager";
import GDPRComplianceDashboard from "@/components/admin/GDPRComplianceDashboard";
import WeeklyTipsManager from "@/components/admin/WeeklyTipsManager";
import { SystemHealthDashboard } from "@/components/admin/SystemHealthDashboard";
import TeamWhitelistManager from "@/components/admin/TeamWhitelistManager";
import { CoachInviteManager } from "@/components/admin/CoachInviteManager";
import LeadsCustomersPanel from "@/components/admin/LeadsCustomersPanel";
import AdminMarketplacePanel from "@/components/marketplace/AdminMarketplacePanel";
import Admin22MTrialsPanel from "@/components/admin/Admin22MTrialsPanel";

interface Profile {
  user_id: string;
  email?: string;
  display_name: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "coach" | "athlete";
}

const ROLES = ["admin", "coach", "athlete"] as const;

/* ── Sidebar section definitions ── */
const SECTIONS = [
  {
    group: "CRM & Revenue",
    items: [
      { id: "leads", label: "Leads & CRM", icon: UserPlus },
      { id: "marketplace", label: "Marketplace", icon: Heart },
      { id: "22m-trials", label: "22M Trials", icon: Users },
      { id: "users", label: "User Roles", icon: Users },
      { id: "team", label: "Team Whitelist", icon: Shield },
    ],
  },
  {
    group: "Coaching",
    items: [
      { id: "coach-mgmt", label: "Coach Management", icon: Briefcase },
      { id: "coach-invites", label: "Coach Invites", icon: Link2 },
      { id: "assignments", label: "Assignments", icon: UserCheck },
    ],
  },
  {
    group: "Content",
    items: [
      { id: "tips", label: "Weekly Tips", icon: Lightbulb },
      { id: "certifications", label: "Exam Questions", icon: Award },
      { id: "expirations", label: "Cert Expirations", icon: Clock },
      { id: "videos", label: "Course Videos", icon: Video },
    ],
  },
  {
    group: "Engagement",
    items: [
      { id: "broadcast", label: "Broadcast", icon: Bell },
      { id: "analytics", label: "Notif Analytics", icon: BarChart3 },
    ],
  },
  {
    group: "Compliance",
    items: [
      { id: "audit", label: "Audit Log", icon: FileText },
      { id: "retention", label: "Data Retention", icon: Database },
      { id: "deletion", label: "Deletion Requests", icon: Trash2 },
      { id: "gdpr", label: "GDPR", icon: BookOpen },
    ],
  },
  {
    group: "System",
    items: [
      { id: "health", label: "System Health", icon: Activity },
    ],
  },
];

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("leads");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      checkAdminRole(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminRole = async (userId: string) => {
    try {
      // Check user_roles table
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      
      // Also check team_whitelist for admin_access
      let hasTeamAdminAccess = false;
      if (!data) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          const { data: teamData } = await supabase
            .from("team_whitelist")
            .select("admin_access")
            .eq("email", user.email.toLowerCase())
            .maybeSingle();
          hasTeamAdminAccess = teamData?.admin_access ?? false;
        }
      }

      if (data || hasTeamAdminAccess) {
        setIsAdmin(true);
        fetchData();
      }
      setLoading(false);
    } catch (error) {
      console.error("Error checking admin role:", error);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name").order("display_name"),
        supabase.from("user_roles").select("id, user_id, role"),
      ]);
      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;
      setProfiles(profilesRes.data || []);
      setUserRoles(rolesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error", description: "Failed to load user data", variant: "destructive" });
    }
  };

  const hasRole = (userId: string, role: string) =>
    userRoles.some((r) => r.user_id === userId && r.role === role);

  const toggleRole = async (userId: string, role: "admin" | "coach" | "athlete") => {
    setUpdatingRole(`${userId}-${role}`);
    try {
      const existing = userRoles.find((r) => r.user_id === userId && r.role === role);
      if (existing) {
        const { error } = await supabase.from("user_roles").delete().eq("id", existing.id);
        if (error) throw error;
        setUserRoles((prev) => prev.filter((r) => r.id !== existing.id));
        toast({ title: "Role removed", description: `Removed ${role} role` });
      } else {
        const { data, error } = await supabase.from("user_roles").insert({ user_id: userId, role }).select().single();
        if (error) throw error;
        setUserRoles((prev) => [...prev, data]);
        toast({ title: "Role assigned", description: `Assigned ${role} role` });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update role", variant: "destructive" });
    } finally {
      setUpdatingRole(null);
    }
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string, active: boolean) => {
    if (!active) return "bg-secondary text-muted-foreground hover:bg-secondary/80";
    switch (role) {
      case "admin": return "bg-destructive/10 text-destructive border-destructive/30";
      case "coach": return "bg-primary/10 text-primary border-primary/30";
      default: return "bg-accent/10 text-accent border-accent/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-display text-foreground mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground mb-6">This page is only available to administrators.</p>
              <Button variant="vault" onClick={() => navigate("/")}>Go Home</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const activeItem = SECTIONS.flatMap((s) => s.items).find((i) => i.id === activeSection);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="flex min-h-[calc(100vh-5rem)]">
          {/* ── Sidebar ── */}
          <aside
            className={`fixed lg:sticky top-20 left-0 z-30 h-[calc(100vh-5rem)] w-64 bg-card border-r border-border overflow-y-auto transition-transform lg:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-display tracking-widest text-primary">ADMIN PANEL</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">{profiles.length} users &middot; {userRoles.filter((r) => r.role === "coach").length} coaches</p>
            </div>

            <nav className="p-2 space-y-4">
              {SECTIONS.map((section) => (
                <div key={section.group}>
                  <p className="px-3 py-1 text-[10px] font-display tracking-[0.15em] text-muted-foreground uppercase">
                    {section.group}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.id === "coach-mgmt") {
                              navigate("/admin/coach-management");
                              return;
                            }
                            setActiveSection(item.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                            active
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-3 mt-4 mx-2 mb-4">
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={() => navigate("/")}>
                <ArrowLeft className="w-3 h-3 mr-2" /> Back to Site
              </Button>
            </div>
          </aside>

          {/* Sidebar overlay for mobile */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Mobile header */}
            <div className="lg:hidden sticky top-20 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg bg-secondary text-foreground">
                <Settings className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                {activeItem && <activeItem.icon className="w-4 h-4 text-primary" />}
                <span className="font-display text-sm text-foreground">{activeItem?.label}</span>
              </div>
            </div>

            <div className="p-4 md:p-6 lg:p-8 max-w-6xl">
              <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

                {/* ── LEADS & CRM ── */}
                {activeSection === "leads" && <LeadsCustomersPanel />}

                {/* ── 22M TRIALS ── */}
                {activeSection === "22m-trials" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">22M FOUNDING ATHLETE TRIALS</h1>
                      <p className="text-sm text-muted-foreground">Manage 22M athlete invites and trial access.</p>
                    </div>
                    <Admin22MTrialsPanel />
                  </div>
                )}

                {/* ── USER ROLES ── */}
                {activeSection === "users" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">USER ROLES</h1>
                      <p className="text-sm text-muted-foreground">Assign admin, coach, and athlete roles.</p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Admins", count: userRoles.filter((r) => r.role === "admin").length, color: "text-destructive" },
                        { label: "Coaches", count: userRoles.filter((r) => r.role === "coach").length, color: "text-primary" },
                        { label: "Athletes", count: userRoles.filter((r) => r.role === "athlete").length, color: "text-accent" },
                      ].map((s) => (
                        <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                          <span className={`text-sm ${s.color}`}>{s.label}</span>
                          <p className="text-2xl font-display text-foreground">{s.count}</p>
                        </div>
                      ))}
                    </div>

                    {/* Search */}
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground w-full text-sm"
                      />
                    </div>

                    {/* List */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-border">
                        <h2 className="text-sm font-display text-foreground">Users ({filteredProfiles.length})</h2>
                      </div>
                      <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                        {filteredProfiles.map((profile) => (
                          <div key={profile.user_id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                                <span className="text-xs font-medium text-accent">
                                  {profile.display_name?.charAt(0).toUpperCase() || "?"}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-foreground">{profile.display_name || "Unknown"}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {ROLES.map((role) => {
                                const active = hasRole(profile.user_id, role);
                                const isUpdating = updatingRole === `${profile.user_id}-${role}`;
                                return (
                                  <button
                                    key={role}
                                    onClick={() => toggleRole(profile.user_id, role)}
                                    disabled={isUpdating}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all ${getRoleColor(role, active)} ${active ? "border" : "border-transparent"}`}
                                  >
                                    {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : active ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                    <span className="capitalize">{role}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Other sections ── */}
                {activeSection === "team" && <TeamWhitelistManager />}
                {activeSection === "coach-invites" && <CoachInviteManager />}
                {activeSection === "assignments" && <CoachAthleteAssignments />}
                {activeSection === "tips" && <WeeklyTipsManager />}
                {activeSection === "certifications" && <CertificationQuestionManager />}
                {activeSection === "expirations" && <CertificationExpirationManager />}
                {activeSection === "videos" && <CourseVideoManager />}
                {activeSection === "broadcast" && <BroadcastPanel userCount={profiles.length} />}
                {activeSection === "analytics" && <NotificationAnalytics />}
                {activeSection === "audit" && <AuditLogViewer />}
                {activeSection === "retention" && <DataRetentionPanel />}
                {activeSection === "deletion" && <DeletionRequestsManager />}
                {activeSection === "gdpr" && <GDPRComplianceDashboard />}
                {activeSection === "health" && <SystemHealthDashboard />}
                {activeSection === "marketplace" && <AdminMarketplacePanel />}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
