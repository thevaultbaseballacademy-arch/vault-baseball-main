import { useState } from "react";
import { Trash2, Loader2, AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeletionRequest {
  id: string;
  status: string;
  reason: string | null;
  requested_at: string;
  processed_at: string | null;
  admin_notes: string | null;
}

interface DataDeletionPanelProps {
  userId: string;
  userEmail: string;
}

const DataDeletionPanel = ({ userId, userEmail }: DataDeletionPanelProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: existingRequest, refetch } = useQuery({
    queryKey: ["deletion-request", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_deletion_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as DeletionRequest | null;
    },
    enabled: !!userId,
  });

  const handleSubmitRequest = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("data_deletion_requests")
        .insert({
          user_id: userId,
          user_email: userEmail,
          reason: reason || null,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your data deletion request has been submitted and will be reviewed by our team.",
      });
      
      setReason("");
      setDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Deletion request error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit deletion request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "approved":
        return "Approved - Processing";
      case "completed":
        return "Completed";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const hasPendingRequest = existingRequest && 
    (existingRequest.status === "pending" || existingRequest.status === "approved");

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <Trash2 className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-display text-foreground">Delete My Data</h2>
          <p className="text-muted-foreground text-sm">Request deletion of all personal data (GDPR)</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Right to Erasure (GDPR Article 17)</p>
              <p className="text-muted-foreground">
                You have the right to request deletion of your personal data. This action is irreversible 
                and will remove all your data from our systems, including your profile, activity history, 
                certifications, and any other personal information.
              </p>
            </div>
          </div>
        </div>

        {existingRequest && (
          <div className="bg-secondary/50 rounded-xl p-4">
            <p className="text-sm font-medium text-foreground mb-2">Your Deletion Request</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(existingRequest.status)}
                <span className="text-sm font-medium">{getStatusText(existingRequest.status)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Requested: {new Date(existingRequest.requested_at).toLocaleDateString()}
              </p>
              {existingRequest.processed_at && (
                <p className="text-xs text-muted-foreground">
                  Processed: {new Date(existingRequest.processed_at).toLocaleDateString()}
                </p>
              )}
              {existingRequest.admin_notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-medium">Admin notes:</span> {existingRequest.admin_notes}
                </p>
              )}
            </div>
          </div>
        )}

        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={hasPendingRequest}
              className="w-full md:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {hasPendingRequest ? "Request Pending" : "Request Data Deletion"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Request Data Deletion</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Are you sure you want to request deletion of all your personal data? 
                  This action cannot be undone.
                </p>
                <p className="font-medium text-foreground">
                  The following will be permanently deleted:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Your profile and account information</li>
                  <li>All athletic stats and KPIs</li>
                  <li>Course progress and certificates</li>
                  <li>Community posts and comments</li>
                  <li>All uploaded videos and media</li>
                  <li>Purchase history and subscriptions</li>
                </ul>
                <div className="pt-2">
                  <label className="text-sm font-medium text-foreground">
                    Reason for deletion (optional)
                  </label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please tell us why you'd like to delete your data..."
                    className="mt-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSubmitRequest}
                disabled={submitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-xs text-muted-foreground">
          Requests are typically processed within 30 days in accordance with GDPR requirements.
        </p>
      </div>
    </div>
  );
};

export default DataDeletionPanel;
