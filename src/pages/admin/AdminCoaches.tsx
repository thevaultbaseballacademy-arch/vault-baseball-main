import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, Plus, Users, Shield, BarChart3 } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useCoachManagement, type Coach } from "@/hooks/useCoachManagement";
import { AdminSidebar } from "@/components/admin-analytics/AdminSidebar";
import { CoachesTable } from "@/components/admin/CoachesTable";
import { CoachForm } from "@/components/admin/CoachForm";
import CoachApprovalPanel from "@/components/admin/CoachApprovalPanel";
import CoachPerformancePanel from "@/components/admin/CoachPerformancePanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminCoaches = () => {
  const { user, isAdmin, isLoading: authLoading } = useAdminAuth();
  const { coaches, isLoading, createCoach, updateCoach, toggleCoachStatus, deleteCoach } = useCoachManagement();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleAddCoach = () => {
    setEditingCoach(null);
    setDialogOpen(true);
  };

  const handleEditCoach = (coach: Coach) => {
    setEditingCoach(coach);
    setDialogOpen(true);
  };

  const handleFormSubmit = (values: any) => {
    if (editingCoach) {
      updateCoach.mutate(
        { id: editingCoach.id, ...values },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createCoach.mutate(values, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    toggleCoachStatus.mutate({ id, currentStatus });
  };

  const handleDeleteCoach = (id: string) => {
    deleteCoach.mutate(id);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display">COACHES</h1>
              <p className="text-muted-foreground mt-1">
                Manage coach applications, approvals, and performance
              </p>
            </div>
            <Button onClick={handleAddCoach}>
              <Plus className="mr-2 h-4 w-4" />
              Add Coach
            </Button>
          </div>

          <Tabs defaultValue="applications" className="space-y-6">
            <TabsList>
              <TabsTrigger value="applications" className="gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Applications
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-1.5">
                <Users className="w-3.5 h-3.5" />
                All Coaches
              </TabsTrigger>
              <TabsTrigger value="performance" className="gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Performance
              </TabsTrigger>
            </TabsList>

            {/* Applications Tab — uses CoachApprovalPanel */}
            <TabsContent value="applications">
              <CoachApprovalPanel />
            </TabsContent>

            {/* All Coaches Tab */}
            <TabsContent value="all" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Coaches</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{coaches?.length || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active</CardTitle>
                    <Users className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {coaches?.filter((c) => c.status === "Active").length || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                    <Users className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">
                      {coaches?.filter((c) => c.status === "Suspended").length || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Coaches</CardTitle>
                  <CardDescription>
                    View and manage all coaches in your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <CoachesTable
                      coaches={coaches || []}
                      onEdit={handleEditCoach}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDeleteCoach}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance">
              <CoachPerformancePanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCoach ? "Edit Coach" : "Add New Coach"}</DialogTitle>
            <DialogDescription>
              {editingCoach
                ? "Update the coach's information below."
                : "Enter the details for the new coach."}
            </DialogDescription>
          </DialogHeader>
          <CoachForm
            coach={editingCoach}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={createCoach.isPending || updateCoach.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoaches;
