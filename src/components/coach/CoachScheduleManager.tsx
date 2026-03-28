import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Users, Calendar, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScheduleBuilder } from "./ScheduleBuilder";
import { ScheduleAssignment } from "./ScheduleAssignment";
import type { Position, TrainingPhase, DaySchedule } from "@/lib/calendarSchedules";

interface CustomSchedule {
  id: string;
  name: string;
  description: string | null;
  position: string | null;
  training_phase: string | null;
  schedule_data: DaySchedule[];
  created_at: string;
  assignment_count?: number;
}

export function CoachScheduleManager() {
  const [schedules, setSchedules] = useState<CustomSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CustomSchedule | null>(null);
  const [assigningSchedule, setAssigningSchedule] = useState<CustomSchedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<CustomSchedule | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: schedulesData, error: schedulesError } = await supabase
        .from("custom_training_schedules")
        .select("*")
        .eq("coach_user_id", user.id)
        .order("created_at", { ascending: false });

      if (schedulesError) throw schedulesError;

      // Get assignment counts only for this coach's schedules
      const scheduleIds = (schedulesData || []).map(s => s.id);
      let countMap = new Map<string, number>();

      if (scheduleIds.length > 0) {
        const { data: assignmentsData } = await supabase
          .from("schedule_assignments")
          .select("schedule_id")
          .in("schedule_id", scheduleIds)
          .eq("is_active", true);

        assignmentsData?.forEach(a => {
          countMap.set(a.schedule_id, (countMap.get(a.schedule_id) || 0) + 1);
        });
      }

      const schedulesWithCounts = (schedulesData || []).map(s => ({
        ...s,
        schedule_data: s.schedule_data as unknown as DaySchedule[],
        assignment_count: countMap.get(s.id) || 0,
      }));

      setSchedules(schedulesWithCounts);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        title: "Error",
        description: "Failed to load schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: {
    name: string;
    description: string;
    position: Position;
    phase: TrainingPhase;
    schedule: DaySchedule[];
  }) => {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      if (editingSchedule) {
        // Update existing
        const { error } = await supabase
          .from("custom_training_schedules")
          .update({
            name: data.name,
            description: data.description || null,
            position: data.position,
            training_phase: data.phase,
            schedule_data: JSON.parse(JSON.stringify(data.schedule)),
          })
          .eq("id", editingSchedule.id);

        if (error) throw error;

        toast({ title: "Updated", description: "Schedule updated successfully" });
      } else {
        // Create new
        const { error } = await supabase
          .from("custom_training_schedules")
          .insert([{
            coach_user_id: userData.user.id,
            name: data.name,
            description: data.description || null,
            position: data.position,
            training_phase: data.phase,
            schedule_data: JSON.parse(JSON.stringify(data.schedule)),
          }]);

        if (error) throw error;

        toast({ title: "Created", description: "Schedule created successfully" });
      }

      setShowBuilder(false);
      setEditingSchedule(null);
      fetchSchedules();
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save schedule",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSchedule) return;

    try {
      const { error } = await supabase
        .from("custom_training_schedules")
        .delete()
        .eq("id", deletingSchedule.id);

      if (error) throw error;

      toast({ title: "Deleted", description: "Schedule deleted successfully" });
      setDeletingSchedule(null);
      fetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  const getPhaseLabel = (phase: string | null) => {
    switch (phase) {
      case "off-season": return "Off-Season";
      case "pre-season": return "Pre-Season";
      case "in-season": return "In-Season";
      default: return phase;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display text-foreground">Training Schedules</h2>
          <p className="text-sm text-muted-foreground">Create and assign custom training programs</p>
        </div>
        <Button variant="vault" onClick={() => setShowBuilder(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Schedules Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first custom training schedule to assign to athletes.
          </p>
          <Button variant="vault" onClick={() => setShowBuilder(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Schedule
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {schedules.map(schedule => (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-4 hover:border-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-foreground">{schedule.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs">
                      {getPhaseLabel(schedule.training_phase)}
                    </span>
                    {schedule.position && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs capitalize">
                        {schedule.position}
                      </span>
                    )}
                  </div>
                  {schedule.description && (
                    <p className="text-sm text-muted-foreground mb-2">{schedule.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {schedule.assignment_count} athlete{schedule.assignment_count !== 1 ? "s" : ""} assigned
                    </span>
                    <span>
                      Created {new Date(schedule.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssigningSchedule(schedule)}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Assign
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingSchedule(schedule);
                      setShowBuilder(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingSchedule(schedule)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={(open) => {
        if (!open) {
          setShowBuilder(false);
          setEditingSchedule(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingSchedule ? "Edit Schedule" : "Create New Schedule"}
            </DialogTitle>
          </DialogHeader>
          <ScheduleBuilder
            initialName={editingSchedule?.name}
            initialDescription={editingSchedule?.description || ""}
            initialPosition={(editingSchedule?.position as Position) || "utility"}
            initialPhase={(editingSchedule?.training_phase as TrainingPhase) || "off-season"}
            initialSchedule={editingSchedule?.schedule_data}
            onSave={handleSave}
            onCancel={() => {
              setShowBuilder(false);
              setEditingSchedule(null);
            }}
            saving={saving}
          />
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={!!assigningSchedule} onOpenChange={(open) => {
        if (!open) {
          setAssigningSchedule(null);
          fetchSchedules(); // Refresh counts
        }
      }}>
        <DialogContent>
          {assigningSchedule && (
            <ScheduleAssignment
              scheduleId={assigningSchedule.id}
              scheduleName={assigningSchedule.name}
              onClose={() => {
                setAssigningSchedule(null);
                fetchSchedules();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSchedule} onOpenChange={(open) => !open && setDeletingSchedule(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingSchedule?.name}" and remove it from all assigned athletes.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
