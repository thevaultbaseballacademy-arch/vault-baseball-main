import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import BiometricLockScreen from "./BiometricLockScreen";

/**
 * Renders a full-screen lock overlay when biometric is enabled
 * and the session hasn't been unlocked yet.
 */
const BiometricGate = () => {
  const { isLocked, isChecking, biometricType, authenticate } = useBiometricAuth();

  if (isChecking || !isLocked) return null;

  return (
    <BiometricLockScreen
      biometricType={biometricType}
      onUnlock={() => authenticate("Unlock VAULT™")}
    />
  );
};

export default BiometricGate;
