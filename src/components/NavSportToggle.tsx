import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useSport, SoftballFormat } from "@/contexts/SportContext";
import { SportType } from "@/lib/sportTypes";

const NavSportToggle = () => {
  const { sport, softballFormat, setSport, setSoftballFormat } = useSport();
  const [switching, setSwitching] = useState(false);

  const handleToggle = async (newSport: SportType) => {
    if (newSport === sport || switching) return;
    setSwitching(true);
    try {
      await setSport(newSport);
    } finally {
      setSwitching(false);
    }
  };

  const handleFormatToggle = async (format: SoftballFormat) => {
    if (format === softballFormat || switching) return;
    setSwitching(true);
    try {
      await setSoftballFormat(format);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Main sport toggle */}
      <div className="flex items-center bg-secondary rounded-lg p-0.5 relative">
        <button
          onClick={() => handleToggle("baseball")}
          className={`relative z-10 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            sport === "baseball"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/70"
          }`}
          disabled={switching}
          title="Baseball"
        >
          ⚾
          <span className="hidden sm:inline">Baseball</span>
        </button>
        <button
          onClick={() => handleToggle("softball")}
          className={`relative z-10 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            sport === "softball"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/70"
          }`}
          disabled={switching}
          title="Softball"
        >
          🥎
          <span className="hidden sm:inline">Softball</span>
        </button>

        {/* Sliding indicator */}
        <motion.div
          className="absolute top-0.5 bottom-0.5 rounded-md bg-background shadow-sm border border-border"
          initial={false}
          animate={{
            left: sport === "baseball" ? "2px" : "50%",
            width: "calc(50% - 4px)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </div>

      {/* Softball format sub-toggle */}
      <AnimatePresence>
        {sport === "softball" && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center bg-secondary/60 rounded-md p-0.5 ml-0.5">
              <button
                onClick={() => handleFormatToggle("fastpitch")}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  softballFormat === "fastpitch"
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground/70"
                }`}
                disabled={switching}
              >
                Fastpitch
              </button>
              <button
                onClick={() => handleFormatToggle("slowpitch")}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  softballFormat === "slowpitch"
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground/70"
                }`}
                disabled={switching}
              >
                Slowpitch
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {switching && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
    </div>
  );
};

export default NavSportToggle;
