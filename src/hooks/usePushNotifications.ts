import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from "@capacitor/push-notifications";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePushNotifications = (userId: string | undefined) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const registerToken = useCallback(async (token: string) => {
    if (!userId) return;

    const platform = Capacitor.getPlatform() as "ios" | "android" | "web";
    
    try {
      const { error } = await supabase
        .from("push_tokens")
        .upsert(
          { user_id: userId, token, platform },
          { onConflict: "user_id,token" }
        );

      if (error) throw error;
      console.log("Push token registered successfully");
    } catch (error) {
      console.error("Error registering push token:", error);
    }
  }, [userId]);

  const removeToken = useCallback(async (token: string) => {
    if (!userId) return;

    try {
      await supabase
        .from("push_tokens")
        .delete()
        .eq("user_id", userId)
        .eq("token", token);
    } catch (error) {
      console.error("Error removing push token:", error);
    }
  }, [userId]);

  const initializePushNotifications = useCallback(async () => {
    // Only initialize on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log("Push notifications only available on native platforms");
      return;
    }

    try {
      // Request permission
      const permissionResult = await PushNotifications.requestPermissions();
      
      if (permissionResult.receive === "granted") {
        // Register with Apple / Google to receive push
        await PushNotifications.register();
      } else {
        console.log("Push notification permission denied");
        toast({
          title: "Notifications Disabled",
          description: "Enable notifications in your device settings to receive updates.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error initializing push notifications:", error);
    }
  }, [toast]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !userId) return;

    // Handle registration success
    const registrationListener = PushNotifications.addListener(
      "registration",
      (token: Token) => {
        console.log("Push registration success, token:", token.value);
        registerToken(token.value);
      }
    );

    // Handle registration error
    const registrationErrorListener = PushNotifications.addListener(
      "registrationError",
      (error: any) => {
        console.error("Push registration error:", error);
      }
    );

    // Handle incoming notifications when app is in foreground
    const notificationReceivedListener = PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema) => {
        console.log("Push notification received:", notification);
        toast({
          title: notification.title || "New Notification",
          description: notification.body || "",
        });
      }
    );

    // Handle notification tap
    const notificationActionListener = PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action: ActionPerformed) => {
        console.log("Push notification action performed:", action);
        // Handle navigation based on notification data
        const data = action.notification.data;
        if (data?.route) {
          // Use React Router navigate() to preserve SPA state instead of
          // doing a full page reload with window.location.href
          navigate(data.route);
        }
      }
    );

    // Initialize
    initializePushNotifications();

    // Cleanup
    return () => {
      registrationListener.then(l => l.remove());
      registrationErrorListener.then(l => l.remove());
      notificationReceivedListener.then(l => l.remove());
      notificationActionListener.then(l => l.remove());
    };
  }, [userId, registerToken, initializePushNotifications, toast]);

  return {
    initializePushNotifications,
    removeToken,
  };
};
