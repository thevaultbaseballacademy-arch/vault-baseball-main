import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserSession {
  id: string;
  user_id: string;
  device_info: string | null;
  ip_address_masked: string | null;
  user_agent: string | null;
  browser: string | null;
  os: string | null;
  location: string | null;
  last_active_at: string;
  created_at: string;
  is_current: boolean;
}

// Parse user agent to extract browser and OS
const parseUserAgent = (ua: string): { browser: string; os: string } => {
  let browser = "Unknown Browser";
  let os = "Unknown OS";

  // Detect browser
  if (ua.includes("Firefox/")) {
    browser = "Firefox";
  } else if (ua.includes("Edg/")) {
    browser = "Microsoft Edge";
  } else if (ua.includes("Chrome/")) {
    browser = "Chrome";
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    browser = "Safari";
  } else if (ua.includes("Opera/") || ua.includes("OPR/")) {
    browser = "Opera";
  }

  // Detect OS
  if (ua.includes("Windows NT 10")) {
    os = "Windows 10/11";
  } else if (ua.includes("Windows NT")) {
    os = "Windows";
  } else if (ua.includes("Mac OS X")) {
    os = "macOS";
  } else if (ua.includes("Linux")) {
    os = "Linux";
  } else if (ua.includes("Android")) {
    os = "Android";
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    os = "iOS";
  }

  return { browser, os };
};

// Generate a unique session token based on access token
const generateSessionToken = (accessToken: string): string => {
  // Use first 32 chars of access token as identifier
  return accessToken.substring(0, 32);
};

export const useSessionManagement = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSessionToken, setCurrentSessionToken] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const token = generateSessionToken(session.access_token);
      setCurrentSessionToken(token);

      // Use the safe view that masks IP addresses for privacy
      const { data, error } = await supabase
        .from("user_sessions_safe")
        .select("*")
        .eq("user_id", session.user.id)
        .order("last_active_at", { ascending: false });

      if (error) throw error;

      // Mark current session (session_token no longer exposed in view for security)
      const sessionsWithCurrent = (data || []).map((s: any) => ({
        ...s,
        is_current: s.is_current || false
      }));

      setSessions(sessionsWithCurrent);
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const recordSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userAgent = navigator.userAgent;
      const { browser, os } = parseUserAgent(userAgent);
      const token = generateSessionToken(session.access_token);

      // SECURITY: Avoid reading the full sessions table; use an upsert keyed by session_token.
      // This records activity without requiring a prior SELECT.
      const { error } = await supabase.from("user_sessions").upsert(
        {
          user_id: session.user.id,
          session_token: token,
          user_agent: userAgent,
          browser,
          os,
          device_info: `${browser} on ${os}`,
          last_active_at: new Date().toISOString(),
        },
        { onConflict: "session_token" },
      );

      if (error) throw error;
    } catch (error) {
      console.error("Error recording session:", error);
    }
  }, []);

  const revokeSession = async (sessionId: string) => {
    try {

      // Delete the session record
      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      // Update local state
      setSessions(sessions.filter(s => s.id !== sessionId));

      toast({
        title: "Session revoked",
        description: "The session has been signed out.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke session",
        variant: "destructive",
      });
      return false;
    }
  };

  const revokeAllOtherSessions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const token = generateSessionToken(session.access_token);

      // Delete all sessions except current
      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("user_id", session.user.id)
        .neq("session_token", token);

      if (error) throw error;

      // Update local state - keep only current session
      setSessions(sessions.filter(s => s.is_current));

      toast({
        title: "All other sessions revoked",
        description: "All other devices have been signed out.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke sessions",
        variant: "destructive",
      });
      return false;
    }
  };

  const cleanupSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const token = generateSessionToken(session.access_token);

      // Delete this session record on logout
      await supabase
        .from("user_sessions")
        .delete()
        .eq("session_token", token);
    } catch (error) {
      console.error("Error cleaning up session:", error);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    currentSessionToken,
    fetchSessions,
    recordSession,
    revokeSession,
    revokeAllOtherSessions,
    cleanupSession,
  };
};
