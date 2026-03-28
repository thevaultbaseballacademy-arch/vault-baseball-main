import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, ProductKey } from "@/lib/productPricing";
import { useEffect, useState } from "react";

interface MobileConversionBarProps {
  productName: string;
  price: number;
  productKey: ProductKey;
  onCheckout: (productKey: ProductKey) => void;
  loading: ProductKey | null;
  ctaText?: string;
}

const MobileConversionBar = ({
  productName,
  price,
  productKey,
  onCheckout,
  loading,
  ctaText = "Buy Now",
}: MobileConversionBarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show bar after scrolling 300px
      const scrolled = window.scrollY > 300;
      
      // Hide when near bottom (footer area)
      const nearBottom = 
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200;
      
      setIsVisible(scrolled && !nearBottom);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLoading = loading === productKey;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
          <div className="bg-background/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3 safe-area-bottom">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted-foreground truncate">
                  {productName}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {formatPrice(price)}
                </span>
              </div>
              <Button
                onClick={() => onCheckout(productKey)}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 h-11 shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  ctaText
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileConversionBar;
