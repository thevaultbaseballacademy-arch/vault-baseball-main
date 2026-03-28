import { useState } from "react";
import { SportType, allSportTypes, sportConfigs } from "@/lib/sportTypes";

interface SportSelectorProps {
  value: SportType;
  onChange: (sport: SportType) => void;
}

const SportSelector = ({ value, onChange }: SportSelectorProps) => {
  const [both, setBoth] = useState(false);

  const handleSelect = (sportId: SportType | "both") => {
    if (sportId === "both") {
      setBoth(true);
      // Default to baseball when "both" is selected — user can toggle later
      onChange("baseball");
    } else {
      setBoth(false);
      onChange(sportId);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground">Choose Your Sport</label>
      <div className="grid grid-cols-3 gap-2">
        {allSportTypes.map((sportId) => {
          const config = sportConfigs[sportId];
          const isActive = !both && value === sportId;
          return (
            <button
              key={sportId}
              type="button"
              onClick={() => handleSelect(sportId)}
              className={`flex flex-col items-center gap-1 p-2.5 border rounded-lg transition-all text-center
                ${isActive
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/20"
                }`}
            >
              <span className="text-xl">{config.icon}</span>
              <p className="font-medium text-xs">{config.displayName}</p>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => handleSelect("both")}
          className={`flex flex-col items-center gap-1 p-2.5 border rounded-lg transition-all text-center
            ${both
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border text-muted-foreground hover:border-foreground/20"
            }`}
        >
          <span className="text-xl">⚾🥎</span>
          <p className="font-medium text-xs">Both</p>
        </button>
      </div>
      {both && (
        <p className="text-[10px] text-muted-foreground">
          You can switch between sports anytime using the toggle in the navigation bar.
        </p>
      )}
    </div>
  );
};

export default SportSelector;
