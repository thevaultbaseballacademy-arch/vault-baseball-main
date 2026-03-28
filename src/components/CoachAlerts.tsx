import { useState } from 'react';
import { Bell, X, Check, CheckCheck, AlertTriangle, Moon, Battery, Brain, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CoachAlert {
  id: string;
  coach_user_id: string;
  athlete_user_id: string;
  alert_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface CoachAlertsProps {
  alerts: CoachAlert[];
  unreadCount: number;
  onMarkAsRead: (alertId: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (alertId: string) => void;
  onRefresh: () => void;
}

const getAlertIcon = (alertType: string) => {
  switch (alertType) {
    case 'missed_checkin':
      return <Calendar className="h-4 w-4 text-amber-500" />;
    case 'low_mood':
      return <Brain className="h-4 w-4 text-blue-500" />;
    case 'low_energy':
      return <Battery className="h-4 w-4 text-orange-500" />;
    case 'high_stress':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'poor_sleep':
      return <Moon className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const getAlertBadgeVariant = (alertType: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (alertType) {
    case 'high_stress':
      return 'destructive';
    case 'missed_checkin':
      return 'secondary';
    default:
      return 'outline';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export function CoachAlerts({
  alerts,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onRefresh
}: CoachAlertsProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">Alerts</h4>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-7 text-xs"
            >
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="h-7 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[300px]">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No alerts yet</p>
              <p className="text-xs">Alerts will appear when athletes need attention</p>
            </div>
          ) : (
            <div className="divide-y">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 hover:bg-muted/50 transition-colors",
                    !alert.is_read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getAlertIcon(alert.alert_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {alert.title}
                        </span>
                        <Badge variant={getAlertBadgeVariant(alert.alert_type)} className="text-[10px] px-1.5 py-0">
                          {alert.alert_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {alert.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {formatTimeAgo(alert.created_at)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!alert.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onMarkAsRead(alert.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(alert.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
