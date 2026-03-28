import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles, BookOpen, Dumbbell, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUpsellEngine, UpsellOffer } from "@/hooks/useUpsellEngine";
import { useActivationTracking } from "@/hooks/useActivationTracking";

const iconMap: Record<string, typeof Sparkles> = {
  coaching: Users,
  program: Dumbbell,
  course: BookOpen,
  subscription: Sparkles,
  upgrade: Sparkles,
};

interface Props {
  userId: string;
}

const UpsellCards = ({ userId }: Props) => {
  const { offers, dismissOffer, convertOffer } = useUpsellEngine(userId);
  const { track } = useActivationTracking();
  const navigate = useNavigate();

  if (offers.length === 0) return null;

  const handleClick = (offer: UpsellOffer) => {
    convertOffer(offer.id);
    track('upsell_clicked', { offer_key: offer.offer_key, offer_type: offer.offer_type });
    navigate(offer.cta_route);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Recommended for You</p>
      <AnimatePresence>
        {offers.map((offer) => {
          const Icon = iconMap[offer.offer_type] || Sparkles;
          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative bg-card border border-accent/20 rounded-xl p-4 group"
            >
              <button
                onClick={() => dismissOffer(offer.id)}
                className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{offer.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{offer.description}</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0 h-auto mt-1.5 text-accent"
                    onClick={() => handleClick(offer)}
                  >
                    {offer.cta_label} <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default UpsellCards;
