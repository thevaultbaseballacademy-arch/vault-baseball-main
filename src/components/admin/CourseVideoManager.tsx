import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Video, Save, Trash2, ExternalLink, ChevronDown, ChevronRight, CheckCircle, Circle, Search, Upload, FileSpreadsheet, X, AlertCircle, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { allCourses } from "@/pages/Courses";
import { courseContent } from "@/lib/courseData";
import { useCourseVideos, useUpsertCourseVideo, useDeleteCourseVideo, useBulkImportVideos, BulkVideoEntry } from "@/hooks/useCourseVideos";
import { toast } from "sonner";

interface LessonVideoFormProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  existingUrl?: string;
  existingPlatform?: string;
}

const LessonVideoForm = ({ 
  courseId, 
  moduleId, 
  lessonId, 
  lessonTitle, 
  existingUrl, 
  existingPlatform 
}: LessonVideoFormProps) => {
  const [url, setUrl] = useState(existingUrl || "");
  const [platform, setPlatform] = useState(existingPlatform || "youtube");
  const upsertVideo = useUpsertCourseVideo();
  const deleteVideo = useDeleteCourseVideo();

  const validateUrl = (videoUrl: string, videoPlatform: string): { valid: boolean; error?: string } => {
    if (!videoUrl.trim()) return { valid: false, error: "URL is required" };
    
    const trimmedUrl = videoUrl.trim();
    
    // Basic URL format check
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return { valid: false, error: "URL must start with http:// or https://" };
    }

    // Platform-specific validation
    if (videoPlatform === 'youtube') {
      const youtubePatterns = [
        /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
        /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
        /^https?:\/\/youtu\.be\/[\w-]+/,
        /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
      ];
      if (!youtubePatterns.some(p => p.test(trimmedUrl))) {
        return { valid: false, error: "Invalid YouTube URL format" };
      }
    } else if (videoPlatform === 'vimeo') {
      const vimeoPatterns = [
        /^https?:\/\/(www\.)?vimeo\.com\/\d+/,
        /^https?:\/\/player\.vimeo\.com\/video\/\d+/,
      ];
      if (!vimeoPatterns.some(p => p.test(trimmedUrl))) {
        return { valid: false, error: "Invalid Vimeo URL format" };
      }
    } else if (videoPlatform === 'wistia') {
      const wistiaPatterns = [
        /^https?:\/\/.*\.wistia\.(com|net)\//,
      ];
      if (!wistiaPatterns.some(p => p.test(trimmedUrl))) {
        return { valid: false, error: "Invalid Wistia URL format" };
      }
    }

    return { valid: true };
  };

  const validation = validateUrl(url, platform);

  const handleSave = () => {
    if (!validation.valid) {
      toast.error(validation.error || "Invalid URL");
      return;
    }
    upsertVideo.mutate({
      course_id: courseId,
      module_id: moduleId,
      lesson_id: lessonId,
      video_url: url.trim(),
      video_platform: platform,
    });
  };

  const handleDelete = () => {
    deleteVideo.mutate(lessonId);
    setUrl("");
  };

  const hasVideo = !!existingUrl;

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0">
        {hasVideo ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <Circle className="w-4 h-4 text-muted-foreground/40" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{lessonTitle}</p>
        <p className="text-xs text-muted-foreground">{lessonId}</p>
      </div>

      <Select value={platform} onValueChange={setPlatform}>
        <SelectTrigger className="w-28 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="youtube">YouTube</SelectItem>
          <SelectItem value="vimeo">Vimeo</SelectItem>
          <SelectItem value="wistia">Wistia</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-1 max-w-md relative">
        <Input
          placeholder="Enter video URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={`h-8 text-sm ${url && !validation.valid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        {url && !validation.valid && (
          <p className="absolute -bottom-4 left-0 text-xs text-destructive">{validation.error}</p>
        )}
      </div>

      <div className="flex gap-1">
        {url && validation.valid && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => window.open(url, "_blank")}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
        
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!url.trim() || !validation.valid || upsertVideo.isPending}
          className="h-8"
        >
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>

        {hasVideo && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteVideo.isPending}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

const CourseVideoManager = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState("");
  const [parsedEntries, setParsedEntries] = useState<BulkVideoEntry[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  
  const { data: videos = [], isLoading } = useCourseVideos(selectedCourse || undefined);
  const bulkImportMutation = useBulkImportVideos();

  const videoMap = new Map(videos.map(v => [v.lesson_id, v]));

  const selectedCourseData = selectedCourse ? courseContent[selectedCourse] : null;
  const selectedCourseInfo = allCourses.find(c => c.id === selectedCourse);

  // Build lesson lookup map for the selected course
  const lessonLookup = useMemo(() => {
    if (!selectedCourseData || !selectedCourse) return new Map<string, { moduleId: string }>();
    const map = new Map<string, { moduleId: string }>();
    selectedCourseData.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        map.set(lesson.id, { moduleId: module.id });
      });
    });
    return map;
  }, [selectedCourseData, selectedCourse]);

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const expandAll = () => {
    if (selectedCourseData) {
      setExpandedModules(new Set(selectedCourseData.modules.map(m => m.id)));
    }
  };

  const collapseAll = () => {
    setExpandedModules(new Set());
  };

  // Parse bulk import text
  const parseBulkImport = (text: string) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const entries: BulkVideoEntry[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      // Support both tab and comma separated
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      
      if (parts.length < 2) {
        errors.push(`Line ${index + 1}: Expected at least 2 columns (lesson_id, video_url)`);
        return;
      }

      const lessonId = parts[0].trim();
      const videoUrl = parts[1].trim();
      const platform = parts[2]?.trim() || 'youtube';

      if (!lessonId || !videoUrl) {
        errors.push(`Line ${index + 1}: Missing lesson ID or video URL`);
        return;
      }

      // Validate URL format
      if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
        errors.push(`Line ${index + 1}: Invalid URL format for "${lessonId}"`);
        return;
      }

      // Look up module info if we have a selected course
      const lessonInfo = lessonLookup.get(lessonId);
      
      entries.push({
        lesson_id: lessonId,
        video_url: videoUrl,
        video_platform: platform,
        course_id: selectedCourse || undefined,
        module_id: lessonInfo?.moduleId,
      });
    });

    setParsedEntries(entries);
    setParseErrors(errors);
  };

  const handleBulkImport = async () => {
    if (parsedEntries.length === 0) {
      toast.error("No valid entries to import");
      return;
    }

    await bulkImportMutation.mutateAsync(parsedEntries);
    setBulkImportOpen(false);
    setBulkImportText("");
    setParsedEntries([]);
    setParseErrors([]);
  };

  const generateTemplate = () => {
    if (!selectedCourseData) return "";
    
    const lines: string[] = [];
    selectedCourseData.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        lines.push(`${lesson.id}\thttps://youtube.com/watch?v=YOUR_VIDEO_ID`);
      });
    });
    return lines.join('\n');
  };

  const copyTemplate = () => {
    const template = generateTemplate();
    navigator.clipboard.writeText(template);
    toast.success("Template copied to clipboard");
  };

  const exportToCsv = () => {
    if (videos.length === 0) {
      toast.error("No videos to export");
      return;
    }

    const headers = ["lesson_id", "video_url", "platform", "course_id", "module_id"];
    const csvContent = [
      headers.join(","),
      ...videos.map(v => [
        v.lesson_id,
        `"${v.video_url}"`,
        v.video_platform || "youtube",
        v.course_id,
        v.module_id
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `course-videos${selectedCourse ? `-${selectedCourse}` : ""}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${videos.length} video(s) to CSV`);
  };

  // Filter courses by search
  const filteredCourses = allCourses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count videos for selected course
  const totalLessons = selectedCourseData?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 0;
  const videosAdded = videos.length;
  const completionPercent = totalLessons > 0 ? Math.round((videosAdded / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="w-6 h-6 text-primary" />
            Course Video Manager
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Add and manage video URLs for all course lessons
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={exportToCsv}
            disabled={videos.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>

          <Dialog open={bulkImportOpen} onOpenChange={setBulkImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Bulk Import Videos
                </DialogTitle>
                <DialogDescription>
                  Paste tab or comma-separated data with columns: lesson_id, video_url, platform (optional)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedCourse && selectedCourseData && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Import for: {selectedCourseInfo?.title}</p>
                      <Button variant="ghost" size="sm" onClick={copyTemplate} className="gap-1 h-7">
                        <Copy className="w-3 h-3" />
                        Copy Template
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {totalLessons} lessons available • Template includes all lesson IDs
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Paste your data:</label>
                  <Textarea
                    placeholder={`lesson_id\tvideo_url\tplatform
ah-1-1\thttps://youtube.com/watch?v=abc123\tyoutube
ah-1-2\thttps://vimeo.com/123456\tvimeo`}
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

                {parsedEntries.length > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-600 flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4" />
                      {parsedEntries.length} valid entries ready to import
                    </p>
                    <div className="max-h-32 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="text-left py-1">Lesson ID</th>
                            <th className="text-left py-1">Video URL</th>
                            <th className="text-left py-1">Platform</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedEntries.slice(0, 10).map((entry, i) => (
                            <tr key={i} className="border-t border-border/50">
                              <td className="py-1 font-mono">{entry.lesson_id}</td>
                              <td className="py-1 truncate max-w-[200px]">{entry.video_url}</td>
                              <td className="py-1">{entry.video_platform}</td>
                            </tr>
                          ))}
                          {parsedEntries.length > 10 && (
                            <tr>
                              <td colSpan={3} className="py-1 text-muted-foreground">
                                ...and {parsedEntries.length - 10} more
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setBulkImportOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleBulkImport} 
                  disabled={parsedEntries.length === 0 || bulkImportMutation.isPending}
                >
                  {bulkImportMutation.isPending ? "Importing..." : `Import ${parsedEntries.length} Videos`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Course List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Select Course</CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-[600px] overflow-y-auto">
              <div className="space-y-1">
                {filteredCourses.map(course => {
                  const content = courseContent[course.id];
                  const lessonCount = content?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 0;
                  
                  return (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course.id)}
                      className={`w-full text-left p-2 rounded-lg transition-colors ${
                        selectedCourse === course.id 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <p className="text-sm font-medium truncate">{course.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {course.category}
                        </Badge>
                        <span className="text-xs opacity-70">{lessonCount} lessons</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lesson Video Editor */}
        <div className="lg:col-span-3">
          {!selectedCourse ? (
            <Card className="h-[400px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a course to manage its video content</p>
              </div>
            </Card>
          ) : !selectedCourseData ? (
            <Card className="h-[400px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>No lesson content found for this course</p>
                <p className="text-sm mt-1">Add modules and lessons in courseData.ts first</p>
              </div>
            </Card>
          ) : (
            <Card>
              <CardHeader className="py-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedCourseInfo?.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {videosAdded} of {totalLessons} videos added ({completionPercent}%)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={expandAll}>
                      Expand All
                    </Button>
                    <Button variant="outline" size="sm" onClick={collapseAll}>
                      Collapse All
                    </Button>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </CardHeader>
              
              <CardContent className="p-4 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : (
                  <div className="space-y-3">
                    {selectedCourseData.modules.map((module, idx) => (
                      <Collapsible 
                        key={module.id} 
                        open={expandedModules.has(module.id)}
                        onOpenChange={() => toggleModule(module.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-3 p-3 bg-card border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            {expandedModules.has(module.id) ? (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{module.title}</p>
                              <p className="text-sm text-muted-foreground">{module.lessons.length} lessons</p>
                            </div>
                            <Badge variant="outline">
                              {module.lessons.filter(l => videoMap.has(l.id)).length}/{module.lessons.length}
                            </Badge>
                          </motion.div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="ml-8 mt-2 space-y-2 pb-2">
                            {module.lessons.map(lesson => {
                              const existingVideo = videoMap.get(lesson.id);
                              return (
                                <LessonVideoForm
                                  key={lesson.id}
                                  courseId={selectedCourse}
                                  moduleId={module.id}
                                  lessonId={lesson.id}
                                  lessonTitle={lesson.title}
                                  existingUrl={existingVideo?.video_url}
                                  existingPlatform={existingVideo?.video_platform}
                                />
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseVideoManager;
