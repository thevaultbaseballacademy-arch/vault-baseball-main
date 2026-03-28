import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, Clock, CheckCircle, XCircle, AlertTriangle, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeletionRequest {
  id: string;
  user_id: string;
  user_email: string;
  reason: string | null;
  status: string;
  requested_at: string;
  processed_at: string | null;
  processed_by: string | null;
  admin_notes: string | null;
}

const DeletionRequestsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | "complete" | null>(null);
  const [processingPurge, setProcessingPurge] = useState(false);

  const handleRunPurge = async () => {
    setProcessingPurge(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-deletion-requests');
      
      if (error) throw error;
      
      toast({
        title: "Purge Complete",
        description: `Processed ${data.processed} requests. Success: ${data.success}, Failed: ${data.failed}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["deletion-requests-admin"] });
    } catch (error: any) {
      toast({
        title: "Purge Failed",
        description: error.message || "Failed to run data purge",
        variant: "destructive",
      });
    } finally {
      setProcessingPurge(false);
    }
  };
  const { data: requests, isLoading } = useQuery({
    queryKey: ["deletion-requests-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_deletion_requests")
        .select("*")
        .order("requested_at", { ascending: false });
      
      if (error) throw error;
      return data as DeletionRequest[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("data_deletion_requests")
        .update({
          status,
          admin_notes: notes,
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Request Updated", description: "The deletion request has been updated." });
      queryClient.invalidateQueries({ queryKey: ["deletion-requests-admin"] });
      setSelectedRequest(null);
      setAdminNotes("");
      setActionType(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update request",
        variant: "destructive",
      });
    },
  });

  const handleAction = (request: DeletionRequest, action: "approve" | "reject" | "complete") => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminNotes(request.admin_notes || "");
  };

  const confirmAction = () => {
    if (!selectedRequest || !actionType) return;
    
    const statusMap = {
      approve: "approved",
      reject: "rejected",
      complete: "completed",
    };
    
    updateMutation.mutate({
      id: selectedRequest.id,
      status: statusMap[actionType],
      notes: adminNotes,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = requests?.filter(r => r.status === "pending").length || 0;
  const approvedCount = requests?.filter(r => r.status === "approved").length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Data Deletion Requests
          </h2>
          <p className="text-sm text-muted-foreground">
            GDPR Right to Erasure requests from users
          </p>
        </div>
        <div className="flex items-center gap-2">
          {approvedCount > 0 && (
            <Button
              onClick={handleRunPurge}
              disabled={processingPurge}
              variant="destructive"
              size="sm"
            >
              {processingPurge ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Purge Now ({approvedCount})
                </>
              )}
            </Button>
          )}
          {(pendingCount > 0 || approvedCount > 0) && (
            <div className="flex gap-2">
              {pendingCount > 0 && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                  {pendingCount} Pending
                </Badge>
              )}
              {approvedCount > 0 && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                  {approvedCount} To Process
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-secondary/50 rounded-xl p-4 text-sm">
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Automated Processing</p>
            <p className="text-muted-foreground">
              Approved deletion requests are automatically processed daily at 4 AM UTC. 
              Use "Run Purge Now" for immediate processing.
            </p>
          </div>
        </div>
      </div>

      {requests?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No deletion requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests?.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(request.status)}
                      <span className="font-medium">{request.user_email}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Requested: {new Date(request.requested_at).toLocaleString()}
                    </p>
                    {request.reason && (
                      <p className="text-sm">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                    )}
                    {request.admin_notes && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Admin notes:</span> {request.admin_notes}
                      </p>
                    )}
                    {request.processed_at && (
                      <p className="text-xs text-muted-foreground">
                        Processed: {new Date(request.processed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {request.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(request, "approve")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/50 hover:bg-destructive/10"
                          onClick={() => handleAction(request, "reject")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {request.status === "approved" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleAction(request, "complete")}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => {
        setSelectedRequest(null);
        setActionType(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approve Deletion Request"}
              {actionType === "reject" && "Reject Deletion Request"}
              {actionType === "complete" && "Complete Deletion Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && (
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg mt-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Approving this request means you commit to deleting all user data within 30 days 
                    as required by GDPR. Ensure data is backed up if needed for legal compliance.
                  </span>
                </div>
              )}
              {actionType === "complete" && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg mt-2">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span>
                    Confirm that all user data has been permanently deleted from all systems 
                    including backups (within allowed retention periods).
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this action..."
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedRequest(null);
              setActionType(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={updateMutation.isPending}
              variant={actionType === "reject" ? "destructive" : "default"}
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {actionType === "approve" && "Approve Request"}
              {actionType === "reject" && "Reject Request"}
              {actionType === "complete" && "Confirm Completed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeletionRequestsManager;
