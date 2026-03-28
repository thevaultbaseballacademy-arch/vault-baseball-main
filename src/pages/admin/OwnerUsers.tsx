import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Search, Shield, Users as UsersIcon, UserCheck, Award, Heart, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { VaultRole } from "@/lib/permissions";

const ALL_ROLES: VaultRole[] = ["owner", "admin", "coach", "athlete", "parent"];

const OwnerUsers = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ["owner-all-profiles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, email, sport_type, created_at")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ["owner-all-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("id, user_id, role");
      return data || [];
    },
  });

  const toggleRole = async (userId: string, role: VaultRole) => {
    const key = `${userId}-${role}`;
    setUpdatingRole(key);
    try {
      const existing = allRoles.find(r => r.user_id === userId && r.role === role);
      if (existing) {
        const { error } = await supabase.from("user_roles").delete().eq("id", existing.id);
        if (error) throw error;
        toast({ title: `Removed ${role} role` });
      } else {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role } as any);
        if (error) throw error;
        toast({ title: `Assigned ${role} role` });
      }
      qc.invalidateQueries({ queryKey: ["owner-all-roles"] });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setUpdatingRole(null);
    }
  };

  const getUserRoles = (userId: string) => allRoles.filter(r => r.user_id === userId).map(r => r.role as string);

  const filtered = profiles.filter(p => {
    const matchesSearch = !search || 
      p.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase());
    const userRoles = getUserRoles(p.user_id);
    const matchesRole = roleFilter === "all" || userRoles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const exportCSV = () => {
    const rows = [["Name", "Email", "Sport", "Roles", "Joined"]];
    filtered.forEach(p => {
      rows.push([
        p.display_name || "", p.email || "", p.sport_type || "",
        getUserRoles(p.user_id).join(";"), p.created_at || "",
      ]);
    });
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "users.csv";
    a.click();
  };

  const roleIcon = (role: string) => {
    switch (role) {
      case "owner": return <Shield className="w-3 h-3" />;
      case "admin": return <Shield className="w-3 h-3" />;
      case "coach": return <Award className="w-3 h-3" />;
      case "parent": return <Heart className="w-3 h-3" />;
      default: return <UserCheck className="w-3 h-3" />;
    }
  };

  const roleColor = (role: string, active: boolean) => {
    if (!active) return "bg-secondary text-muted-foreground";
    switch (role) {
      case "owner": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "admin": return "bg-destructive/10 text-destructive border-destructive/30";
      case "coach": return "bg-primary/10 text-primary border-primary/30";
      case "parent": return "bg-pink-500/10 text-pink-400 border-pink-500/30";
      default: return "bg-accent/10 text-accent border-accent/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground">USERS</h1>
          <p className="text-sm text-muted-foreground">{profiles.length} total users</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground text-xs">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground w-full text-sm"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all", ...ALL_ROLES].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${roleFilter === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* User list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
          {filtered.map(profile => {
            const userRoles = getUserRoles(profile.user_id);
            return (
              <div key={profile.user_id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">
                      {profile.display_name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{profile.display_name || "Unknown"}</p>
                    <div className="flex items-center gap-2">
                      {profile.email && <p className="text-xs text-muted-foreground truncate">{profile.email}</p>}
                      {profile.sport_type && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{profile.sport_type}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_ROLES.map(role => {
                    const active = userRoles.includes(role);
                    const isUpdating = updatingRole === `${profile.user_id}-${role}`;
                    return (
                      <button
                        key={role}
                        onClick={() => toggleRole(profile.user_id, role)}
                        disabled={isUpdating}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${roleColor(role, active)} ${active ? "border" : "border-transparent"}`}
                      >
                        {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : roleIcon(role)}
                        <span className="capitalize">{role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">No users found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerUsers;
