import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, Award, Calendar, Hash, CheckCircle, Twitter, Linkedin, Facebook, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { CourseCertificate as CertificateType } from "@/hooks/useCourseCertificates";
import vaultLogo from "@/assets/vault-logo-new.webp";

interface CourseCertificateProps {
  certificate: CertificateType;
  onShare?: () => void;
}

const CourseCertificate = ({ certificate, onShare }: CourseCertificateProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const shareUrl = `${window.location.origin}/verify-course-certificate?cert=${certificate.certificate_number}`;
  const shareText = `🎓 I just completed "${certificate.course_title}" at VAULT™ Baseball! Check out my verified certificate:`;
  const hashtags = "VAULTBaseball,Baseball,Training,Achievement";

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    
    try {
      toast.loading("Generating PDF...");
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#0a0a0a",
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`VAULT-Certificate-${certificate.certificate_number}.pdf`);
      
      toast.dismiss();
      toast.success("Certificate downloaded!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to download certificate");
      console.error(error);
    }
  };

  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    
    try {
      toast.loading("Generating image...");
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#0a0a0a",
        logging: false,
      });
      
      const link = document.createElement("a");
      link.download = `VAULT-Certificate-${certificate.certificate_number}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.dismiss();
      toast.success("Certificate downloaded!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to download certificate");
      console.error(error);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Certificate link copied to clipboard!");
    setShowShareMenu(false);
    onShare?.();
  };

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
    setShowShareMenu(false);
    onShare?.();
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, "_blank", "width=600,height=600");
    setShowShareMenu(false);
    onShare?.();
  };

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
    setShowShareMenu(false);
    onShare?.();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "VAULT™ Course Certificate",
          text: shareText,
          url: shareUrl,
        });
        onShare?.();
      } catch {
        // User cancelled
      }
    }
    setShowShareMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <motion.div
        ref={certificateRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/30 rounded-xl p-8 md:p-12 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary))_0%,transparent_50%)]" />
        </div>
        
        {/* Corner Decorations */}
        <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary/40" />
        <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-primary/40" />
        <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-primary/40" />
        <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary/40" />
        
        {/* Content */}
        <div className="relative text-center space-y-6">
          {/* VAULT Logo Watermark */}
          <div className="flex justify-center mb-4">
            <img 
              src={vaultLogo} 
              alt="VAULT" 
              className="h-16 md:h-20 object-contain opacity-90"
            />
          </div>
          
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Award className="w-8 h-8 text-primary" />
              <span className="text-sm font-semibold tracking-[0.3em] text-primary uppercase">
                Certificate of Completion
              </span>
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-bebas text-4xl md:text-5xl tracking-wider text-foreground">
              VAULT™ BASEBALL
            </h1>
          </div>
          
          {/* Divider */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary/50" />
            <CheckCircle className="w-6 h-6 text-primary" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          
          {/* Recipient */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-widest">
              This is to certify that
            </p>
            <h2 className="font-bebas text-3xl md:text-4xl text-foreground">
              {certificate.recipient_name}
            </h2>
          </div>
          
          {/* Course */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-widest">
              Has successfully completed
            </p>
            <h3 className="text-xl md:text-2xl font-semibold text-primary">
              {certificate.course_title}
            </h3>
          </div>
          
          {/* Date & Certificate Number */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Completed: {format(new Date(certificate.completion_date), "MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="w-4 h-4" />
              <span className="font-mono">{certificate.certificate_number}</span>
            </div>
          </div>
          
          {/* Footer */}
          <div className="pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Verify this certificate at vault-baseball.lovable.app/verify-course-certificate
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Action Buttons */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={handleDownloadPDF} className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleDownloadImage} className="gap-2">
              <Download className="w-4 h-4" />
              Download Image
            </Button>
            <div className="relative">
              <Button 
                variant="secondary" 
                onClick={() => setShowShareMenu(!showShareMenu)} 
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Certificate
              </Button>
              
              {/* Share Menu Dropdown */}
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
                  >
                    <Card className="border-border bg-card shadow-xl">
                      <CardContent className="p-2 min-w-[200px]">
                        <div className="flex flex-col gap-1">
                          {/* Close button */}
                          <div className="flex justify-between items-center px-2 py-1 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">Share to</span>
                            <button 
                              onClick={() => setShowShareMenu(false)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Twitter/X */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShareTwitter}
                            className="w-full justify-start gap-3 h-10"
                          >
                            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                              <Twitter className="w-4 h-4 text-white" />
                            </div>
                            <span>X (Twitter)</span>
                          </Button>
                          
                          {/* LinkedIn */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShareLinkedIn}
                            className="w-full justify-start gap-3 h-10"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center">
                              <Linkedin className="w-4 h-4 text-white" />
                            </div>
                            <span>LinkedIn</span>
                          </Button>
                          
                          {/* Facebook */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShareFacebook}
                            className="w-full justify-start gap-3 h-10"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center">
                              <Facebook className="w-4 h-4 text-white" />
                            </div>
                            <span>Facebook</span>
                          </Button>
                          
                          {/* Copy Link */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyLink}
                            className="w-full justify-start gap-3 h-10"
                          >
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Link2 className="w-4 h-4" />
                            </div>
                            <span>Copy Link</span>
                          </Button>
                          
                          {/* Native Share (mobile) */}
                          {typeof navigator !== 'undefined' && navigator.share && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleNativeShare}
                              className="w-full justify-start gap-3 h-10"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <Share2 className="w-4 h-4 text-primary" />
                              </div>
                              <span>More Options</span>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseCertificate;
