import { supabase } from "@/integrations/supabase/client";

type EventType = 'delivered' | 'opened' | 'clicked' | 'dismissed';

interface TrackEventParams {
  notificationId: string;
  userId: string;
  eventType: EventType;
  metadata?: Record<string, any>;
}

export const trackNotificationEvent = async ({
  notificationId,
  userId,
  eventType,
  metadata = {}
}: TrackEventParams) => {
  try {
    const { error } = await supabase
      .from('notification_analytics')
      .insert({
        notification_id: notificationId,
        user_id: userId,
        event_type: eventType,
        metadata
      });

    if (error) {
      console.error("Error tracking notification event:", error);
    }
  } catch (error) {
    console.error("Error tracking notification event:", error);
  }
};

export const trackNotificationOpened = async (notificationId: string, userId: string) => {
  return trackNotificationEvent({
    notificationId,
    userId,
    eventType: 'opened'
  });
};

export const trackNotificationClicked = async (notificationId: string, userId: string, destination?: string) => {
  return trackNotificationEvent({
    notificationId,
    userId,
    eventType: 'clicked',
    metadata: { destination }
  });
};

export const trackNotificationDismissed = async (notificationId: string, userId: string) => {
  return trackNotificationEvent({
    notificationId,
    userId,
    eventType: 'dismissed'
  });
};
