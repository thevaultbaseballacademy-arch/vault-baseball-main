import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, CheckCircle, Video } from "lucide-react";
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
import type { ExamQuestion } from "@/hooks/useExamQuestionManagement";

interface ExamQuestionsTableProps {
  questions: ExamQuestion[];
  onEdit: (question: ExamQuestion) => void;
  onDelete: (id: string) => void;
}

export const ExamQuestionsTable = ({ questions, onEdit, onDelete }: ExamQuestionsTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<ExamQuestion | null>(null);

  const handleDeleteClick = (question: ExamQuestion) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (questionToDelete) {
      onDelete(questionToDelete.id);
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
    }
  };

  const getCertTypeBadgeClass = (certType: string) => {
    const map: Record<string, string> = {
      "Foundations": "bg-blue-600",
      "Performance": "bg-purple-600",
      "Catcher": "bg-orange-600",
      "Infield": "bg-green-600",
      "Outfield": "bg-teal-600",
      "Softball Hitting Foundations": "bg-pink-600",
      "Softball Hitting Performance": "bg-rose-600",
      "Softball Slap Specialist": "bg-amber-600",
      "Catcher Specialist": "bg-red-600",
      "Infield Specialist": "bg-emerald-600",
      "Outfield Specialist": "bg-cyan-600",
    };
    return map[certType] || "";
  };

  const getQuestionTypeBadge = (type: string) => {
    const map: Record<string, string> = {
      standard: "bg-muted text-muted-foreground",
      scenario: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
      multi_step: "bg-orange-600/20 text-orange-400 border-orange-600/30",
      kpi: "bg-blue-600/20 text-blue-400 border-blue-600/30",
      video: "bg-purple-600/20 text-purple-400 border-purple-600/30",
    };
    return map[type] || "";
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead className="w-[120px]">Cert Type</TableHead>
              <TableHead className="w-[90px]">Q Type</TableHead>
              <TableHead>Question</TableHead>
              <TableHead className="w-[80px]">Answer</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No questions found. Add questions manually or import from CSV.
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-mono text-sm">
                    {question.question_id}
                  </TableCell>
                  <TableCell>
                    <Badge className={getCertTypeBadgeClass(question.cert_type)}>
                      {question.cert_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getQuestionTypeBadge((question as any).question_type || 'standard')}>
                      {((question as any).question_type || 'standard').replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="flex items-start gap-2">
                      {question.video_url && (
                        <Video className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      )}
                      <span title={question.question}>
                        {truncateText(question.question, 80)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                      {question.correct_answer}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(question)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(question)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete question "{questionToDelete?.question_id}"? 
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
