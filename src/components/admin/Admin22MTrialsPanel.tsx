import { useState } from "react";
import { format } from "date-fns";
import { Copy, Plus, Users, Clock, CheckCircle, AlertTriangle, Calendar, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  useAdminTrials,
  useAdmin22MInvites,
  useCreate22MInvite,
  useExtendTrial,
} from "@/hooks/use22MTrialStatus";

const Admin22MTrialsPanel = () => {
  const { toast } = useToast();
  const { data: trials, isLoading: trialsLoading } = useAdminTrials();
  const { data: invites, isLoading: invitesLoading } = useAdmin22MInvites();
  const createInvite = useCreate22MInvite();
  const extendTrial = useExtendTrial();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newInviteLabel, setNewInviteLabel] = useState("");
  const [newInviteMaxUses, setNewInviteMaxUses] = useState("50");
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState("7");

  const activeTrials = trials?.filter((t) => {
    const endDate = new Date(t.trial_end_date);
    return t.trial_active && endDate > new Date();
  }) || [];

  const expiredTrials = trials?.filter((t) => {
    const endDate = new Date(t.trial_end_date);
    return endDate <= new Date();
  }) || [];

  const convertedTrials = trials?.filter((t) => t.converted_at) || [];

  const handleCreateInvite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const result = await createInvite.mutateAsync({
        label: newInviteLabel || "22M Baseball Program",
        maxUses: parseInt(newInviteMaxUses) || 50,
        createdBy: user.id,
      });

      toast({
        title: "Invite Created",
        description: "New 22M invite link has been generated.",
      });

      setCreateDialogOpen(false);
      setNewInviteLabel("");
      setNewInviteMaxUses("50");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create invite",
        variant: "destructive",
      });
    }
  };

  const handleExtendTrial = async () => {
    if (!selectedTrialId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await extendTrial.mutateAsync({
        trialId: selectedTrialId,
        additionalDays: parseInt(extendDays) || 7,
        adminId: user.id,
      });

      toast({
        title: "Trial Extended",
        description: `Trial extended by ${extendDays} days.`,
      });

      setExtendDialogOpen(false);
      setSelectedTrialId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to extend trial",
        variant: "destructive",
      });
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/claim-22m?invite=${token}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Copied!", description: "Invite link copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Trials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{activeTrials.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expired Trials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{expiredTrials.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Converted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold">{convertedTrials.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">
                {invites?.filter((i) => i.is_active).length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trials">
        <TabsList>
          <TabsTrigger value="trials">Athlete Trials</TabsTrigger>
          <TabsTrigger value="invites">Invite Links</TabsTrigger>
        </TabsList>

        <TabsContent value="trials" className="mt-4">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Trial Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading trials...
                    </TableCell>
                  </TableRow>
                ) : trials?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No trials yet
                    </TableCell>
                  </TableRow>
                ) : (
                  trials?.map((trial) => {
                    const endDate = new Date(trial.trial_end_date);
                    const isExpired = endDate <= new Date();
                    const isConverted = !!trial.converted_at;
                    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

                    return (
                      <TableRow key={trial.id}>
                        <TableCell className="font-mono text-xs">
                          {trial.user_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {trial.trial_type?.replace(/_/g, " ").toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(trial.trial_start_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(endDate, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {isConverted ? (
                            <Badge className="bg-primary/20 text-primary">Converted</Badge>
                          ) : isExpired ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : (
                            <Badge variant="default">{daysLeft}d left</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!isConverted && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTrialId(trial.id);
                                setExtendDialogOpen(true);
                              }}
                            >
                              Extend
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="invites" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="vault">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invite Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create 22M Invite Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Label (Team/Group Name)</Label>
                    <Input
                      value={newInviteLabel}
                      onChange={(e) => setNewInviteLabel(e.target.value)}
                      placeholder="e.g., 22M Spring 2026 Cohort"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Uses</Label>
                    <Input
                      type="number"
                      value={newInviteMaxUses}
                      onChange={(e) => setNewInviteMaxUses(e.target.value)}
                      placeholder="50"
                    />
                  </div>
                  <Button
                    variant="vault"
                    className="w-full"
                    onClick={handleCreateInvite}
                    disabled={createInvite.isPending}
                  >
                    Generate Link
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading invites...
                    </TableCell>
                  </TableRow>
                ) : invites?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No invite links created yet
                    </TableCell>
                  </TableRow>
                ) : (
                  invites?.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">
                        {invite.label || "Unnamed"}
                      </TableCell>
                      <TableCell>
                        {invite.used_count || 0} / {invite.max_uses || "∞"}
                      </TableCell>
                      <TableCell>
                        {invite.is_active ? (
                          <Badge>Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invite.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyInviteLink(invite.token)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy Link
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Extend Trial Dialog */}
      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Trial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Additional Days</Label>
              <Input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                placeholder="7"
              />
            </div>
            <Button
              variant="vault"
              className="w-full"
              onClick={handleExtendTrial}
              disabled={extendTrial.isPending}
            >
              Extend Trial
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin22MTrialsPanel;
