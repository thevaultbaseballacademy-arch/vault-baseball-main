import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Clock, CheckCircle, Users, ArrowLeft, BookOpen, 
  PlayCircle, Lock, ChevronDown, ChevronUp, Play, Video, ShoppingCart, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { 
  useCourseEnrollments, 
  useCourseProgress, 
  useEnrollInCourse,
  useUpdateProgress,
  useUpdateEnrollmentProgress
} from "@/hooks/useCourseEnrollment";
import { useCourseVideos } from "@/hooks/useCourseVideos";
import { useHasCourseAccess } from "@/hooks/useUserPurchases";
import { useCertificateForCourse, useGenerateCertificate } from "@/hooks/useCourseCertificates";
import { allCourses } from "./Courses";
import { courseContent } from "@/lib/courseData";
import { useToast } from "@/hooks/use-toast";
import VideoPlayer from "@/components/courses/VideoPlayer";
import VideoComingSoon from "@/components/courses/VideoComingSoon";
import { getLessonDetail } from "@/lib/eliteCoachingContent";
import CourseCertificate from "@/components/certifications/CourseCertificate";
import { useContentAccessLog } from "@/hooks/useContentAccessLog";

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logAccess } = useContentAccessLog();
  const [userId, setUserId] = useState<string | undefined>();
  const [userName, setUserName] = useState<string>("");
  const [openModules, setOpenModules] = useState<number[]>([0]);
  const [activeLesson, setActiveLesson] = useState<{ moduleIndex: number; lessonIndex: number } | null>(null);
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);
  
  const { data: enrollments = [] } = useCourseEnrollments(userId);
  const { data: progressData = [] } = useCourseProgress(userId, courseId || "");
  const { data: dbVideos = [] } = useCourseVideos(courseId || undefined);
  const { hasAccess: hasPurchasedAccess, isLoading: accessLoading } = useHasCourseAccess(userId, courseId || "");
  const { data: existingCertificate } = useCertificateForCourse(userId, courseId);
  const enrollMutation = useEnrollInCourse();
  const updateProgressMutation = useUpdateProgress();
  const updateEnrollmentMutation = useUpdateEnrollmentProgress();
  const generateCertificateMutation = useGenerateCertificate();

  // Helper to check if a video URL is a real, playable URL (not a placeholder)
  const isPlayableUrl = (url: string): boolean => {
    if (!url || url.trim() === "") return false;
    // Filter out placeholder/example URLs from static data
    if (/[?&]v=example\d*/i.test(url)) return false;
    if (/[?&]v=sc\d*/i.test(url)) return false;
    if (/[?&]v=sa\d*/i.test(url)) return false;
    if (/[?&]v=mt\d*/i.test(url)) return false;
    if (/[?&]v=hm\d*/i.test(url)) return false;
    if (/[?&]v=gm\d*/i.test(url)) return false;
    if (/[?&]v=[a-z]{1,4}\d{1,3}$/i.test(url)) return false; // catch generic short placeholders
    return true;
  };

  // Create a map of lesson IDs to video URLs from database
  const videoUrlMap = useMemo(() => {
    const map = new Map<string, string>();
    dbVideos.forEach(v => {
      if (isPlayableUrl(v.video_url)) {
        map.set(v.lesson_id, v.video_url);
      }
    });
    return map;
  }, [dbVideos]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUserId(data.user?.id);
      if (data.user?.id) {
        // Fetch user profile for certificate name
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, email")
          .eq("user_id", data.user.id)
          .maybeSingle();
        setUserName(profile?.display_name || profile?.email || data.user.email || "Athlete");
      }
    });
  }, []);

  // Log content access for IP protection
  useEffect(() => {
    if (courseId) {
      logAccess({ contentType: "course", contentId: courseId, moduleName: course?.title });
    }
  }, [courseId]);

  const course = allCourses.find(c => c.id === courseId);
  const staticCourseContent = courseId ? courseContent[courseId] : undefined;
  const enrollment = enrollments.find(e => e.course_id === courseId);
  const isEnrolled = !!enrollment;
  const hasFullAccess = hasPurchasedAccess || isEnrolled;

  // Generate module structure from courseData.ts or fallback to generic structure
  const modules = useMemo(() => {
    if (!course) return [];
    
    // Use static course content if available
    if (staticCourseContent) {
      return staticCourseContent.modules.map((module, moduleIndex) => ({
        index: moduleIndex,
        title: module.title,
        description: module.description,
        lessons: module.lessons.map((lesson, lessonIndex) => {
          // Check for database video URL first, then fall back to static (only if playable)
          const dbVideoUrl = videoUrlMap.get(lesson.id);
          const staticUrl = isPlayableUrl(lesson.videoUrl) ? lesson.videoUrl : "";
          const videoUrl = dbVideoUrl || staticUrl;
          return {
            index: lessonIndex,
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            duration: lesson.duration,
            videoUrl,
            hasVideo: !!videoUrl,
            isFree: lesson.isFree,
          };
        }),
      }));
    }
    
    // Fallback: generate generic structure
    const lessonTitles = [
      "Introduction & Overview",
      "Core Concepts",
      "Drill Breakdown",
      "Technique Focus",
      "Practice Session",
      "Progress Check",
    ];
    
    const lessonsPerModule = Math.ceil(course.lessons / course.modules);
    return Array.from({ length: course.modules }, (_, moduleIndex) => ({
      index: moduleIndex,
      title: `Week ${moduleIndex + 1}`,
      description: "",
      lessons: Array.from(
        { length: Math.min(lessonsPerModule, course.lessons - moduleIndex * lessonsPerModule) },
        (_, lessonIndex) => ({
          index: lessonIndex,
          id: `${courseId}-${moduleIndex}-${lessonIndex}`,
          title: lessonTitles[lessonIndex % lessonTitles.length],
          description: "",
          duration: "10 min",
          videoUrl: "",
          hasVideo: false,
          isFree: lessonIndex === 0,
        })
      ),
    }));
  }, [course, staticCourseContent, courseId, videoUrlMap]);

  // Calculate progress
  const completedLessons = progressData.filter(p => p.completed).length;
  const totalLessons = course?.lessons || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Update enrollment progress when lesson progress changes
  useEffect(() => {
    if (enrollment && progressPercent !== enrollment.progress_percent) {
      updateEnrollmentMutation.mutate({
        enrollmentId: enrollment.id,
        progressPercent,
        completed: progressPercent === 100,
      });
    }
  }, [progressPercent, enrollment]);

  const isLessonCompleted = (moduleIndex: number, lessonIndex: number) => {
    return progressData.some(
      p => p.module_index === moduleIndex && p.lesson_index === lessonIndex && p.completed
    );
  };

  const handleToggleLesson = (moduleIndex: number, lessonIndex: number) => {
    if (!userId || !courseId || !hasFullAccess) return;
    
    const isCompleted = isLessonCompleted(moduleIndex, lessonIndex);
    updateProgressMutation.mutate({
      userId,
      courseId,
      moduleIndex,
      lessonIndex,
      completed: !isCompleted,
    });
  };

  const handleEnroll = () => {
    if (!userId) {
      navigate("/auth");
      return;
    }
    if (!courseId) return;
    enrollMutation.mutate({ userId, courseId });
  };

  const toggleModule = (index: number) => {
    setOpenModules(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <div className="text-center py-16">
            <h1 className="text-2xl font-display text-foreground mb-4">Course Not Found</h1>
            <Button asChild>
              <Link to="/courses">Back to Courses</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = course.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Back Button */}
        <div className="container mx-auto px-4 mb-6">
          <Button variant="ghost" asChild>
            <Link to="/courses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programs
            </Link>
          </Button>
        </div>

        {/* Course Header */}
        <section className="container mx-auto px-4 mb-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge>{course.tag}</Badge>
                  <Badge variant="outline">{course.level}</Badge>
                  <Badge variant="secondary">{course.category}</Badge>
                </div>

                <h1 className="text-3xl md:text-4xl font-display text-foreground mb-4">
                  {course.title}
                </h1>

                <p className="text-muted-foreground text-lg mb-6">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {course.modules} Modules • {course.lessons} Lessons
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {course.students.toLocaleString()} athletes
                  </span>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {course.metrics.map((metric) => (
                    <span 
                      key={metric}
                      className="px-3 py-1.5 rounded-full bg-secondary text-sm text-muted-foreground"
                    >
                      {metric}
                    </span>
                  ))}
                </div>

                {/* Features */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl border border-border p-6 sticky top-28"
              >
                <div className="relative h-40 rounded-xl overflow-hidden mb-6">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-xl bg-background/90 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  {hasPurchasedAccess && (
                    <Badge className="absolute top-4 right-4 bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Purchased
                    </Badge>
                  )}
                </div>

                {hasFullAccess ? (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Your Progress</span>
                        <span className="font-semibold text-primary">{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-3" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {completedLessons} of {totalLessons} lessons completed
                      </p>
                    </div>
                    
                    {progressPercent === 100 && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 text-center">
                        <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="font-semibold text-foreground">Program Completed!</p>
                        <p className="text-sm text-muted-foreground mb-3">Congratulations on finishing this program.</p>
                        {existingCertificate ? (
                          <Button 
                            size="sm" 
                            onClick={() => setShowCertificateDialog(true)}
                            className="gap-2"
                          >
                            <Award className="w-4 h-4" />
                            View Certificate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              if (userId && courseId && course) {
                                generateCertificateMutation.mutate({
                                  userId,
                                  courseId,
                                  courseTitle: course.title,
                                  recipientName: userName,
                                  completionDate: new Date().toISOString(),
                                }, {
                                  onSuccess: () => setShowCertificateDialog(true),
                                });
                              }
                            }}
                            disabled={generateCertificateMutation.isPending}
                            className="gap-2"
                          >
                            <Award className="w-4 h-4" />
                            {generateCertificateMutation.isPending ? "Generating..." : "Get Certificate"}
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mb-6">
                    <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                      <Lock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-center text-muted-foreground">
                        Purchase this program to unlock all {course.lessons} lessons and track your progress.
                      </p>
                    </div>
                    <Link to="/products" className="block">
                      <Button className="w-full" variant="vault" size="lg">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        View Purchase Options
                      </Button>
                    </Link>
                  </div>
                )}

                {hasFullAccess && (
                  <Button 
                    className="w-full" 
                    size="lg"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Continue Training
                  </Button>
                )}

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By {course.instructor}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Video Player Section */}
        {activeLesson && hasFullAccess && (
          <section className="container mx-auto px-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Week {activeLesson.moduleIndex + 1} • Lesson {activeLesson.lessonIndex + 1}
                  </p>
                  <h3 className="text-xl font-display text-foreground">
                    {modules[activeLesson.moduleIndex]?.lessons[activeLesson.lessonIndex]?.title}
                  </h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveLesson(null)}
                >
                  Close
                </Button>
              </div>
              {modules[activeLesson.moduleIndex]?.lessons[activeLesson.lessonIndex]?.videoUrl ? (
                <VideoPlayer
                  videoUrl={modules[activeLesson.moduleIndex]?.lessons[activeLesson.lessonIndex]?.videoUrl || ""}
                  title={modules[activeLesson.moduleIndex]?.lessons[activeLesson.lessonIndex]?.title || ""}
                  duration={modules[activeLesson.moduleIndex]?.lessons[activeLesson.lessonIndex]?.duration}
                  isPreview={modules[activeLesson.moduleIndex]?.lessons[activeLesson.lessonIndex]?.isFree}
                />
              ) : (
                <VideoComingSoon
                  title={modules[activeLesson.moduleIndex]?.lessons[activeLesson.lessonIndex]?.title || ""}
                  description={modules[activeLesson.moduleIndex]?.lessons[activeLesson.lessonIndex]?.description}
                  duration={modules[activeLesson.moduleIndex]?.lessons[activeLesson.lessonIndex]?.duration}
                  isPreview={modules[activeLesson.moduleIndex]?.lessons[activeLesson.lessonIndex]?.isFree}
                />
              )}
              {/* Elite Lesson Curriculum Content */}
              {(() => {
                const lessonTitle = modules[activeLesson.moduleIndex]?.lessons[activeLesson.lessonIndex]?.title || "";
                const detail = getLessonDetail(lessonTitle);
                if (!detail) return null;
                return (
                  <div className="mt-4 space-y-4">
                    {detail.coachingPoints.length > 0 && (
                      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                        <h4 className="text-xs font-display text-foreground uppercase tracking-wide mb-2">Elite Coaching Points</h4>
                        <div className="space-y-2">
                          {detail.coachingPoints.map((pt, i) => (
                            <div key={i} className="flex gap-2.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                              <p className="text-sm text-muted-foreground leading-relaxed">{pt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {detail.drillProtocols.length > 0 && (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                        <h4 className="text-xs font-display text-foreground uppercase tracking-wide mb-3">Drill Protocols</h4>
                        <div className="space-y-3">
                          {detail.drillProtocols.map((drill, i) => (
                            <div key={i} className="bg-card rounded-lg p-3">
                              <p className="text-sm font-medium text-foreground">{drill.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{drill.protocol}</p>
                              <p className="text-xs text-amber-600 mt-1.5 font-medium">Cue: {drill.cue}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {detail.commonErrors.length > 0 && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                        <h4 className="text-xs font-display text-foreground uppercase tracking-wide mb-2">Common Errors to Avoid</h4>
                        <div className="space-y-1.5">
                          {detail.commonErrors.map((err, i) => (
                            <div key={i} className="flex gap-2.5">
                              <span className="text-red-500 text-xs mt-0.5 shrink-0">✗</span>
                              <p className="text-sm text-muted-foreground">{err}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {detail.eliteStandard && (
                      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                        <h4 className="text-xs font-display text-foreground uppercase tracking-wide mb-1">Elite Standard</h4>
                        <p className="text-sm text-muted-foreground">{detail.eliteStandard}</p>
                      </div>
                    )}
                    {detail.scienceBasis && (
                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                        <h4 className="text-xs font-display text-foreground uppercase tracking-wide mb-1">Science Basis</h4>
                        <p className="text-sm text-muted-foreground">{detail.scienceBasis}</p>
                      </div>
                    )}
                    {detail.weeklyTask && (
                      <div className="bg-secondary border border-border rounded-xl p-4">
                        <h4 className="text-xs font-display text-foreground uppercase tracking-wide mb-1">This Week's Assignment</h4>
                        <p className="text-sm text-muted-foreground">{detail.weeklyTask}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeLesson.lessonIndex === 0 && activeLesson.moduleIndex === 0}
                  onClick={() => {
                    if (activeLesson.lessonIndex > 0) {
                      setActiveLesson({ ...activeLesson, lessonIndex: activeLesson.lessonIndex - 1 });
                    } else if (activeLesson.moduleIndex > 0) {
                      const prevModuleLessons = modules[activeLesson.moduleIndex - 1].lessons.length;
                      setActiveLesson({ moduleIndex: activeLesson.moduleIndex - 1, lessonIndex: prevModuleLessons - 1 });
                    }
                  }}
                >
                  Previous Lesson
                </Button>
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isLessonCompleted(activeLesson.moduleIndex, activeLesson.lessonIndex)}
                    onCheckedChange={() => handleToggleLesson(activeLesson.moduleIndex, activeLesson.lessonIndex)}
                  />
                  <span className="text-sm text-muted-foreground">Mark as complete</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    activeLesson.moduleIndex === modules.length - 1 && 
                    activeLesson.lessonIndex === modules[activeLesson.moduleIndex].lessons.length - 1
                  }
                  onClick={() => {
                    const currentModule = modules[activeLesson.moduleIndex];
                    if (activeLesson.lessonIndex < currentModule.lessons.length - 1) {
                      setActiveLesson({ ...activeLesson, lessonIndex: activeLesson.lessonIndex + 1 });
                    } else if (activeLesson.moduleIndex < modules.length - 1) {
                      setActiveLesson({ moduleIndex: activeLesson.moduleIndex + 1, lessonIndex: 0 });
                    }
                  }}
                >
                  Next Lesson
                </Button>
              </div>
            </motion.div>
          </section>
        )}

        {/* Course Content */}
        <section className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-display text-foreground mb-6">Program Content</h2>
            
            <div className="space-y-3">
              {modules.map((module) => {
                const moduleLessonsCompleted = module.lessons.filter(
                  l => isLessonCompleted(module.index, l.index)
                ).length;
                const moduleProgress = module.lessons.length > 0 
                  ? Math.round((moduleLessonsCompleted / module.lessons.length) * 100)
                  : 0;

                return (
                  <Collapsible
                    key={module.index}
                    open={openModules.includes(module.index)}
                    onOpenChange={() => toggleModule(module.index)}
                  >
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="font-display text-primary">{module.index + 1}</span>
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-foreground">{module.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {module.lessons.length} lessons • {moduleLessonsCompleted} completed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {isEnrolled && (
                            <div className="hidden sm:flex items-center gap-2">
                              <Progress value={moduleProgress} className="w-20 h-2" />
                              <span className="text-xs text-muted-foreground w-8">{moduleProgress}%</span>
                            </div>
                          )}
                          {openModules.includes(module.index) ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="border-t border-border">
                          {module.lessons.map((lesson) => {
                            const completed = isLessonCompleted(module.index, lesson.index);
                            const isActive = activeLesson?.moduleIndex === module.index && activeLesson?.lessonIndex === lesson.index;
                            
                            return (
                              <div 
                                key={lesson.index}
                                className={`flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors border-b border-border last:border-0 cursor-pointer ${isActive ? 'bg-primary/10' : ''}`}
                                onClick={() => {
                                  if (isEnrolled && lesson.hasVideo) {
                                    setActiveLesson({ moduleIndex: module.index, lessonIndex: lesson.index });
                                  }
                                }}
                              >
                                {isEnrolled ? (
                                  <Checkbox
                                    checked={completed}
                                    onCheckedChange={() => handleToggleLesson(module.index, lesson.index)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="data-[state=checked]:bg-primary"
                                  />
                                ) : (
                                  <Lock className="w-4 h-4 text-muted-foreground" />
                                )}
                                <div className="flex-1">
                                  <p className={`text-sm ${completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                    {lesson.title}
                                  </p>
                                </div>
                                {lesson.hasVideo && isEnrolled && (
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                                    <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                                  </div>
                                )}
                                <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                              </div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </motion.div>
        </section>
      </main>

      {/* Certificate Dialog */}
      <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Course Certificate
            </DialogTitle>
          </DialogHeader>
          {existingCertificate && (
            <CourseCertificate certificate={existingCertificate} />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CourseDetailPage;
