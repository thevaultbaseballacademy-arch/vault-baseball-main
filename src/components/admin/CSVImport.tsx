import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CERT_TYPES, type CertType, type ExamQuestionInsert } from "@/hooks/useExamQuestionManagement";

interface CSVImportProps {
  onImport: (questions: ExamQuestionInsert[]) => void;
  isImporting?: boolean;
}

interface ParseResult {
  questions: ExamQuestionInsert[];
  errors: string[];
}

export const CSVImport = ({ onImport, isImporting }: CSVImportProps) => {
  const [certType, setCertType] = useState<CertType>("Foundations");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (content: string, selectedCertType: CertType): ParseResult => {
    const lines = content.split("\n").filter(line => line.trim());
    const questions: ExamQuestionInsert[] = [];
    const errors: string[] = [];

    // Skip header row
    const dataLines = lines.slice(1);

    dataLines.forEach((line, index) => {
      const rowNum = index + 2; // Account for header and 0-index
      
      // Handle CSV with potential commas in quoted fields
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      if (values.length < 6) {
        errors.push(`Row ${rowNum}: Not enough columns (expected at least 6)`);
        return;
      }

      const [questionId, question, optionA, optionB, optionC, optionD, correctAnswer] = values;

      if (!questionId || !question) {
        errors.push(`Row ${rowNum}: Missing question ID or question text`);
        return;
      }

      const normalizedAnswer = (correctAnswer || "A").toUpperCase().trim();
      if (!["A", "B", "C", "D"].includes(normalizedAnswer)) {
        errors.push(`Row ${rowNum}: Invalid correct answer "${correctAnswer}" (must be A, B, C, or D)`);
        return;
      }

      questions.push({
        cert_type: selectedCertType,
        question_id: questionId.trim(),
        question: question.trim(),
        option_a: optionA?.trim() || "",
        option_b: optionB?.trim() || "",
        option_c: optionC?.trim() || "",
        option_d: optionD?.trim() || "",
        correct_answer: normalizedAnswer,
      });
    });

    return { questions, errors };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseCSV(content, certType);
      setParseResult(result);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parseResult?.questions.length) {
      onImport(parseResult.questions);
      setParseResult(null);
      setFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Questions from CSV
        </CardTitle>
        <CardDescription>
          Upload a CSV file with columns: question_id, question, option_a, option_b, option_c, option_d, correct_answer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-48">
            <Select value={certType} onValueChange={(v) => setCertType(v as CertType)}>
              <SelectTrigger>
                <SelectValue placeholder="Certification Type" />
              </SelectTrigger>
              <SelectContent>
                {CERT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button variant="outline" onClick={handleBrowse}>
            <FileText className="mr-2 h-4 w-4" />
            Browse CSV
          </Button>

          {fileName && (
            <span className="text-sm text-muted-foreground">
              Selected: {fileName}
            </span>
          )}
        </div>

        {parseResult && (
          <div className="space-y-3">
            {parseResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-1">
                    {parseResult.errors.length} error(s) found:
                  </div>
                  <ul className="list-disc list-inside text-sm max-h-24 overflow-auto">
                    {parseResult.errors.slice(0, 5).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {parseResult.errors.length > 5 && (
                      <li>...and {parseResult.errors.length - 5} more</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {parseResult.questions.length > 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Ready to import {parseResult.questions.length} questions for {certType} certification.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleImport}
              disabled={!parseResult.questions.length || isImporting}
            >
              {isImporting ? "Importing..." : `Import ${parseResult.questions.length} Questions`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
