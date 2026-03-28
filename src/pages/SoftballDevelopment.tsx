import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSport } from "@/contexts/SportContext";
import SkillPathway from "@/components/softball/SkillPathway";
import DrillBrowser from "@/components/softball/DrillBrowser";
import AssessmentModule from "@/components/softball/AssessmentModule";
import ProgramBrowser from "@/components/softball/ProgramBrowser";

const SoftballDevelopment = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { sport } = useSport();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect baseball users to regular courses
  if (sport !== 'softball') {
    navigate("/courses");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <span className="text-3xl mb-2 block">🥎</span>
              <h1 className="text-3xl md:text-5xl font-display text-foreground mb-2">
                SOFTBALL DEVELOPMENT
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Structured skill pathways, drill libraries, assessments, and training programs 
                designed specifically for fastpitch softball athletes.
              </p>
            </div>

            {/* Skill Pathways */}
            <SkillPathway />

            {/* Tabbed Content */}
            <Tabs defaultValue="drills" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="drills">🏋️ Drill Library</TabsTrigger>
                <TabsTrigger value="assessments">📋 Assessments</TabsTrigger>
                <TabsTrigger value="programs">📅 Programs</TabsTrigger>
              </TabsList>

              <TabsContent value="drills" className="mt-6">
                <DrillBrowser />
              </TabsContent>

              <TabsContent value="assessments" className="mt-6">
                <AssessmentModule />
              </TabsContent>

              <TabsContent value="programs" className="mt-6">
                <ProgramBrowser />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SoftballDevelopment;
