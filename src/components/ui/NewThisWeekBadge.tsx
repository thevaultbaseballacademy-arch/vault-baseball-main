import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { isWithinInterval, subDays } from "date-fns";

interface NewThisWeekBadgeProps {
  createdAt?: string | Date;
  forceShow?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "floating" | "inline";
  className?: string;
}

/**
 * Displays a "New This Week" badge for fresh content
 * Automatically hides after 7 days unless forceShow is true
 */
const NewThisWeekBadge = ({ 
  createdAt, 
  forceShow = false, 
  size = "md",
  variant = "default",
  className = ""
}: NewThisWeekBadgeProps) => {
  // Check if content is within the last 7 days
  const isNew = forceShow || (createdAt && isWithinInterval(new Date(createdAt), {
    start: subDays(new Date(), 7),
    end: new Date()
  }));

  if (!isNew) return null;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const variantClasses = {
    default: "relative",
    floating: "absolute top-2 right-2 z-10",
    inline: "inline-flex",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 15,
        delay: 0.2
      }}
      className={`${variantClasses[variant]} ${className}`}
    >
      <div 
        className={`
          inline-flex items-center font-medium uppercase tracking-wider
          bg-gradient-to-r from-emerald-500 to-teal-500 
          text-white rounded-full shadow-lg
          ${sizeClasses[size]}
        `}
      >
        <motion.div
          animate={{ 
            rotate: [0, 15, -15, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatDelay: 3 
          }}
        >
          <Sparkles className={iconSizes[size]} />
        </motion.div>
        <span>New This Week</span>
      </div>
      
      {/* Subtle glow effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur-md -z-10"
        aria-hidden="true"
      />
    </motion.div>
  );
};

export default NewThisWeekBadge;