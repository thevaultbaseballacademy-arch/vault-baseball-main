import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, Search, Filter } from "lucide-react";

interface ExamAttempt {
  id: string;
  coach_id: string;
  coach_name: string;
  cert_type: string;
  score: number;
  pass_fail: boolean;
  duration_seconds: number | null;
  created_at: string;
}

interface ExamAttemptHistoryProps {
  dateRange: number;
  coachId?: string;
}

export const ExamAttemptHistory = ({ dateRange, coachId }: ExamAttemptHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [certTypeFilter, setCertTypeFilter] = useState<string>("all");
  const [resultFilter, setResultFilter] = useState<string>("all");

  const { data: attempts, isLoading } = useQuery({
    queryKey: ["exam-attempt-history", dateRange, coachId],
    queryFn: async () => {
      const dateRangeStart = new Date();
      dateRangeStart.setDate(dateRangeStart.getDate() - dateRange);

      let query = supabase
        .from("admin_exam_attempts")
        .select(`
          id,
          coach_id,
          cert_type,
          score,
          pass_fail,
          duration_seconds,
          created_at,
          coaches!inner(name)
        `)
        .gte("created_at", dateRangeStart.toISOString())
        .order("created_at", { ascending: false });

      if (coachId) {
        query = query.eq("coach_id", coachId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((attempt: any) => ({
        id: attempt.id,
        coach_id: attempt.coach_id,
        coach_name: attempt.coaches?.name || "Unknown",
        cert_type: attempt.cert_type,
        score: attempt.score,
        pass_fail: attempt.pass_fail,
        duration_seconds: attempt.duration_seconds,
        created_at: attempt.created_at,
      })) as ExamAttempt[];
    },
  });

  const filteredAttempts = attempts?.filter((attempt) => {
    const matchesSearch = attempt.coach_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCertType = certTypeFilter === "all" || attempt.cert_type === certTypeFilter;
    const matchesResult = resultFilter === "all" || 
      (resultFilter === "passed" && attempt.pass_fail) ||
      (resultFilter === "failed" && !attempt.pass_fail);
    return matchesSearch && matchesCertType && matchesResult;
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exam Attempt History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Exam Attempt History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by coach name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={certTypeFilter} onValueChange={setCertTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Cert Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Foundations">Foundations</SelectItem>
                <SelectItem value="Performance">Performance</SelectItem>
                <SelectItem value="Catcher">Catcher</SelectItem>
                <SelectItem value="Infield">Infield</SelectItem>
                <SelectItem value="Outfield">Outfield</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-display">{filteredAttempts?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total Attempts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display text-green-600">
              {filteredAttempts?.filter(a => a.pass_fail).length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Passed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display text-red-600">
              {filteredAttempts?.filter(a => !a.pass_fail).length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display">
              {filteredAttempts && filteredAttempts.length > 0
                ? Math.round(filteredAttempts.reduce((acc, a) => acc + a.score, 0) / filteredAttempts.length)
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coach</TableHead>
                <TableHead>Certification</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Result</TableHead>
                <TableHead className="text-center">Duration</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttempts && filteredAttempts.length > 0 ? (
                filteredAttempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-medium">{attempt.coach_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{attempt.cert_type}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={attempt.score >= 85 ? "text-green-600" : "text-red-600"}>
                        {attempt.score}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {attempt.pass_fail ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Pass
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Fail
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {formatDuration(attempt.duration_seconds)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(attempt.created_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No exam attempts found for the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
