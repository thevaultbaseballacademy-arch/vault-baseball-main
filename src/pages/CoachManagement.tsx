import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, Shield, Users, UserPlus, UserX, DollarSign,
  BarChart3, Search, TrendingUp, FileText, Tag, ChevronRight,
  Settings, Award, Star, Clock, Building2, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCoachManagement, Coach } from "@/hooks/useCoachManagement";
import { useCoachPayouts } from "@/hooks/useCoachPayouts";
import { CoachesTable } from "@/components/admin/CoachesTable";
import { CoachForm } from "@/components/admin/CoachForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { format } from "date-fns";

const CoachManagement = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCoachForm, setShowCoachForm] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { coaches, isLoading: coachesLoading, createCoach, updateCoach, toggleCoachStatus, deleteCoach } = useCoachManagement();
  const { payouts, eligibleCoaches, getCoachPayoutTotal } = useCoachPayouts();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      checkAuthorization(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuthorization = async (userId: string) => {
    try {
      // Check admin role
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (adminRole) {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      // Check team_whitelist for admin_access
      const { data: teamAccess } = await supabase
        .from("team_whitelist")
        .select("admin_access")
        .eq("admin_access", true);

      // Verify user email against whitelist
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email && teamAccess) {
        const { data: whitelistMatch } = await supabase
          .from("team_whitelist")
          .select("admin_access")
          .eq("email", userData.user.email)
          .eq("admin_access", true)
          .maybeSingle();

        if (whitelistMatch) {
          setAuthorized(true);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Auth check error:", error);
      setLoading(false);
    }
  };

  const filteredCoaches = coaches?.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const activeCoaches = coaches?.filter(c => c.status === "Active") || [];
  const suspendedCoaches = coaches?.filter(c => c.status === "Suspended") || [];
  const certifiedCoaches = coaches?.filter(c => c.is_certified || c.is_bypass_certified) || [];
  const marketplaceCoaches = coaches?.filter(c => c.is_marketplace_approved) || [];

  const totalRevenue = payouts
    ?.filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount_cents, 0) || 0;

  const pendingPayouts = payouts
    ?.filter(p => p.status === "pending")
    .reduce((sum, p) => sum + p.amount_cents, 0) || 0;

  const handleEdit = (coach: Coach) => {
    setEditingCoach(coach);
    setShowCoachForm(true);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    toggleCoachStatus.mutate({ id, currentStatus });
  };

  const handleDelete = (id: string) => {
    deleteCoach.mutate(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-display text-foreground mb-2">Access Restricted</h2>
              <p className="text-muted-foreground mb-6">This page is only available to administrators and authorized managers.</p>
              <Button variant="vault" onClick={() => navigate("/")}>Go Home</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-display text-foreground mb-1">COACH MANAGEMENT</h1>
                <p className="text-muted-foreground">Hire, manage, and track coach performance & revenue</p>
              </div>
              <Button onClick={() => { setEditingCoach(null); setShowCoachForm(true); }}>
                <UserPlus className="w-4 h-4 mr-2" /> Hire New Coach
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: "Total Coaches", value: coaches?.length || 0, icon: Users, color: "text-primary" },
                { label: "Active", value: activeCoaches.length, icon: Users, color: "text-green-500" },
                { label: "Suspended", value: suspendedCoaches.length, icon: UserX, color: "text-destructive" },
                { label: "Certified", value: certifiedCoaches.length, icon: Award, color: "text-amber-500" },
                { label: "Total Revenue", value: `$${(totalRevenue / 100).toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
                { label: "Pending Payouts", value: `$${(pendingPayouts / 100).toLocaleString()}`, icon: Clock, color: "text-amber-500" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                    <span className="text-xs text-muted-foreground">{kpi.label}</span>
                  </div>
                  <p className="text-xl font-display text-foreground">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-3xl grid-cols-5">
                <TabsTrigger value="overview" className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Overview
                </TabsTrigger>
                <TabsTrigger value="roster" className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> Roster
                </TabsTrigger>
                <TabsTrigger value="revenue" className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Revenue
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" /> Performance
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Files
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Coach Activity */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-display text-foreground mb-4">RECENT COACHES</h3>
                    <div className="space-y-3">
                      {(coaches || []).slice(0, 5).map((coach) => (
                        <div key={coach.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">{coach.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{coach.name}</p>
                              <p className="text-xs text-muted-foreground">{coach.role} · {coach.status}</p>
                            </div>
                          </div>
                          <Badge variant={coach.status === "Active" ? "default" : "destructive"} className={coach.status === "Active" ? "bg-green-600" : ""}>
                            {coach.status}
                          </Badge>
                        </div>
                      ))}
                      {(!coaches || coaches.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">No coaches yet</p>
                      )}
                    </div>
                  </div>

                  {/* Revenue Summary */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-display text-foreground mb-4">REVENUE BREAKDOWN</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Total Processed</span>
                        <span className="text-lg font-display text-green-500">${(totalRevenue / 100).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Pending Payouts</span>
                        <span className="text-lg font-display text-amber-500">${(pendingPayouts / 100).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Platform Revenue (30%)</span>
                        <span className="text-lg font-display text-primary">${((totalRevenue * 0.3) / 100).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Marketplace Coaches</span>
                        <span className="text-lg font-display text-foreground">{marketplaceCoaches.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Hire Coach", icon: UserPlus, action: () => { setEditingCoach(null); setShowCoachForm(true); } },
                    { label: "View Payouts", icon: DollarSign, action: () => navigate("/admin/payouts") },
                    { label: "Coach Invites", icon: Tag, action: () => navigate("/admin") },
                    { label: "Certifications", icon: Award, action: () => navigate("/admin/certifications") },
                  ].map((item) => (
                    <button key={item.label} onClick={item.action} className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors text-left group">
                      <item.icon className="w-5 h-5 text-primary mb-2" />
                      <p className="text-sm font-medium text-foreground flex items-center gap-1">
                        {item.label}
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                    </button>
                  ))}
                </div>
              </TabsContent>

              {/* Roster Tab */}
              <TabsContent value="roster" className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search coaches by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                      Clear
                    </Button>
                    <Button size="sm" onClick={() => { setEditingCoach(null); setShowCoachForm(true); }}>
                      <UserPlus className="w-4 h-4 mr-1" /> Add Coach
                    </Button>
                  </div>
                </div>

                {coachesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <CoachesTable
                    coaches={filteredCoaches}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                  />
                )}
              </TabsContent>

              {/* Revenue Tab */}
              <TabsContent value="revenue" className="space-y-6">
                <h2 className="text-xl font-display text-foreground">REVENUE & PAYOUTS</h2>

                {/* Per-Coach Revenue */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-sm font-display text-foreground">Coach Earnings Summary</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {(eligibleCoaches || []).map((coach) => {
                      const total = getCoachPayoutTotal(coach.id);
                      return (
                        <div key={coach.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">{coach.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{coach.name}</p>
                              <p className="text-xs text-muted-foreground">{coach.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-display text-foreground">${(total / 100).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {coach.stripe_account_id ? "Stripe Connected" : "No Stripe"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {(!eligibleCoaches || eligibleCoaches.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-8">No eligible coaches for payouts</p>
                    )}
                  </div>
                </div>

                {/* Recent Payouts */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-sm font-display text-foreground">Recent Payouts</h3>
                  </div>
                  <div className="divide-y divide-border max-h-96 overflow-y-auto">
                    {(payouts || []).slice(0, 20).map((payout) => {
                      const coach = eligibleCoaches?.find(c => c.id === payout.coach_id);
                      return (
                        <div key={payout.id} className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{coach?.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{payout.description || "Payout"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-display text-foreground">${(payout.amount_cents / 100).toFixed(2)}</p>
                            <Badge variant={payout.status === "completed" ? "default" : "secondary"} className={payout.status === "completed" ? "bg-green-600 text-xs" : "text-xs"}>
                              {payout.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    {(!payouts || payouts.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-8">No payouts yet</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <h2 className="text-xl font-display text-foreground">COACH PERFORMANCE</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(coaches || []).map((coach) => {
                    const coachPayoutTotal = getCoachPayoutTotal(coach.id);
                    return (
                      <div key={coach.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">{coach.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{coach.name}</p>
                            <p className="text-xs text-muted-foreground">{coach.role}</p>
                          </div>
                          <Badge variant={coach.status === "Active" ? "default" : "destructive"} className={coach.status === "Active" ? "bg-green-600 text-xs" : "text-xs"}>
                            {coach.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-secondary/50 rounded-lg p-2">
                            <p className="text-[10px] text-muted-foreground">Revenue</p>
                            <p className="text-sm font-display text-foreground">${(coachPayoutTotal / 100).toLocaleString()}</p>
                          </div>
                          <div className="bg-secondary/50 rounded-lg p-2">
                            <p className="text-[10px] text-muted-foreground">Certified</p>
                            <p className="text-sm font-display text-foreground">
                              {coach.is_certified || coach.is_bypass_certified ? "Yes" : "No"}
                            </p>
                          </div>
                          <div className="bg-secondary/50 rounded-lg p-2">
                            <p className="text-[10px] text-muted-foreground">Marketplace</p>
                            <p className="text-sm font-display text-foreground">
                              {coach.is_marketplace_approved ? "Active" : "Inactive"}
                            </p>
                          </div>
                          <div className="bg-secondary/50 rounded-lg p-2">
                            <p className="text-[10px] text-muted-foreground">Staff</p>
                            <p className="text-sm font-display text-foreground">
                              {coach.is_staff ? "Yes" : "No"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleEdit(coach)}>
                            Edit
                          </Button>
                          <Button
                            variant={coach.status === "Active" ? "destructive" : "default"}
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleToggleStatus(coach.id, coach.status)}
                          >
                            {coach.status === "Active" ? "Suspend" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {(!coaches || coaches.length === 0) && (
                    <p className="text-sm text-muted-foreground col-span-full text-center py-8">No coaches to show</p>
                  )}
                </div>
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files" className="space-y-6">
                <h2 className="text-xl font-display text-foreground">COACH FILES & DOCUMENTS</h2>
                <p className="text-sm text-muted-foreground">
                  Coach application documents, resumes, and certifications are stored securely.
                </p>

                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-display text-foreground mb-4">APPLICATION FILES</h3>
                  <div className="space-y-3">
                    {(coaches || []).filter(c => c.email).slice(0, 10).map((coach) => (
                      <div key={coach.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{coach.name}</p>
                            <p className="text-xs text-muted-foreground">{coach.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {coach.is_certified ? "Certified" : "Pending"}
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleEdit(coach)}>
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-display text-foreground mb-4">SEASONAL DISCOUNT CODES</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage seasonal promotions and discount codes for coach services.
                  </p>
                  <div className="bg-secondary/50 rounded-lg p-8 text-center">
                    <Tag className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Discount codes can be managed through your Stripe dashboard for coach services and marketplace bookings.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/admin/payouts")}>
                      Manage Payouts & Stripe
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Coach Form Dialog */}
          {showCoachForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
                <h2 className="text-lg font-display text-foreground mb-4">
                  {editingCoach ? "Edit Coach" : "Hire New Coach"}
                </h2>
                <CoachForm
                  coach={editingCoach}
                  onSubmit={(data) => {
                    const coachData = {
                      name: data.name || "",
                      email: data.email || "",
                      role: data.role as any,
                      org_id: data.org_id || "",
                      ...(data.team_id ? { team_id: data.team_id } : {}),
                    };
                    if (editingCoach) {
                      updateCoach.mutate({ id: editingCoach.id, ...coachData });
                    } else {
                      createCoach.mutate(coachData);
                    }
                    setShowCoachForm(false);
                    setEditingCoach(null);
                  }}
                  onCancel={() => { setShowCoachForm(false); setEditingCoach(null); }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CoachManagement;
