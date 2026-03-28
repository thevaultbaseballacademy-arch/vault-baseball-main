import { useState, useEffect, useCallback } from "react";

export const COOKIE_CONSENT_KEY = "vault_cookie_consent";
export const COOKIE_PREFERENCES_KEY = "vault_cookie_preferences";

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const defaultPreferences: CookiePreferences = {
  essential: true, // Always required
  functional: false,
  analytics: false,
  marketing: false,
};

export type ConsentStatus = "pending" | "accepted" | "declined" | "customized";

export const useCookieConsent = () => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>("pending");
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentStatus | null;
    const storedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (consent) {
      setConsentStatus(consent);
      if (storedPrefs) {
        try {
          const parsed = JSON.parse(storedPrefs);
          setPreferences({ ...defaultPreferences, ...parsed, essential: true });
        } catch {
          setPreferences(defaultPreferences);
        }
      }
    } else {
      // Show banner after a small delay to prevent flash
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = useCallback((prefs: CookiePreferences, status: ConsentStatus) => {
    const safePrefs = { ...prefs, essential: true };
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(safePrefs));
    localStorage.setItem(COOKIE_CONSENT_KEY, status);
    setPreferences(safePrefs);
    setConsentStatus(status);
    setShowBanner(false);
  }, []);

  const acceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted, "accepted");
  }, [savePreferences]);

  const declineAll = useCallback(() => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyEssential, "declined");
  }, [savePreferences]);

  const saveCustomPreferences = useCallback((prefs: CookiePreferences) => {
    savePreferences(prefs, "customized");
  }, [savePreferences]);

  const updatePreference = useCallback((key: keyof CookiePreferences, value: boolean) => {
    if (key === "essential") return; // Cannot disable essential
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetBanner = useCallback(() => {
    setShowBanner(true);
  }, []);

  const hasConsent = useCallback((type: keyof CookiePreferences): boolean => {
    return preferences[type];
  }, [preferences]);

  return {
    consentStatus,
    preferences,
    showBanner,
    setShowBanner,
    acceptAll,
    declineAll,
    saveCustomPreferences,
    updatePreference,
    resetBanner,
    hasConsent,
  };
};
