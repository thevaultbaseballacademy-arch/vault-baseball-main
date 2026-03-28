import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExamPerformanceData } from "@/hooks/useCertificationAnalytics";
import { format } from "date-fns";

interface ExamPerformanceSectionProps {
  data: ExamPerformanceData | undefined;
  isLoading: boolean;
}

export const ExamPerformanceSection = ({ data, isLoading }: ExamPerformanceSectionProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="h-[300px] animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-32" />
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No exam performance data available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pass Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pass Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {data.passRateTrend.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.passRateTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value), "MMM d")}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Pass Rate"]}
                    labelFormatter={(label) => format(new Date(label), "MMM d, yyyy")}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="passRate"
                    stroke="hsl(142, 71%, 45%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(142, 71%, 45%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {data.scoreDistribution.every((d) => d.count === 0) ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No score data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    formatter={(value: number) => [value, "Attempts"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hardest Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hardest Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {data.hardestQuestions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No question data available
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question ID</TableHead>
                  <TableHead className="text-right">Total Attempts</TableHead>
                  <TableHead className="text-right">Incorrect</TableHead>
                  <TableHead className="text-right">Incorrect Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.hardestQuestions.map((q) => (
                  <TableRow key={q.questionId}>
                    <TableCell className="font-mono text-sm">{q.questionId}</TableCell>
                    <TableCell className="text-right">{q.totalAttempts}</TableCell>
                    <TableCell className="text-right">{q.incorrectCount}</TableCell>
                    <TableCell className="text-right">
                      <span className={q.incorrectRate > 50 ? "text-destructive font-semibold" : ""}>
                        {q.incorrectRate}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
