import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Crown, BarChart3, Users, DollarSign, Shield, Settings,
  TrendingUp, Activity, Database, FileText, Bell, Heart,
  Award, BookOpen, Briefcase, Link2, UserCheck, Video,
  Lightbulb, Clock, Trash2, UserPlus, ChevronRight, Loader2,
  Building, CreditCard, Globe, Zap, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOwnerAuth } from "@/hooks/useOwnerAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Admin Components
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
import { OwnerOverviewPanel } from "@/components/owner/OwnerOverviewPanel";
import { OwnerRevenuePanel } from "@/components/owner/OwnerRevenuePanel";
import { OwnerUserRolesPanel } from "@/components/owner/OwnerUserRolesPanel";
import { OwnerPlatformSettings } from "@/components/owner/OwnerPlatformSettings";

const SECTIONS = [
  {
    group: "Owner",
    items: [
      { id: "overview", label: "Command Center", icon: Crown },
      { id: "revenue", label: "Revenue & Analytics", icon: DollarSign },
      { id: "platform", label: "Platform Settings", icon: Settings },
    ],
  },
  {
    group: "CRM & Revenue",
    items: [
      { id: "leads", label: "Leads & CRM", icon: UserPlus },
      { id: "marketplace", label: "Marketplace", icon: Heart },
      { id: "22m-trials", label: "22M Trials", icon: Users },
    ],
  },
  {
    group: "User Management",
    items: [
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

const OwnerCommandCenter = () => {
  const { user, isOwner, isLoading, profile } = useOwnerAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-display text-foreground mb-2">Owner Access Required</h2>
              <p className="text-muted-foreground mb-6">This command center is only available to platform owners.</p>
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
          {/* Sidebar */}
          <aside
            className={`fixed lg:sticky top-20 left-0 z-30 h-[calc(100vh-5rem)] w-72 bg-card border-r border-border overflow-y-auto transition-transform lg:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Owner Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-lg tracking-wide text-foreground">OWNER HQ</h2>
                  <p className="text-xs text-muted-foreground">{profile?.display_name}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
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
                      const isOwnerSection = section.group === "Owner";
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
                              ? isOwnerSection
                                ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary font-medium border border-primary/30"
                                : "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${active && isOwnerSection ? "text-primary" : ""}`} />
                          <span className="truncate">{item.label}</span>
                          {isOwnerSection && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Quick Links */}
            <div className="p-3 mt-4 mx-2 mb-4 space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs"
                onClick={() => navigate("/admin/certification-analytics")}
              >
                <BarChart3 className="w-3 h-3 mr-2" /> Cert Analytics
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs"
                onClick={() => navigate("/admin/payouts")}
              >
                <CreditCard className="w-3 h-3 mr-2" /> Coach Payouts
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-xs" 
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-3 h-3 mr-2" /> Back to Site
              </Button>
            </div>
          </aside>

          {/* Mobile overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile header */}
            <div className="lg:hidden sticky top-20 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg bg-secondary text-foreground">
                <Crown className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                {activeItem && <activeItem.icon className="w-4 h-4 text-primary" />}
                <span className="font-display text-sm text-foreground">{activeItem?.label}</span>
              </div>
            </div>

            <div className="p-4 md:p-6 lg:p-8 max-w-7xl">
              <motion.div 
                key={activeSection} 
                initial={{ opacity: 0, y: 8 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2 }}
              >
                {/* Owner-Exclusive Sections */}
                {activeSection === "overview" && <OwnerOverviewPanel />}
                {activeSection === "revenue" && <OwnerRevenuePanel />}
                {activeSection === "platform" && <OwnerPlatformSettings />}
                
                {/* CRM & Revenue */}
                {activeSection === "leads" && <LeadsCustomersPanel />}
                {activeSection === "marketplace" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">MARKETPLACE MANAGEMENT</h1>
                      <p className="text-sm text-muted-foreground">Monitor coach marketplace activity and revenue.</p>
                    </div>
                    <AdminMarketplacePanel />
                  </div>
                )}
                {activeSection === "22m-trials" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">22M FOUNDING ATHLETE TRIALS</h1>
                      <p className="text-sm text-muted-foreground">Manage 22M athlete invites and trial access.</p>
                    </div>
                    <Admin22MTrialsPanel />
                  </div>
                )}
                
                {/* User Management */}
                {activeSection === "users" && <OwnerUserRolesPanel />}
                {activeSection === "team" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">TEAM WHITELIST</h1>
                      <p className="text-sm text-muted-foreground">Manage team members with full platform access.</p>
                    </div>
                    <TeamWhitelistManager />
                  </div>
                )}
                
                {/* Coaching */}
                {activeSection === "coach-invites" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">COACH INVITE TOKENS</h1>
                      <p className="text-sm text-muted-foreground">Create and manage coach invitation links.</p>
                    </div>
                    <CoachInviteManager />
                  </div>
                )}
                {activeSection === "assignments" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">COACH-ATHLETE ASSIGNMENTS</h1>
                      <p className="text-sm text-muted-foreground">View and manage coach-athlete relationships.</p>
                    </div>
                    <CoachAthleteAssignments />
                  </div>
                )}
                
                {/* Content */}
                {activeSection === "tips" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">WEEKLY TIPS</h1>
                      <p className="text-sm text-muted-foreground">Manage tips displayed to athletes.</p>
                    </div>
                    <WeeklyTipsManager />
                  </div>
                )}
                {activeSection === "certifications" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">EXAM QUESTIONS</h1>
                      <p className="text-sm text-muted-foreground">Manage certification exam question bank.</p>
                    </div>
                    <CertificationQuestionManager />
                  </div>
                )}
                {activeSection === "expirations" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">CERTIFICATION EXPIRATIONS</h1>
                      <p className="text-sm text-muted-foreground">Track and manage expiring certifications.</p>
                    </div>
                    <CertificationExpirationManager />
                  </div>
                )}
                {activeSection === "videos" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">COURSE VIDEOS</h1>
                      <p className="text-sm text-muted-foreground">Manage video content for courses.</p>
                    </div>
                    <CourseVideoManager />
                  </div>
                )}
                
                {/* Engagement */}
                {activeSection === "broadcast" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">BROADCAST CENTER</h1>
                      <p className="text-sm text-muted-foreground">Send notifications to users.</p>
                    </div>
                    <BroadcastPanel userCount={0} />
                  </div>
                )}
                {activeSection === "analytics" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">NOTIFICATION ANALYTICS</h1>
                      <p className="text-sm text-muted-foreground">Track notification engagement.</p>
                    </div>
                    <NotificationAnalytics />
                  </div>
                )}
                
                {/* Compliance */}
                {activeSection === "audit" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">AUDIT LOG</h1>
                      <p className="text-sm text-muted-foreground">Review system activity and changes.</p>
                    </div>
                    <AuditLogViewer />
                  </div>
                )}
                {activeSection === "retention" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">DATA RETENTION</h1>
                      <p className="text-sm text-muted-foreground">Configure data retention policies.</p>
                    </div>
                    <DataRetentionPanel />
                  </div>
                )}
                {activeSection === "deletion" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">DELETION REQUESTS</h1>
                      <p className="text-sm text-muted-foreground">Process user data deletion requests.</p>
                    </div>
                    <DeletionRequestsManager />
                  </div>
                )}
                {activeSection === "gdpr" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">GDPR COMPLIANCE</h1>
                      <p className="text-sm text-muted-foreground">Monitor privacy compliance status.</p>
                    </div>
                    <GDPRComplianceDashboard />
                  </div>
                )}
                
                {/* System */}
                {activeSection === "health" && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-display text-foreground mb-1">SYSTEM HEALTH</h1>
                      <p className="text-sm text-muted-foreground">Monitor platform performance and status.</p>
                    </div>
                    <SystemHealthDashboard />
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerCommandCenter;
