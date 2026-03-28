import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useSport } from "@/contexts/SportContext";
import { SportType, allSportTypes, sportConfigs } from "@/lib/sportTypes";
import { useToast } from "@/hooks/use-toast";

const SportSwitcher = () => {
  const { sport, setSport } = useSport();
  const [switching, setSwitching] = useState(false);
  const { toast } = useToast();

  const handleSwitch = async (newSport: SportType) => {
    if (newSport === sport) return;
    setSwitching(true);
    try {
      await setSport(newSport);
      toast({
        title: "Sport Updated",
        description: `Switched to ${sportConfigs[newSport].displayName}. Your content will now reflect ${sportConfigs[newSport].displayName}-specific training.`,
      });
    } catch {
      toast({ title: "Error", description: "Failed to update sport preference", variant: "destructive" });
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
          {sportConfigs[sport].icon}
        </div>
        <div>
          <h2 className="text-xl font-display text-foreground">Sport Preference</h2>
          <p className="text-muted-foreground text-sm">Choose your primary sport for personalized content</p>
        </div>
      </div>

      {switching && (
        <div className="flex items-center gap-2 mb-4 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Switching sport...
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {allSportTypes.map((sportId) => {
          const config = sportConfigs[sportId];
          const isActive = sport === sportId;
          return (
            <button
              key={sportId}
              onClick={() => handleSwitch(sportId)}
              disabled={switching}
              className={`flex flex-col items-center gap-2 p-4 border rounded-xl transition-all
                ${isActive
                  ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20"
                  : "border-border text-muted-foreground hover:border-foreground/20"
                }
                disabled:opacity-50`}
            >
              <span className="text-3xl">{config.icon}</span>
              <p className="font-display text-lg">{config.displayName}</p>
              {isActive && (
                <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SportSwitcher;
