import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CERT_TYPES, QUESTION_TYPES, DIFFICULTY_LEVELS, type ExamQuestion } from "@/hooks/useExamQuestionManagement";

const questionFormSchema = z.object({
  cert_type: z.enum(["Foundations", "Performance", "Catcher", "Infield", "Outfield", "Softball Hitting Foundations", "Softball Hitting Performance", "Softball Slap Specialist", "Catcher Specialist", "Infield Specialist", "Outfield Specialist"]),
  question_id: z.string().min(1, "Question ID is required"),
  question: z.string().min(10, "Question must be at least 10 characters"),
  option_a: z.string().min(1, "Option A is required"),
  option_b: z.string().min(1, "Option B is required"),
  option_c: z.string().min(1, "Option C is required"),
  option_d: z.string().min(1, "Option D is required"),
  correct_answer: z.enum(["A", "B", "C", "D"]),
  video_url: z.string().optional(),
  question_type: z.enum(["standard", "scenario", "multi_step", "kpi", "video"]),
  scenario_id: z.string().optional(),
  step_number: z.coerce.number().optional(),
  kpi_category: z.string().optional(),
  difficulty_level: z.enum(["standard", "advanced", "elite"]),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

interface ExamQuestionFormProps {
  question?: ExamQuestion | null;
  onSubmit: (values: QuestionFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ExamQuestionForm = ({ question, onSubmit, onCancel, isSubmitting }: ExamQuestionFormProps) => {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      cert_type: question?.cert_type || "Foundations",
      question_id: question?.question_id || "",
      question: question?.question || "",
      option_a: question?.option_a || "",
      option_b: question?.option_b || "",
      option_c: question?.option_c || "",
      option_d: question?.option_d || "",
      correct_answer: (question?.correct_answer as "A" | "B" | "C" | "D") || "A",
      video_url: question?.video_url || "",
      question_type: (question as any)?.question_type || "standard",
      scenario_id: (question as any)?.scenario_id || "",
      step_number: (question as any)?.step_number || undefined,
      kpi_category: (question as any)?.kpi_category || "",
      difficulty_level: (question as any)?.difficulty_level || "standard",
    },
  });

  const questionType = form.watch("question_type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cert_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certification Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CERT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="question_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question ID</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., FOUND-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="question_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {QUESTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {(questionType === "scenario" || questionType === "multi_step") && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="scenario_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scenario ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., IF-SC1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="step_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Step Number</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {questionType === "kpi" && (
          <FormField
            control={form.control}
            name="kpi_category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KPI Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., transfer_time, route_efficiency" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter the question text" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="option_a"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Option A</FormLabel>
                <FormControl>
                  <Input placeholder="Option A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="option_b"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Option B</FormLabel>
                <FormControl>
                  <Input placeholder="Option B" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="option_c"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Option C</FormLabel>
                <FormControl>
                  <Input placeholder="Option C" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="option_d"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Option D</FormLabel>
                <FormControl>
                  <Input placeholder="Option D" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="video_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL (optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://... or pending-upload://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="correct_answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correct Answer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : question ? "Update Question" : "Add Question"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
