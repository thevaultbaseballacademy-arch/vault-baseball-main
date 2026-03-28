import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Award, Shield, ShieldCheck, UserCheck, UserX, Star, Search,
  CheckCircle2, XCircle, Clock, AlertTriangle, MoreHorizontal,
  FileText, Video, ExternalLink, MessageSquare, ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup, RadioGroupItem,
} from "@/components/ui/radio-group";
import { format } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  applied: { label: "Applied", color: "bg-blue-100 text-blue-800", icon: Clock },
  pending_review: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  certification_required: { label: "Cert Required", color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
  certified: { label: "Certified", color: "bg-emerald-100 text-emerald-800", icon: Award },
  bypass_certified: { label: "Eddie Certified", color: "bg-purple-100 text-purple-800", icon: ShieldCheck },
  approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
  suspended: { label: "Suspended", color: "bg-red-200 text-red-900", icon: UserX },
};

const COACH_TYPES = [
  { value: "standard", label: "Standard Coach", description: "Must complete Vault Certification before marketplace access" },
  { value: "vault_certified", label: "Vault Certified Coach", description: "Already completed certification — marketplace access allowed" },
  { value: "vault_staff", label: "Vault Staff Coach", description: "Internal staff — bypass certification, immediate access" },
  { value: "eddie_certified", label: "Certified Directly by Eddie Mejia", description: "In-person certified — bypass certification, immediate access" },
];

const CoachApprovalPanel = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailRequest, setDetailRequest] = useState<any>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<any>(null);
  const [selectedCoachType, setSelectedCoachType] = useState("standard");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoTarget, setInfoTarget] = useState<any>(null);
  const [infoMessage, setInfoMessage] = useState("");

  // Fetch application requests with full details
  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-coach-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_registration_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch coaches for cross-referencing
  const { data: coaches } = useQuery({
    queryKey: ["admin-coaches-approval"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-coach-requests"] });
    queryClient.invalidateQueries({ queryKey: ["admin-coaches-approval"] });
    queryClient.invalidateQueries({ queryKey: ["admin-coaches"] });
  };

  const updateRequest = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase
        .from("coach_registration_requests")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidateAll,
    onError: (e) => toast.error(e.message),
  });

  const updateCoach = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (updates.is_marketplace_approved !== undefined || updates.is_bypass_certified !== undefined) {
        updates.approved_by_admin = user?.id;
      }
      const { error } = await supabase.from("coaches").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidateAll,
    onError: (e) => toast.error(e.message),
  });

  const handleApprove = async (request: any, coachType: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Determine updates based on coach type
    let coachUpdates: Record<string, any> = {
      marketplace_status: "approved",
      is_marketplace_approved: true,
      is_certified: true,
      approved_by_admin: user?.id,
    };

    let needsCertification = false;

    switch (coachType) {
      case "standard":
        coachUpdates = {
          marketplace_status: "certification_required",
          is_marketplace_approved: false,
          is_certified: false,
          approved_by_admin: user?.id,
        };
        needsCertification = true;
        break;
      case "vault_certified":
        coachUpdates.is_certified = true;
        break;
      case "vault_staff":
        coachUpdates.is_staff = true;
        coachUpdates.is_bypass_certified = true;
        coachUpdates.is_certified = true;
        break;
      case "eddie_certified":
        coachUpdates.is_bypass_certified = true;
        coachUpdates.is_certified = true;
        break;
    }

    // Find or create coach record
    const existingCoach = coaches?.find((c: any) => c.user_id === request.user_id);

    if (existingCoach) {
      await updateCoach.mutateAsync({ id: existingCoach.id, updates: coachUpdates });
    } else {
      // Create coach record
      const { error } = await supabase.from("coaches").insert({
        user_id: request.user_id,
        name: request.full_name,
        email: request.email,
        org_id: "00000000-0000-0000-0000-000000000000",
        ...coachUpdates,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
    }

    // Assign coach role if not standard (standard waits for certification)
    if (!needsCertification) {
      await supabase.from("user_roles").upsert(
        { user_id: request.user_id, role: "coach" },
        { onConflict: "user_id,role" }
      );
      await supabase.from("coach_onboarding").upsert(
        { user_id: request.user_id },
        { onConflict: "user_id" }
      );
    }

    // Update request status
    await updateRequest.mutateAsync({
      id: request.id,
      updates: {
        status: needsCertification ? "certification_required" : "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      },
    });

    toast.success(
      needsCertification
        ? `${request.full_name} approved — certification required before marketplace access`
        : `${request.full_name} approved and added to marketplace`
    );
    setApproveDialogOpen(false);
    setDetailRequest(null);
  };

  const handleReject = async (request: any, reason: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    await updateRequest.mutateAsync({
      id: request.id,
      updates: {
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      },
    });

    const existingCoach = coaches?.find((c: any) => c.user_id === request.user_id);
    if (existingCoach) {
      await updateCoach.mutateAsync({
        id: existingCoach.id,
        updates: { marketplace_status: "rejected", is_marketplace_approved: false },
      });
    }

    toast.success(`${request.full_name} rejected`);
    setRejectDialogOpen(false);
    setDetailRequest(null);
  };

  const handleRequestMoreInfo = async (request: any, msg: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    await updateRequest.mutateAsync({
      id: request.id,
      updates: {
        status: "pending_review",
        reviewed_by: user?.id,
      },
    });

    // Log the info request as activity
    await supabase.from("activity_feed").insert({
      activity_type: "coach_info_request",
      title: `More info requested from ${request.full_name}`,
      description: msg,
      user_id: user?.id,
    });

    toast.success(`Info request sent to ${request.full_name}`);
    setInfoDialogOpen(false);
    setDetailRequest(null);
  };

  // Coach status management (for existing coaches tab)
  const handleSuspend = (coach: any) => {
    updateCoach.mutate({
      id: coach.id,
      updates: { is_marketplace_approved: false, marketplace_status: "suspended", status: "Suspended" },
    });
  };

  const handleToggleStaff = (coach: any, value: boolean) => {
    updateCoach.mutate({ id: coach.id, updates: { is_staff: value } });
  };

  const handleSetStatus = (coach: any, status: string) => {
    const updates: Record<string, any> = { marketplace_status: status };
    if (status === "approved") updates.is_marketplace_approved = true;
    if (status === "suspended" || status === "rejected") updates.is_marketplace_approved = false;
    updateCoach.mutate({ id: coach.id, updates });
  };

  const filtered = (requests || []).filter((r: any) => {
    const matchSearch =
      !searchTerm ||
      r.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: requests?.length || 0,
    applied: requests?.filter((r: any) => r.status === "applied").length || 0,
    pending: requests?.filter((r: any) => r.status === "pending_review").length || 0,
    approved: requests?.filter((r: any) => r.status === "approved").length || 0,
    rejected: requests?.filter((r: any) => r.status === "rejected").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Applications", value: counts.total, icon: Shield, color: "text-foreground" },
          { label: "New Applications", value: counts.applied, icon: Clock, color: "text-blue-600" },
          { label: "Pending Review", value: counts.pending, icon: AlertTriangle, color: "text-yellow-600" },
          { label: "Approved", value: counts.approved, icon: CheckCircle2, color: "text-green-600" },
          { label: "Rejected", value: counts.rejected, icon: XCircle, color: "text-red-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className={`text-2xl font-display ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="certification_required">Cert Required</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Materials</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">Loading...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No applications match your filters.</TableCell>
              </TableRow>
            ) : (
              filtered.map((req: any) => {
                const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.applied;
                const specialties = (req as any).specialties || [];
                return (
                  <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailRequest(req)}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{req.full_name}</p>
                        <p className="text-xs text-muted-foreground">{req.email}</p>
                        {(req as any).location && (
                          <p className="text-xs text-muted-foreground">{(req as any).location}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {specialties.slice(0, 3).map((s: string) => (
                          <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">{s}</Badge>
                        ))}
                        {specialties.length > 3 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{specialties.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-[180px]">
                        {(req as any).coaching_experience || req.specialization || "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        {(req as any).resume_url && (
                          <button onClick={async (e) => { e.stopPropagation(); const { data } = await supabase.storage.from('coach-applications').createSignedUrl((req as any).resume_url, 3600); if (data?.signedUrl) window.open(data.signedUrl, '_blank'); }}>
                            <FileText className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </button>
                        )}
                        {(req as any).video_sample_url && (
                          <button onClick={async (e) => { e.stopPropagation(); const { data } = await supabase.storage.from('coach-applications').createSignedUrl((req as any).video_sample_url, 3600); if (data?.signedUrl) window.open(data.signedUrl, '_blank'); }}>
                            <Video className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </button>
                        )}
                        {!(req as any).resume_url && !(req as any).video_sample_url && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(req.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDetailRequest(req); }}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={!!detailRequest} onOpenChange={(open) => !open && setDetailRequest(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wide">APPLICATION REVIEW</DialogTitle>
            <DialogDescription>Review applicant details and take action.</DialogDescription>
          </DialogHeader>
          {detailRequest && (
            <div className="space-y-5 pt-2">
              {/* Applicant Info */}
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Full Name" value={detailRequest.full_name} />
                <InfoField label="Email" value={detailRequest.email} />
                <InfoField label="Phone" value={(detailRequest as any).phone} />
                <InfoField label="Location" value={(detailRequest as any).location} />
                <InfoField label="Organization" value={detailRequest.organization} />
                <InfoField label="Social Media" value={(detailRequest as any).social_media} />
              </div>

              {/* Specialties */}
              {((detailRequest as any).specialties?.length > 0) && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Coaching Specialties</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(detailRequest as any).specialties.map((s: string) => (
                      <Badge key={s} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {(detailRequest as any).playing_experience && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Playing Experience</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{(detailRequest as any).playing_experience}</p>
                </div>
              )}
              {(detailRequest as any).coaching_experience && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Coaching Experience</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{(detailRequest as any).coaching_experience}</p>
                </div>
              )}

              {/* Why Vault */}
              {detailRequest.message && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Why They Want to Coach on Vault</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{detailRequest.message}</p>
                </div>
              )}

              {/* Materials */}
              <div className="flex gap-3">
                {(detailRequest as any).resume_url && (
                  <button onClick={async () => { const { data } = await supabase.storage.from('coach-applications').createSignedUrl((detailRequest as any).resume_url, 3600); if (data?.signedUrl) window.open(data.signedUrl, '_blank'); }}
                    className="flex items-center gap-2 px-3 py-2 border border-border text-sm text-foreground hover:bg-muted transition-colors">
                    <FileText className="w-4 h-4" /> View Resume <ExternalLink className="w-3 h-3" />
                  </button>
                )}
                {(detailRequest as any).video_sample_url && (
                  <button onClick={async () => { const { data } = await supabase.storage.from('coach-applications').createSignedUrl((detailRequest as any).video_sample_url, 3600); if (data?.signedUrl) window.open(data.signedUrl, '_blank'); }}
                    className="flex items-center gap-2 px-3 py-2 border border-border text-sm text-foreground hover:bg-muted transition-colors">
                    <Video className="w-4 h-4" /> View Video <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Status & Date */}
              <div className="flex items-center gap-4 pt-2 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={(STATUS_CONFIG[detailRequest.status] || STATUS_CONFIG.applied).color}>
                    {(STATUS_CONFIG[detailRequest.status] || STATUS_CONFIG.applied).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Applied</p>
                  <p className="text-sm text-foreground">{format(new Date(detailRequest.created_at), "MMMM d, yyyy")}</p>
                </div>
                {detailRequest.reviewed_at && (
                  <div>
                    <p className="text-xs text-muted-foreground">Reviewed</p>
                    <p className="text-sm text-foreground">{format(new Date(detailRequest.reviewed_at), "MMMM d, yyyy")}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {["applied", "pending_review"].includes(detailRequest.status) && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setApproveTarget(detailRequest);
                      setSelectedCoachType("standard");
                      setApproveDialogOpen(true);
                    }}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setInfoTarget(detailRequest);
                      setInfoMessage("");
                      setInfoDialogOpen(true);
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Request More Info
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setRejectTarget(detailRequest);
                      setRejectReason("");
                      setRejectDialogOpen(true);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog — Coach Type Selection */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wide">APPROVE COACH</DialogTitle>
            <DialogDescription>
              Choose the coach type for <span className="font-medium text-foreground">{approveTarget?.full_name}</span>. This determines their certification and marketplace access path.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={selectedCoachType} onValueChange={setSelectedCoachType} className="space-y-3 pt-2">
            {COACH_TYPES.map((type) => (
              <label
                key={type.value}
                className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                  selectedCoachType === type.value
                    ? "border-foreground bg-muted/50"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <RadioGroupItem value={type.value} className="mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{type.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => approveTarget && handleApprove(approveTarget, selectedCoachType)}
              disabled={updateRequest.isPending || updateCoach.isPending}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wide">REJECT APPLICATION</DialogTitle>
            <DialogDescription>
              Reject the application from <span className="font-medium text-foreground">{rejectTarget?.full_name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Label>Reason (optional)</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => rejectTarget && handleReject(rejectTarget, rejectReason)}
              disabled={updateRequest.isPending}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request More Info Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wide">REQUEST MORE INFO</DialogTitle>
            <DialogDescription>
              Ask <span className="font-medium text-foreground">{infoTarget?.full_name}</span> for additional information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Label>Message</Label>
            <Textarea
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
              placeholder="What additional information do you need?"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInfoDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => infoTarget && handleRequestMoreInfo(infoTarget, infoMessage)}
              disabled={!infoMessage.trim() || updateRequest.isPending}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoField = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm text-foreground">{value || "—"}</p>
  </div>
);

export default CoachApprovalPanel;
