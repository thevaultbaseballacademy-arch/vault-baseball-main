import { useState, useEffect } from "react";
import { CheckCircle2, Circle, ClipboardList, Loader2, Dumbbell, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

interface HomeworkItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  is_completed: boolean;
  completed_at: string | null;
  due_date: string | null;
  sort_order: number;
}

export const PlayerHomeworkChecklist = ({ userId }: { userId: string }) => {
  const [items, setItems] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    fetchHomework();

    const channel = supabase
      .channel("homework-updates")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "player_homework",
        filter: `athlete_user_id=eq.${userId}`,
      }, () => fetchHomework())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const fetchHomework = async () => {
    const { data, error } = await supabase
      .from("player_homework")
      .select("id, title, description, category, is_completed, completed_at, due_date, sort_order")
      .eq("athlete_user_id", userId)
      .order("is_completed", { ascending: true })
      .order("sort_order", { ascending: true })
      .limit(20);

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const toggleItem = async (item: HomeworkItem) => {
    const newCompleted = !item.is_completed;
    
    // Optimistic update
    setItems(prev => prev.map(i => 
      i.id === item.id 
        ? { ...i, is_completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
        : i
    ));

    const { error } = await supabase
      .from("player_homework")
      .update({
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq("id", item.id);

    if (error) {
      // Revert
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) return null;

  const completed = items.filter(i => i.is_completed).length;
  const total = items.length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case "drill": return <Dumbbell className="w-4 h-4 text-primary" />;
      case "focus": return <Target className="w-4 h-4 text-accent" />;
      default: return <ClipboardList className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            WEEKLY HOMEWORK
          </CardTitle>
          <Badge variant={progressPercent === 100 ? "default" : "secondary"}>
            {completed}/{total} Done
          </Badge>
        </div>
        <Progress value={progressPercent} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence>
          {items.map(item => (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                item.is_completed
                  ? "bg-muted/30 border-border/50"
                  : "bg-card border-border hover:border-primary/30"
              }`}
              onClick={() => toggleItem(item)}
            >
              {item.is_completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
              {categoryIcon(item.category)}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                )}
              </div>
              {item.due_date && !item.is_completed && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  Due {new Date(item.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
