import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { getCertificationDisplayName, type CertificationType } from "@/lib/certificationPricing";
import { format } from "date-fns";
import vaultLogo from "@/assets/vault-logo-new.webp";

// Helper function to load image as base64
const loadImageAsBase64 = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } else {
        reject(new Error("Could not get canvas context"));
      }
    };
    img.onerror = reject;
    img.src = src;
  });
};

interface CertificateGeneratorProps {
  coachName: string;
  certificationType: CertificationType;
  certificateNumber: string;
  score: number;
  issuedAt: string;
  expiresAt: string;
}

export const CertificateGenerator = ({
  coachName,
  certificationType,
  certificateNumber,
  score,
  issuedAt,
  expiresAt,
}: CertificateGeneratorProps) => {
  const [generating, setGenerating] = useState(false);

  const generateCertificate = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Background - dark gradient effect with subtle pattern
      doc.setFillColor(17, 24, 39); // Dark slate
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Inner border
      doc.setDrawColor(212, 175, 55); // Gold
      doc.setLineWidth(2);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      // Double border effect
      doc.setLineWidth(0.5);
      doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

      // Corner decorations
      const cornerSize = 15;
      doc.setLineWidth(1);
      
      // Top left
      doc.line(10, 25, 25, 25);
      doc.line(25, 10, 25, 25);
      
      // Top right
      doc.line(pageWidth - 10, 25, pageWidth - 25, 25);
      doc.line(pageWidth - 25, 10, pageWidth - 25, 25);
      
      // Bottom left
      doc.line(10, pageHeight - 25, 25, pageHeight - 25);
      doc.line(25, pageHeight - 10, 25, pageHeight - 25);
      
      // Bottom right
      doc.line(pageWidth - 10, pageHeight - 25, pageWidth - 25, pageHeight - 25);
      doc.line(pageWidth - 25, pageHeight - 10, pageWidth - 25, pageHeight - 25);

      // Add VAULT Logo watermark in center (semi-transparent effect)
      try {
        const logoBase64 = await loadImageAsBase64(vaultLogo);
        // Center watermark - semi-transparent effect achieved by using it with low opacity background
        const logoWidth = 60;
        const logoHeight = 60;
        doc.addImage(logoBase64, 'PNG', pageWidth / 2 - logoWidth / 2, 30, logoWidth, logoHeight);
      } catch (logoError) {
        console.log('Could not add logo to PDF:', logoError);
      }

      // VAULT Logo/Brand text (moved down to accommodate logo)
      doc.setTextColor(212, 175, 55);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("THE VAULT", pageWidth / 2, 100, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("BASEBALL ACADEMY", pageWidth / 2, 106, { align: "center" });

      // Decorative line
      doc.setLineWidth(0.5);
      doc.line(pageWidth / 2 - 40, 112, pageWidth / 2 + 40, 112);

      // Certificate Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFICATE", pageWidth / 2, 125, { align: "center" });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(180, 180, 180);
      doc.text("OF ACHIEVEMENT", pageWidth / 2, 132, { align: "center" });

      // Presented to text
      doc.setFontSize(11);
      doc.setTextColor(180, 180, 180);
      doc.text("This is to certify that", pageWidth / 2, 145, { align: "center" });

      // Coach Name
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(212, 175, 55);
      doc.text(coachName.toUpperCase(), pageWidth / 2, 158, { align: "center" });

      // Underline for name
      const nameWidth = doc.getTextWidth(coachName.toUpperCase());
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.5);
      doc.line(pageWidth / 2 - nameWidth / 2 - 10, 162, pageWidth / 2 + nameWidth / 2 + 10, 162);

      // Achievement text
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 255, 255);
      doc.text("has successfully completed the", pageWidth / 2, 172, { align: "center" });

      // Certification Name
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      const certName = getCertificationDisplayName(certificationType);
      doc.text(certName.toUpperCase(), pageWidth / 2, 182, { align: "center" });

      // Score badge
      doc.setFontSize(10);
      doc.setTextColor(180, 180, 180);
      doc.text(`Achieved Score: ${score}%`, pageWidth / 2, 192, { align: "center" });

      // Dates section (adjusted to bottom)
      const dateY = pageHeight - 40;
      doc.setFontSize(9);
      doc.setTextColor(180, 180, 180);
      
      // Issue date
      doc.text("DATE ISSUED", pageWidth / 2 - 50, dateY, { align: "center" });
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(format(new Date(issuedAt), "MMMM d, yyyy"), pageWidth / 2 - 50, dateY + 5, { align: "center" });

      // Expiration date
      doc.setFont("helvetica", "normal");
      doc.setTextColor(180, 180, 180);
      doc.text("VALID UNTIL", pageWidth / 2 + 50, dateY, { align: "center" });
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(format(new Date(expiresAt), "MMMM d, yyyy"), pageWidth / 2 + 50, dateY + 5, { align: "center" });

      // Signature line
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.3);
      doc.line(pageWidth / 2 - 40, 185, pageWidth / 2 + 40, 185);
      
      doc.setFontSize(9);
      doc.setTextColor(180, 180, 180);
      doc.setFont("helvetica", "normal");
      doc.text("VAULT Baseball Academy", pageWidth / 2, 191, { align: "center" });

      // Certificate ID (bottom)
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Certificate ID: ${certificateNumber}`, pageWidth / 2, pageHeight - 18, { align: "center" });
      
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.text("Verify at: vaultbaseball.com/verify", pageWidth / 2, pageHeight - 13, { align: "center" });

      // Save
      const fileName = `VAULT_${certificationType}_Certificate_${coachName.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generateCertificate}
      disabled={generating}
      className="gap-2"
    >
      {generating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      Download Certificate
    </Button>
  );
};

export default CertificateGenerator;
