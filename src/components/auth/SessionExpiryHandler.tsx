import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Global component that listens for auth state changes and handles
 * session expiry by showing a toast and redirecting to /auth.
 * 
 * Mount this once inside BrowserRouter.
 */
const SessionExpiryHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const hadSession = useRef(false);

  useEffect(() => {
    // Track whether user ever had a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) hadSession.current = true;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" && hadSession.current) {
          hadSession.current = false;
          toast({
            title: "Session ended",
            description: "Please sign in again to continue.",
            variant: "destructive",
          });
          navigate("/auth", { replace: true });
        }

        // Token refresh with no session = expired
        if (event === "TOKEN_REFRESHED" && !session && hadSession.current) {
          hadSession.current = false;
          toast({
            title: "Session expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          });
          navigate("/auth", { replace: true });
        }

        if (session) {
          hadSession.current = true;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return null;
};

export default SessionExpiryHandler;
