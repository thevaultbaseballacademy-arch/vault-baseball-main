import { ScanFace, Fingerprint, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { useToast } from "@/hooks/use-toast";

const BiometricToggle = () => {
  const { isAvailable, isEnabled, biometricType, toggleBiometric } = useBiometricAuth();
  const { toast } = useToast();

  if (!isAvailable) return null;

  const label =
    biometricType === "face"
      ? "Face ID"
      : biometricType === "fingerprint"
        ? "Touch ID"
        : "Biometric Lock";

  const Icon =
    biometricType === "face"
      ? ScanFace
      : biometricType === "fingerprint"
        ? Fingerprint
        : ShieldCheck;

  const handleToggle = async () => {
    const success = await toggleBiometric();
    if (success) {
      toast({
        title: isEnabled ? `${label} Disabled` : `${label} Enabled`,
        description: isEnabled
          ? "Biometric security has been turned off."
          : `${label} will be required on app launch and for sensitive actions.`,
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <Label className="text-sm font-medium text-foreground">{label}</Label>
          <p className="text-xs text-muted-foreground">
            Require {label.toLowerCase()} to unlock app &amp; confirm actions
          </p>
        </div>
      </div>
      <Switch checked={isEnabled} onCheckedChange={handleToggle} />
    </div>
  );
};

export default BiometricToggle;
