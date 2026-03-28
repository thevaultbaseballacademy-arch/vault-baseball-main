import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Bell, Heart, MessageCircle, AtSign, Check, Trash2, 
  BookOpen, Users, ArrowLeft, Filter, Loader2 
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  actor_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

const typeConfig: Record<string, { icon: typeof Heart; color: string; bg: string; label: string }> = {
  like: { icon: Heart, color: "text-red-500", bg: "bg-red-500/10", label: "Likes" },
  comment: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10", label: "Comments" },
  mention: { icon: AtSign, color: "text-purple-500", bg: "bg-purple-500/10", label: "Mentions" },
  course_update: { icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10", label: "Courses" },
  coach_message: { icon: Users, color: "text-orange-500", bg: "bg-orange-500/10", label: "Coaches" },
  community_like: { icon: Heart, color: "text-red-500", bg: "bg-red-500/10", label: "Likes" },
  community_comment: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10", label: "Comments" },
  community_mention: { icon: AtSign, color: "text-purple-500", bg: "bg-purple-500/10", label: "Mentions" },
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [actorProfiles, setActorProfiles] = useState<Record<string, { display_name: string | null; avatar_url: string | null }>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
    });
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
        return;
      }

      setNotifications(data || []);

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

      setLoading(false);
    };

    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel("notifications-page")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const clearAll = async () => {
    if (!userId) return;
    
    await supabase.from("notifications").delete().eq("user_id", userId);
    setNotifications([]);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
      // Track opened event
      if (userId) {
        trackNotificationOpened(notification.id, userId);
      }
    }

    // Determine destination and track click
    let destination = '/';
    if (notification.post_id) {
      destination = '/community';
    } else if (notification.type === "course_update") {
      destination = '/courses';
    } else if (notification.type === "coach_message") {
      destination = '/dashboard';
    } else if (notification.actor_id && notification.actor_id !== userId) {
      destination = `/profile/${notification.actor_id}`;
    }

    // Track click with destination
    if (userId) {
      trackNotificationClicked(notification.id, userId, destination);
    }

    navigate(destination);
  };

  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Track dismissal before deletion
    if (userId) {
      trackNotificationDismissed(notificationId, userId);
    }

    await supabase.from("notifications").delete().eq("id", notificationId);

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.is_read;
    return n.type === activeTab || n.type.includes(activeTab);
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: Record<string, Notification[]> = {};
    
    notifications.forEach((n) => {
      const date = new Date(n.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "Yesterday";
      } else {
        key = format(date, "MMMM d, yyyy");
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });

    return groups;
  };

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-4 max-w-3xl">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-display text-foreground">Notifications</h1>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <Check className="w-4 h-4 mr-2" />
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
                    Clear all
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-5 h-auto p-1">
                <TabsTrigger value="all" className="text-xs py-2">
                  All
                  {notifications.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                      {notifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs py-2">
                  Unread
                  {unreadCount > 0 && (
                    <Badge className="ml-1.5 h-5 px-1.5">{unreadCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="like" className="text-xs py-2">
                  <Heart className="w-3.5 h-3.5" />
                </TabsTrigger>
                <TabsTrigger value="comment" className="text-xs py-2">
                  <MessageCircle className="w-3.5 h-3.5" />
                </TabsTrigger>
                <TabsTrigger value="mention" className="text-xs py-2">
                  <AtSign className="w-3.5 h-3.5" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {filteredNotifications.length === 0 ? (
                  <div className="py-16 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedNotifications).map(([date, items]) => (
                      <div key={date}>
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                          {date}
                        </h3>
                        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
                          {items.map((notification) => {
                            const config = typeConfig[notification.type] || typeConfig.like;
                            const Icon = config.icon;
                            const actorProfile = actorProfiles[notification.actor_id];

                            return (
                              <motion.div
                                key={notification.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors group ${
                                  !notification.is_read ? "bg-primary/5" : ""
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div className="relative">
                                    <Avatar className="w-10 h-10">
                                      <AvatarImage src={actorProfile?.avatar_url || undefined} />
                                      <AvatarFallback className={config.bg}>
                                        <Icon className={`w-4 h-4 ${config.color}`} />
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${config.bg} flex items-center justify-center`}>
                                      <Icon className={`w-3 h-3 ${config.color}`} />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground">
                                      <span className="font-medium">
                                        {actorProfile?.display_name || "Someone"}
                                      </span>{" "}
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {formatDistanceToNow(new Date(notification.created_at), {
                                        addSuffix: true,
                                      })}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {!notification.is_read && (
                                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => deleteNotification(notification.id, e)}
                                    >
                                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Notifications;
