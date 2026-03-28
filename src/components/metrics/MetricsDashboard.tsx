import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp, Target, Zap, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDeviceMetrics } from "@/hooks/useDeviceMetrics";
import { DEVICE_CONFIG, type DeviceType, type DeviceMetric } from "@/types/deviceMetrics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { VaultPowerMetricCard } from "./VaultPowerMetricCard";
import { VerifiedBadge } from "./VerifiedBadge";

interface MetricsDashboardProps {
  userId: string;
}

function MetricCard({ label, value, unit, trend, color, verified }: {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number;
  color?: string;
  verified?: boolean;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          {verified && (
            <Shield className="w-3 h-3 text-velocity" />
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-display font-bold" style={{ color }}>
            {value}
          </span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${trend >= 0 ? 'text-longevity' : 'text-velocity'}`}>
            <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend).toFixed(1)}% from last session</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MetricsDashboard({ userId }: MetricsDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pitching' | 'hitting' | 'throwing'>('all');
  
  const { data: metrics = [], isLoading } = useDeviceMetrics(
    userId, 
    selectedCategory === 'all' ? undefined : selectedCategory
  );
  
  // Calculate aggregated stats
  const stats = useMemo(() => {
    if (!metrics.length) return null;
    
    const pitchingMetrics = metrics.filter(m => m.metric_category === 'pitching');
    const hittingMetrics = metrics.filter(m => m.metric_category === 'hitting');
    
    const avgVelo = pitchingMetrics.length > 0
      ? pitchingMetrics.filter(m => m.velocity_mph).reduce((sum, m) => sum + (m.velocity_mph || 0), 0) / pitchingMetrics.filter(m => m.velocity_mph).length
      : null;
    
    const avgSpinRate = pitchingMetrics.length > 0
      ? pitchingMetrics.filter(m => m.spin_rate_rpm).reduce((sum, m) => sum + (m.spin_rate_rpm || 0), 0) / pitchingMetrics.filter(m => m.spin_rate_rpm).length
      : null;
    
    const avgExitVelo = hittingMetrics.length > 0
      ? hittingMetrics.filter(m => m.exit_velocity_mph).reduce((sum, m) => sum + (m.exit_velocity_mph || 0), 0) / hittingMetrics.filter(m => m.exit_velocity_mph).length
      : null;
    
    const avgBatSpeed = hittingMetrics.length > 0
      ? hittingMetrics.filter(m => m.bat_speed_mph).reduce((sum, m) => sum + (m.bat_speed_mph || 0), 0) / hittingMetrics.filter(m => m.bat_speed_mph).length
      : null;
    
    const maxVelo = pitchingMetrics.length > 0
      ? Math.max(...pitchingMetrics.filter(m => m.velocity_mph).map(m => m.velocity_mph || 0))
      : null;
    
    const maxExitVelo = hittingMetrics.length > 0
      ? Math.max(...hittingMetrics.filter(m => m.exit_velocity_mph).map(m => m.exit_velocity_mph || 0))
      : null;
    
    return {
      avgVelo: avgVelo?.toFixed(1),
      avgSpinRate: avgSpinRate?.toFixed(0),
      avgExitVelo: avgExitVelo?.toFixed(1),
      avgBatSpeed: avgBatSpeed?.toFixed(1),
      maxVelo: maxVelo?.toFixed(1),
      maxExitVelo: maxExitVelo?.toFixed(1),
      totalSessions: new Set(metrics.map(m => m.session_id || m.recorded_at.slice(0, 10))).size,
      totalMetrics: metrics.length
    };
  }, [metrics]);
  
  // Prepare chart data
  const chartData = useMemo(() => {
    const grouped = metrics.reduce((acc, m) => {
      const date = m.recorded_at.slice(0, 10);
      if (!acc[date]) {
        acc[date] = { date, velocities: [], exitVelos: [] };
      }
      if (m.velocity_mph) acc[date].velocities.push(m.velocity_mph);
      if (m.exit_velocity_mph) acc[date].exitVelos.push(m.exit_velocity_mph);
      return acc;
    }, {} as Record<string, { date: string; velocities: number[]; exitVelos: number[] }>);
    
    return Object.values(grouped)
      .map(g => ({
        date: g.date,
        avgVelo: g.velocities.length > 0 ? g.velocities.reduce((a, b) => a + b, 0) / g.velocities.length : null,
        avgExitVelo: g.exitVelos.length > 0 ? g.exitVelos.reduce((a, b) => a + b, 0) / g.exitVelos.length : null
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);
  }, [metrics]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (!metrics.length) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-display text-lg font-bold mb-2">No Metrics Yet</h3>
        <p className="text-muted-foreground">
          Add your first metrics manually, import from CSV, or connect your devices.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as typeof selectedCategory)}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pitching">Pitching</TabsTrigger>
          <TabsTrigger value="hitting">Hitting</TabsTrigger>
          <TabsTrigger value="throwing">Throwing</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* VAULT Power Metrics */}
      <VaultPowerMetricCard metrics={metrics} />
      
      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.maxVelo && (
            <MetricCard 
              label="Max Velocity" 
              value={stats.maxVelo} 
              unit="mph"
              color="hsl(var(--vault-velocity))"
              verified={metrics.some(m => m.import_source === 'api' && m.velocity_mph)}
            />
          )}
          {stats.avgSpinRate && (
            <MetricCard 
              label="Avg Spin Rate" 
              value={stats.avgSpinRate} 
              unit="rpm"
              color="hsl(var(--vault-athleticism))"
              verified={metrics.some(m => m.import_source === 'api' && m.spin_rate_rpm)}
            />
          )}
          {stats.maxExitVelo && (
            <MetricCard 
              label="Max Exit Velo" 
              value={stats.maxExitVelo} 
              unit="mph"
              color="hsl(var(--vault-utility))"
              verified={metrics.some(m => m.import_source === 'api' && m.exit_velocity_mph)}
            />
          )}
          {stats.avgBatSpeed && (
            <MetricCard 
              label="Avg Bat Speed" 
              value={stats.avgBatSpeed} 
              unit="mph"
              color="hsl(var(--vault-longevity))"
              verified={metrics.some(m => m.import_source === 'api' && m.bat_speed_mph)}
            />
          )}
        </div>
      )}
      
      {/* Trend chart */}
      {chartData.length > 1 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-wider text-sm">
              Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 0
                  }}
                />
                {chartData.some(d => d.avgVelo) && (
                  <Line 
                    type="monotone" 
                    dataKey="avgVelo" 
                    name="Pitch Velocity"
                    stroke="hsl(var(--vault-velocity))" 
                    strokeWidth={2}
                    dot={false}
                  />
                )}
                {chartData.some(d => d.avgExitVelo) && (
                  <Line 
                    type="monotone" 
                    dataKey="avgExitVelo" 
                    name="Exit Velocity"
                    stroke="hsl(var(--vault-utility))" 
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      
      {/* Recent metrics table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wider text-sm flex items-center justify-between">
            <span>Recent Metrics</span>
            <Badge variant="secondary">{metrics.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-display text-xs uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="text-left py-2 px-2 font-display text-xs uppercase tracking-wider text-muted-foreground">Device</th>
                  <th className="text-left py-2 px-2 font-display text-xs uppercase tracking-wider text-muted-foreground">Category</th>
                  <th className="text-left py-2 px-2 font-display text-xs uppercase tracking-wider text-muted-foreground">Key Metric</th>
                  <th className="text-left py-2 px-2 font-display text-xs uppercase tracking-wider text-muted-foreground">Source</th>
                </tr>
              </thead>
              <tbody>
                {metrics.slice(0, 20).map((metric) => (
                  <tr key={metric.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-2 px-2 text-muted-foreground">
                      {new Date(metric.recorded_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2">
                      <span className="flex items-center gap-1">
                        {DEVICE_CONFIG[metric.device_type].logo}
                        <span className="text-xs">{DEVICE_CONFIG[metric.device_type].name}</span>
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <Badge variant="outline" className="text-xs uppercase">
                        {metric.metric_category}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 font-mono">
                      {metric.velocity_mph && `${metric.velocity_mph} mph`}
                      {metric.exit_velocity_mph && `${metric.exit_velocity_mph} mph EV`}
                      {metric.bat_speed_mph && `${metric.bat_speed_mph} mph bat`}
                      {metric.measured_velocity_mph && `${metric.measured_velocity_mph} mph`}
                    </td>
                    <td className="py-2 px-2">
                      <VerifiedBadge source={metric.import_source} showLabel />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
