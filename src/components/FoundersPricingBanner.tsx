import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FoundersPricingBannerProps {
  endDate?: Date; // Default to Wednesday EOD
}

export const FoundersPricingBanner = ({ endDate }: FoundersPricingBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const navigate = useNavigate();

  // Calculate next Wednesday EOD if no endDate provided
  const getNextWednesday = () => {
    const now = new Date();
    const day = now.getDay();
    const daysUntilWed = (3 - day + 7) % 7 || 7; // If today is Wednesday, get next Wednesday
    const nextWed = new Date(now);
    nextWed.setDate(now.getDate() + daysUntilWed);
    nextWed.setHours(23, 59, 59, 999);
    return nextWed;
  };

  const targetDate = endDate || getNextWednesday();

  useEffect(() => {
    // Check if user dismissed the banner
    const dismissed = sessionStorage.getItem('founders_banner_dismissed');
    if (dismissed) {
      setIsVisible(false);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("Offer Ended");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [targetDate]);

  const handleDismiss = () => {
    sessionStorage.setItem('founders_banner_dismissed', 'true');
    setIsVisible(false);
  };

  const handleUpgrade = () => {
    navigate('/products/founders-access');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Zap className="w-4 h-4 shrink-0 animate-pulse" />
              <p className="text-sm font-medium truncate">
                <span className="hidden sm:inline">Founder's Pricing ($499) for the Full VAULT™ OS ends </span>
                <span className="sm:hidden">Founder's Pricing ends </span>
                <span className="font-bold">Wednesday EOD</span>
                {timeLeft && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-primary-foreground/20 rounded text-xs">
                    <Clock className="w-3 h-3" />
                    {timeLeft}
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUpgrade}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
              >
                Upgrade Now
              </Button>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-primary-foreground/20 rounded transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
