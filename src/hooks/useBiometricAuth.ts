import { useState, useEffect, useCallback } from "react";

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
    isChecking: false,
    biometricType: "none",
    isEnabled: false,
  });

  const checkAvailability = useCallback(async () => {
    const timeout = setTimeout(() => {
      setState((prev) => ({ ...prev, isChecking: false, isLocked: false }));
    }, 3000);

    try {
      if (isNative()) {
        const { NativeBiometric } = await import("capacitor-native-biometric");
        const result = await NativeBiometric.isAvailable();
        const enabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY) === "true";
        const wasLocked = sessionStorage.getItem(BIOMETRIC_LOCKED_KEY) !== "unlocked";

        clearTimeout(timeout);
        setState((prev) => ({
          ...prev,
          isAvailable: result.isAvailable,
          biometricType: result.biometryType === 1 ? "face" : result.biometryType === 2 ? "fingerprint" : "iris",
          isEnabled: enabled,
          isLocked: enabled && wasLocked,
          isChecking: false,
        }));
      } else {
        const webAuthnAvailable =
          typeof window !== "undefined" &&
          window.PublicKeyCredential !== undefined;

        const enabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY) === "true";
        const wasLocked = sessionStorage.getItem(BIOMETRIC_LOCKED_KEY) !== "unlocked";

        clearTimeout(timeout);
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
      clearTimeout(timeout);
      setState((prev) => ({
        ...prev,
        isAvailable: false,
        isChecking: false,
        isLocked: false,
      }));
    }
  }, []);

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
        sessionStorage.setItem(BIOMETRIC_LOCKED_KEY, "unlocked");
        setState((prev) => ({ ...prev, isLocked: false }));
        return true;
      }
    } catch {
      return false;
    }
  }, []);

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

  const requireBiometric = useCallback(
    async (reason = "Authenticate to continue"): Promise<boolean> => {
      if (!state.isEnabled) return true;
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
