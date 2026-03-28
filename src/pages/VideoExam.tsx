import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Loader2, Video, AlertTriangle } from "lucide-react";
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
import { useVideoQuestions, useSubmitVideoExam, type VideoQuestion } from "@/hooks/useVideoExam";

const CERT_LABELS: Record<string, string> = {
  "Softball Hitting Foundations": "Hitting Foundations Video Cert",
  "Softball Hitting Performance": "Hitting Performance Video Cert",
  "Softball Slap Specialist": "Slap Specialist Video Cert",
};

const VideoExam = () => {
  const { certType } = useParams<{ certType: string }>();
  const decodedCertType = certType ? decodeURIComponent(certType) : null;
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  // answers: { [videoId]: { q1: idx, q2: idx, q3: idx, q4: idx } }
  const [answers, setAnswers] = useState<Record<string, Record<string, number>>>({});
  const [results, setResults] = useState<{ score: number; totalPoints: number; passed: boolean; percentage: number } | null>(null);

  const { data: questions = [], isLoading: questionsLoading } = useVideoQuestions(decodedCertType);
  const submitMutation = useSubmitVideoExam();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { navigate("/auth"); return; }
      setUser(session.user);
      setLoading(false);
    });
  }, [navigate]);

  const current = questions[currentIndex];
  const totalAnswered = Object.values(answers).reduce((sum, a) => {
    return sum + Object.keys(a).length;
  }, 0);
  const totalQuestions = questions.length * 4;
  const progress = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;

  const handleAnswer = (videoId: string, qKey: string, idx: number) => {
    setAnswers(prev => ({
      ...prev,
      [videoId]: { ...prev[videoId], [qKey]: idx },
    }));
  };

  const handleSubmit = async () => {
    if (!decodedCertType) return;
    const result = await submitMutation.mutateAsync({ certType: decodedCertType, answers });
    setResults(result);
  };

  if (loading || questionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-4 max-w-2xl text-center">
          <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-display mb-2">No Video Questions Available</h2>
          <p className="text-muted-foreground mb-4">Video clips are being prepared for this certification.</p>
          <Button onClick={() => navigate("/certifications")}>Back to Certifications</Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Results
  if (results) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className={`border-2 ${results.passed ? "border-green-500" : "border-red-500"}`}>
              <CardHeader className="text-center">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${results.passed ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  {results.passed ? <CheckCircle className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
                </div>
                <CardTitle className="text-2xl mt-4">
                  {results.passed ? "Video Certification Passed!" : "Not Quite There"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <div>
                  <p className="text-5xl font-display">{results.percentage}%</p>
                  <p className="text-muted-foreground">{results.score} of {results.totalPoints} points</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Each video = 4 points (Issue + Cause + Fix + KPI)</p>
                  <Progress value={results.percentage} className="h-3" />
                  <div className="flex justify-between text-xs mt-1">
                    <span>0%</span>
                    <span className="text-primary font-medium">80% to pass</span>
                    <span>100%</span>
                  </div>
                </div>
                {results.passed ? (
                  <div className="bg-green-500/10 rounded-lg p-4">
                    <p className="text-green-600 font-medium">🎥 Video certification earned! This contributes to your PRO badge.</p>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 rounded-lg p-4">
                    <p className="text-amber-600 font-medium">Review the video scenarios and try again.</p>
                  </div>
                )}
                <Button variant="vault" onClick={() => navigate("/certifications")} className="w-full">
                  Back to Certifications
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Pre-exam
  if (!started) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-4 max-w-2xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/certifications")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Card>
            <CardHeader className="text-center">
              <Video className="w-12 h-12 text-primary mx-auto mb-3" />
              <CardTitle className="text-2xl">{CERT_LABELS[decodedCertType || ""] || "Video Certification"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-3xl font-display">{questions.length}</p>
                  <p className="text-sm text-muted-foreground">Videos</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-3xl font-display">{questions.length * 4}</p>
                  <p className="text-sm text-muted-foreground">Points</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-3xl font-display">80%</p>
                  <p className="text-sm text-muted-foreground">To Pass</p>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h3 className="font-medium">Scoring System</h3>
                <p className="text-sm text-muted-foreground">Each video = 4 points:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• <span className="font-medium text-foreground">Issue ID</span> → 1 point</li>
                  <li>• <span className="font-medium text-foreground">Cause</span> → 1 point</li>
                  <li>• <span className="font-medium text-foreground">Fix</span> → 1 point</li>
                  <li>• <span className="font-medium text-foreground">KPI</span> → 1 point</li>
                </ul>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-600">Required for PRO Certification</p>
                  <p className="text-muted-foreground mt-1">Passing this video exam is required to earn the VAULT™ PRO Coach badge.</p>
                </div>
              </div>
              <Button variant="vault" size="lg" className="w-full" onClick={() => setStarted(true)}>
                Begin Video Exam
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Exam in progress
  const videoAnswers = answers[current?.id] || {};
  const qLabels = ["Issue ID", "Cause", "Fix", "KPI Impacted"];
  const qKeys = ["q1", "q2", "q3", "q4"] as const;
  const qFields = ["question_1", "question_2", "question_3", "question_4"] as const;
  const oFields = ["options_1", "options_2", "options_3", "options_4"] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur border-b z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-primary" />
              <span className="font-display text-lg">Video {currentIndex + 1}/{questions.length}</span>
            </div>
            <Badge variant="secondary">{totalAnswered}/{totalQuestions} answered</Badge>
          </div>
          <Progress value={progress} className="h-1 mt-2" />
        </div>
      </div>

      <main className="pt-24 pb-32 container mx-auto px-4 max-w-3xl">
        {current && (
          <AnimatePresence mode="wait">
            <motion.div key={current.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {/* Video player */}
              <Card className="mb-6">
                <CardContent className="p-0">
                  {current.video_url.startsWith("pending-upload://") ? (
                    <div className="aspect-video bg-muted/30 border-b flex flex-col items-center justify-center gap-3">
                      <Video className="w-12 h-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Video clip pending upload</p>
                    </div>
                  ) : (
                    <video src={current.video_url} controls className="w-full aspect-video object-contain bg-black" preload="metadata" />
                  )}
                  {current.scenario_description && (
                    <div className="p-4 border-t bg-muted/20">
                      <p className="text-sm font-medium">Scenario: <span className="text-muted-foreground font-normal">{current.scenario_description}</span></p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 4 Questions */}
              <div className="space-y-4">
                {qKeys.map((qKey, qi) => (
                  <Card key={qKey} className={videoAnswers[qKey] !== undefined ? "border-primary/30" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{qLabels[qi]}</Badge>
                        <span className="text-xs text-muted-foreground">1 point</span>
                      </div>
                      <CardTitle className="text-base">{(current as any)[qFields[qi]]}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={videoAnswers[qKey]?.toString()}
                        onValueChange={(v) => handleAnswer(current.id, qKey, parseInt(v))}
                        className="space-y-2"
                      >
                        {((current as any)[oFields[qi]] as string[]).map((opt: string, oi: number) => (
                          <div
                            key={oi}
                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                              videoAnswers[qKey] === oi ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                            }`}
                            onClick={() => handleAnswer(current.id, qKey, oi)}
                          >
                            <RadioGroupItem value={oi.toString()} id={`${current.id}-${qKey}-${oi}`} />
                            <Label htmlFor={`${current.id}-${qKey}-${oi}`} className="flex-1 cursor-pointer text-sm">{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Video navigator */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {questions.map((q, i) => {
            const a = answers[q.id];
            const count = a ? Object.keys(a).length : 0;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-10 h-10 rounded text-sm font-medium transition-all ${
                  i === currentIndex ? "bg-primary text-primary-foreground"
                    : count === 4 ? "bg-green-500/20 text-green-600"
                    : count > 0 ? "bg-amber-500/20 text-amber-600"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          {currentIndex === questions.length - 1 ? (
            <Button variant="vault" onClick={handleSubmit} disabled={submitMutation.isPending}>
              {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Video Exam
            </Button>
          ) : (
            <Button variant="vault" onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoExam;
