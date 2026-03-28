import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Layers, Sparkles } from "lucide-react";
import { softballTrainingSystems, softballAdditionalSystems } from "@/lib/softball/courseData";

const SoftballCourses = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/softball")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Softball
          </Button>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <p className="text-xs font-display tracking-[0.3em] text-muted-foreground mb-2">VAULT SOFTBALL</p>
            <h1 className="text-3xl md:text-4xl font-display tracking-tight text-foreground">
              🥎 SOFTBALL TRAINING SYSTEMS
            </h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xl">
              Structured courses built for fastpitch athletes — from windmill pitching to elite defensive play.
            </p>
          </motion.div>

          {/* Main Training Systems */}
          <div className="space-y-4 mb-12">
            {softballTrainingSystems.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border hover:border-foreground/20 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/course/${course.courseId}`)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] font-display tracking-wider">
                            PILLAR {course.pillar}
                          </Badge>
                          {course.isNew && (
                            <Badge className="text-[10px] font-display tracking-wider bg-primary text-primary-foreground">
                              <Sparkles className="w-3 h-3 mr-1" /> NEW
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-display text-lg text-foreground mt-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {course.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" /> {course.modules} Modules
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {course.metrics.map(m => (
                            <Badge key={m} variant="secondary" className="text-[10px] font-display tracking-wider">
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon */}
          <div>
            <p className="text-xs font-display tracking-[0.2em] text-muted-foreground mb-4">COMING SOON</p>
            <div className="grid md:grid-cols-3 gap-3">
              {softballAdditionalSystems.map((sys, i) => (
                <Card key={i} className="border-border opacity-60">
                  <CardContent className="p-4">
                    <p className={`text-xs font-display tracking-wider ${sys.color} mb-1`}>PILLAR {sys.pillar}</p>
                    <h4 className="font-display text-sm text-foreground">{sys.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{sys.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default SoftballCourses;
