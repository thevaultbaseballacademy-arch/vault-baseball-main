import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Heart, MessageCircle, AtSign, Check, Trash2, BookOpen, Users, ExternalLink, Target } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { trackNotificationOpened, trackNotificationClicked, trackNotificationDismissed } from "@/lib/notificationAnalytics";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  post_id: string | null;
  actor_id: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationBellProps {
  userId: string;
}

const typeConfig: Record<string, { icon: typeof Heart; color: string; bg: string }> = {
  like: { icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
  comment: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  mention: { icon: AtSign, color: "text-purple-500", bg: "bg-purple-500/10" },
  course_update: { icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10" },
  coach_message: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  new_message: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  coach_feedback: { icon: Target, color: "text-accent", bg: "bg-accent/10" },
  community_like: { icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
  community_comment: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  community_mention: { icon: AtSign, color: "text-purple-500", bg: "bg-purple-500/10" },
  lesson_booked: { icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10" },
  lesson_confirmed: { icon: Check, color: "text-green-600", bg: "bg-green-500/10" },
  lesson_cancelled: { icon: Bell, color: "text-destructive", bg: "bg-destructive/10" },
  lesson_completed: { icon: Check, color: "text-green-500", bg: "bg-green-500/10" },
  lesson_link_added: { icon: ExternalLink, color: "text-blue-500", bg: "bg-blue-500/10" },
};

const NotificationBell = ({ userId }: NotificationBellProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [actorProfiles, setActorProfiles] = useState<Record<string, { display_name: string | null; avatar_url: string | null }>>({});
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching notifications:", error);
      return;
    }

    setNotifications(data || []);
    setUnreadCount(data?.filter(n => !n.is_read).length || 0);

    // Fetch actor profiles
    const actorIds = [...new Set((data || []).map((n) => n.actor_id))];
    if (actorIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", actorIds);

      if (profiles) {
        const profileMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
        profiles.forEach((p) => {
          profileMap[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url };
        });
        setActorProfiles(profileMap);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Track dismissal before deletion
    trackNotificationDismissed(notificationId, userId);
    
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notification && !notification.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
      // Track opened event
      trackNotificationOpened(notification.id, userId);
    }
    
    // Determine destination and track click
    let destination = '/';
    if (notification.type?.startsWith('lesson_')) {
      destination = '/remote-lessons';
    } else if (notification.post_id) {
      destination = '/community';
    } else if (notification.type === "course_update") {
      destination = "/courses";
    } else if (notification.type === "coach_message") {
      destination = "/coach/lessons";
    } else if (notification.type === "coach_feedback") {
      destination = "/profile";
    } else if (notification.actor_id && notification.actor_id !== userId) {
      destination = `/profile/${notification.actor_id}`;
    }
    
    // Track click with destination
    trackNotificationClicked(notification.id, userId, destination);
    
    navigate(destination);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs gap-1"
            >
              <Check className="w-3 h-3" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[320px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(notification => {
                const config = typeConfig[notification.type] || typeConfig.like;
                const Icon = config.icon;
                const actorProfile = actorProfiles[notification.actor_id];

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors group ${
                      !notification.is_read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="relative">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={actorProfile?.avatar_url || undefined} />
                          <AvatarFallback className={config.bg}>
                            <Icon className={`w-4 h-4 ${config.color}`} />
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${config.bg} flex items-center justify-center border-2 border-popover`}>
                          <Icon className={`w-2.5 h-2.5 ${config.color}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-2">
                          <span className="font-medium">
                            {actorProfile?.display_name || "Someone"}
                          </span>{" "}
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-start gap-1">
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => deleteNotification(notification.id, e)}
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-center gap-2 text-sm"
            onClick={() => {
              navigate("/notifications");
              setOpen(false);
            }}
          >
            View all notifications
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
