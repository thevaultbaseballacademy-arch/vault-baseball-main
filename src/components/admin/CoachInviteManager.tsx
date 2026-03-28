import { useState, useEffect } from "react";
import { Link2, Plus, Copy, Trash2, Loader2, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InviteToken {
  id: string;
  token: string;
  label: string | null;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface RegistrationRequest {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  organization: string | null;
  specialization: string | null;
  status: string;
  created_at: string;
}

export function CoachInviteManager() {
  const [tokens, setTokens] = useState<InviteToken[]>([]);
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel] = useState("");
  const [maxUses, setMaxUses] = useState("10");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [tokensRes, requestsRes] = await Promise.all([
      supabase.from("coach_invite_tokens").select("*").order("created_at", { ascending: false }),
      supabase.from("coach_registration_requests").select("*").order("created_at", { ascending: false }),
    ]);
    setTokens(tokensRes.data || []);
    setRequests(requestsRes.data || []);
    setLoading(false);
  };

  const createToken = async () => {
    setCreating(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase.from("coach_invite_tokens").insert({
      created_by: userData.user.id,
      label: label || null,
      max_uses: parseInt(maxUses) || 10,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to create invite link", variant: "destructive" });
    } else {
      toast({ title: "Created", description: "Invite link created successfully" });
      setShowCreate(false);
      setLabel("");
      setMaxUses("10");
      fetchData();
    }
    setCreating(false);
  };

  const copyLink = (token: string, id: string) => {
    const url = `${window.location.origin}/coach-register?invite=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied!", description: "Invite link copied to clipboard" });
  };

  const deactivateToken = async (id: string) => {
    await supabase.from("coach_invite_tokens").update({ is_active: false }).eq("id", id);
    fetchData();
  };

  const handleRequest = async (requestId: string, userId: string, action: "approved" | "rejected") => {
    const { data: userData } = await supabase.auth.getUser();

    // Update request
    await supabase.from("coach_registration_requests").update({
      status: action,
      reviewed_by: userData?.user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", requestId);

    if (action === "approved") {
      // Assign coach role
      await supabase.from("user_roles").insert({ user_id: userId, role: "coach" });
      // Create onboarding
      await supabase.from("coach_onboarding").upsert({ user_id: userId }, { onConflict: "user_id" });
    }

    toast({
      title: action === "approved" ? "Approved" : "Rejected",
      description: `Coach application has been ${action}.`,
    });
    fetchData();
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }

  const pendingRequests = requests.filter(r => r.status === "pending");

  return (
    <div className="space-y-8">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Pending Coach Applications ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div key={req.id} className="bg-card border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{req.full_name}</p>
                  <p className="text-sm text-muted-foreground">{req.email}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                    {req.organization && <span>{req.organization}</span>}
                    {req.specialization && <span>• {req.specialization}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="vault" onClick={() => handleRequest(req.id, req.user_id, "approved")}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRequest(req.id, req.user_id, "rejected")}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Links */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display text-foreground flex items-center gap-2">
            <Link2 className="w-5 h-5 text-accent" />
            Coach Invite Links
          </h3>
          <Button variant="vault" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Create Link
          </Button>
        </div>

        {tokens.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Link2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No invite links yet. Create one to share with coaches.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map(token => (
              <div key={token.id} className={`bg-card border rounded-xl p-4 flex items-center gap-4 ${token.is_active ? "border-border" : "border-border opacity-50"}`}>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{token.label || "Unnamed Link"}</p>
                  <p className="text-xs text-muted-foreground">
                    Used {token.used_count}/{token.max_uses} • Created {new Date(token.created_at).toLocaleDateString()}
                    {!token.is_active && " • Deactivated"}
                  </p>
                </div>
                {token.is_active && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(token.token, token.id)}
                    >
                      {copiedId === token.id ? (
                        <><CheckCircle className="w-4 h-4 mr-1 text-accent" /> Copied</>
                      ) : (
                        <><Copy className="w-4 h-4 mr-1" /> Copy</>
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deactivateToken(token.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent applications */}
      {requests.filter(r => r.status !== "pending").length > 0 && (
        <div>
          <h3 className="text-lg font-display text-foreground mb-4">Recent Applications</h3>
          <div className="space-y-2">
            {requests.filter(r => r.status !== "pending").slice(0, 10).map(req => (
              <div key={req.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${req.status === "approved" ? "bg-accent" : "bg-destructive"}`} />
                <span className="text-sm text-foreground flex-1">{req.full_name}</span>
                <span className="text-xs text-muted-foreground capitalize">{req.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Create Coach Invite Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Label (optional)</Label>
              <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Spring 2026 Coaches" />
            </div>
            <div className="space-y-2">
              <Label>Max Uses</Label>
              <Input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} min="1" max="100" />
            </div>
            <Button variant="vault" className="w-full" onClick={createToken} disabled={creating}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generate Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
