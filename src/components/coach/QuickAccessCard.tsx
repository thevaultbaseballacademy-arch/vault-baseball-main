import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  delay?: number;
}

const QuickAccessCard = ({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color,
  delay = 0 
}: QuickAccessCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(href)}
      className="w-full p-6 bg-card border border-border rounded-2xl text-left hover:border-accent/50 hover:shadow-lg transition-all group"
    >
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <h3 className="font-display text-xl text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
    </motion.button>
  );
};

export default QuickAccessCard;
