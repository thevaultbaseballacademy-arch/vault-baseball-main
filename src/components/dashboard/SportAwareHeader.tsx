import { useSport } from "@/contexts/SportContext";
import { Badge } from "@/components/ui/badge";

interface SportAwareHeaderProps {
  baseTitle: string;
  subtitle?: string;
}

const SportAwareHeader = ({ baseTitle, subtitle }: SportAwareHeaderProps) => {
  const { sport, sportConfig, softballFormat } = useSport();

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-display text-foreground">
            {baseTitle}
          </h1>
          <Badge variant="outline" className="text-xs font-medium gap-1">
            {sportConfig.icon} {sportConfig.displayName}
            {sport === "softball" && (
              <span className="text-muted-foreground ml-0.5">
                • {softballFormat === "fastpitch" ? "Fastpitch" : "Slowpitch"}
              </span>
            )}
          </Badge>
        </div>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default SportAwareHeader;
