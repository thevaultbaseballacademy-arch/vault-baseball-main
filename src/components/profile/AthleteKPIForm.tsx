import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Gauge, 
  Plus, 
  Loader2, 
  Trash2, 
  Zap, 
  Ruler, 
  Dumbbell,
  TrendingUp,
  Calendar,
  Target,
  Trophy,
  CheckCircle2,
  Clock,
  LineChart,
  X,
  MessageSquare,
  Send,
  User,
  Download,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import jsPDF from "jspdf";

interface AthleteKPI {
  id: string;
  user_id: string;
  kpi_category: 'performance' | 'physical' | 'training';
  kpi_name: string;
  kpi_value: number;
  kpi_unit: string | null;
  recorded_at: string;
  notes: string | null;
  created_at: string;
}

interface AthleteKPIGoal {
  id: string;
  user_id: string;
  kpi_category: string;
  kpi_name: string;
  target_value: number;
  kpi_unit: string | null;
  target_date: string | null;
  notes: string | null;
  is_achieved: boolean;
  achieved_at: string | null;
  created_at: string;
}

interface CoachKPIComment {
  id: string;
  coach_user_id: string;
  athlete_user_id: string;
  kpi_category: string;
  kpi_name: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

interface AthleteKPIFormProps {
  userId: string;
  isOwnProfile: boolean;
  currentUserId?: string;
}

const kpiCategories = [
  { value: "performance", label: "Performance Metrics", icon: Zap, color: "text-amber-500" },
  { value: "physical", label: "Physical Measurements", icon: Ruler, color: "text-blue-500" },
  { value: "training", label: "Training Progress", icon: Dumbbell, color: "text-green-500" },
];

const performanceKPIs = [
  { name: "Fastball Velocity", unit: "mph", direction: "higher" },
  { name: "Exit Velocity", unit: "mph", direction: "higher" },
  { name: "Sprint Speed", unit: "mph", direction: "higher" },
  { name: "60-Yard Dash", unit: "sec", direction: "lower" },
  { name: "Throwing Velocity", unit: "mph", direction: "higher" },
  { name: "Pop Time", unit: "sec", direction: "lower" },
  { name: "Bat Speed", unit: "mph", direction: "higher" },
  { name: "Spin Rate", unit: "rpm", direction: "higher" },
  { name: "Launch Angle", unit: "°", direction: "higher" },
  { name: "Home to First", unit: "sec", direction: "lower" },
];

const physicalKPIs = [
  { name: "Height", unit: "in", direction: "higher" },
  { name: "Weight", unit: "lbs", direction: "neutral" },
  { name: "Body Fat", unit: "%", direction: "lower" },
  { name: "Wingspan", unit: "in", direction: "higher" },
  { name: "Vertical Jump", unit: "in", direction: "higher" },
  { name: "Broad Jump", unit: "in", direction: "higher" },
  { name: "Grip Strength (L)", unit: "lbs", direction: "higher" },
  { name: "Grip Strength (R)", unit: "lbs", direction: "higher" },
  { name: "Flexibility Score", unit: "", direction: "higher" },
];

const trainingKPIs = [
  { name: "Weekly Workouts", unit: "sessions", direction: "higher" },
  { name: "Training Hours", unit: "hrs", direction: "higher" },
  { name: "Squat Max", unit: "lbs", direction: "higher" },
  { name: "Bench Press Max", unit: "lbs", direction: "higher" },
  { name: "Deadlift Max", unit: "lbs", direction: "higher" },
  { name: "Pull-ups", unit: "reps", direction: "higher" },
  { name: "Plyo Throws", unit: "throws", direction: "higher" },
  { name: "Long Toss Max", unit: "ft", direction: "higher" },
  { name: "Bullpen Count", unit: "pitches", direction: "higher" },
  { name: "BP Swings", unit: "swings", direction: "higher" },
];

const getKPIOptions = (category: string) => {
  switch (category) {
    case "performance": return performanceKPIs;
    case "physical": return physicalKPIs;
    case "training": return trainingKPIs;
    default: return [];
  }
};

const getKPIDirection = (category: string, name: string): string => {
  const options = getKPIOptions(category);
  const found = options.find(k => k.name === name);
  return found?.direction || "higher";
};

const AthleteKPIForm = ({ userId, isOwnProfile, currentUserId }: AthleteKPIFormProps) => {
  const [addOpen, setAddOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [selectedKPIForChart, setSelectedKPIForChart] = useState<{ category: string; name: string; unit: string | null } | null>(null);
  const [category, setCategory] = useState<string>("");
  const [kpiName, setKpiName] = useState("");
  const [kpiValue, setKpiValue] = useState("");
  const [kpiUnit, setKpiUnit] = useState("");
  const [recordedAt, setRecordedAt] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [goalNotes, setGoalNotes] = useState("");
  const [activeTab, setActiveTab] = useState("performance");
  const [newComment, setNewComment] = useState("");
  const [commentCategory, setCommentCategory] = useState("");
  const [commentKpiName, setCommentKpiName] = useState("");
  const queryClient = useQueryClient();

  // Check if current user is a coach for this athlete
  const { data: isCoachForAthlete = false } = useQuery({
    queryKey: ['is-coach-for-athlete', currentUserId, userId],
    queryFn: async () => {
      if (!currentUserId || currentUserId === userId) return false;
      const { data, error } = await supabase
        .from('coach_athlete_assignments')
        .select('id')
        .eq('coach_user_id', currentUserId)
        .eq('athlete_user_id', userId)
        .eq('is_active', true)
        .eq('athlete_approved', true)
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
    enabled: !!currentUserId && currentUserId !== userId
  });

  const { data: kpis = [], isLoading } = useQuery({
    queryKey: ['athlete-kpis', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('athlete_kpis')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });
      if (error) throw error;
      return data as AthleteKPI[];
    }
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['athlete-kpi-goals', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('athlete_kpi_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AthleteKPIGoal[];
    }
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['coach-kpi-comments', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coach_kpi_comments')
        .select('*')
        .eq('athlete_user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CoachKPIComment[];
    }
  });

  const { data: coachProfiles = {} } = useQuery({
    queryKey: ['coach-profiles', comments.map(c => c.coach_user_id)],
    queryFn: async () => {
      const coachIds = [...new Set(comments.map(c => c.coach_user_id))];
      if (coachIds.length === 0) return {};
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', coachIds);
      if (error) return {};
      return data.reduce((acc, p) => ({ ...acc, [p.user_id]: p }), {} as Record<string, { display_name: string | null; avatar_url: string | null }>);
    },
    enabled: comments.length > 0
  });

  const addKPI = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('athlete_kpis')
        .insert({
          user_id: userId,
          kpi_category: category,
          kpi_name: kpiName,
          kpi_value: parseFloat(kpiValue),
          kpi_unit: kpiUnit || null,
          recorded_at: recordedAt,
          notes: notes || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-kpis', userId] });
      checkGoalAchievement();
      toast.success("KPI recorded!");
      resetForm();
    },
    onError: () => toast.error("Failed to add KPI"),
  });

  const addGoal = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('athlete_kpi_goals')
        .upsert({
          user_id: userId,
          kpi_category: category,
          kpi_name: kpiName,
          target_value: parseFloat(targetValue),
          kpi_unit: kpiUnit || null,
          target_date: targetDate || null,
          notes: goalNotes || null,
        }, {
          onConflict: 'user_id,kpi_category,kpi_name'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-kpi-goals', userId] });
      toast.success("Goal set!");
      resetGoalForm();
    },
    onError: () => toast.error("Failed to set goal"),
  });

  const deleteKPI = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('athlete_kpis').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-kpis', userId] });
      toast.success("KPI removed");
    },
    onError: () => toast.error("Failed to remove KPI"),
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('athlete_kpi_goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-kpi-goals', userId] });
      toast.success("Goal removed");
    },
    onError: () => toast.error("Failed to remove goal"),
  });

  const markGoalAchieved = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('athlete_kpi_goals')
        .update({ is_achieved: true, achieved_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athlete-kpi-goals', userId] });
      toast.success("🎉 Goal achieved!");
    },
    onError: () => toast.error("Failed to update goal"),
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from('coach_kpi_comments')
        .insert({
          coach_user_id: currentUserId,
          athlete_user_id: userId,
          kpi_category: commentCategory,
          kpi_name: commentKpiName,
          comment: newComment,
        });
      if (error) throw error;

      // Create notification for the athlete
      if (userId !== currentUserId) {
        // Get coach name for the notification
        const { data: coachProfile } = await supabase
          .rpc('get_public_profile', { target_user_id: currentUserId });
        
        const coachName = (coachProfile as Array<{ display_name: string }> | null)?.[0]?.display_name || 'Your coach';
        
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'coach_feedback',
          title: 'New Coach Feedback',
          message: `${coachName} commented on your ${commentKpiName} (${commentCategory}): "${newComment.slice(0, 100)}${newComment.length > 100 ? '...' : ''}"`,
          actor_id: currentUserId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-kpi-comments', userId] });
      toast.success("Comment added!");
      setNewComment("");
      setCommentCategory("");
      setCommentKpiName("");
    },
    onError: () => toast.error("Failed to add comment"),
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coach_kpi_comments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-kpi-comments', userId] });
      toast.success("Comment removed");
    },
    onError: () => toast.error("Failed to remove comment"),
  });

  const checkGoalAchievement = async () => {
    // Check if any goals should be marked as achieved based on new KPI
    const relevantGoal = goals.find(g => 
      g.kpi_category === category && 
      g.kpi_name === kpiName && 
      !g.is_achieved
    );
    
    if (relevantGoal) {
      const newValue = parseFloat(kpiValue);
      const direction = getKPIDirection(category, kpiName);
      const achieved = direction === "lower" 
        ? newValue <= relevantGoal.target_value
        : newValue >= relevantGoal.target_value;
      
      if (achieved) {
        await markGoalAchieved.mutateAsync(relevantGoal.id);
      }
    }
  };

  const resetForm = () => {
    setAddOpen(false);
    setCategory("");
    setKpiName("");
    setKpiValue("");
    setKpiUnit("");
    setRecordedAt(format(new Date(), "yyyy-MM-dd"));
    setNotes("");
  };

  const resetGoalForm = () => {
    setGoalOpen(false);
    setCategory("");
    setKpiName("");
    setTargetValue("");
    setKpiUnit("");
    setTargetDate("");
    setGoalNotes("");
  };

  const handleKPISelect = (name: string) => {
    setKpiName(name);
    const options = getKPIOptions(category);
    const selected = options.find(k => k.name === name);
    if (selected) {
      setKpiUnit(selected.unit);
    }
  };

  const groupedKPIs = kpis.reduce((acc, kpi) => {
    if (!acc[kpi.kpi_category]) acc[kpi.kpi_category] = {};
    if (!acc[kpi.kpi_category][kpi.kpi_name]) acc[kpi.kpi_category][kpi.kpi_name] = [];
    acc[kpi.kpi_category][kpi.kpi_name].push(kpi);
    return acc;
  }, {} as Record<string, Record<string, AthleteKPI[]>>);

  const getLatestKPIs = (categoryData: Record<string, AthleteKPI[]>) => {
    return Object.entries(categoryData).map(([name, entries]) => ({
      name,
      latest: entries[0],
      previous: entries[1],
      trend: entries.length > 1 ? entries[0].kpi_value - entries[1].kpi_value : 0,
      historyCount: entries.length,
    }));
  };

  const getChartData = () => {
    if (!selectedKPIForChart) return [];
    const categoryKPIs = groupedKPIs[selectedKPIForChart.category]?.[selectedKPIForChart.name] || [];
    // Reverse to show oldest first for chart
    return [...categoryKPIs].reverse().map(kpi => ({
      date: format(parseISO(kpi.recorded_at), "MMM d"),
      fullDate: format(parseISO(kpi.recorded_at), "MMM d, yyyy"),
      value: kpi.kpi_value,
      notes: kpi.notes,
    }));
  };

  const getGoalForSelectedKPI = () => {
    if (!selectedKPIForChart) return null;
    return goals.find(
      g => g.kpi_category === selectedKPIForChart.category && 
           g.kpi_name === selectedKPIForChart.name && 
           !g.is_achieved
    );
  };

  const openChart = (cat: string, name: string, unit: string | null) => {
    setSelectedKPIForChart({ category: cat, name, unit });
    setChartOpen(true);
  };

  const getGoalProgress = (goal: AthleteKPIGoal, latestValue: number | null): { percent: number; remaining: number } => {
    if (latestValue === null) return { percent: 0, remaining: goal.target_value };
    
    const direction = getKPIDirection(goal.kpi_category, goal.kpi_name);
    
    // Get the starting point (first recorded value for this KPI)
    const categoryKPIs = groupedKPIs[goal.kpi_category]?.[goal.kpi_name] || [];
    const startValue = categoryKPIs.length > 0 
      ? categoryKPIs[categoryKPIs.length - 1].kpi_value 
      : latestValue;
    
    if (direction === "lower") {
      // For "lower is better" metrics (like 60-yard dash)
      const totalToImprove = startValue - goal.target_value;
      if (totalToImprove <= 0) return { percent: 100, remaining: 0 };
      const improved = startValue - latestValue;
      const percent = Math.min(100, Math.max(0, (improved / totalToImprove) * 100));
      const remaining = Math.max(0, latestValue - goal.target_value);
      return { percent, remaining };
    } else {
      // For "higher is better" metrics (like fastball velocity)
      const totalToImprove = goal.target_value - startValue;
      if (totalToImprove <= 0) return { percent: 100, remaining: 0 };
      const improved = latestValue - startValue;
      const percent = Math.min(100, Math.max(0, (improved / totalToImprove) * 100));
      const remaining = Math.max(0, goal.target_value - latestValue);
      return { percent, remaining };
    }
  };

  const getLatestValueForGoal = (goal: AthleteKPIGoal): number | null => {
    const categoryKPIs = groupedKPIs[goal.kpi_category]?.[goal.kpi_name];
    if (!categoryKPIs || categoryKPIs.length === 0) return null;
    return categoryKPIs[0].kpi_value;
  };

  const activeGoals = goals.filter(g => !g.is_achieved);
  const achievedGoals = goals.filter(g => g.is_achieved);

  const getCommentsForKPI = (cat: string, name: string) => {
    return comments.filter(c => c.kpi_category === cat && c.kpi_name === name);
  };

  const allKPINames = [...new Set(kpis.map(k => ({ category: k.kpi_category, name: k.kpi_name })))];

  // Export to CSV
  const exportToCSV = () => {
    if (kpis.length === 0) {
      toast.error("No KPI data to export");
      return;
    }

    const headers = ["Category", "Metric", "Value", "Unit", "Recorded At", "Notes"];
    const rows = kpis.map(kpi => [
      kpi.kpi_category,
      kpi.kpi_name,
      kpi.kpi_value.toString(),
      kpi.kpi_unit || "",
      format(parseISO(kpi.recorded_at), "yyyy-MM-dd"),
      kpi.notes || ""
    ]);

    // Add goals section
    const goalsHeaders = ["", "", "", "", "", ""];
    const goalsTitle = ["", "", "", "", "", ""];
    const goalRows = goals.map(goal => [
      goal.kpi_category,
      goal.kpi_name,
      `Target: ${goal.target_value}`,
      goal.kpi_unit || "",
      goal.target_date ? format(parseISO(goal.target_date), "yyyy-MM-dd") : "",
      goal.is_achieved ? "Achieved" : "In Progress"
    ]);

    const csvContent = [
      "KPI Performance Data",
      `Exported: ${format(new Date(), "MMMM d, yyyy")}`,
      "",
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")),
      "",
      "Goals",
      ["Category", "Metric", "Target", "Unit", "Target Date", "Status"].join(","),
      ...goalRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kpi-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("CSV exported successfully!");
  };

  // Export to PDF
  const exportToPDF = () => {
    if (kpis.length === 0) {
      toast.error("No KPI data to export");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("KPI Performance Report", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    // Group by category for better organization
    const categories = ["performance", "physical", "training"];
    const categoryLabels: Record<string, string> = {
      performance: "Performance Metrics",
      physical: "Physical Measurements",
      training: "Training Progress"
    };

    categories.forEach(cat => {
      const categoryKPIs = groupedKPIs[cat];
      if (!categoryKPIs || Object.keys(categoryKPIs).length === 0) return;

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Category header
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246); // Blue color
      doc.text(categoryLabels[cat], 14, yPos);
      yPos += 8;
      doc.setTextColor(0, 0, 0);

      // Latest values for each metric in this category
      const latestKPIs = getLatestKPIs(categoryKPIs);
      
      latestKPIs.forEach(({ name, latest, trend, historyCount }) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(name, 14, yPos);
        
        doc.setFont("helvetica", "normal");
        const valueText = `${latest.kpi_value}${latest.kpi_unit ? ` ${latest.kpi_unit}` : ""}`;
        doc.text(valueText, 100, yPos);

        // Trend indicator
        if (trend !== 0) {
          const trendText = trend > 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1);
          doc.setTextColor(trend > 0 ? 34 : 239, trend > 0 ? 197 : 68, trend > 0 ? 94 : 68);
          doc.text(trendText, 140, yPos);
          doc.setTextColor(0, 0, 0);
        }

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`${historyCount} entries | Last: ${format(parseISO(latest.recorded_at), "MMM d, yyyy")}`, 14, yPos + 5);
        doc.setTextColor(0, 0, 0);
        
        yPos += 12;
      });

      yPos += 5;
    });

    // Goals Section
    if (goals.length > 0) {
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 5;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(139, 92, 246); // Purple color
      doc.text("Goals", 14, yPos);
      yPos += 8;
      doc.setTextColor(0, 0, 0);

      goals.forEach(goal => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        const latestValue = getLatestValueForGoal(goal);
        const progress = latestValue !== null ? getGoalProgress(goal, latestValue) : null;

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(goal.kpi_name, 14, yPos);

        doc.setFont("helvetica", "normal");
        const targetText = `Target: ${goal.target_value}${goal.kpi_unit ? ` ${goal.kpi_unit}` : ""}`;
        doc.text(targetText, 100, yPos);

        if (goal.is_achieved) {
          doc.setTextColor(34, 197, 94);
          doc.text("✓ Achieved", 160, yPos);
          doc.setTextColor(0, 0, 0);
        } else if (progress) {
          doc.text(`${progress.percent.toFixed(0)}%`, 160, yPos);
        }

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        if (goal.target_date) {
          doc.text(`Target date: ${format(parseISO(goal.target_date), "MMM d, yyyy")}`, 14, yPos + 5);
        }
        doc.setTextColor(0, 0, 0);
        
        yPos += 12;
      });
    }

    // Save PDF
    doc.save(`kpi-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("PDF exported successfully!");
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Goals Section */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            KPI Goals
          </CardTitle>
          {isOwnProfile && (
            <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <Target className="w-4 h-4" />
                  Set Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Set Performance Goal</DialogTitle>
                  <DialogDescription>Define a target to work toward, like 90mph fastball or 6.5 sec 60-yard dash.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={(v) => { setCategory(v); setKpiName(""); setKpiUnit(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {kpiCategories.map(c => (
                          <SelectItem key={c.value} value={c.value}>
                            <div className="flex items-center gap-2">
                              <c.icon className={`w-4 h-4 ${c.color}`} />
                              {c.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {category && (
                    <div className="space-y-2">
                      <Label>Metric</Label>
                      <Select value={kpiName} onValueChange={handleKPISelect}>
                        <SelectTrigger><SelectValue placeholder="Select metric" /></SelectTrigger>
                        <SelectContent>
                          {getKPIOptions(category).map(k => (
                            <SelectItem key={k.name} value={k.name}>
                              {k.name} {k.unit && `(${k.unit})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Target Value</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={targetValue}
                          onChange={(e) => setTargetValue(e.target.value)}
                          placeholder="90"
                        />
                        {kpiUnit && (
                          <span className="text-sm text-muted-foreground whitespace-nowrap">{kpiUnit}</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Date (optional)</Label>
                      <Input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      value={goalNotes}
                      onChange={(e) => setGoalNotes(e.target.value)}
                      placeholder="Why this goal matters to you..."
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetGoalForm}>Cancel</Button>
                  <Button 
                    onClick={() => addGoal.mutate()} 
                    disabled={!category || !kpiName || !targetValue || addGoal.isPending}
                  >
                    {addGoal.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Set Goal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>

        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No goals set yet</p>
              {isOwnProfile && <p className="text-sm mt-1">Set targets to track your progress</p>}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Goals */}
              {activeGoals.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Active Goals ({activeGoals.length})
                  </h4>
                  <div className="grid gap-3">
                    {activeGoals.map(goal => {
                      const latestValue = getLatestValueForGoal(goal);
                      const { percent, remaining } = getGoalProgress(goal, latestValue);
                      const daysLeft = goal.target_date 
                        ? differenceInDays(new Date(goal.target_date), new Date())
                        : null;
                      const categoryInfo = kpiCategories.find(c => c.value === goal.kpi_category);
                      const Icon = categoryInfo?.icon || Target;

                      return (
                        <div 
                          key={goal.id}
                          className="group relative p-4 rounded-lg border border-border bg-muted/30"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${categoryInfo?.color || 'text-muted-foreground'}`} />
                              <span className="font-medium">{goal.kpi_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {daysLeft !== null && daysLeft >= 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                                </Badge>
                              )}
                              {daysLeft !== null && daysLeft < 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  Overdue
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Current: {latestValue !== null ? `${latestValue}${goal.kpi_unit ? ` ${goal.kpi_unit}` : ''}` : 'No data'}
                              </span>
                              <span className="font-medium text-primary">
                                Target: {goal.target_value}{goal.kpi_unit ? ` ${goal.kpi_unit}` : ''}
                              </span>
                            </div>
                            <Progress value={percent} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{Math.round(percent)}% complete</span>
                              {remaining > 0 && (
                                <span>{remaining.toFixed(1)} {goal.kpi_unit} to go</span>
                              )}
                            </div>
                          </div>

                          {goal.notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic">"{goal.notes}"</p>
                          )}

                          {isOwnProfile && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              {percent >= 100 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => markGoalAchieved.mutate(goal.id)}
                                >
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => deleteGoal.mutate(goal.id)}
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Achieved Goals */}
              {achievedGoals.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Achieved ({achievedGoals.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {achievedGoals.map(goal => (
                      <div 
                        key={goal.id}
                        className="group relative p-3 rounded-lg border border-green-500/30 bg-green-500/10"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{goal.kpi_name}</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">
                          {goal.target_value}
                          {goal.kpi_unit && <span className="text-sm font-normal ml-1">{goal.kpi_unit}</span>}
                        </p>
                        {goal.achieved_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(goal.achieved_at), "MMM d, yyyy")}
                          </p>
                        )}
                        {isOwnProfile && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteGoal.mutate(goal.id)}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPIs Section */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            Recorded KPIs
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Export Button */}
            {kpis.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem onClick={exportToCSV} className="gap-2 cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4 text-green-500" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToPDF} className="gap-2 cursor-pointer">
                    <FileText className="w-4 h-4 text-red-500" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {isOwnProfile && (
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Log KPI
                  </Button>
                </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Log New KPI</DialogTitle>
                  <DialogDescription>Track your performance, physical, or training metrics.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={(v) => { setCategory(v); setKpiName(""); setKpiUnit(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {kpiCategories.map(c => (
                          <SelectItem key={c.value} value={c.value}>
                            <div className="flex items-center gap-2">
                              <c.icon className={`w-4 h-4 ${c.color}`} />
                              {c.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {category && (
                    <div className="space-y-2">
                      <Label>Metric</Label>
                      <Select value={kpiName} onValueChange={handleKPISelect}>
                        <SelectTrigger><SelectValue placeholder="Select metric" /></SelectTrigger>
                        <SelectContent>
                          {getKPIOptions(category).map(k => (
                            <SelectItem key={k.name} value={k.name}>
                              {k.name} {k.unit && `(${k.unit})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Value</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={kpiValue}
                          onChange={(e) => setKpiValue(e.target.value)}
                          placeholder="0"
                        />
                        {kpiUnit && (
                          <span className="text-sm text-muted-foreground whitespace-nowrap">{kpiUnit}</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={recordedAt}
                        onChange={(e) => setRecordedAt(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add context or details..."
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button 
                    onClick={() => addKPI.mutate()} 
                    disabled={!category || !kpiName || !kpiValue || addKPI.isPending}
                  >
                    {addKPI.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Log KPI
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {kpis.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gauge className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No KPIs logged yet</p>
              {isOwnProfile && <p className="text-sm mt-1">Start tracking your performance metrics</p>}
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                {kpiCategories.map(cat => (
                  <TabsTrigger key={cat.value} value={cat.value} className="flex items-center gap-1.5">
                    <cat.icon className={`w-4 h-4 ${cat.color}`} />
                    <span className="hidden sm:inline">{cat.label.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {kpiCategories.map(cat => {
                const categoryData = groupedKPIs[cat.value] || {};
                const latestKPIs = getLatestKPIs(categoryData);

                return (
                  <TabsContent key={cat.value} value={cat.value}>
                    {latestKPIs.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <cat.icon className={`w-8 h-8 mx-auto mb-2 opacity-50 ${cat.color}`} />
                        <p className="text-sm">No {cat.label.toLowerCase()} recorded</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {latestKPIs.map(({ name, latest, trend, historyCount }) => {
                          const goal = goals.find(g => g.kpi_category === cat.value && g.kpi_name === name && !g.is_achieved);
                          
                          return (
                            <div 
                              key={name}
                              className="group relative p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => historyCount > 1 && openChart(cat.value, name, latest.kpi_unit)}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-muted-foreground truncate pr-2">{name}</p>
                                <div className="flex items-center gap-1">
                                  {historyCount > 1 && (
                                    <LineChart className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                  )}
                                  {trend !== 0 && (
                                    <TrendingUp className={`w-3 h-3 flex-shrink-0 ${trend > 0 ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
                                  )}
                                </div>
                              </div>
                              <p className="text-xl font-bold text-foreground">
                                {latest.kpi_value}
                                {latest.kpi_unit && (
                                  <span className="text-sm font-normal text-muted-foreground ml-1">{latest.kpi_unit}</span>
                                )}
                              </p>
                              {goal && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Target className="w-3 h-3 text-primary" />
                                  <span className="text-xs text-primary">
                                    Goal: {goal.target_value}{goal.kpi_unit ? ` ${goal.kpi_unit}` : ''}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(latest.recorded_at), "MMM d, yyyy")}
                                  </p>
                                </div>
                                {historyCount > 1 && (
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                    {historyCount} logs
                                  </Badge>
                                )}
                              </div>
                              {isOwnProfile && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => { e.stopPropagation(); deleteKPI.mutate(latest.id); }}
                                >
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* KPI Chart Dialog */}
      <Dialog open={chartOpen} onOpenChange={setChartOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary" />
              {selectedKPIForChart?.name} Trend
            </DialogTitle>
            <DialogDescription>
              Historical progress over time
              {getGoalForSelectedKPI() && (
                <span className="ml-2 text-primary">
                  • Target: {getGoalForSelectedKPI()?.target_value}{selectedKPIForChart?.unit ? ` ${selectedKPIForChart.unit}` : ''}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedKPIForChart && getChartData().length > 0 ? (
              <div className="space-y-4">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={getChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs fill-muted-foreground"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        className="text-xs fill-muted-foreground"
                        tick={{ fontSize: 11 }}
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => `${value}${selectedKPIForChart.unit ? ` ${selectedKPIForChart.unit}` : ''}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number) => [
                          `${value}${selectedKPIForChart.unit ? ` ${selectedKPIForChart.unit}` : ''}`,
                          'Value'
                        ]}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          return item?.fullDate || label;
                        }}
                      />
                      {getGoalForSelectedKPI() && (
                        <ReferenceLine 
                          y={getGoalForSelectedKPI()!.target_value} 
                          stroke="hsl(var(--primary))" 
                          strokeDasharray="5 5"
                          label={{ 
                            value: `Goal: ${getGoalForSelectedKPI()!.target_value}`, 
                            position: 'right',
                            fill: 'hsl(var(--primary))',
                            fontSize: 11
                          }}
                        />
                      )}
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-3 pt-2 border-t border-border">
                  {(() => {
                    const data = getChartData();
                    const values = data.map(d => d.value);
                    const latest = values[values.length - 1];
                    const first = values[0];
                    const max = Math.max(...values);
                    const min = Math.min(...values);
                    const change = latest - first;
                    const direction = getKPIDirection(selectedKPIForChart.category, selectedKPIForChart.name);
                    const isPositiveChange = direction === 'lower' ? change < 0 : change > 0;
                    
                    return (
                      <>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Latest</p>
                          <p className="text-lg font-bold">{latest}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Change</p>
                          <p className={`text-lg font-bold ${isPositiveChange ? 'text-green-500' : change !== 0 ? 'text-red-500' : ''}`}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Best</p>
                          <p className="text-lg font-bold text-primary">
                            {direction === 'lower' ? min : max}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Entries</p>
                          <p className="text-lg font-bold">{data.length}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <LineChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Not enough data to display chart</p>
                <p className="text-sm mt-1">Log more entries to see trends</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setChartOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coach Comments Section */}
      {(isCoachForAthlete || comments.length > 0) && (
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Coach Feedback
            </CardTitle>
            {isCoachForAthlete && (
              <Badge variant="secondary" className="gap-1">
                <User className="w-3 h-3" />
                Coach Access
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Comment Form for Coaches */}
            {isCoachForAthlete && (
              <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-3">
                <p className="text-sm font-medium">Add Feedback</p>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={commentCategory} onValueChange={(v) => { setCommentCategory(v); setCommentKpiName(""); }}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      {kpiCategories.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <c.icon className={`w-4 h-4 ${c.color}`} />
                            {c.label.split(' ')[0]}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={commentKpiName} 
                    onValueChange={setCommentKpiName}
                    disabled={!commentCategory}
                  >
                    <SelectTrigger><SelectValue placeholder="Metric" /></SelectTrigger>
                    <SelectContent>
                      {commentCategory && getKPIOptions(commentCategory).map(k => (
                        <SelectItem key={k.name} value={k.name}>{k.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add your coaching feedback..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => addComment.mutate()}
                    disabled={!commentCategory || !commentKpiName || !newComment.trim() || addComment.isPending}
                    size="icon"
                    className="self-end"
                  >
                    {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No coach feedback yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map(comment => {
                  const coachProfile = coachProfiles[comment.coach_user_id];
                  const categoryInfo = kpiCategories.find(c => c.value === comment.kpi_category);
                  const Icon = categoryInfo?.icon || Gauge;
                  const isOwnComment = currentUserId === comment.coach_user_id;

                  return (
                    <div 
                      key={comment.id}
                      className="group relative p-3 rounded-lg border border-border bg-muted/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {coachProfile?.avatar_url ? (
                            <img src={coachProfile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-medium">
                              {coachProfile?.display_name || 'Coach'}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-1">
                              <Icon className={`w-3 h-3 ${categoryInfo?.color || ''}`} />
                              {comment.kpi_name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(comment.created_at), "MMM d, yyyy")}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{comment.comment}</p>
                        </div>
                        {isOwnComment && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            onClick={() => deleteComment.mutate(comment.id)}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AthleteKPIForm;
