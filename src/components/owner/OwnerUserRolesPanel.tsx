import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search, Check, Plus, Loader2, Shield, Award, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ROLES = ["admin", "coach", "athlete"] as const;

interface Profile {
  user_id: string;
  display_name: string | null;
  email?: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "coach" | "athlete";
}

export const OwnerUserRolesPanel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: profiles = [], refetch: refetchProfiles } = useQuery({
    queryKey: ["owner-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, email")
        .order("display_name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: userRoles = [], refetch: refetchRoles } = useQuery({
    queryKey: ["owner-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("id, user_id, role");
      if (error) throw error;
      return data || [];
    },
  });

  const filteredProfiles = profiles.filter(
    (p) =>
      p.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasRole = (userId: string, role: string) =>
    userRoles.some((r) => r.user_id === userId && r.role === role);

  const toggleRole = async (userId: string, role: "admin" | "coach" | "athlete") => {
    setUpdatingRole(`${userId}-${role}`);
    try {
      const existing = userRoles.find((r) => r.user_id === userId && r.role === role);
      if (existing) {
        const { error } = await supabase.from("user_roles").delete().eq("id", existing.id);
        if (error) throw error;
        toast({ title: "Role removed", description: `Removed ${role} role` });
      } else {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
        if (error) throw error;
        toast({ title: "Role assigned", description: `Assigned ${role} role` });
      }
      refetchRoles();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update role", variant: "destructive" });
    } finally {
      setUpdatingRole(null);
    }
  };

  const getRoleColor = (role: string, active: boolean) => {
    if (!active) return "bg-secondary text-muted-foreground hover:bg-secondary/80";
    switch (role) {
      case "admin": return "bg-destructive/10 text-destructive border-destructive/30";
      case "coach": return "bg-primary/10 text-primary border-primary/30";
      default: return "bg-accent/10 text-accent border-accent/30";
    }
  };

  const roleCounts = {
    admin: userRoles.filter((r) => r.role === "admin").length,
    coach: userRoles.filter((r) => r.role === "coach").length,
    athlete: userRoles.filter((r) => r.role === "athlete").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display text-foreground mb-1">USER ROLES</h1>
        <p className="text-sm text-muted-foreground">Assign admin, coach, and athlete roles to users.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">Admins</span>
          </div>
          <p className="text-2xl font-display text-foreground">{roleCounts.admin}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Coaches</span>
          </div>
          <p className="text-2xl font-display text-foreground">{roleCounts.coach}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-accent" />
            <span className="text-sm text-accent">Athletes</span>
          </div>
          <p className="text-2xl font-display text-foreground">{roleCounts.athlete}</p>
        </div>
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

      {/* User List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-display text-foreground">Users ({filteredProfiles.length})</h2>
          <span className="text-xs text-muted-foreground">{profiles.length} total</span>
        </div>
        <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
          {filteredProfiles.map((profile) => (
            <div key={profile.user_id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-accent">
                    {profile.display_name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{profile.display_name || "Unknown"}</p>
                  {profile.email && (
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  )}
                </div>
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
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : active ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
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
  );
};
