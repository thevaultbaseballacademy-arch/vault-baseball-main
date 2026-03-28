import { motion } from "framer-motion";
import { 
  Target, Shield, Diamond, Circle, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NewThisWeekBadge from "@/components/ui/NewThisWeekBadge";
import { useSport } from "@/contexts/SportContext";
import { softballPositions } from "@/lib/softball/positions";

interface PositionData {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  courseId: string;
  description: string;
  hasNewContent?: boolean;
}

// Baseball positions (original)
const baseballPositions: PositionData[] = [
  {
    id: "pitching",
    name: "Pitching",
    icon: Target,
    color: "#ef4444",
    courseId: "velocity-system",
    description: "Velocity, arm care, mechanics",
    hasNewContent: true,
  },
  {
    id: "catching",
    name: "Catching",
    icon: Shield,
    color: "#8b5cf6",
    courseId: "catcher-training",
    description: "Receiving, blocking, throws",
    hasNewContent: false,
  },
  {
    id: "infield",
    name: "Infield",
    icon: Diamond,
    color: "#f59e0b",
    courseId: "infield-training",
    description: "Footwork, transfers, throws",
    hasNewContent: true,
  },
  {
    id: "outfield",
    name: "Outfield",
    icon: Circle,
    color: "#22c55e",
    courseId: "outfield-training",
    description: "Routes, jumps, arm strength",
    hasNewContent: false,
  },
  {
    id: "hitting",
    name: "Hitting",
    icon: Zap,
    color: "#3b82f6",
    courseId: "elite-hitting",
    description: "Swing mechanics, approach",
    hasNewContent: false,
  }
];

const PositionShortcuts = () => {
  const navigate = useNavigate();
  const { sport } = useSport();

  const positions: PositionData[] = sport === 'softball' ? softballPositions : baseballPositions;

  const handlePositionClick = (position: PositionData) => {
    navigate(`/courses?position=${position.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-foreground">POSITION DRILLS</h2>
        <span className="text-sm text-muted-foreground">1 click access</span>
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {positions.map((position, index) => (
          <motion.button
            key={position.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePositionClick(position)}
            className="relative flex flex-col items-center p-4 bg-card border border-border rounded-2xl hover:border-accent/50 hover:shadow-lg transition-all group"
          >
            {position.hasNewContent && (
              <NewThisWeekBadge 
                variant="floating" 
                forceShow={true} 
                size="sm" 
                className="!top-1 !right-1"
              />
            )}
            
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:scale-110"
              style={{ backgroundColor: `${position.color}15` }}
            >
              <position.icon 
                className="w-6 h-6 transition-transform" 
                style={{ color: position.color }} 
              />
            </div>
            <span className="font-display text-lg text-foreground">{position.name}</span>
            <span className="text-xs text-muted-foreground text-center mt-1 hidden md:block">
              {position.description}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default PositionShortcuts;
