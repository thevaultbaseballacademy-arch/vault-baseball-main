import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2, Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBackupCodes } from "@/hooks/useBackupCodes";
import { QRCodeSVG } from "qrcode.react";
import BackupCodesDisplay from "./BackupCodesDisplay";

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

type SetupStep = "qr" | "verify" | "backup";

const MFASetup = ({ onComplete, onCancel }: MFASetupProps) => {
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState<SetupStep>("qr");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { codes, generateBackupCodes, loading: generatingCodes } = useBackupCodes();

  useEffect(() => {
    enrollMFA();
  }, []);

  const enrollMFA = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "VAULT Admin 2FA",
      });

      if (error) throw error;

      if (data) {
        setFactorId(data.id);
        setQrCode(data.totp.uri);
        setSecret(data.totp.secret);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set up 2FA",
        variant: "destructive",
      });
      onCancel?.();
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!factorId || verificationCode.length !== 6) return;

    setVerifying(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode,
      });

      if (verifyError) throw verifyError;

      // Generate backup codes after successful verification
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await generateBackupCodes(user.id);
        setStep("backup");
      }

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been set up successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show backup codes after verification
  if (step === "backup" && codes.length > 0) {
    return (
      <BackupCodesDisplay
        codes={codes}
        onContinue={() => onComplete?.()}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Set Up Two-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground">Secure your admin account with 2FA</p>
        </div>
      </div>

      {/* Step 1: QR Code */}
      <div className="space-y-4">
        <div className="p-4 bg-secondary/50 rounded-lg border border-border">
          <p className="text-sm font-medium text-foreground mb-3">
            Step 1: Scan the QR code with your authenticator app
          </p>
          <div className="flex justify-center bg-white p-4 rounded-lg">
            {qrCode && <QRCodeSVG value={qrCode} size={180} />}
          </div>
        </div>

        {/* Manual entry option */}
        <div className="p-4 bg-secondary/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">
            Can't scan? Enter this code manually:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-background rounded text-sm font-mono break-all">
              {secret}
            </code>
            <Button variant="ghost" size="sm" onClick={copySecret}>
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Step 2: Verify */}
      <div className="space-y-4">
        <div className="p-4 bg-secondary/50 rounded-lg border border-border">
          <p className="text-sm font-medium text-foreground mb-3">
            Step 2: Enter the 6-digit code from your app
          </p>
          <div className="space-y-2">
            <Label htmlFor="verificationCode">Verification Code</Label>
            <Input
              id="verificationCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-widest font-mono"
            />
          </div>
        </div>

        {/* Info about backup codes */}
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-500">
            <p className="font-medium">Backup codes will be generated</p>
            <p className="mt-1 text-blue-500/80">
              After verification, you'll receive 10 backup codes for account recovery.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          variant="vault"
          onClick={handleVerify}
          disabled={verifying || generatingCodes || verificationCode.length !== 6}
          className="flex-1"
        >
          {verifying || generatingCodes ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {generatingCodes ? "Generating Codes..." : "Verifying..."}
            </>
          ) : (
            "Enable 2FA"
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default MFASetup;
