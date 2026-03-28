import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, ShieldCheck, ShieldAlert, ShieldX, Lock, Award } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { 
  useCertificationManagement, 
  ADMIN_CERT_TYPES, 
  ADMIN_CERT_STATUSES,
  type AdminCertType,
  type AdminCertStatus 
} from "@/hooks/useCertificationManagement";
import { AdminSidebar } from "@/components/admin-analytics/AdminSidebar";
import { CertificationsTable } from "@/components/admin/CertificationsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminCertifications = () => {
  const { user, isAdmin, isLoading: authLoading } = useAdminAuth();
  const [certTypeFilter, setCertTypeFilter] = useState<AdminCertType | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<AdminCertStatus | undefined>(undefined);
  
  const { 
    certifications, 
    isLoading, 
    updateStatus,
    deleteCertification,
    getStatusCounts 
  } = useCertificationManagement({ certType: certTypeFilter, status: statusFilter });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const statusCounts = getStatusCounts();
  const totalCerts = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const handleUpdateStatus = (id: string, status: AdminCertStatus) => {
    updateStatus.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    deleteCertification.mutate(id);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-display">Certifications</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage coach certifications and compliance status
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCerts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <ShieldCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{statusCounts.Active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring</CardTitle>
                <ShieldAlert className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{statusCounts.Expiring}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expired</CardTitle>
                <ShieldX className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{statusCounts.Expired}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Locked</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statusCounts.Locked}</div>
              </CardContent>
            </Card>
          </div>

          {/* Certifications Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Certifications</CardTitle>
                  <CardDescription>
                    View and manage coach certifications by type and status
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Select 
                    value={certTypeFilter || "all"} 
                    onValueChange={(v) => setCertTypeFilter(v === "all" ? undefined : v as AdminCertType)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Cert Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {ADMIN_CERT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={statusFilter || "all"} 
                    onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v as AdminCertStatus)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {ADMIN_CERT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <CertificationsTable
                  certifications={certifications || []}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDelete}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminCertifications;
