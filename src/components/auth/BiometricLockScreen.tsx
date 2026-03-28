import { motion } from "framer-motion";
import { Fingerprint, ShieldCheck, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BiometricLockScreenProps {
  biometricType: "face" | "fingerprint" | "iris" | "none";
  onUnlock: () => void;
}

const BiometricLockScreen = ({ biometricType, onUnlock }: BiometricLockScreenProps) => {
  const icon =
    biometricType === "face" ? (
      <ScanFace className="w-16 h-16 text-primary" />
    ) : biometricType === "fingerprint" ? (
      <Fingerprint className="w-16 h-16 text-primary" />
    ) : (
      <ShieldCheck className="w-16 h-16 text-primary" />
    );

  const label =
    biometricType === "face"
      ? "Face ID"
      : biometricType === "fingerprint"
        ? "Touch ID"
        : "Biometric";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center gap-8 p-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring" }}
        className="flex flex-col items-center gap-6"
      >
        <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
          {icon}
        </div>

        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl tracking-wide text-foreground">
            VAULT™
          </h1>
          <p className="text-muted-foreground text-sm">
            Unlock with {label} to continue
          </p>
        </div>

        <Button
          size="lg"
          variant="vault"
          onClick={onUnlock}
          className="mt-4 gap-2 px-8"
        >
          {icon}
          Unlock with {label}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default BiometricLockScreen;
