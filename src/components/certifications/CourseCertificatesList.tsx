import { useState } from "react";
import { motion } from "framer-motion";
import { Award, ChevronRight, Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useCourseCertificates, CourseCertificate as CertificateType } from "@/hooks/useCourseCertificates";
import CourseCertificate from "./CourseCertificate";

interface CourseCertificatesListProps {
  userId: string;
}

const CourseCertificatesList = ({ userId }: CourseCertificatesListProps) => {
  const { data: certificates = [], isLoading } = useCourseCertificates(userId);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateType | null>(null);

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            My Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (certificates.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            My Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No certificates yet</p>
            <p className="text-sm mt-1">Complete a course to earn your first certificate!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            My Certificates
            <Badge variant="secondary" className="ml-auto">
              {certificates.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => setSelectedCertificate(cert)}
                className="w-full text-left p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50 group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{cert.course_title}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(cert.completion_date), "MMM d, yyyy")}
                      </span>
                      <span className="font-mono text-xs">{cert.certificate_number}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </button>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Course Certificate
            </DialogTitle>
          </DialogHeader>
          {selectedCertificate && (
            <CourseCertificate certificate={selectedCertificate} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseCertificatesList;
