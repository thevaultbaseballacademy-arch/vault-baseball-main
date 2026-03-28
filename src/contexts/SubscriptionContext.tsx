import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { usePushNotifications } from "@/hooks/usePushNotifications";

type SubscriptionTier = "basic" | "performance" | "elite" | null;

interface SubscriptionContextType {
  user: User | null;
  session: Session | null;
  isSubscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionEnd: string | null;
  isLoading: boolean;
  hasTeamAccess: boolean;
  refreshSubscription: () => Promise<void>;
}

const PRODUCT_TO_TIER: Record<string, SubscriptionTier> = {
  "prod_TgddaadHxz0mTj": "basic",
  "prod_TgddQA4gp7kWZy": "performance",
  "prod_Tgdd8gSJpkk33e": "elite",
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTeamAccess, setHasTeamAccess] = useState(false);

  // Use refs to avoid stale closures in interval
  const sessionRef = useRef<Session | null>(null);
  const userRef = useRef<User | null>(null);

  usePushNotifications(user?.id);

  const checkTeamAccess = useCallback(async (email: string | undefined) => {
    if (!email) { setHasTeamAccess(false); return; }
    try {
      const { data } = await supabase
        .from("team_whitelist")
        .select("full_access")
        .eq("email", email.toLowerCase())
        .maybeSingle();
      setHasTeamAccess(data?.full_access ?? false);
    } catch { setHasTeamAccess(false); }
  }, []);

  const checkSubscription = useCallback(async (accessToken: string, userEmail?: string) => {
    try {
      // Run team check and subscription check in parallel
      const [, subResult] = await Promise.all([
        checkTeamAccess(userEmail),
        supabase.functions.invoke("check-subscription", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const { data, error } = subResult;
      if (error) throw error;

      setIsSubscribed(data?.subscribed ?? false);
      setSubscriptionTier(data?.product_id ? PRODUCT_TO_TIER[data.product_id] || null : null);
      setSubscriptionEnd(data?.subscription_end ?? null);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setIsSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
    }
  }, [checkTeamAccess]);

  const refreshSubscription = useCallback(async () => {
    if (sessionRef.current?.access_token) {
      await checkSubscription(sessionRef.current.access_token, userRef.current?.email);
    }
  }, [checkSubscription]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        sessionRef.current = newSession;
        userRef.current = newSession?.user ?? null;

        if (event === "TOKEN_REFRESHED" && !newSession) {
          setIsSubscribed(false);
          setSubscriptionTier(null);
          setSubscriptionEnd(null);
          setHasTeamAccess(false);
          setIsLoading(false);
          return;
        }

        if (event === "SIGNED_OUT") {
          setIsSubscribed(false);
          setSubscriptionTier(null);
          setSubscriptionEnd(null);
          setHasTeamAccess(false);
          setIsLoading(false);
          return;
        }

        if (newSession?.access_token) {
          setTimeout(() => {
            checkSubscription(newSession.access_token, newSession.user?.email);
          }, 0);
        } else {
          setIsSubscribed(false);
          setSubscriptionTier(null);
          setSubscriptionEnd(null);
          setHasTeamAccess(false);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      sessionRef.current = s;
      userRef.current = s?.user ?? null;

      if (s?.access_token) {
        checkSubscription(s.access_token, s.user?.email);
      }
      setIsLoading(false);
    });

    // Use refs for interval to avoid stale closure
    const interval = setInterval(() => {
      if (sessionRef.current?.access_token) {
        checkSubscription(sessionRef.current.access_token, userRef.current?.email);
      }
    }, 300000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [checkSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        user,
        session,
        isSubscribed: isSubscribed || hasTeamAccess,
        subscriptionTier: hasTeamAccess ? "elite" : subscriptionTier,
        subscriptionEnd,
        isLoading,
        hasTeamAccess,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
