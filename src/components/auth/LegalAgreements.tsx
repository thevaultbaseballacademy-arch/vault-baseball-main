import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LegalAgreementsProps {
  onAgreementChange: (allAgreed: boolean) => void;
}

const LegalAgreements = ({ onAgreementChange }: LegalAgreementsProps) => {
  const [agreements, setAgreements] = useState({
    terms: false,
    waiver: false,
    refund: false,
    isMinor: false,
    guardianConsent: false,
  });

  const handleAgreementChange = (key: keyof typeof agreements, checked: boolean) => {
    const newAgreements = { ...agreements, [key]: checked };
    setAgreements(newAgreements);
    
    // Check if all required agreements are accepted
    const requiredAgreements = [newAgreements.terms, newAgreements.waiver, newAgreements.refund];
    
    // If minor checkbox is checked, guardian consent is also required
    if (newAgreements.isMinor) {
      requiredAgreements.push(newAgreements.guardianConsent);
    }
    
    const allAgreed = requiredAgreements.every(Boolean);
    onAgreementChange(allAgreed);
  };

  return (
    <div className="space-y-4 text-left">
      {/* Terms of Service */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms"
          checked={agreements.terms}
          onCheckedChange={(checked) => handleAgreementChange("terms", checked as boolean)}
          className="mt-1"
        />
        <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
          I agree to the{" "}
          <a
            href="/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            Terms of Service
            <ExternalLink className="w-3 h-3" />
          </a>
        </Label>
      </div>

      {/* Athlete Waiver */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="waiver"
          checked={agreements.waiver}
          onCheckedChange={(checked) => handleAgreementChange("waiver", checked as boolean)}
          className="mt-1"
        />
        <Label htmlFor="waiver" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
          I acknowledge the{" "}
          <a
            href="/athlete-waiver"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            Athlete Waiver & Liability Release
            <ExternalLink className="w-3 h-3" />
          </a>
          , including assumption of risk for physical training activities
        </Label>
      </div>

      {/* Refund Policy */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="refund"
          checked={agreements.refund}
          onCheckedChange={(checked) => handleAgreementChange("refund", checked as boolean)}
          className="mt-1"
        />
        <Label htmlFor="refund" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
          I understand and accept the{" "}
          <a
            href="/refund-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            Strict No-Refund Policy
            <ExternalLink className="w-3 h-3" />
          </a>
          {" "}— all sales are final
        </Label>
      </div>

      {/* Divider */}
      <div className="border-t border-border/50 my-4" />

      {/* Minor Checkbox */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="isMinor"
          checked={agreements.isMinor}
          onCheckedChange={(checked) => handleAgreementChange("isMinor", checked as boolean)}
          className="mt-1"
        />
        <Label htmlFor="isMinor" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
          The athlete is under 18 years of age
        </Label>
      </div>

      {/* Guardian Consent - Only shown if minor is checked */}
      <AnimatePresence>
        {agreements.isMinor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-7 overflow-hidden"
          >
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-400">
                  A parent or legal guardian must agree on behalf of the minor athlete.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="guardianConsent"
                checked={agreements.guardianConsent}
                onCheckedChange={(checked) => handleAgreementChange("guardianConsent", checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="guardianConsent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                I am the parent/legal guardian of this athlete and I agree to all terms on their behalf, 
                including the waiver of liability and assumption of risk
              </Label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LegalAgreements;
