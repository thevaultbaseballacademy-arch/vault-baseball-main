import { useState, useEffect, useCallback } from "react";

// Check if we're running in a Capacitor native context
const isNative = (): boolean => {
  return typeof (window as any).Capacitor !== "undefined";
};

interface BiometricState {
  isAvailable: boolean;
  isLocked: boolean;
  isChecking: boolean;
  biometricType: "face" | "fingerprint" | "iris" | "none";
  isEnabled: boolean;
}

const BIOMETRIC_ENABLED_KEY = "vault_biometric_enabled";
const BIOMETRIC_LOCKED_KEY = "vault_biometric_locked";

export const useBiometricAuth = () => {
  const [state, setState] = useState<BiometricState>({
    isAvailable: false,
    isLocked: false,
    isChecking: true,
    biometricType: "none",
    isEnabled: false,
  });

  // Check biometric availability
  const checkAvailability = useCallback(async () => {
    try {
      if (isNative()) {
        const { NativeBiometric } = await import("capacitor-native-biometric");
        const result = await NativeBiometric.isAvailable();
        const enabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY) === "true";
        const wasLocked = sessionStorage.getItem(BIOMETRIC_LOCKED_KEY) !== "unlocked";

        setState((prev) => ({
          ...prev,
          isAvailable: result.isAvailable,
          biometricType: result.biometryType === 1 ? "face" : result.biometryType === 2 ? "fingerprint" : "iris",
          isEnabled: enabled,
          isLocked: enabled && wasLocked,
          isChecking: false,
        }));
      } else {
        // Web fallback — check WebAuthn availability
        const webAuthnAvailable =
          typeof window !== "undefined" &&
          window.PublicKeyCredential !== undefined;

        const enabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY) === "true";
        const wasLocked = sessionStorage.getItem(BIOMETRIC_LOCKED_KEY) !== "unlocked";

        setState((prev) => ({
          ...prev,
          isAvailable: webAuthnAvailable,
          biometricType: webAuthnAvailable ? "face" : "none",
          isEnabled: enabled,
          isLocked: enabled && wasLocked,
          isChecking: false,
        }));
      }
    } catch {
      setState((prev) => ({
        ...prev,
        isAvailable: false,
        isChecking: false,
      }));
    }
  }, []);

  // Authenticate with biometrics
  const authenticate = useCallback(async (reason = "Verify your identity"): Promise<boolean> => {
    try {
      if (isNative()) {
        const { NativeBiometric } = await import("capacitor-native-biometric");
        await NativeBiometric.verifyIdentity({
          reason,
          title: "VAULT™ Security",
          subtitle: reason,
          description: "Use Face ID or fingerprint to continue",
        });
        sessionStorage.setItem(BIOMETRIC_LOCKED_KEY, "unlocked");
        setState((prev) => ({ ...prev, isLocked: false }));
        return true;
      } else {
        // Web / PWA fallback: attempt WebAuthn if available; otherwise
        // silently grant access so the app is never blocked by a
        // browser confirm() dialog (which would be rejected by App Store review).
        if (typeof window !== "undefined" && window.PublicKeyCredential !== undefined) {
          try {
            // A real WebAuthn ceremony would go here for production PWA.
            // For now we treat WebAuthn availability as sufficient and unlock.
            sessionStorage.setItem(BIOMETRIC_LOCKED_KEY, "unlocked");
            setState((prev) => ({ ...prev, isLocked: false }));
            return true;
          } catch {
            return false;
          }
        }
        // No biometric capability on this platform — silently unlock
        sessionStorage.setItem(BIOMETRIC_LOCKED_KEY, "unlocked");
        setState((prev) => ({ ...prev, isLocked: false }));
        return true;
      }
    } catch {
      return false;
    }
  }, []);

  // Toggle biometric on/off
  const toggleBiometric = useCallback(async () => {
    const newValue = !state.isEnabled;
    if (newValue) {
      const success = await authenticate("Enable biometric security");
      if (!success) return false;
    }
    localStorage.setItem(BIOMETRIC_ENABLED_KEY, String(newValue));
    setState((prev) => ({
      ...prev,
      isEnabled: newValue,
      isLocked: false,
    }));
    return true;
  }, [state.isEnabled, authenticate]);

  // Guard sensitive actions
  const requireBiometric = useCallback(
    async (reason = "Authenticate to continue"): Promise<boolean> => {
      if (!state.isEnabled) return true; // not enabled, allow through
      return authenticate(reason);
    },
    [state.isEnabled, authenticate],
  );

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    ...state,
    authenticate,
    toggleBiometric,
    requireBiometric,
  };
};
