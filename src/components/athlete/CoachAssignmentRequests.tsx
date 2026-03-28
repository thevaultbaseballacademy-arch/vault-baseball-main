import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, UserX, Loader2, Users, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PendingAssignment {
  id: string;
  coach_user_id: string;
  approval_requested_at: string | null;
  created_at: string;
  coach_name: string | null;
  coach_email: string | null;
}

export const CoachAssignmentRequests = ({ userId }: { userId: string }) => {
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchPendingAssignments();
    }
  }, [userId]);

  const fetchPendingAssignments = async () => {
    try {
      // Fetch assignments where athlete_approved is null (pending)
      const { data: assignments, error: assignmentsError } = await supabase
        .from('coach_athlete_assignments')
        .select('id, coach_user_id, approval_requested_at, created_at')
        .eq('athlete_user_id', userId)
        .eq('is_active', true)
        .is('athlete_approved', null);

      if (assignmentsError) throw assignmentsError;

      if (!assignments || assignments.length === 0) {
        setPendingAssignments([]);
        setLoading(false);
        return;
      }

      // Fetch coach profiles - use profiles_public view to respect email privacy
      const coachIds = assignments.map(a => a.coach_user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles_public')
        .select('user_id, display_name, email')
        .in('user_id', coachIds);

      if (profilesError) throw profilesError;

      // Combine data
      const enrichedAssignments = assignments.map(assignment => {
        const profile = profiles?.find(p => p.user_id === assignment.coach_user_id);
        return {
          ...assignment,
          coach_name: profile?.display_name || null,
          coach_email: profile?.email || null,
        };
      });

      setPendingAssignments(enrichedAssignments);
    } catch (error) {
      console.error('Error fetching pending assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load coach assignment requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (assignmentId: string, approved: boolean) => {
    setProcessingId(assignmentId);
    try {
      const { error } = await supabase
        .from('coach_athlete_assignments')
        .update({
          athlete_approved: approved,
          approved_at: approved ? new Date().toISOString() : null,
        })
        .eq('id', assignmentId)
        .eq('athlete_user_id', userId);

      if (error) throw error;

      toast({
        title: approved ? "Coach Approved" : "Request Declined",
        description: approved 
          ? "The coach can now view your profile and training data." 
          : "The assignment request has been declined.",
      });

      // Remove from pending list
      setPendingAssignments(prev => prev.filter(a => a.id !== assignmentId));
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-display text-foreground">Coach Requests</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (pendingAssignments.length === 0) {
    return null; // Hide the section if no pending requests
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display text-foreground">Coach Requests</h2>
          <p className="text-muted-foreground text-sm">
            {pendingAssignments.length} pending request{pendingAssignments.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {pendingAssignments.map((assignment) => (
            <motion.div
              key={assignment.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-secondary/50 rounded-xl p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {assignment.coach_name || assignment.coach_email || "Unknown Coach"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Requested {formatDate(assignment.approval_requested_at || assignment.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 sm:flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApproval(assignment.id, false)}
                    disabled={processingId === assignment.id}
                    className="flex-1 sm:flex-none"
                  >
                    {processingId === assignment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </>
                    )}
                  </Button>
                  <Button
                    variant="vault"
                    size="sm"
                    onClick={() => handleApproval(assignment.id, true)}
                    disabled={processingId === assignment.id}
                    className="flex-1 sm:flex-none"
                  >
                    {processingId === assignment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3 bg-muted/50 rounded-lg px-3 py-2">
                By approving, this coach will be able to view your profile, training data, and check-ins.
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CoachAssignmentRequests;
