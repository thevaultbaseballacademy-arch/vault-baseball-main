import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Search, CheckCircle, XCircle, Clock, 
  Award, Calendar, User, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCertificationDisplayName, type CertificationType } from "@/lib/certificationPricing";
import vaultLogo from "@/assets/vault-logo-new.webp";

interface CertificateVerificationResponse {
  found: boolean;
  message?: string;
  certificate_number?: string;
  certification_type?: string;
  status?: string;
  issued_at?: string;
  expires_at?: string;
  score?: number;
  coach_name?: string;
  is_valid?: boolean;
}

interface VerificationResult {
  valid: boolean;
  status?: 'active' | 'expired' | 'revoked';
  certificationType?: CertificationType;
  certificationName?: string;
  coachName?: string;
  issuedAt?: string;
  expiresAt?: string;
  score?: number;
  message: string;
}

const VerifyCertification = () => {
  const [certificateId, setCertificateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      // Use secure RPC function for public certificate verification
      const { data: rawData, error } = await supabase
        .rpc('verify_certificate_public', { cert_number: certificateId.trim() });
      
      const data = rawData as unknown as CertificateVerificationResponse | null;

      if (error) {
        console.error('Verification error:', error);
        setResult({
          valid: false,
          message: "An error occurred while verifying. Please try again.",
        });
        return;
      }

      if (!data || !data.found) {
        setResult({
          valid: false,
          message: "Certificate not found. Please check the ID and try again.",
        });
        return;
      }

      const isExpired = new Date(data.expires_at) <= new Date();
      const isActive = data.status === 'active' && !isExpired;

      setResult({
        valid: data.is_valid,
        status: isExpired ? 'expired' : (data.status as 'active' | 'expired' | 'revoked'),
        certificationType: data.certification_type as CertificationType,
        certificationName: getCertificationDisplayName(data.certification_type as CertificationType),
        coachName: data.coach_name,
        issuedAt: data.issued_at,
        expiresAt: data.expires_at,
        score: data.score,
        message: isActive 
          ? "This certificate is valid and active."
          : isExpired 
            ? "This certificate has expired."
            : "This certificate has been revoked.",
      });
    } catch (error) {
      console.error('Verification error:', error);
      setResult({
        valid: false,
        message: "An error occurred while verifying. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!result) return null;
    
    if (result.valid) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-500" />
        </motion.div>
      );
    }
    
    if (result.status === 'expired') {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Clock className="w-10 h-10 text-amber-500" />
        </motion.div>
      );
    }
    
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <XCircle className="w-10 h-10 text-red-500" />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              {/* VAULT Logo */}
              <div className="flex justify-center mb-4">
                <img 
                  src={vaultLogo} 
                  alt="VAULT" 
                  className="h-16 md:h-20 object-contain"
                />
              </div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Certificate Verification</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display text-foreground">
                VERIFY CERTIFICATION
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Enter a certificate ID to verify its authenticity and check if it's currently valid.
              </p>
            </div>

            {/* Search Form */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Certificate ID
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={certificateId}
                        onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                        placeholder="VAULT-XXXXX-YYYY"
                        className="font-mono text-lg tracking-wider"
                        disabled={loading}
                      />
                      <Button 
                        type="submit" 
                        variant="vault"
                        disabled={loading || !certificateId.trim()}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The certificate ID can be found at the bottom of the certificate PDF.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Results */}
            <AnimatePresence mode="wait">
              {hasSearched && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`border-2 ${
                    result.valid 
                      ? 'border-green-500/30 bg-green-500/5' 
                      : result.status === 'expired'
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-red-500/30 bg-red-500/5'
                  }`}>
                    <CardContent className="pt-8 pb-8">
                      {getStatusIcon()}
                      
                      <h3 className={`text-xl font-display text-center mb-2 ${
                        result.valid 
                          ? 'text-green-600' 
                          : result.status === 'expired'
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }`}>
                        {result.valid 
                          ? 'VERIFIED' 
                          : result.status === 'expired'
                            ? 'EXPIRED'
                            : 'INVALID'}
                      </h3>
                      
                      <p className="text-center text-muted-foreground mb-6">
                        {result.message}
                      </p>

                      {result.certificationName && (
                        <div className="space-y-4">
                          <div className="bg-background/50 rounded-lg p-4 space-y-3">
                            {/* Certification Name */}
                            <div className="flex items-center gap-3">
                              <Award className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Certification</p>
                                <p className="font-medium text-foreground">{result.certificationName}</p>
                              </div>
                            </div>

                            {/* Coach Name */}
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Certified Coach</p>
                                <p className="font-medium text-foreground">{result.coachName}</p>
                              </div>
                            </div>

                            {/* Dates */}
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-primary" />
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Validity Period</p>
                                <p className="font-medium text-foreground">
                                  {result.issuedAt && format(new Date(result.issuedAt), 'MMM d, yyyy')}
                                  {' → '}
                                  {result.expiresAt && format(new Date(result.expiresAt), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>

                            {/* Score */}
                            {result.score && (
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-primary" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Exam Score</p>
                                  <p className="font-medium text-foreground">{result.score}%</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Certificate ID */}
                          <p className="text-center text-xs text-muted-foreground font-mono">
                            Certificate ID: {certificateId}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info Section */}
            <div className="text-center space-y-2 pt-4">
              <p className="text-sm text-muted-foreground">
                All VAULT certifications are issued with a unique verification number.
              </p>
              <p className="text-xs text-muted-foreground">
                If you believe there's an error with this verification, please contact{' '}
                <a href="mailto:support@vaultbaseball.com" className="text-primary hover:underline">
                  support@vaultbaseball.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyCertification;
