import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { StatusBreakdown } from "@/hooks/useCertificationAnalytics";

interface StatusBreakdownChartProps {
  data: StatusBreakdown;
  isLoading: boolean;
}

const COLORS = {
  Active: "hsl(142, 71%, 45%)",
  Expiring: "hsl(45, 93%, 47%)",
  Expired: "hsl(0, 84%, 60%)",
  Locked: "hsl(0, 0%, 45%)",
};

export const StatusBreakdownChart = ({ data, isLoading }: StatusBreakdownChartProps) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
    color: COLORS[name as keyof typeof COLORS],
  }));

  const total = chartData.reduce((acc, item) => acc + item.value, 0);

  if (isLoading) {
    return (
      <Card className="h-[350px] animate-pulse">
        <CardHeader>
          <div className="h-5 bg-muted rounded w-32" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="w-48 h-48 rounded-full bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[350px]">
      <CardHeader>
        <CardTitle className="text-lg">Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No certification data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value} certifications`, name]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
