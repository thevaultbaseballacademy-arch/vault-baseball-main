import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Check, X, Loader2, Calendar, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addWeeks } from "date-fns";
import { createNotification, getActorName } from "@/lib/notifications";

interface Athlete {
  user_id: string;
  display_name: string;
  email: string;
}

interface Assignment {
  id: string;
  athlete_user_id: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
}

interface ScheduleAssignmentProps {
  scheduleId: string;
  scheduleName: string;
  onClose: () => void;
}

const PRESET_DURATIONS = [
  { label: "2 Weeks", weeks: 2 },
  { label: "4 Weeks", weeks: 4 },
  { label: "6 Weeks", weeks: 6 },
  { label: "8 Weeks", weeks: 8 },
  { label: "12 Weeks", weeks: 12 },
];

export function ScheduleAssignment({ scheduleId, scheduleName, onClose }: ScheduleAssignmentProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addWeeks(new Date(), 4));
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [scheduleId]);

  const fetchData = async () => {
    try {
      // Fetch all athletes (profiles)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name, email")
        .order("display_name");

      if (profilesError) throw profilesError;

      // Fetch current assignments for this schedule
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("schedule_assignments")
        .select("id, athlete_user_id, is_active, start_date, end_date")
        .eq("schedule_id", scheduleId);

      if (assignmentsError) throw assignmentsError;

      setAthletes(profilesData || []);
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load athletes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAssignment = (userId: string) => {
    return assignments.find(a => a.athlete_user_id === userId && a.is_active);
  };

  const isAssigned = (userId: string) => {
    return !!getAssignment(userId);
  };

  const applyPresetDuration = (weeks: number) => {
    if (startDate) {
      setEndDate(addWeeks(startDate, weeks));
    }
  };

  const toggleAssignment = async (athleteId: string) => {
    setSaving(athleteId);
    try {
      const existingAssignment = assignments.find(a => a.athlete_user_id === athleteId);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) throw new Error("Not authenticated");

      if (existingAssignment) {
        // Toggle existing assignment
        const { error } = await supabase
          .from("schedule_assignments")
          .update({ is_active: !existingAssignment.is_active })
          .eq("id", existingAssignment.id);

        if (error) throw error;

        setAssignments(prev => prev.map(a => 
          a.id === existingAssignment.id 
            ? { ...a, is_active: !a.is_active } 
            : a
        ));
      } else {
        // Create new assignment with date range
        const { data, error } = await supabase
          .from("schedule_assignments")
          .insert({
            schedule_id: scheduleId,
            athlete_user_id: athleteId,
            assigned_by: userData.user.id,
            is_active: true,
            start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
            end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
          })
          .select()
          .single();

        if (error) throw error;

        setAssignments(prev => [...prev, data]);

        // Send notification to the athlete
        const coachName = await getActorName(userData.user.id);
        await createNotification({
          userId: athleteId,
          type: 'coach_message' as any,
          title: "New Training Schedule Assigned",
          message: `${coachName} assigned you a new training schedule: "${scheduleName}"${startDate && endDate ? ` (${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")})` : ""}`,
          actorId: userData.user.id,
        });
      }

      toast({
        title: isAssigned(athleteId) ? "Unassigned" : "Assigned",
        description: isAssigned(athleteId) 
          ? "Schedule removed from athlete"
          : `Schedule assigned${startDate && endDate ? ` (${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")})` : ""}`,
      });
      
      setSelectedAthlete(null);
    } catch (error) {
      console.error("Error toggling assignment:", error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const updateAssignmentDates = async (assignmentId: string) => {
    setSaving(assignmentId);
    try {
      const { error } = await supabase
        .from("schedule_assignments")
        .update({
          start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
          end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
        })
        .eq("id", assignmentId);

      if (error) throw error;

      setAssignments(prev => prev.map(a => 
        a.id === assignmentId 
          ? { 
              ...a, 
              start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
              end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
            } 
          : a
      ));

      toast({
        title: "Updated",
        description: `Date range updated to ${format(startDate!, "MMM d")} - ${format(endDate!, "MMM d, yyyy")}`,
      });
      
      setSelectedAthlete(null);
    } catch (error) {
      console.error("Error updating dates:", error);
      toast({
        title: "Error",
        description: "Failed to update date range",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleAthleteClick = (athlete: Athlete) => {
    const assignment = getAssignment(athlete.user_id);
    
    if (assignment) {
      // If already assigned, toggle selection for date editing
      if (selectedAthlete === athlete.user_id) {
        setSelectedAthlete(null);
      } else {
        setSelectedAthlete(athlete.user_id);
        // Load existing dates
        if (assignment.start_date) {
          setStartDate(new Date(assignment.start_date));
        }
        if (assignment.end_date) {
          setEndDate(new Date(assignment.end_date));
        }
      }
    } else {
      // If not assigned, select for new assignment
      if (selectedAthlete === athlete.user_id) {
        setSelectedAthlete(null);
      } else {
        setSelectedAthlete(athlete.user_id);
        // Reset to default dates
        setStartDate(new Date());
        setEndDate(addWeeks(new Date(), 4));
      }
    }
  };

  const assignedCount = assignments.filter(a => a.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg text-foreground">Assign Athletes</h3>
          <p className="text-sm text-muted-foreground">
            {scheduleName} • {assignedCount} assigned
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Done
        </Button>
      </div>

      {/* Date Range Selector (shown when athlete is selected) */}
      {selectedAthlete && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-secondary/50 rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <CalendarRange className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Training Period</span>
          </div>

          {/* Preset Durations */}
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESET_DURATIONS.map(preset => (
              <Button
                key={preset.weeks}
                variant="outline"
                size="sm"
                onClick={() => applyPresetDuration(preset.weeks)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      if (date && endDate && date > endDate) {
                        setEndDate(addWeeks(date, 4));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isAssigned(selectedAthlete) ? (
              <>
                <Button
                  size="sm"
                  onClick={() => {
                    const assignment = getAssignment(selectedAthlete);
                    if (assignment) updateAssignmentDates(assignment.id);
                  }}
                  disabled={saving === selectedAthlete}
                  className="flex-1"
                >
                  {saving === selectedAthlete ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Update Dates
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => toggleAssignment(selectedAthlete)}
                  disabled={saving === selectedAthlete}
                >
                  Unassign
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => toggleAssignment(selectedAthlete)}
                  disabled={saving === selectedAthlete}
                  className="flex-1"
                >
                  {saving === selectedAthlete ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Assign Schedule
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAthlete(null)}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}

      <div className="max-h-96 overflow-y-auto space-y-2">
        {athletes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No athletes found</p>
          </div>
        ) : (
          athletes.map(athlete => {
            const assigned = isAssigned(athlete.user_id);
            const assignment = getAssignment(athlete.user_id);
            const isSaving = saving === athlete.user_id;
            const isSelected = selectedAthlete === athlete.user_id;

            return (
              <motion.button
                key={athlete.user_id}
                onClick={() => handleAthleteClick(athlete)}
                disabled={isSaving}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-accent/20 border-accent ring-2 ring-accent/20"
                    : assigned
                    ? "bg-accent/10 border-accent"
                    : "bg-secondary border-border hover:border-accent/50"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {athlete.display_name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {athlete.display_name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">{athlete.email}</p>
                    {assigned && assignment?.start_date && assignment?.end_date && (
                      <p className="text-xs text-accent mt-0.5">
                        {format(new Date(assignment.start_date), "MMM d")} - {format(new Date(assignment.end_date), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {assigned && (
                    <span className="text-xs text-accent flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Assigned
                    </span>
                  )}
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : assigned ? (
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                      <Check className="w-3 h-3 text-accent-foreground" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
