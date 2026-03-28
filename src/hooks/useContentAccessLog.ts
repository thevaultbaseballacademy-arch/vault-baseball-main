import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "vault_session_id";

function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

/**
 * Logs content access events for IP protection and usage tracking.
 * Debounces duplicate logs for the same content within 30s.
 */
export const useContentAccessLog = () => {
  const recentRef = useRef<Map<string, number>>(new Map());

  const logAccess = useCallback(async (params: {
    contentType: string;
    contentId: string;
    moduleName?: string;
    sportType?: string;
  }) => {
    const key = `${params.contentType}:${params.contentId}`;
    const now = Date.now();
    const last = recentRef.current.get(key);
    if (last && now - last < 30000) return; // debounce 30s
    recentRef.current.set(key, now);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await (supabase.from("content_access_logs") as any).insert({
        user_id: user.id,
        content_type: params.contentType,
        content_id: params.contentId,
        module_name: params.moduleName || null,
        sport_type: params.sportType || "baseball",
        session_id: getSessionId(),
      });
    } catch {
      // silent — non-critical telemetry
    }
  }, []);

  return { logAccess };
};
