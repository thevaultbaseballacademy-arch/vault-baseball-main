import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Trophy, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Star,
  Award,
  Target,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  user_id: string | null;
  activity_type: string;
  title: string;
  description: string | null;
  metadata: unknown;
  created_at: string;
}

const activityIcons: Record<string, React.ReactNode> = {
  velocity_gain: <Zap className="w-4 h-4 text-red-500" />,
  community_win: <Trophy className="w-4 h-4 text-amber-500" />,
  new_drill: <BookOpen className="w-4 h-4 text-blue-500" />,
  course_complete: <Award className="w-4 h-4 text-green-500" />,
  certification: <Star className="w-4 h-4 text-purple-500" />,
  goal_achieved: <Target className="w-4 h-4 text-emerald-500" />,
  team_join: <Users className="w-4 h-4 text-cyan-500" />,
  pr_set: <TrendingUp className="w-4 h-4 text-orange-500" />,
};

const activityColors: Record<string, string> = {
  velocity_gain: "from-red-500/10 to-orange-500/10 border-red-500/20",
  community_win: "from-amber-500/10 to-yellow-500/10 border-amber-500/20",
  new_drill: "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
  course_complete: "from-green-500/10 to-emerald-500/10 border-green-500/20",
  certification: "from-purple-500/10 to-pink-500/10 border-purple-500/20",
  goal_achieved: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
  team_join: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20",
  pr_set: "from-orange-500/10 to-red-500/10 border-orange-500/20",
};

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Fetch initial activities
    fetchActivities();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('activity_feed_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
        },
        (payload) => {
          const newActivity = payload.new as ActivityItem;
          setActivities((prev) => [newActivity, ...prev].slice(0, 20));
          // Flash the live indicator
          setIsLive(true);
          setTimeout(() => setIsLive(false), 2000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "just now";
    }
  };

  // Generate sample activities for demo if none exist
  const displayActivities = activities.length > 0 ? activities : [
    {
      id: "demo-1",
      user_id: null,
      activity_type: "velocity_gain",
      title: "Marcus T. hit 87 mph",
      description: "+5 mph in 8 weeks",
      metadata: {},
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: "demo-2",
      user_id: null,
      activity_type: "new_drill",
      title: "New drill added",
      description: "Advanced Arm Care Protocol",
      metadata: {},
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: "demo-3",
      user_id: null,
      activity_type: "community_win",
      title: "Jake R. committed",
      description: "University of Florida",
      metadata: {},
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "demo-4",
      user_id: null,
      activity_type: "course_complete",
      title: "Ryan M. completed course",
      description: "12-Week Velocity System",
      metadata: {},
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "demo-5",
      user_id: null,
      activity_type: "pr_set",
      title: "Dylan K. set new PR",
      description: "Exit velo: 98 mph",
      metadata: {},
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: "demo-6",
      user_id: null,
      activity_type: "certification",
      title: "Coach Mike earned certification",
      description: "VAULT™ Performance Certified",
      metadata: {},
      created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-display text-foreground">Live Activity</h2>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ 
              scale: isLive ? [1, 1.2, 1] : 1,
              opacity: 1 
            }}
            className="flex items-center gap-2"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs text-muted-foreground">Live</span>
          </motion.div>
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {displayActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-4 bg-gradient-to-r ${activityColors[activity.activity_type] || "from-secondary to-secondary"} hover:bg-secondary/50 transition-colors`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {activityIcons[activity.activity_type] || <Activity className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {getTimeAgo(activity.created_at)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-secondary/30">
        <p className="text-xs text-center text-muted-foreground">
          Updates in real-time as athletes train
        </p>
      </div>
    </div>
  );
};

export default LiveActivityFeed;