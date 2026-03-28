import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface WeeklyTip {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

const WeeklyTipCard = () => {
  const [tips, setTips] = useState<WeeklyTip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTips();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('weekly-tips-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_tips',
        },
        () => {
          fetchTips();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTips = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_tips')
        .select('id, title, content, category, created_at')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTips(data || []);
    } catch (error) {
      console.error('Error fetching tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextTip = () => {
    setCurrentIndex((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'training': return '🏋️';
      case 'recovery': return '💤';
      case 'nutrition': return '🥗';
      case 'mindset': return '🧠';
      case 'technique': return '⚾';
      default: return '💡';
    }
  };

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'training': return 'from-accent/20 to-accent/5';
      case 'recovery': return 'from-blue-500/20 to-blue-500/5';
      case 'nutrition': return 'from-green-500/20 to-green-500/5';
      case 'mindset': return 'from-purple-500/20 to-purple-500/5';
      case 'technique': return 'from-orange-500/20 to-orange-500/5';
      default: return 'from-primary/20 to-primary/5';
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-secondary rounded-lg" />
          <div className="h-5 bg-secondary rounded w-32" />
        </div>
        <div className="h-4 bg-secondary rounded w-full mb-2" />
        <div className="h-4 bg-secondary rounded w-3/4" />
      </div>
    );
  }

  if (tips.length === 0) {
    return null; // Don't render if no tips
  }

  const currentTip = tips[currentIndex];

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${getCategoryGradient(currentTip.category)} border border-border rounded-xl p-6`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
      <Sparkles className="absolute top-4 right-4 w-5 h-5 text-accent/30" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center text-xl">
          {getCategoryIcon(currentTip.category)}
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Weekly Tip
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {currentIndex + 1} of {tips.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTip.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-lg font-display text-foreground mb-2">
            {currentTip.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentTip.content}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {tips.length > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-1.5">
            {tips.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'bg-accent w-6' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevTip}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextTip}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyTipCard;