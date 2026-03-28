import { Users, Trophy, Heart } from "lucide-react";

type Role = "athlete" | "coach" | "parent";

interface RoleSelectorProps {
  value: Role;
  onChange: (role: Role) => void;
}

const RoleSelector = ({ value, onChange }: RoleSelectorProps) => {
  const roles = [
    { key: "athlete" as const, icon: Trophy, label: "Athlete", desc: "Train & develop" },
    { key: "parent" as const, icon: Heart, label: "Parent", desc: "Support my athlete" },
    { key: "coach" as const, icon: Users, label: "Coach", desc: "Coach athletes" },
  ];

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground">I am a...</label>
      <div className="grid grid-cols-3 gap-2">
        {roles.map(({ key, icon: Icon, label, desc }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex flex-col items-center gap-1 p-2.5 border rounded-lg transition-all text-center text-sm
              ${value === key
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:border-foreground/20"
              }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <p className="font-medium text-xs">{label}</p>
            <p className="text-[10px] opacity-70 leading-tight">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;
