import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  FileQuestion, Plus, Trash2, Upload, Download, Search,
  ChevronDown, ChevronRight, Edit2, Save, X, Check, AlertCircle,
  FileSpreadsheet, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CertificationType } from "@/lib/certificationPricing";
import { getCertificationDisplayName } from "@/lib/certificationPricing";

interface Question {
  id: string;
  certification_type: CertificationType;
  section: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation: string | null;
  is_scenario: boolean;
  display_order: number;
  is_active: boolean;
}

const CERT_TYPES: CertificationType[] = ['foundations', 'performance', 'catcher_specialist', 'infield_specialist', 'outfield_specialist'];

const CertificationQuestionManager = () => {
  const [selectedCertType, setSelectedCertType] = useState<CertificationType>('foundations');
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<Omit<Question, 'id'>[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  
  const queryClient = useQueryClient();

  // Fetch questions
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['admin-cert-questions', selectedCertType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certification_questions')
        .select('*')
        .eq('certification_type', selectedCertType as any)
        .order('section')
        .order('display_order');

      if (error) throw error;
      return (data || []).map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      })) as Question[];
    },
  });

  // Group questions by section
  const sections = useMemo(() => {
    const filtered = questions.filter(q => 
      q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.section.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const sectionMap = new Map<string, Question[]>();
    filtered.forEach(q => {
      const existing = sectionMap.get(q.section) || [];
      sectionMap.set(q.section, [...existing, q]);
    });
    return Array.from(sectionMap.entries());
  }, [questions, searchQuery]);

  // Save question mutation
  const saveQuestionMutation = useMutation({
    mutationFn: async (question: Partial<Question> & { id?: string }) => {
      const { id, ...data } = question;
      
      if (id) {
        const { error } = await supabase
          .from('certification_questions')
          .update({
            certification_type: data.certification_type as any,
            section: data.section,
            question_text: data.question_text,
            options: JSON.stringify(data.options),
            correct_answer_index: data.correct_answer_index,
            explanation: data.explanation,
            is_scenario: data.is_scenario,
            display_order: data.display_order,
            is_active: data.is_active,
          } as any)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('certification_questions')
          .insert({
            certification_type: data.certification_type!,
            section: data.section!,
            question_text: data.question_text!,
            options: JSON.stringify(data.options),
            correct_answer_index: data.correct_answer_index!,
            explanation: data.explanation,
            is_scenario: data.is_scenario,
            display_order: data.display_order,
            is_active: data.is_active,
          } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cert-questions'] });
      setEditingQuestion(null);
      setIsAddingNew(false);
      toast.success('Question saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save question');
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('certification_questions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cert-questions'] });
      toast.success('Question deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete question');
    },
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (questions: Omit<Question, 'id'>[]) => {
      const payload = questions.map(q => ({
        certification_type: q.certification_type,
        section: q.section,
        question_text: q.question_text,
        options: JSON.stringify(q.options),
        correct_answer_index: q.correct_answer_index,
        explanation: q.explanation,
        is_scenario: q.is_scenario,
        display_order: q.display_order,
        is_active: q.is_active,
      }));
      
      const { data, error } = await supabase
        .from('certification_questions')
        .insert(payload as any)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-cert-questions'] });
      setBulkImportOpen(false);
      setBulkImportText("");
      setParsedQuestions([]);
      toast.success(`Imported ${data.length} questions`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to import questions');
    },
  });

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const parseBulkImport = (text: string) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const questions: Omit<Question, 'id'>[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      try {
        // Expected format: section\tquestion\toption1|option2|option3|option4\tcorrect_index\texplanation\tis_scenario
        const parts = line.split('\t');
        
        if (parts.length < 4) {
          errors.push(`Line ${index + 1}: Expected at least 4 columns (section, question, options, correct_index)`);
          return;
        }

        const section = parts[0].trim();
        const questionText = parts[1].trim();
        const optionsStr = parts[2].trim();
        const correctIndex = parseInt(parts[3].trim());
        const explanation = parts[4]?.trim() || null;
        const isScenario = parts[5]?.trim().toLowerCase() === 'true';

        if (!section || !questionText || !optionsStr) {
          errors.push(`Line ${index + 1}: Missing required fields`);
          return;
        }

        const options = optionsStr.split('|').map(o => o.trim());
        if (options.length < 2) {
          errors.push(`Line ${index + 1}: At least 2 options required (use | to separate)`);
          return;
        }

        if (isNaN(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
          errors.push(`Line ${index + 1}: Invalid correct answer index`);
          return;
        }

        questions.push({
          certification_type: selectedCertType,
          section,
          question_text: questionText,
          options,
          correct_answer_index: correctIndex,
          explanation,
          is_scenario: isScenario,
          display_order: questions.length + 1,
          is_active: true,
        });
      } catch (e) {
        errors.push(`Line ${index + 1}: Parse error`);
      }
    });

    setParsedQuestions(questions);
    setParseErrors(errors);
  };

  const exportToCsv = () => {
    if (questions.length === 0) {
      toast.error("No questions to export");
      return;
    }

    const headers = ["section", "question_text", "options", "correct_answer_index", "explanation", "is_scenario"];
    const csvContent = [
      headers.join("\t"),
      ...questions.map(q => [
        q.section,
        `"${q.question_text.replace(/"/g, '""')}"`,
        q.options.join('|'),
        q.correct_answer_index,
        q.explanation || '',
        q.is_scenario
      ].join("\t"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/tab-separated-values;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `certification-questions-${selectedCertType}.tsv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${questions.length} question(s)`);
  };

  const generateTemplate = () => {
    return `Section Name\tQuestion text here?\tOption A|Option B|Option C|Option D\t0\tExplanation text\tfalse`;
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(generateTemplate());
    toast.success("Template copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-primary" />
            Certification Questions
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage exam questions for coach certifications
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCsv} disabled={questions.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Dialog open={bulkImportOpen} onOpenChange={setBulkImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Bulk Import Questions
                </DialogTitle>
                <DialogDescription>
                  Paste tab-separated data with columns: section, question, options (pipe-separated), correct_index, explanation, is_scenario
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Import for: {getCertificationDisplayName(selectedCertType)}</p>
                    <Button variant="ghost" size="sm" onClick={copyTemplate} className="gap-1 h-7">
                      <Copy className="w-3 h-3" />
                      Copy Template
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Paste your data:</label>
                  <Textarea
                    placeholder={`Section\tQuestion?\tOption A|Option B|Option C|Option D\t1\tExplanation\tfalse`}
                    value={bulkImportText}
                    onChange={(e) => {
                      setBulkImportText(e.target.value);
                      parseBulkImport(e.target.value);
                    }}
                    className="font-mono text-sm min-h-[200px]"
                  />
                </div>

                {parseErrors.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-destructive flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      {parseErrors.length} parsing error(s)
                    </p>
                    <ul className="text-xs text-destructive space-y-1 max-h-24 overflow-y-auto">
                      {parseErrors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {parsedQuestions.length > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {parsedQuestions.length} valid questions ready to import
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setBulkImportOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => bulkImportMutation.mutate(parsedQuestions)} 
                  disabled={parsedQuestions.length === 0 || bulkImportMutation.isPending}
                >
                  {bulkImportMutation.isPending ? "Importing..." : `Import ${parsedQuestions.length} Questions`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={() => setIsAddingNew(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Certification type selector */}
      <div className="flex gap-2 flex-wrap">
        {CERT_TYPES.map(type => (
          <Button
            key={type}
            variant={selectedCertType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCertType(type)}
          >
            {getCertificationDisplayName(type)}
            <Badge variant="secondary" className="ml-2">
              {questions.filter(q => q.certification_type === type).length || 0}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Add new question form */}
      {isAddingNew && (
        <QuestionEditor
          question={{
            certification_type: selectedCertType,
            section: '',
            question_text: '',
            options: ['', '', '', ''],
            correct_answer_index: 0,
            explanation: '',
            is_scenario: false,
            display_order: questions.length + 1,
            is_active: true,
          }}
          onSave={(q) => saveQuestionMutation.mutate(q)}
          onCancel={() => setIsAddingNew(false)}
          isSaving={saveQuestionMutation.isPending}
        />
      )}

      {/* Questions by section */}
      <div className="space-y-4">
        {sections.map(([section, sectionQuestions]) => (
          <Collapsible
            key={section}
            open={expandedSections.has(section)}
            onOpenChange={() => toggleSection(section)}
          >
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {expandedSections.has(section) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <CardTitle className="text-base">{section}</CardTitle>
                  </div>
                  <Badge variant="secondary">{sectionQuestions.length} questions</Badge>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-3">
                  {sectionQuestions.map((question) => (
                    editingQuestion?.id === question.id ? (
                      <QuestionEditor
                        key={question.id}
                        question={editingQuestion}
                        onSave={(q) => saveQuestionMutation.mutate({ ...q, id: question.id })}
                        onCancel={() => setEditingQuestion(null)}
                        isSaving={saveQuestionMutation.isPending}
                      />
                    ) : (
                      <QuestionRow
                        key={question.id}
                        question={question}
                        onEdit={() => setEditingQuestion(question)}
                        onDelete={() => deleteQuestionMutation.mutate(question.id)}
                        isDeleting={deleteQuestionMutation.isPending}
                      />
                    )
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}

        {sections.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No questions found for this certification</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsAddingNew(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Question
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Question row component
const QuestionRow = ({ 
  question, 
  onEdit, 
  onDelete, 
  isDeleting 
}: { 
  question: Question; 
  onEdit: () => void; 
  onDelete: () => void;
  isDeleting: boolean;
}) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium line-clamp-2">{question.question_text}</p>
      <div className="flex items-center gap-2 mt-1">
        {question.is_scenario && <Badge variant="outline" className="text-xs">Scenario</Badge>}
        {!question.is_active && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
        <span className="text-xs text-muted-foreground">
          {question.options.length} options • Answer: {String.fromCharCode(65 + question.correct_answer_index)}
        </span>
      </div>
    </div>
    <div className="flex gap-1">
      <Button size="sm" variant="ghost" onClick={onEdit}>
        <Edit2 className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onDelete} disabled={isDeleting}>
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  </div>
);

// Question editor component
const QuestionEditor = ({
  question,
  onSave,
  onCancel,
  isSaving,
}: {
  question: Omit<Question, 'id'> & { id?: string };
  onSave: (question: Omit<Question, 'id'>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) => {
  const [formData, setFormData] = useState(question);

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ 
      ...formData, 
      options: newOptions,
      correct_answer_index: Math.min(formData.correct_answer_index, newOptions.length - 1)
    });
  };

  return (
    <Card className="border-primary">
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Section</Label>
            <Input
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              placeholder="e.g., VAULT™ Philosophy"
            />
          </div>
          <div>
            <Label>Display Order</Label>
            <Input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <Label>Question</Label>
          <Textarea
            value={formData.question_text}
            onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
            placeholder="Enter the question..."
            rows={2}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Options</Label>
            <Button variant="ghost" size="sm" onClick={addOption}>
              <Plus className="w-3 h-3 mr-1" />
              Add Option
            </Button>
          </div>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  formData.correct_answer_index === index 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, correct_answer_index: index })}
                  className={formData.correct_answer_index === index ? 'text-green-600' : ''}
                >
                  <Check className="w-4 h-4" />
                </Button>
                {formData.options.length > 2 && (
                  <Button variant="ghost" size="sm" onClick={() => removeOption(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Explanation (shown after answering)</Label>
          <Textarea
            value={formData.explanation || ''}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            placeholder="Explain why this answer is correct..."
            rows={2}
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_scenario}
              onCheckedChange={(checked) => setFormData({ ...formData, is_scenario: checked })}
            />
            <Label>Scenario-Based Question</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label>Active</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave(formData)} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Question'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificationQuestionManager;
