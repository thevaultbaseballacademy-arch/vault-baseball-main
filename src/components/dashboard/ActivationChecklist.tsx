import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Circle, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ActivationStep {
  key: string;
  label: string;
  route: string;
  completed: boolean;
}

interface Props {
  userId: string;
}

const ActivationChecklist = ({ userId }: Props) => {
  const [steps, setSteps] = useState<ActivationStep[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkActivation();
  }, [userId]);

  const checkActivation = async () => {
    const [eventsRes, checkinsRes, kpisRes, lessonsRes, homeworkRes, assignmentsRes] = await Promise.all([
      supabase.from('activation_events').select('event_type').eq('user_id', userId),
      supabase.from('athlete_checkins').select('id').eq('user_id', userId).limit(1),
      supabase.from('athlete_kpis').select('id').eq('user_id', userId).limit(1),
      supabase.from('remote_lessons').select('id').eq('athlete_user_id', userId).limit(1),
      supabase.from('player_homework').select('id').eq('athlete_user_id', userId).eq('is_completed', true).limit(1),
      supabase.from('coach_athlete_assignments').select('id').eq('athlete_user_id', userId).eq('is_active', true).limit(1),
    ]);

    const events = new Set((eventsRes.data || []).map(e => e.event_type));

    setSteps([
      { key: 'onboarding', label: 'Complete your profile', route: '/athlete-onboarding', completed: events.has('onboarding_complete') },
      { key: 'checkin', label: 'Log your first check-in', route: '/checkin', completed: (checkinsRes.data?.length || 0) > 0 },
      { key: 'kpi', label: 'Record a baseline KPI', route: '/velocity-baseline', completed: (kpisRes.data?.length || 0) > 0 },
      { key: 'coach', label: 'Connect with a coach', route: '/find-coach', completed: (assignmentsRes.data?.length || 0) > 0 },
      { key: 'drill', label: 'Complete your first drill', route: '/dashboard', completed: (homeworkRes.data?.length || 0) > 0 },
      { key: 'lesson', label: 'Book your first lesson', route: '/book-session', completed: (lessonsRes.data?.length || 0) > 0 },
    ]);
    setLoading(false);
  };

  if (loading) return null;

  const completedCount = steps.filter(s => s.completed).length;
  const allDone = completedCount === steps.length;

  if (allDone) return null; // Hide when fully activated

  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-accent" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Get Started</p>
        </div>
        <span className="text-xs font-medium text-accent">{progressPct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <button
            key={step.key}
            onClick={() => !step.completed && navigate(step.route)}
            disabled={step.completed}
            className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
              step.completed 
                ? 'opacity-60' 
                : 'hover:bg-secondary cursor-pointer'
            }`}
          >
            {step.completed ? (
              <Check className="w-4 h-4 text-green-500 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <span className={`text-sm flex-1 ${step.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {step.label}
            </span>
            {!step.completed && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default ActivationChecklist;
