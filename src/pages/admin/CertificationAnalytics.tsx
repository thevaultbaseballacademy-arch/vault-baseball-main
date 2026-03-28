import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminSidebar } from "@/components/admin-analytics/AdminSidebar";
import { KPICards } from "@/components/admin-analytics/KPICards";
import { StatusBreakdownChart } from "@/components/admin-analytics/StatusBreakdownChart";
import { ActionNeededTable } from "@/components/admin-analytics/ActionNeededTable";
import { ExamPerformanceSection } from "@/components/admin-analytics/ExamPerformanceSection";
import { ExamAttemptHistory } from "@/components/admin-analytics/ExamAttemptHistory";
import { AnalyticsFilters } from "@/components/admin-analytics/AnalyticsFilters";
import { useCertificationAnalytics, useExamPerformanceData, AnalyticsFilters as FiltersType } from "@/hooks/useCertificationAnalytics";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CertificationAnalytics = () => {
  const { user, isAdmin, isLoading: authLoading } = useAdminAuth();
  const [filters, setFilters] = useState<FiltersType>({ dateRange: 90 });

  const { data: analyticsData, isLoading: analyticsLoading } = useCertificationAnalytics(filters);
  const { data: examData, isLoading: examLoading } = useExamPerformanceData(filters.dateRange);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  const handleAssignRecert = (coachId: string) => {
    toast.info("Assign recertification - coming soon");
  };

  const handleLockAccess = (coachId: string) => {
    toast.info("Lock access - coming soon");
  };

  const handleViewAttempts = (coachId: string) => {
    toast.info("View attempts - coming soon");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-display tracking-wide mb-2">Certification Analytics</h1>
            <p className="text-muted-foreground">
              Track compliance, reduce risk, and protect VAULT™ system integrity.
            </p>
          </div>

          <AnalyticsFilters filters={filters} onFiltersChange={setFilters} />

          <KPICards
            data={analyticsData?.kpis || { compliancePercent: 0, expiringIn30Days: 0, accessLocked: 0, passRate90Days: 0, avgRiskIndex: 0 }}
            isLoading={analyticsLoading}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatusBreakdownChart
              data={analyticsData?.statusBreakdown || { Active: 0, Expiring: 0, Expired: 0, Locked: 0 }}
              isLoading={analyticsLoading}
            />
            <div className="lg:col-span-2">
              <ActionNeededTable
                coaches={analyticsData?.coachesWithRisk || []}
                isLoading={analyticsLoading}
                onAssignRecert={handleAssignRecert}
                onLockAccess={handleLockAccess}
                onViewAttempts={handleViewAttempts}
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-display mb-4">Exam Analytics</h2>
            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
                <TabsTrigger value="history">Attempt History</TabsTrigger>
              </TabsList>
              <TabsContent value="performance">
                <ExamPerformanceSection data={examData} isLoading={examLoading} />
              </TabsContent>
              <TabsContent value="history">
                <ExamAttemptHistory dateRange={filters.dateRange} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CertificationAnalytics;
