import { useState, useEffect } from "react";
import { Send, Loader2, Bell, BookOpen, Megaphone, Users, Clock, Calendar, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

interface BroadcastPanelProps {
  userCount: number;
}

interface ScheduledBroadcast {
  id: string;
  title: string;
  message: string;
  type: string;
  scheduled_at: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  notified_count: number;
}

const notificationTypes = [
  {
    value: "course_update",
    label: "Course Update",
    description: "New lessons, modules, or program changes",
    icon: BookOpen,
    color: "text-green-500",
  },
  {
    value: "announcement",
    label: "Announcement",
    description: "General platform announcements",
    icon: Megaphone,
    color: "text-blue-500",
  },
  {
    value: "coach_message",
    label: "Coach Message",
    description: "Messages from coaching staff",
    icon: Users,
    color: "text-orange-500",
  },
];

const BroadcastPanel = ({ userCount }: BroadcastPanelProps) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledBroadcasts, setScheduledBroadcasts] = useState<ScheduledBroadcast[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchScheduledBroadcasts();
  }, []);

  const fetchScheduledBroadcasts = async () => {
    setLoadingScheduled(true);
    const { data, error } = await supabase
      .from("scheduled_broadcasts")
      .select("*")
      .order("scheduled_at", { ascending: true });

    if (!error && data) {
      setScheduledBroadcasts(data);
    }
    setLoadingScheduled(false);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter both title and message",
        variant: "destructive",
      });
      return;
    }

    if (isScheduled && (!scheduledDate || !scheduledTime)) {
      toast({
        title: "Missing schedule",
        description: "Please select a date and time for the scheduled broadcast",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    setSentCount(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      if (isScheduled) {
        // Create scheduled broadcast
        const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
        
        const { error } = await supabase
          .from("scheduled_broadcasts")
          .insert({
            title: title.trim(),
            message: message.trim(),
            type,
            scheduled_at: scheduledAt,
            created_by: session.user.id,
          });

        if (error) throw error;

        toast({
          title: "Broadcast scheduled!",
          description: `Will be sent on ${format(new Date(scheduledAt), "PPP 'at' p")}`,
        });

        setTitle("");
        setMessage("");
        setScheduledDate("");
        setScheduledTime("");
        setIsScheduled(false);
        fetchScheduledBroadcasts();

      } else {
        // Send immediately
        const { data, error } = await supabase.functions.invoke("admin-broadcast", {
          body: {
            title: title.trim(),
            message: message.trim(),
            type,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;

        setSentCount(data.notifiedCount || 0);
        setTitle("");
        setMessage("");
        
        toast({
          title: "Broadcast sent!",
          description: `Notification sent to ${data.notifiedCount} users`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send broadcast",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const cancelScheduledBroadcast = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_broadcasts")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Broadcast cancelled",
        description: "The scheduled broadcast has been cancelled",
      });

      fetchScheduledBroadcasts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel broadcast",
        variant: "destructive",
      });
    }
  };

  const deleteScheduledBroadcast = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_broadcasts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Broadcast deleted",
        description: "The broadcast has been removed",
      });

      fetchScheduledBroadcasts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete broadcast",
        variant: "destructive",
      });
    }
  };

  const pendingBroadcasts = scheduledBroadcasts.filter(b => b.status === "pending");
  const pastBroadcasts = scheduledBroadcasts.filter(b => b.status !== "pending");

  // Get minimum date/time (now)
  const now = new Date();
  const minDate = format(now, "yyyy-MM-dd");
  const minTime = scheduledDate === minDate ? format(now, "HH:mm") : "00:00";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Broadcast Notifications
          </CardTitle>
          <CardDescription>
            Send a notification to all {userCount} registered users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Type */}
          <div className="space-y-3">
            <Label>Notification Type</Label>
            <RadioGroup
              value={type}
              onValueChange={setType}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {notificationTypes.map((option) => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      type === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={option.value} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${option.color}`} />
                        <span className="font-medium text-sm text-foreground">
                          {option.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="broadcast-title">Title</Label>
            <Input
              id="broadcast-title"
              placeholder="e.g., New Velocity System Module Available!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/100
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="broadcast-message">Message</Label>
            <Textarea
              id="broadcast-message"
              placeholder="Enter your notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500
            </p>
          </div>

          {/* Schedule Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm text-foreground">Schedule for later</p>
                <p className="text-xs text-muted-foreground">Send at a specific date and time</p>
              </div>
            </div>
            <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
          </div>

          {/* Schedule Date/Time */}
          {isScheduled && (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Date</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={minDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Time</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={scheduledDate === minDate ? minTime : undefined}
                />
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
            <div className="bg-card border border-border rounded-lg p-3">
              <p className="font-medium text-sm text-foreground">
                {title || "Notification Title"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {message || "Notification message will appear here..."}
              </p>
            </div>
          </div>

          {/* Send Button */}
          <div className="flex items-center justify-between">
            {sentCount !== null && (
              <p className="text-sm text-green-600">
                ✓ Sent to {sentCount} users
              </p>
            )}
            <Button
              onClick={handleSend}
              disabled={sending || !title.trim() || !message.trim()}
              className="ml-auto"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isScheduled ? "Scheduling..." : "Sending..."}
                </>
              ) : isScheduled ? (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Broadcast
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to {userCount} Users
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Broadcasts */}
      {pendingBroadcasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              Scheduled Broadcasts
            </CardTitle>
            <CardDescription>
              {pendingBroadcasts.length} broadcast{pendingBroadcasts.length !== 1 ? "s" : ""} pending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingBroadcasts.map((broadcast) => (
                <div 
                  key={broadcast.id}
                  className="flex items-start justify-between p-4 rounded-xl border border-border bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm text-foreground truncate">
                        {broadcast.title}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {format(new Date(broadcast.scheduled_at), "MMM d, h:mm a")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {broadcast.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Scheduled {formatDistanceToNow(new Date(broadcast.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => cancelScheduledBroadcast(broadcast.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Broadcasts */}
      {pastBroadcasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Broadcast History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pastBroadcasts.slice(0, 10).map((broadcast) => (
                <div 
                  key={broadcast.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-foreground truncate">{broadcast.title}</p>
                      <Badge 
                        variant={broadcast.status === "sent" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {broadcast.status === "sent" 
                          ? `Sent to ${broadcast.notified_count}` 
                          : "Cancelled"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {broadcast.sent_at 
                        ? format(new Date(broadcast.sent_at), "PPP 'at' p")
                        : format(new Date(broadcast.scheduled_at), "PPP 'at' p")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteScheduledBroadcast(broadcast.id)}
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BroadcastPanel;
