import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, Plus, FileQuestion, BookOpen } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useExamQuestionManagement, CERT_TYPES, type CertType, type ExamQuestion } from "@/hooks/useExamQuestionManagement";
import { AdminSidebar } from "@/components/admin-analytics/AdminSidebar";
import { ExamQuestionsTable } from "@/components/admin/ExamQuestionsTable";
import { ExamQuestionForm } from "@/components/admin/ExamQuestionForm";
import { CSVImport } from "@/components/admin/CSVImport";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminExams = () => {
  const { user, isAdmin, isLoading: authLoading } = useAdminAuth();
  const [certTypeFilter, setCertTypeFilter] = useState<CertType | undefined>(undefined);
  const { 
    questions, 
    isLoading, 
    createQuestion, 
    updateQuestion, 
    deleteQuestion,
    importQuestions,
    getQuestionStats 
  } = useExamQuestionManagement(certTypeFilter);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const stats = getQuestionStats();
  const totalQuestions = Object.values(stats).reduce((a, b) => a + b, 0);

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setDialogOpen(true);
  };

  const handleEditQuestion = (question: ExamQuestion) => {
    setEditingQuestion(question);
    setDialogOpen(true);
  };

  const handleFormSubmit = (values: any) => {
    if (editingQuestion) {
      updateQuestion.mutate(
        { id: editingQuestion.id, ...values },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createQuestion.mutate(values, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDeleteQuestion = (id: string) => {
    deleteQuestion.mutate(id);
  };

  const handleImport = (questions: any[]) => {
    importQuestions.mutate(questions);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display">Exam Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage question banks and exam configuration
              </p>
            </div>
            <Button onClick={handleAddQuestion}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalQuestions}</div>
              </CardContent>
            </Card>
            {CERT_TYPES.map((type) => (
              <Card key={type}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{type}</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats[type] || 0}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="questions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="questions">Question Bank</TabsTrigger>
              <TabsTrigger value="import">CSV Import</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Question Bank</CardTitle>
                      <CardDescription>
                        View and manage all exam questions
                      </CardDescription>
                    </div>
                    <Select 
                      value={certTypeFilter || "all"} 
                      onValueChange={(v) => setCertTypeFilter(v === "all" ? undefined : v as CertType)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {CERT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ExamQuestionsTable
                      questions={questions || []}
                      onEdit={handleEditQuestion}
                      onDelete={handleDeleteQuestion}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="import">
              <CSVImport 
                onImport={handleImport} 
                isImporting={importQuestions.isPending} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
            <DialogDescription>
              {editingQuestion
                ? "Update the question details below."
                : "Enter the details for the new exam question."}
            </DialogDescription>
          </DialogHeader>
          <ExamQuestionForm
            question={editingQuestion}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={createQuestion.isPending || updateQuestion.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExams;
