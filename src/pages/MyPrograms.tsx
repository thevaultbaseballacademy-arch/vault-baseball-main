import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlayCircle, Clock, Target, TrendingUp, CheckCircle, BookOpen, Calendar, ArrowRight, LogIn, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useCourseEnrollments } from "@/hooks/useCourseEnrollment";
import { allCourses } from "@/pages/Courses";
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import CourseCertificatesList from "@/components/certifications/CourseCertificatesList";

const MyPrograms = () => {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({ id: user.id });
      }
    });
  }, []);

  const { data: enrollments, isLoading } = useCourseEnrollments(user?.id);

  const enrolledCourses = enrollments?.map((enrollment) => {
    const course = allCourses.find((c) => c.id === enrollment.course_id);
    return course ? { ...course, enrollment } : null;
  }).filter(Boolean) || [];

  const completedCount = enrolledCourses.filter((c) => c?.enrollment?.status === "completed").length;
  const inProgressCount = enrolledCourses.filter((c) => c?.enrollment?.status === "active" && (c?.enrollment?.progress_percent ?? 0) > 0).length;
  const notStartedCount = enrolledCourses.filter((c) => c?.enrollment?.progress_percent === 0).length;

  const totalProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((acc, c) => acc + (c?.enrollment?.progress_percent ?? 0), 0) / enrolledCourses.length)
    : 0;

  const pieData = [
    { name: "Completed", value: completedCount, color: "hsl(var(--primary))" },
    { name: "In Progress", value: inProgressCount, color: "hsl(var(--accent))" },
    { name: "Not Started", value: notStartedCount, color: "hsl(var(--muted))" },
  ].filter((d) => d.value > 0);

  const progressData = enrolledCourses.slice(0, 5).map((c) => ({
    name: c?.title?.split(" ").slice(0, 2).join(" ") || "",
    progress: c?.enrollment?.progress_percent ?? 0,
  }));

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to view your programs</h2>
            <p className="text-muted-foreground mb-6">Track your progress and continue your training</p>
            <Button asChild>
              <Link to="/auth"><LogIn className="w-4 h-4 mr-2" />Sign In</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              My Training Programs
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track your progress and continue your journey to becoming an elite athlete
            </p>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-foreground">{enrolledCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Enrolled</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-3xl font-bold text-foreground">{inProgressCount}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-3xl font-bold text-foreground">{completedCount}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border">
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-foreground">{totalProgress}%</p>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Progress Charts */}
            <div className="lg:col-span-1 space-y-6">
              {/* Pie Chart */}
              {enrolledCourses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Program Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 mt-4">
                        {pieData.map((entry) => (
                          <div key={entry.name} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-muted-foreground">{entry.name}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Bar Chart */}
              {progressData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Progress Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={progressData} layout="vertical">
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis 
                              type="category" 
                              dataKey="name" 
                              width={80} 
                              tick={{ fontSize: 12 }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip 
                              formatter={(value) => [`${value}%`, "Progress"]}
                              contentStyle={{ 
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px"
                              }}
                            />
                            <Bar 
                              dataKey="progress" 
                              fill="hsl(var(--primary))" 
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Right Column - Course Cards & Certificates */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="programs" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="programs" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Programs
                  </TabsTrigger>
                  <TabsTrigger value="certificates" className="gap-2">
                    <Award className="w-4 h-4" />
                    Certificates
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="programs">
              
              {isLoading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse bg-card border-border">
                      <CardContent className="p-6">
                        <div className="h-20 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : enrolledCourses.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No programs yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start your training journey by enrolling in a program
                    </p>
                    <Button asChild>
                      <Link to="/courses">Browse Programs</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.map((course, index) => {
                    if (!course) return null;
                    const IconComponent = course.icon;
                    const isCompleted = course.enrollment?.status === "completed";
                    const progress = course.enrollment?.progress_percent ?? 0;
                    
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                              {/* Course Image */}
                              <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={course.image}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Course Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <IconComponent className="w-4 h-4 text-primary" />
                                      <Badge variant="secondary" className="text-xs">
                                        {course.tag}
                                      </Badge>
                                      {isCompleted && (
                                        <Badge className="bg-green-500/10 text-green-500 text-xs">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Complete
                                        </Badge>
                                      )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground truncate">
                                      {course.title}
                                    </h3>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {course.duration}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    {course.lessons} lessons
                                  </span>
                                  {course.enrollment?.last_accessed_at && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      Last: {new Date(course.enrollment.last_accessed_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="text-foreground font-medium">{progress}%</span>
                                  </div>
                                  <Progress value={progress} className="h-2" />
                                </div>

                                {/* Action Button */}
                                <Button 
                                  onClick={() => navigate(`/course/${course.id}`)}
                                  className="w-full md:w-auto"
                                >
                                  {progress === 0 ? (
                                    <>
                                      <PlayCircle className="w-4 h-4 mr-2" />
                                      Start Training
                                    </>
                                  ) : isCompleted ? (
                                    <>
                                      <BookOpen className="w-4 h-4 mr-2" />
                                      Review Program
                                    </>
                                  ) : (
                                    <>
                                      <ArrowRight className="w-4 h-4 mr-2" />
                                      Continue Training
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Browse More */}
              {enrolledCourses.length > 0 && (
                <div className="mt-8 text-center">
                  <Button variant="outline" asChild>
                    <Link to="/courses">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse More Programs
                    </Link>
                  </Button>
                </div>
              )}
                </TabsContent>
                
                <TabsContent value="certificates">
                  {user && <CourseCertificatesList userId={user.id} />}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MyPrograms;
