import { useState } from "react";
import { MoreHorizontal, ShieldCheck, ShieldAlert, ShieldX, Lock, Unlock, Trash2, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { CertificationWithCoach, AdminCertStatus } from "@/hooks/useCertificationManagement";
import { format, differenceInDays } from "date-fns";

interface CertificationsTableProps {
  certifications: CertificationWithCoach[];
  onUpdateStatus: (id: string, status: AdminCertStatus) => void;
  onDelete: (id: string) => void;
}

export const CertificationsTable = ({ certifications, onUpdateStatus, onDelete }: CertificationsTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState<CertificationWithCoach | null>(null);

  const handleDeleteClick = (cert: CertificationWithCoach) => {
    setCertToDelete(cert);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (certToDelete) {
      onDelete(certToDelete.id);
      setDeleteDialogOpen(false);
      setCertToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-600">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case "Expiring":
        return (
          <Badge className="bg-yellow-600">
            <ShieldAlert className="mr-1 h-3 w-3" />
            Expiring
          </Badge>
        );
      case "Expired":
        return (
          <Badge variant="destructive">
            <ShieldX className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        );
      case "Locked":
        return (
          <Badge variant="secondary" className="bg-gray-600 text-white">
            <Lock className="mr-1 h-3 w-3" />
            Locked
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCertTypeBadgeClass = (certType: string) => {
    switch (certType) {
      case "Foundations":
        return "bg-blue-600";
      case "Performance":
        return "bg-purple-600";
      case "Catcher":
        return "bg-orange-600";
      case "Infield":
        return "bg-green-600";
      case "Outfield":
        return "bg-teal-600";
      default:
        return "";
    }
  };

  const getDaysUntilExpiration = (expirationDate: string | null) => {
    if (!expirationDate) return null;
    const days = differenceInDays(new Date(expirationDate), new Date());
    return days;
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coach</TableHead>
              <TableHead>Certification</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No certifications found.
                </TableCell>
              </TableRow>
            ) : (
              certifications.map((cert) => {
                const daysUntilExpiration = getDaysUntilExpiration(cert.expiration_date);
                
                return (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cert.coaches?.name || "Unknown"}</div>
                        <div className="text-sm text-muted-foreground">{cert.coaches?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCertTypeBadgeClass(cert.cert_type)}>
                        {cert.cert_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(cert.status)}</TableCell>
                    <TableCell>
                      {cert.last_score !== null ? (
                        <span className={cert.last_score >= 85 ? "text-green-600 font-medium" : "text-yellow-600"}>
                          {cert.last_score}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cert.issued_date ? format(new Date(cert.issued_date), "MMM d, yyyy") : "—"}
                    </TableCell>
                    <TableCell>
                      {cert.expiration_date ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className={
                            daysUntilExpiration !== null && daysUntilExpiration <= 30 
                              ? daysUntilExpiration <= 0 
                                ? "text-destructive font-medium" 
                                : "text-yellow-600 font-medium"
                              : "text-muted-foreground"
                          }>
                            {format(new Date(cert.expiration_date), "MMM d, yyyy")}
                          </span>
                          {daysUntilExpiration !== null && daysUntilExpiration <= 30 && daysUntilExpiration > 0 && (
                            <span className="text-xs text-yellow-600">({daysUntilExpiration}d left)</span>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {cert.status !== "Active" && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(cert.id, "Active")}>
                              <ShieldCheck className="mr-2 h-4 w-4 text-green-600" />
                              Set Active
                            </DropdownMenuItem>
                          )}
                          {cert.status !== "Locked" && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(cert.id, "Locked")}>
                              <Lock className="mr-2 h-4 w-4" />
                              Lock Access
                            </DropdownMenuItem>
                          )}
                          {cert.status === "Locked" && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(cert.id, "Active")}>
                              <Unlock className="mr-2 h-4 w-4" />
                              Unlock Access
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(cert)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {certToDelete?.cert_type} certification for {certToDelete?.coaches?.name}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
