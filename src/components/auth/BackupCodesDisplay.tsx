import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Download, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BackupCodesDisplayProps {
  codes: string[];
  onContinue: () => void;
}

const BackupCodesDisplay = ({ codes, onContinue }: BackupCodesDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyAllCodes = () => {
    const text = codes.join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard",
    });
  };

  const downloadCodes = () => {
    const text = `VAULT 2FA Backup Codes\n${"=".repeat(30)}\n\nGenerated: ${new Date().toLocaleString()}\n\nThese codes can each be used once to sign in if you lose access to your authenticator app.\n\n${codes.map((code, i) => `${i + 1}. ${code}`).join("\n")}\n\nKeep these codes in a safe place. Each code can only be used once.`;
    
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vault-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Backup codes saved to file",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
          <Key className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Save Your Backup Codes</h3>
          <p className="text-sm text-muted-foreground">
            Use these if you lose your authenticator
          </p>
        </div>
      </div>

      <div className="p-4 bg-secondary/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground mb-4">
          Each code can only be used once. Store them somewhere safe.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {codes.map((code, index) => (
            <div
              key={index}
              className="px-3 py-2 bg-background rounded text-sm font-mono text-center"
            >
              {code}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={copyAllCodes} className="flex-1">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </>
          )}
        </Button>
        <Button variant="outline" onClick={downloadCodes} className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-sm text-yellow-500">
          <strong>Important:</strong> This is the only time these codes will be shown. 
          Make sure you save them before continuing.
        </p>
      </div>

      <Button variant="vault" onClick={onContinue} className="w-full">
        I've Saved My Codes
      </Button>
    </motion.div>
  );
};

export default BackupCodesDisplay;
