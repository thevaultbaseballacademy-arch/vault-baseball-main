import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2, Check, X, AlertTriangle, Key, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBackupCodes } from "@/hooks/useBackupCodes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MFASetup from "./MFASetup";
import BackupCodesDisplay from "./BackupCodesDisplay";

interface MFASettingsProps {
  userId: string;
}

interface Factor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
  created_at: string;
}

const MFASettings = ({ userId }: MFASettingsProps) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [disablingFactor, setDisablingFactor] = useState<string | null>(null);
  const [remainingCodes, setRemainingCodes] = useState<number>(0);
  const { toast } = useToast();
  const { codes, generateBackupCodes, getRemainingCodesCount, loading: generatingCodes } = useBackupCodes();

  useEffect(() => {
    checkAdminAndFactors();
  }, [userId]);

  const checkAdminAndFactors = async () => {
    setLoading(true);
    try {
      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roleData);

      // Get MFA factors
      const { data: mfaData, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;

      // Filter to only verified TOTP factors
      const verifiedFactors = mfaData?.totp?.filter(f => f.status === "verified") || [];
      setFactors(verifiedFactors);

      // Get remaining backup codes count
      if (verifiedFactors.length > 0) {
        const count = await getRemainingCodesCount(userId);
        setRemainingCodes(count);
      }
    } catch (error: any) {
      console.error("Error checking MFA status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!disablingFactor) return;

    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: disablingFactor,
      });

      if (error) throw error;

      // Delete backup codes
      await supabase.from("mfa_backup_codes").delete().eq("user_id", userId);

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
      
      setFactors(factors.filter(f => f.id !== disablingFactor));
      setRemainingCodes(0);
      setShowDisableConfirm(false);
      setDisablingFactor(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disable 2FA",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateCodes = async () => {
    const newCodes = await generateBackupCodes(userId);
    if (newCodes.length > 0) {
      setShowRegenerateConfirm(false);
      setShowBackupCodes(true);
      setRemainingCodes(newCodes.length);
    }
  };

  // Don't show for non-admins
  if (!loading && !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const hasMFA = factors.length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display text-foreground">Two-Factor Authentication</h2>
              <p className="text-sm text-muted-foreground">
                {hasMFA ? "2FA is enabled on your account" : "Add an extra layer of security"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasMFA ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
                <Check className="w-4 h-4" />
                Enabled
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                Not Enabled
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {hasMFA ? (
            <>
              <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Active authenticator:</p>
                {factors.map((factor) => (
                  <div key={factor.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {factor.friendly_name || "Authenticator App"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(factor.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setDisablingFactor(factor.id);
                        setShowDisableConfirm(true);
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              {/* Backup Codes Section */}
              <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Backup Codes</p>
                  </div>
                  <span className={`text-sm font-medium ${
                    remainingCodes <= 2 ? "text-yellow-500" : "text-muted-foreground"
                  }`}>
                    {remainingCodes} remaining
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Use these codes if you lose access to your authenticator app
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRegenerateConfirm(true)}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate Backup Codes
                </Button>
              </div>

              {remainingCodes <= 2 && remainingCodes > 0 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-500">
                      <p className="font-medium">Low Backup Codes</p>
                      <p className="mt-1 text-yellow-500/80">
                        You only have {remainingCodes} backup code{remainingCodes !== 1 ? "s" : ""} left. 
                        Consider regenerating new codes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Your admin account is protected with two-factor authentication. You'll need to enter
                a code from your authenticator app when signing in.
              </p>
            </>
          ) : (
            <>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-500">
                    <p className="font-medium">Recommended for Admin Accounts</p>
                    <p className="mt-1 text-yellow-500/80">
                      As an admin, you have access to sensitive data. Enable 2FA to protect your
                      account from unauthorized access.
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="vault" onClick={() => setShowSetup(true)}>
                Enable Two-Factor Authentication
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* MFA Setup Dialog */}
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app to get started.
            </DialogDescription>
          </DialogHeader>
          <MFASetup
            onComplete={() => {
              setShowSetup(false);
              checkAdminAndFactors();
            }}
            onCancel={() => setShowSetup(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Backup Codes</DialogTitle>
            <DialogDescription>
              Your previous codes have been invalidated.
            </DialogDescription>
          </DialogHeader>
          <BackupCodesDisplay
            codes={codes}
            onContinue={() => setShowBackupCodes(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Regenerate Confirmation */}
      <AlertDialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Backup Codes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will invalidate all your existing backup codes and generate new ones.
              Make sure to save the new codes in a safe place.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerateCodes}
              disabled={generatingCodes}
            >
              {generatingCodes ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                "Regenerate Codes"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable Confirmation */}
      <AlertDialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the extra security layer from your admin account and delete all
              your backup codes. You can always enable it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDisablingFactor(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableMFA}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disable 2FA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MFASettings;
