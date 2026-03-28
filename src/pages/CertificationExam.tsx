import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock, 
  AlertTriangle, Loader2, Flag, BookOpen, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  useCertificationDefinitions,
  useExamQuestions,
  useStartExamAttempt,
  useSubmitExam,
  ExamQuestion
} from "@/hooks/useCertifications";
import { getCertificationDisplayName, type CertificationType } from "@/lib/certificationPricing";

const CertificationExam = () => {
  const { certType } = useParams<{ certType: CertificationType }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [examResults, setExamResults] = useState<{ score: number; passed: boolean; correct: number; total: number } | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);

  const { data: definitions = [] } = useCertificationDefinitions();
  const { data: fetchedQuestions = [], isLoading: questionsLoading, refetch: refetchQuestions } = useExamQuestions(certType || null);
  const startAttemptMutation = useStartExamAttempt();
  const submitExamMutation = useSubmitExam();

  const definition = definitions.find(d => d.certification_type === certType);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    });
  }, [navigate]);

  // Timer effect
  useEffect(() => {
    if (!examStarted || timeRemaining === null || showResults) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examStarted, showResults]);

  const handleStartExam = async () => {
    if (!certType) return;
    
    // Refetch to get fresh randomized questions
    const { data: freshQuestions } = await refetchQuestions();
    const questionsToUse = freshQuestions || fetchedQuestions;
    
    if (questionsToUse.length === 0) {
      return;
    }
    
    // Store the questions for this exam session
    setExamQuestions(questionsToUse);
    
    const questionIds = questionsToUse.map(q => q.id);
    const result = await startAttemptMutation.mutateAsync({ certType, questionIds });
    setAttemptId(result.id);
    setExamStarted(true);
    // Set timer based on question count (1.5 min per question)
    setTimeRemaining(questionsToUse.length * 90);
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmitExam = async () => {
    if (!attemptId || !definition || !certType) return;

    const result = await submitExamMutation.mutateAsync({
      attemptId,
      answers,
      questions: examQuestions,
      certType,
      certificationName: definition.name,
    });

    setExamResults(result);
    setShowResults(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Use examQuestions during exam, fetchedQuestions for pre-exam display
  const displayQuestions = examStarted ? examQuestions : fetchedQuestions;
  const currentQuestion = displayQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = displayQuestions.length > 0 ? (answeredCount / displayQuestions.length) * 100 : 0;

  // Group questions by section
  const sections = useMemo(() => {
    const sectionMap = new Map<string, ExamQuestion[]>();
    displayQuestions.forEach(q => {
      const existing = sectionMap.get(q.section) || [];
      sectionMap.set(q.section, [...existing, q]);
    });
    return Array.from(sectionMap.entries());
  }, [displayQuestions]);

  if (loading || questionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!definition || !certType) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-display mb-4">Certification Not Found</h2>
            <Button onClick={() => navigate("/certifications")}>Back to Certifications</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (fetchedQuestions.length === 0 && !examStarted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-display mb-2">No Questions Available</h2>
            <p className="text-muted-foreground mb-4">This exam doesn't have any questions yet.</p>
            <Button onClick={() => navigate("/certifications")}>Back to Certifications</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Results screen
  if (showResults && examResults) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className={`border-2 ${examResults.passed ? 'border-green-500' : 'border-red-500'}`}>
                <CardHeader>
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${examResults.passed ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    {examResults.passed ? (
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    ) : (
                      <XCircle className="w-10 h-10 text-red-600" />
                    )}
                  </div>
                  <CardTitle className="text-2xl mt-4">
                    {examResults.passed ? 'Congratulations!' : 'Not Quite There'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-5xl font-display text-foreground">{examResults.score}%</p>
                    <p className="text-muted-foreground mt-1">
                      {examResults.correct} of {examResults.total} correct
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 text-left">
                    <p className="text-sm text-muted-foreground mb-2">Passing Score Required</p>
                    <Progress value={examResults.score} className="h-3" />
                    <div className="flex justify-between text-xs mt-1">
                      <span>0%</span>
                      <span className="text-primary font-medium">{definition.passing_score}% to pass</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {examResults.passed ? (
                    <div className="bg-green-500/10 rounded-lg p-4">
                      <p className="text-green-600 font-medium">
                        🎉 You've earned your {getCertificationDisplayName(certType)} certification!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Valid for {definition.validity_months} months
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-500/10 rounded-lg p-4">
                      <p className="text-amber-600 font-medium">
                        You can retake this exam after reviewing the material.
                      </p>
                    </div>
                  )}

                  <Button variant="vault" onClick={() => navigate("/certifications")} className="w-full">
                    Back to Certifications
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Pre-exam screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Button variant="ghost" className="mb-6" onClick={() => navigate("/certifications")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Certifications
            </Button>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{definition.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-3xl font-display text-foreground">{definition.question_count}</p>
                    <p className="text-sm text-muted-foreground">Questions</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-3xl font-display text-foreground">{definition.passing_score}%</p>
                    <p className="text-sm text-muted-foreground">To Pass</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-3xl font-display text-foreground">{Math.round(definition.question_count * 1.5)}</p>
                    <p className="text-sm text-muted-foreground">Minutes</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Exam Sections:</h3>
                  {sections.map(([section, sectionQuestions]) => (
                    <div key={section} className="flex justify-between items-center bg-muted/30 rounded-lg px-4 py-2">
                      <span className="text-sm">{section}</span>
                      <Badge variant="secondary">{sectionQuestions.length} questions</Badge>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-600">Before you begin:</p>
                      <ul className="mt-1 space-y-1 text-muted-foreground">
                        <li>• Ensure you have a stable internet connection</li>
                        <li>• Set aside uninterrupted time to complete the exam</li>
                        <li>• The timer will start when you click "Begin Exam"</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="vault" 
                  size="lg" 
                  className="w-full"
                  onClick={handleStartExam}
                  disabled={startAttemptMutation.isPending}
                >
                  {startAttemptMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Begin Exam
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Exam in progress
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header with timer */}
      <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur border-b z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-display text-lg">{getCertificationDisplayName(certType)}</span>
              <Badge variant="secondary">
                {currentQuestionIndex + 1} / {examQuestions.length}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Answered:</span>
                <span className="font-medium">{answeredCount}/{examQuestions.length}</span>
              </div>
              
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${timeRemaining < 300 ? 'bg-red-500/10 text-red-600' : 'bg-muted'}`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
          </div>
          <Progress value={progressPercent} className="h-1 mt-2" />
        </div>
      </div>

      <main className="pt-24 pb-32">
        <div className="container mx-auto px-4 max-w-3xl">
          {currentQuestion && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{currentQuestion.section}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFlag(currentQuestion.id)}
                        className={flaggedQuestions.has(currentQuestion.id) ? 'text-amber-600' : ''}
                      >
                        <Flag className="w-4 h-4 mr-1" />
                        {flaggedQuestions.has(currentQuestion.id) ? 'Flagged' : 'Flag'}
                      </Button>
                    </div>
                    {/* Video player for video-based questions */}
                    {(currentQuestion as any).video_url && !(currentQuestion as any).video_url.startsWith('pending-upload://') && (
                      <div className="mt-3 rounded-lg overflow-hidden border bg-black">
                        <video
                          src={(currentQuestion as any).video_url}
                          controls
                          className="w-full max-h-64 object-contain"
                          preload="metadata"
                        />
                      </div>
                    )}
                    {(currentQuestion as any).video_url && (currentQuestion as any).video_url.startsWith('pending-upload://') && (
                      <div className="mt-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-6 flex flex-col items-center gap-2">
                        <Video className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Video clip pending upload</p>
                      </div>
                    )}
                    <CardTitle className="text-xl leading-relaxed">
                      {currentQuestion.question_text}
                    </CardTitle>
                    {currentQuestion.is_scenario && (
                      <Badge className="bg-primary/10 text-primary mt-2">Scenario-Based</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={answers[currentQuestion.id]?.toString()}
                      onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
                      className="space-y-3"
                    >
                      {currentQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                            answers[currentQuestion.id] === index 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-muted-foreground/30'
                          }`}
                          onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                        >
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Question navigator */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {examQuestions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded text-sm font-medium transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-primary text-primary-foreground'
                    : answers[q.id] !== undefined
                    ? 'bg-green-500/20 text-green-600'
                    : flaggedQuestions.has(q.id)
                    ? 'bg-amber-500/20 text-amber-600'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentQuestionIndex === examQuestions.length - 1 ? (
              <Button 
                variant="vault"
                onClick={handleSubmitExam}
                disabled={submitExamMutation.isPending}
              >
                {submitExamMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Submit Exam
              </Button>
            ) : (
              <Button
                variant="vault"
                onClick={() => setCurrentQuestionIndex(prev => Math.min(examQuestions.length - 1, prev + 1))}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationExam;
