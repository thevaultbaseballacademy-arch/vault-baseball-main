import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, 
  Clock, 
  Lock, 
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { KPIData } from "@/hooks/useCertificationAnalytics";

interface KPICardsProps {
  data: KPIData;
  isLoading: boolean;
}

export const KPICards = ({ data, isLoading }: KPICardsProps) => {
  const cards = [
    {
      title: "Certification Compliance",
      value: `${data.compliancePercent}%`,
      icon: CheckCircle,
      color: data.compliancePercent >= 80 ? "text-green-500" : data.compliancePercent >= 60 ? "text-yellow-500" : "text-destructive",
      bgColor: data.compliancePercent >= 80 ? "bg-green-500/10" : data.compliancePercent >= 60 ? "bg-yellow-500/10" : "bg-destructive/10",
    },
    {
      title: "Expiring in 30 Days",
      value: data.expiringIn30Days.toString(),
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Access Locked",
      value: data.accessLocked.toString(),
      icon: Lock,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Pass Rate (90 days)",
      value: `${data.passRate90Days}%`,
      icon: TrendingUp,
      color: data.passRate90Days >= 80 ? "text-green-500" : "text-yellow-500",
      bgColor: data.passRate90Days >= 80 ? "bg-green-500/10" : "bg-yellow-500/10",
    },
    {
      title: "Risk Index (Avg)",
      value: data.avgRiskIndex.toString(),
      icon: AlertTriangle,
      color: data.avgRiskIndex <= 20 ? "text-green-500" : data.avgRiskIndex <= 40 ? "text-yellow-500" : "text-destructive",
      bgColor: data.avgRiskIndex <= 20 ? "bg-green-500/10" : data.avgRiskIndex <= 40 ? "bg-yellow-500/10" : "bg-destructive/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-display ${card.color}`}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
