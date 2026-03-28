import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Zap, 
  Activity, 
  Target, 
  Heart,
  Brain,
  ChevronLeft,
  ChevronRight,
  Clock,
  Settings2,
  User,
  Calendar,
  Dumbbell,
  Wind,
  Shield,
  Loader2,
  UserCheck
} from "lucide-react";
import {
  Position,
  TrainingPhase,
  DaySchedule,
  positions,
  phases,
  getScheduleForSettings
} from "@/lib/calendarSchedules";

interface AssignedSchedule {
  id: string;
  name: string;
  description: string | null;
  schedule_data: DaySchedule[];
}

const emphasisConfig = {
  velocity: { 
    color: "bg-red-500", 
    textColor: "text-red-500",
    bgLight: "bg-red-500/10",
    border: "border-red-500/30",
    icon: Zap,
    label: "Velocity"
  },
  athleticism: { 
    color: "bg-blue-500", 
    textColor: "text-blue-500",
    bgLight: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: Activity,
    label: "Athleticism"
  },
  skill: { 
    color: "bg-amber-500", 
    textColor: "text-amber-500",
    bgLight: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: Target,
    label: "Skill/Transfer"
  },
  recovery: { 
    color: "bg-green-500", 
    textColor: "text-green-500",
    bgLight: "bg-green-500/10",
    border: "border-green-500/30",
    icon: Heart,
    label: "Recovery"
  },
  mental: { 
    color: "bg-purple-500", 
    textColor: "text-purple-500",
    bgLight: "bg-purple-500/10",
    border: "border-purple-500/30",
    icon: Brain,
    label: "Mental"
  },
};

const WeeklyCalendar = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState<Position>("utility");
  const [phase, setPhase] = useState<TrainingPhase>("off-season");
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [assignedSchedules, setAssignedSchedules] = useState<AssignedSchedule[]>([]);
  const [selectedAssignedSchedule, setSelectedAssignedSchedule] = useState<string | null>(null);
  const [loadingAssigned, setLoadingAssigned] = useState(true);

  // Fetch assigned schedules for the current user
  useEffect(() => {
    const fetchAssignedSchedules = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoadingAssigned(false);
          return;
        }

        // Get active assignments for this user
        const { data: assignments, error: assignmentsError } = await supabase
          .from("schedule_assignments")
          .select("schedule_id")
          .eq("athlete_user_id", user.id)
          .eq("is_active", true);

        if (assignmentsError) throw assignmentsError;

        if (assignments && assignments.length > 0) {
          const scheduleIds = assignments.map(a => a.schedule_id);
          
          // Fetch the actual schedules
          const { data: schedules, error: schedulesError } = await supabase
            .from("custom_training_schedules")
            .select("id, name, description, schedule_data")
            .in("id", scheduleIds);

          if (schedulesError) throw schedulesError;

          const formattedSchedules = (schedules || []).map(s => ({
            ...s,
            schedule_data: s.schedule_data as unknown as DaySchedule[],
          }));

          setAssignedSchedules(formattedSchedules);
        }
      } catch (error) {
        console.error("Error fetching assigned schedules:", error);
      } finally {
        setLoadingAssigned(false);
      }
    };

    fetchAssignedSchedules();
  }, []);

  // Get customized schedule based on position and phase OR use assigned schedule
  const weeklySchedule = useMemo(() => {
    if (selectedAssignedSchedule) {
      const assigned = assignedSchedules.find(s => s.id === selectedAssignedSchedule);
      if (assigned && assigned.schedule_data) {
        return assigned.schedule_data;
      }
    }
    return getScheduleForSettings(position, phase);
  }, [position, phase, selectedAssignedSchedule, assignedSchedules]);

  const [selectedDay, setSelectedDay] = useState<DaySchedule>(weeklySchedule[0]);

  // Update selected day when schedule changes
  useMemo(() => {
    const dayIndex = weeklySchedule.findIndex(d => d.day === selectedDay.day);
    if (dayIndex >= 0) {
      setSelectedDay(weeklySchedule[dayIndex]);
    } else {
      setSelectedDay(weeklySchedule[0]);
    }
  }, [weeklySchedule]);

  const getIntensityBadge = (intensity: "high" | "moderate" | "low") => {
    switch (intensity) {
      case "high":
        return <Badge variant="outline" className="border-red-500/50 text-red-500 text-xs">High</Badge>;
      case "moderate":
        return <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 text-xs">Mod</Badge>;
      case "low":
        return <Badge variant="outline" className="border-green-500/50 text-green-500 text-xs">Low</Badge>;
    }
  };

  // Calculate weekly distribution
  const weeklyDistribution = useMemo(() => {
    const dist = {
      velocity: 0,
      athleticism: 0,
      skill: 0,
      recovery: 0,
      mental: 0,
    };
    
    weeklySchedule.forEach(day => {
      day.blocks.forEach(block => {
        const duration = parseInt(block.duration);
        dist[block.emphasis] += duration;
      });
    });
    
    return dist;
  }, [weeklySchedule]);

  const totalMinutes = Object.values(weeklyDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-display">VAULT™ Weekly Calendar</h1>
                <p className="text-muted-foreground">
                  Structured training distribution for optimal development
                </p>
              </div>
            </div>
            
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "week" | "day")}>
              <TabsList>
                <TabsTrigger value="week">Week View</TabsTrigger>
                <TabsTrigger value="day">Day View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Assigned Schedules Banner */}
        {!loadingAssigned && assignedSchedules.length > 0 && (
          <Card className="mb-8 border-accent/30 bg-accent/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium text-foreground">Coach-Assigned Schedule Available</p>
                    <p className="text-sm text-muted-foreground">Your coach has assigned you a custom training program</p>
                  </div>
                </div>
                <Select 
                  value={selectedAssignedSchedule || "custom"} 
                  onValueChange={(v) => setSelectedAssignedSchedule(v === "custom" ? null : v)}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom (Position/Phase)</SelectItem>
                    {assignedSchedules.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customization Panel - Only show when using custom schedule */}
        {!selectedAssignedSchedule && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Customize Your Schedule</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Position Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Position
                  </label>
                  <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{pos.label}</span>
                            <span className="text-xs text-muted-foreground">{pos.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Phase Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Training Phase
                  </label>
                  <Select value={phase} onValueChange={(v) => setPhase(v as TrainingPhase)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      {phases.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{p.label}</span>
                            <span className="text-xs text-muted-foreground">{p.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Distribution Summary */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Weekly Training Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(weeklyDistribution).map(([key, minutes]) => {
                const config = emphasisConfig[key as keyof typeof emphasisConfig];
                const Icon = config.icon;
                const percentage = Math.round((minutes / totalMinutes) * 100);
                
                return (
                  <div key={key} className={`flex items-center gap-3 p-3 rounded-lg ${config.bgLight} ${config.border} border`}>
                    <Icon className={`h-5 w-5 ${config.textColor}`} />
                    <div>
                      <div className="font-semibold">{config.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(minutes / 60)}h {minutes % 60}m ({percentage}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {viewMode === "week" ? (
          /* Week View */
          <div className="grid grid-cols-7 gap-2 mb-8">
            {weeklySchedule.map((day) => {
              const config = emphasisConfig[day.primary];
              const Icon = config.icon;
              const isSelected = selectedDay.day === day.day;
              
              return (
                <Card 
                  key={day.day}
                  className={`cursor-pointer transition-all hover:scale-[1.02] ${
                    isSelected ? `ring-2 ring-primary ${config.bgLight}` : ""
                  }`}
                  onClick={() => setSelectedDay(day)}
                >
                  <CardContent className="p-3 text-center">
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-full ${config.bgLight} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${config.textColor}`} />
                    </div>
                    <div className="font-semibold text-sm">{day.shortDay}</div>
                    <Badge className={`mt-1 ${config.color} text-white text-xs`}>
                      {config.label.split('/')[0]}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-2 line-clamp-1">
                      {day.theme}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Day Navigation */
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                const currentIndex = weeklySchedule.findIndex(d => d.day === selectedDay.day);
                const prevIndex = currentIndex === 0 ? 6 : currentIndex - 1;
                setSelectedDay(weeklySchedule[prevIndex]);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[200px]">
              <h2 className="text-2xl font-bold">{selectedDay.day}</h2>
              <p className="text-muted-foreground">{selectedDay.theme}</p>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                const currentIndex = weeklySchedule.findIndex(d => d.day === selectedDay.day);
                const nextIndex = currentIndex === 6 ? 0 : currentIndex + 1;
                setSelectedDay(weeklySchedule[nextIndex]);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Selected Day Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const config = emphasisConfig[selectedDay.primary];
                  const Icon = config.icon;
                  return (
                    <>
                      <div className={`p-2 rounded-lg ${config.bgLight}`}>
                        <Icon className={`h-6 w-6 ${config.textColor}`} />
                      </div>
                      <div>
                        <CardTitle>{selectedDay.day} — {selectedDay.theme}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Primary Focus: {emphasisConfig[selectedDay.primary].label}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {selectedDay.blocks.reduce((sum, b) => sum + parseInt(b.duration), 0)} min
                </div>
                <div className="text-sm text-muted-foreground">Total Duration</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedDay.blocks.map((block, index) => {
                const config = emphasisConfig[block.emphasis];
                const Icon = config.icon;
                
                return (
                  <div 
                    key={block.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${config.border} ${config.bgLight}`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background text-muted-foreground font-semibold">
                      {index + 1}
                    </div>
                    <div className={`p-2 rounded-lg bg-background`}>
                      <Icon className={`h-5 w-5 ${config.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{block.name}</span>
                        <Badge variant="outline" className={`${config.textColor} ${config.border} text-xs`}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{block.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{block.duration}</div>
                      {getIntensityBadge(block.intensity)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Day Summary */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-3">Training Emphasis Breakdown</h4>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(
                  selectedDay.blocks.reduce((acc, block) => {
                    const duration = parseInt(block.duration);
                    acc[block.emphasis] = (acc[block.emphasis] || 0) + duration;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([emphasis, minutes]) => {
                  const config = emphasisConfig[emphasis as keyof typeof emphasisConfig];
                  return (
                    <Badge 
                      key={emphasis} 
                      className={`${config.color} text-white`}
                    >
                      {config.label}: {minutes} min
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VAULT™ Principles */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">VAULT™ Weekly Structure Principles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex gap-3">
                <Dumbbell className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">High Intent Days</h4>
                  <p className="text-sm text-muted-foreground">
                    Monday & Thursday focus on max effort velocity work when CNS is fresh
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Wind className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Movement Quality</h4>
                  <p className="text-sm text-muted-foreground">
                    Tuesday emphasizes athletic development and movement patterns
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Target className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Game Transfer</h4>
                  <p className="text-sm text-muted-foreground">
                    Wed/Fri/Sat focus on skill execution and competitive performance
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Recovery Protocol</h4>
                  <p className="text-sm text-muted-foreground">
                    Sunday is active recovery to rebuild and prepare for the next cycle
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default WeeklyCalendar;
