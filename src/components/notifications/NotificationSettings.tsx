import { Bell, BookOpen, Heart, MessageCircle, AtSign, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationPreferences, NotificationPreferences } from "@/hooks/useNotificationPreferences";

interface NotificationSettingsProps {
  userId: string | undefined;
}

const notificationOptions: {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "course_updates",
    label: "Course Updates",
    description: "New lessons, content updates, and program announcements",
    icon: BookOpen,
  },
  {
    key: "community_mentions",
    label: "Mentions",
    description: "When someone mentions you in a post or comment",
    icon: AtSign,
  },
  {
    key: "community_likes",
    label: "Likes",
    description: "When someone likes your posts",
    icon: Heart,
  },
  {
    key: "community_comments",
    label: "Comments",
    description: "When someone comments on your posts",
    icon: MessageCircle,
  },
  {
    key: "coach_messages",
    label: "Coach Messages",
    description: "Messages and feedback from your coaches",
    icon: Users,
  },
];

const NotificationSettings = ({ userId }: NotificationSettingsProps) => {
  const { preferences, loading, updatePreference } = useNotificationPreferences(userId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Choose which notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.key}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor={option.key} className="text-sm font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
              <Switch
                id={option.key}
                checked={preferences[option.key]}
                onCheckedChange={(checked) => updatePreference(option.key, checked)}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
