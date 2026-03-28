import { Loader2, UserPlus, ShoppingCart, Users, MessageCircle, CreditCard, BarChart3, Download, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminCRM } from "@/hooks/useAdminCRM";
import { formatPrice } from "@/lib/productPricing";

const LeadsCustomersPanel = () => {
  const {
    loading, filters, setFilters, resetFilters,
    leads, purchases, onboarding, profiles,
    kpis, uniqueProducts, uniquePositions,
  } = useAdminCRM();

  const [expandedOnboarding, setExpandedOnboarding] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasActiveFilters = filters.search || filters.product !== "all" || filters.position !== "all" || filters.membershipStatus !== "all" || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display text-foreground mb-1">LEADS & CRM</h1>
        <p className="text-sm text-muted-foreground">Track leads, purchases, onboarding, and athlete profiles.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "New Leads (30d)", value: kpis.recentLeads, icon: UserPlus, color: "text-primary" },
          { label: "Guide Signups", value: kpis.guideSignups, icon: Download, color: "text-accent" },
          { label: "Chat Qualified", value: kpis.chatQualified, icon: MessageCircle, color: "text-primary" },
          { label: "Purchases", value: kpis.totalPurchases, icon: ShoppingCart, color: "text-accent" },
          { label: "Active Members", value: kpis.activeMemberships, icon: CreditCard, color: "text-primary" },
          { label: "Athlete Profiles", value: kpis.totalProfiles, icon: Users, color: "text-muted-foreground" },
          { label: "Revenue", value: formatPrice(kpis.totalRevenue), icon: BarChart3, color: "text-accent" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              <span className="text-[11px] text-muted-foreground leading-tight">{kpi.label}</span>
            </div>
            <p className="text-xl font-display text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="ml-auto h-7 text-xs">
              <X className="w-3 h-3 mr-1" /> Clear
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Search name or email…"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
          />
          <Select value={filters.product} onValueChange={(v) => setFilters({ ...filters, product: v })}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Product" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {uniqueProducts.map((p) => (
                <SelectItem key={p} value={p}>{p.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.position} onValueChange={(v) => setFilters({ ...filters, position: v })}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Position" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {uniquePositions.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.membershipStatus} onValueChange={(v) => setFilters({ ...filters, membershipStatus: v })}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="flex-1 px-2 py-2 text-xs bg-secondary border border-border rounded-lg text-foreground"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="flex-1 px-2 py-2 text-xs bg-secondary border border-border rounded-lg text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Data Tabs */}
      <Tabs defaultValue="leads">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="purchases">Purchases ({purchases.length})</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding ({onboarding.length})</TabsTrigger>
          <TabsTrigger value="profiles">Profiles ({profiles.length})</TabsTrigger>
        </TabsList>

        {/* LEADS */}
        <TabsContent value="leads" className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Athlete</TableHead>
                  <TableHead className="hidden md:table-cell">Parent</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Age</TableHead>
                  <TableHead className="hidden sm:table-cell">Position</TableHead>
                  <TableHead className="hidden lg:table-cell">Source</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No leads found</TableCell></TableRow>
                ) : leads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium text-sm">{l.athlete_name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{l.parent_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{l.email}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{l.athlete_age || "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground capitalize">{l.primary_position || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">{l.lead_source || "direct"}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{new Date(l.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* PURCHASES */}
        <TabsContent value="purchases" className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Membership</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No purchases found</TableCell></TableRow>
                ) : purchases.map((p) => {
                  const isSubscription = p.product_key?.includes("remote_training") || p.product_key?.includes("membership");
                  const isActive = p.status === "completed" && (!p.expires_at || new Date(p.expires_at) > new Date());
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs font-mono text-muted-foreground">{p.user_id?.slice(0, 8)}…</TableCell>
                      <TableCell className="font-medium text-sm">{p.product_key.replace(/_/g, " ")}</TableCell>
                      <TableCell className="text-sm">{formatPrice(p.amount_cents)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          p.status === "completed" ? "bg-accent/10 text-accent" :
                          p.status === "expired" ? "bg-destructive/10 text-destructive" :
                          "bg-primary/10 text-primary"
                        }`}>{p.status}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {isSubscription ? (
                          <span className={`px-2 py-0.5 text-xs rounded ${isActive ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">One-time</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(p.purchased_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ONBOARDING */}
        <TabsContent value="onboarding" className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Athlete</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Level</TableHead>
                  <TableHead className="hidden sm:table-cell">Position</TableHead>
                  <TableHead className="hidden md:table-cell">Velocity</TableHead>
                  <TableHead className="hidden lg:table-cell">Product</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {onboarding.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No entries found</TableCell></TableRow>
                ) : onboarding.map((o) => (
                  <>
                    <TableRow key={o.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => setExpandedOnboarding(expandedOnboarding === o.id ? null : o.id)}>
                      <TableCell className="font-medium text-sm">{o.athlete_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{o.email}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground capitalize text-sm">{o.current_level?.replace(/_/g, " ") || "—"}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground capitalize text-sm">{o.position || "—"}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{o.current_velocity ? `${o.current_velocity} mph` : "—"}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {o.product_purchased ? (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">{o.product_purchased.replace(/_/g, " ")}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {expandedOnboarding === o.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                      </TableCell>
                    </TableRow>
                    {expandedOnboarding === o.id && (
                      <TableRow key={`${o.id}-detail`}>
                        <TableCell colSpan={8} className="bg-secondary/30 px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            {o.parent_name && <div><span className="text-muted-foreground">Parent:</span> <span className="text-foreground">{o.parent_name}</span></div>}
                            {o.exit_velo && <div><span className="text-muted-foreground">Exit Velo:</span> <span className="text-foreground">{o.exit_velo} mph</span></div>}
                            {o.sixty_time && <div><span className="text-muted-foreground">60yd:</span> <span className="text-foreground">{o.sixty_time}s</span></div>}
                            {o.athlete_goals && <div className="sm:col-span-2 lg:col-span-3"><span className="text-muted-foreground">Goals:</span> <span className="text-foreground">{o.athlete_goals}</span></div>}
                            {o.biggest_struggle && <div className="sm:col-span-2 lg:col-span-3"><span className="text-muted-foreground">Struggle:</span> <span className="text-foreground">{o.biggest_struggle}</span></div>}
                            {o.training_history && <div className="sm:col-span-2 lg:col-span-3"><span className="text-muted-foreground">Training History:</span> <span className="text-foreground">{o.training_history}</span></div>}
                            {o.social_handle && <div><span className="text-muted-foreground">Instagram:</span> <span className="text-foreground">{o.social_handle}</span></div>}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ATHLETE PROFILES */}
        <TabsContent value="profiles" className="mt-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Position</TableHead>
                  <TableHead className="hidden md:table-cell">Grad Year</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No profiles found</TableCell></TableRow>
                ) : profiles.map((p) => (
                  <TableRow key={p.user_id}>
                    <TableCell className="font-medium text-sm">{p.display_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{p.email || "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground capitalize text-sm">{p.position || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{p.graduation_year || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadsCustomersPanel;
