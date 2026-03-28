import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import { Award, CheckCircle, XCircle, Search, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useVerifyCertificate } from "@/hooks/useCourseCertificates";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import vaultLogo from "@/assets/vault-logo-new.webp";

const VerifyCourseCertificate = () => {
  const [searchParams] = useSearchParams();
  const [certificateNumber, setCertificateNumber] = useState(searchParams.get("cert") || "");
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    message?: string;
    certificate_number?: string;
    course_title?: string;
    recipient_name?: string;
    issued_at?: string;
    completion_date?: string;
  } | null>(null);
  
  const verifyCertificate = useVerifyCertificate();

  // Auto-verify if cert param is present
  useEffect(() => {
    const certParam = searchParams.get("cert");
    if (certParam) {
      handleVerify(certParam);
    }
  }, [searchParams]);

  const handleVerify = async (certNum?: string) => {
    const numberToVerify = certNum || certificateNumber.trim();
    if (!numberToVerify) return;
    
    try {
      const result = await verifyCertificate.mutateAsync(numberToVerify);
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({ valid: false, message: "Verification failed" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* VAULT Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src={vaultLogo} 
              alt="VAULT" 
              className="h-16 md:h-20 object-contain"
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-bebas text-4xl md:text-5xl tracking-wide mb-2">
            VERIFY CERTIFICATE
          </h1>
          <p className="text-muted-foreground">
            Enter a certificate number to verify its authenticity
          </p>
        </motion.div>
        
        {/* Search Form */}
        <Card className="border-border/50 mb-8">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Input
                placeholder="Enter certificate number (e.g., VAULT-ABC12345)"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value.toUpperCase())}
                className="font-mono"
              />
              <Button 
                onClick={() => handleVerify()} 
                disabled={verifyCertificate.isPending || !certificateNumber.trim()}
                className="gap-2 min-w-[120px]"
              >
                {verifyCertificate.isPending ? (
                  "Verifying..."
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Verify
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Verification Result */}
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {verificationResult.valid ? (
              <Card className="border-green-500/50 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-green-500">
                    <CheckCircle className="w-6 h-6" />
                    Certificate Verified
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Recipient</p>
                      <p className="font-semibold text-lg">{verificationResult.recipient_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Course Completed</p>
                      <p className="font-semibold text-lg text-primary">{verificationResult.course_title}</p>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Certificate Number</p>
                        <p className="font-mono">{verificationResult.certificate_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Completion Date
                        </p>
                        <p>
                          {verificationResult.completion_date && 
                            format(new Date(verificationResult.completion_date), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      This certificate was issued by VAULT™ Baseball and is authentic.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-destructive">
                    <XCircle className="w-6 h-6" />
                    Certificate Not Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The certificate number you entered could not be verified. Please check the number and try again.
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default VerifyCourseCertificate;
