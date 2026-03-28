import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Trash2, Loader2, Shield, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WhitelistEntry {
  id: string;
  email: string;
  full_access: boolean;
  admin_access: boolean;
  notes: string | null;
  created_at: string;
}

const TeamWhitelistManager = () => {
  const [entries, setEntries] = useState<WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newFullAccess, setNewFullAccess] = useState(true);
  const [newAdminAccess, setNewAdminAccess] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("team_whitelist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching whitelist:", error);
      toast({
        title: "Error",
        description: "Failed to load team whitelist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!newEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("team_whitelist")
        .insert({
          email: newEmail.toLowerCase().trim(),
          full_access: newFullAccess,
          admin_access: newAdminAccess,
          notes: newNotes.trim() || null,
          added_by: user?.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already exists",
            description: "This email is already in the whitelist",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setEntries(prev => [data, ...prev]);
      setNewEmail("");
      setNewNotes("");
      setNewFullAccess(true);
      setNewAdminAccess(false);
      
      toast({
        title: "Team member added",
        description: `${newEmail} now has ${newAdminAccess ? 'admin' : 'full'} access`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add team member",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleToggleAccess = async (entry: WhitelistEntry, field: 'full_access' | 'admin_access') => {
    const newValue = !entry[field];
    
    try {
      const { error } = await supabase
        .from("team_whitelist")
        .update({ [field]: newValue })
        .eq("id", entry.id);

      if (error) throw error;

      setEntries(prev => 
        prev.map(e => e.id === entry.id ? { ...e, [field]: newValue } : e)
      );
      
      toast({
        title: "Access updated",
        description: `${entry.email} ${field.replace('_', ' ')} is now ${newValue ? 'enabled' : 'disabled'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update access",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, email: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("team_whitelist")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setEntries(prev => prev.filter(e => e.id !== id));
      toast({
        title: "Removed",
        description: `${email} has been removed from the team whitelist`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Entry Form */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-accent" />
          Add Team Member
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="teammate@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="e.g., QA Tester, Marketing"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Switch
              id="full_access"
              checked={newFullAccess}
              onCheckedChange={setNewFullAccess}
            />
            <Label htmlFor="full_access" className="cursor-pointer">
              Full App Access (bypass subscription)
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="admin_access"
              checked={newAdminAccess}
              onCheckedChange={setNewAdminAccess}
            />
            <Label htmlFor="admin_access" className="cursor-pointer">
              Admin Dashboard Access
            </Label>
          </div>
        </div>
        
        <Button
          variant="vault"
          onClick={handleAddEntry}
          disabled={adding || !newEmail.trim()}
          className="mt-4"
        >
          {adding ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Add to Whitelist
        </Button>
      </div>

      {/* Current Whitelist */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-display text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Team Whitelist ({entries.length})
          </h3>
        </div>

        {entries.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No team members added yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add email addresses above to grant team access
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-accent">
                      {entry.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{entry.email}</p>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={entry.full_access}
                      onCheckedChange={() => handleToggleAccess(entry, 'full_access')}
                    />
                    <span className="text-sm text-muted-foreground">Full Access</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={entry.admin_access}
                      onCheckedChange={() => handleToggleAccess(entry, 'admin_access')}
                    />
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entry.id, entry.email)}
                    disabled={deletingId === entry.id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {deletingId === entry.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">Access Levels:</p>
        <ul className="space-y-1">
          <li><span className="text-accent font-medium">Full Access</span> — Bypasses subscription requirements, grants access to all premium features</li>
          <li><span className="text-red-600 font-medium">Admin Access</span> — Grants access to the Admin Dashboard and management tools</li>
        </ul>
        <p className="mt-3 text-xs">
          Team members must sign up with the exact email address listed above to receive access.
        </p>
      </div>
    </div>
  );
};

export default TeamWhitelistManager;
