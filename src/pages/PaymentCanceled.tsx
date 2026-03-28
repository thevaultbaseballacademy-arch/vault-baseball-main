import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PaymentCanceled = () => {
  const openEddie = () => {
    const btn = document.querySelector('[aria-label="Ask Eddie AI"]') as HTMLButtonElement;
    if (btn) btn.click();
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto text-center space-y-8"
          >
            <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto">
              <span className="text-2xl font-display text-muted-foreground">X</span>
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-display text-foreground mb-3">
                CHECKOUT CANCELED
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                No charges were made. Your cart is still waiting if you want to come back.
              </p>
            </div>

            {/* Reassurance */}
            <div className="bg-card border border-border p-6 text-left space-y-3">
              <p className="text-[11px] font-display tracking-[0.25em] text-muted-foreground">NOT SURE YET?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you have questions about which product is right for your athlete, talk to Eddie. He'll walk you through the options based on your goals — no pressure, no upsell.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="vault" size="lg" className="w-full" onClick={openEddie}>
                <MessageCircle className="w-4 h-4 mr-2" />
                ASK EDDIE AI
              </Button>
              <Link to="/">
                <Button variant="vaultOutline" size="lg" className="w-full">
                  RETURN HOME
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default PaymentCanceled;
