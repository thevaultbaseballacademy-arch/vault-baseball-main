import { motion } from "framer-motion";
import { CheckSquare, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRecruitingProfile } from "@/hooks/useRecruitingProfile";

const RecruitingChecklist = () => {
  const { checklist, toggleChecklistItem, readinessScore, loading } = useRecruitingProfile();

  // Group by category
  const categories = checklist.reduce<Record<string, typeof checklist>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loading) {
    return <main className="min-h-screen bg-background"><Navbar /><div className="pt-24 pb-16 container mx-auto px-4"><div className="h-64 bg-secondary animate-pulse rounded-2xl max-w-3xl mx-auto" /></div></main>;
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/recruiting" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Recruiting Hub
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-display text-foreground">READINESS CHECKLIST</h1>
              <p className="text-sm text-muted-foreground">Track your recruiting preparation progress</p>
            </div>
          </div>

          {/* Score */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display text-foreground">Overall Readiness</p>
              <span className="text-2xl font-display text-amber-500">{readinessScore}%</span>
            </div>
            <Progress value={readinessScore} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {checklist.filter((c) => c.is_completed).length} of {checklist.length} items completed
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            {Object.entries(categories).map(([category, items], ci) => {
              const done = items.filter((i) => i.is_completed).length;
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ci * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-foreground">{category}</h3>
                    <span className="text-xs text-muted-foreground">{done}/{items.length}</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          item.is_completed ? "bg-green-500/5" : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        <Checkbox
                          checked={item.is_completed}
                          onCheckedChange={(v) => toggleChecklistItem(item.id, !!v)}
                          className="mt-0.5"
                        />
                        <span className={`text-sm ${item.is_completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {item.item_label}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default RecruitingChecklist;
