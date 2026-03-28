import { useState, useEffect } from "react";
import { CalendarPlus, Clock, Plus, Trash2, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function generateAvailabilityICS(slots: AvailabilitySlot[], coachName: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vault Baseball//Availability//EN",
    "X-WR-CALNAME:Vault Coach Availability",
  ];

  // Generate recurring events for the next 12 weeks
  const today = new Date();
  const activeSlots = slots.filter(s => s.is_active);

  for (const slot of activeSlots) {
    // Find next occurrence of this day
    const daysUntil = (slot.day_of_week - today.getDay() + 7) % 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);

    for (let week = 0; week < 12; week++) {
      const eventDate = new Date(nextDate);
      eventDate.setDate(nextDate.getDate() + week * 7);

      const [startH, startM] = slot.start_time.split(":").map(Number);
      const [endH, endM] = slot.end_time.split(":").map(Number);

      const startDt = new Date(eventDate);
      startDt.setHours(startH, startM, 0, 0);
      const endDt = new Date(eventDate);
      endDt.setHours(endH, endM, 0, 0);

      const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

      lines.push(
        "BEGIN:VEVENT",
        `DTSTART:${fmt(startDt)}`,
        `DTEND:${fmt(endDt)}`,
        `SUMMARY:${coachName} - Available for Lessons`,
        `DESCRIPTION:Open availability slot on Vault Baseball`,
        `UID:avail-${slot.id}-w${week}@vault-baseball.com`,
        "STATUS:CONFIRMED",
        "CATEGORIES:Vault Availability",
        "END:VEVENT"
      );
    }
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

interface CoachAvailabilitySyncProps {
  coachUserId: string;
}

const CoachAvailabilitySync = ({ coachUserId }: CoachAvailabilitySyncProps) => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newDay, setNewDay] = useState("1");
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("17:00");
  const { toast } = useToast();

  useEffect(() => {
    fetchSlots();
  }, [coachUserId]);

  const fetchSlots = async () => {
    const { data } = await supabase
      .from("coach_availability")
      .select("*")
      .eq("coach_user_id", coachUserId)
      .order("day_of_week")
      .order("start_time");
    setSlots(data || []);
    setLoading(false);
  };

  const addSlot = async () => {
    setSaving(true);
    const { error } = await supabase.from("coach_availability").insert({
      coach_user_id: coachUserId,
      day_of_week: parseInt(newDay),
      start_time: newStart,
      end_time: newEnd,
      is_active: true,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Slot added" });
      fetchSlots();
    }
    setSaving(false);
  };

  const toggleSlot = async (id: string, isActive: boolean) => {
    await supabase.from("coach_availability").update({ is_active: !isActive }).eq("id", id);
    fetchSlots();
  };

  const deleteSlot = async (id: string) => {
    await supabase.from("coach_availability").delete().eq("id", id);
    fetchSlots();
    toast({ title: "Slot removed" });
  };

  const exportToCalendar = async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", coachUserId)
      .single();

    const ics = generateAvailabilityICS(slots, profile?.display_name || "Coach");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vault-coach-availability.ics";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Calendar exported", description: "Import the .ics file into Google Calendar, Apple Calendar, or Outlook." });
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-primary" />
            AVAILABILITY SYNC
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportToCalendar} disabled={slots.length === 0} className="gap-1">
            <Download className="w-3 h-3" /> Export to Calendar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Set your weekly availability and sync to your calendar app</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new slot */}
        <div className="flex flex-wrap items-end gap-2 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="space-y-1">
            <Label className="text-xs">Day</Label>
            <Select value={newDay} onValueChange={setNewDay}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DAYS.map((d, i) => <SelectItem key={i} value={i.toString()}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Start</Label>
            <Input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} className="w-28 h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">End</Label>
            <Input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} className="w-28 h-8 text-xs" />
          </div>
          <Button size="sm" variant="vault" onClick={addSlot} disabled={saving} className="h-8">
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>

        {/* Existing slots */}
        {slots.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No availability set yet. Add your first slot above.</p>
        ) : (
          <div className="space-y-2">
            {slots.map(slot => (
              <div key={slot.id} className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${slot.is_active ? "bg-card border-border" : "bg-muted/30 border-border/50 opacity-60"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-primary w-8">{DAY_SHORT[slot.day_of_week]}</span>
                  <div className="flex items-center gap-1 text-sm text-foreground">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={slot.is_active} onCheckedChange={() => toggleSlot(slot.id, slot.is_active)} />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteSlot(slot.id)}>
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoachAvailabilitySync;
