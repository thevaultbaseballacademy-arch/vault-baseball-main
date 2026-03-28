import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

/**
 * Handles the Android hardware back button using @capacitor/app.
 * Without this, tapping the back button on Android causes the app
 * to crash or get stuck on the current screen.
 *
 * Should be mounted once at the root of the app (e.g. in App.tsx).
 */
export const useAndroidBackButton = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
      return;
    }

    const listener = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        navigate(-1);
      } else {
        // At the root of the stack — minimize the app rather than close it
        App.minimizeApp();
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [navigate]);
};
