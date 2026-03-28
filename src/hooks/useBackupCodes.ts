import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Generate a random backup code (8 alphanumeric characters)
const generateCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding confusing chars like 0, O, 1, I
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Simple hash function for backup codes (in production, use a proper crypto library)
const hashCode = async (code: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(code.toUpperCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const useBackupCodes = () => {
  const [loading, setLoading] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const { toast } = useToast();

  const generateBackupCodes = async (userId: string, count: number = 10): Promise<string[]> => {
    setLoading(true);
    try {
      // Delete existing backup codes
      await supabase.from("mfa_backup_codes").delete().eq("user_id", userId);

      // Generate new codes
      const newCodes: string[] = [];
      const codeRecords: { user_id: string; code_hash: string }[] = [];

      for (let i = 0; i < count; i++) {
        const code = generateCode();
        newCodes.push(code);
        const hash = await hashCode(code);
        codeRecords.push({ user_id: userId, code_hash: hash });
      }

      // Store hashed codes in database
      const { error } = await supabase.from("mfa_backup_codes").insert(codeRecords);

      if (error) throw error;

      setCodes(newCodes);
      return newCodes;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate backup codes",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const verifyBackupCode = async (userId: string, code: string): Promise<boolean> => {
    setLoading(true);
    try {
      const hash = await hashCode(code.toUpperCase().replace(/\s/g, ""));

      // Find unused backup code
      const { data, error } = await supabase
        .from("mfa_backup_codes")
        .select("id")
        .eq("user_id", userId)
        .eq("code_hash", hash)
        .is("used_at", null)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Mark code as used
        await supabase
          .from("mfa_backup_codes")
          .update({ used_at: new Date().toISOString() })
          .eq("id", data.id);

        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Backup code verification error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getRemainingCodesCount = async (userId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from("mfa_backup_codes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("used_at", null);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error getting remaining codes:", error);
      return 0;
    }
  };

  const clearCodes = () => setCodes([]);

  return {
    loading,
    codes,
    generateBackupCodes,
    verifyBackupCode,
    getRemainingCodesCount,
    clearCodes,
  };
};
