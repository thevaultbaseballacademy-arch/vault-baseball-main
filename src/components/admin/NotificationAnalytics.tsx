import { useState, useEffect } from "react";
import { 
  BarChart3, TrendingUp, Eye, MousePointer, Bell, 
  Loader2, Calendar, ArrowUp, ArrowDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface AnalyticsSummary {
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalDismissed: number;
  openRate: number;
  clickRate: number;
}

interface DailyStats {
  date: string;
  delivered: number;
  opened: number;
  clicked: number;
}

interface TypeBreakdown {
  type: string;
  count: number;
  openRate: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(142, 76%, 36%)', 'hsl(45, 93%, 47%)'];

const NotificationAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalDismissed: 0,
    openRate: 0,
    clickRate: 0
  });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [typeBreakdown, setTypeBreakdown] = useState<TypeBreakdown[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = startOfDay(subDays(new Date(), days)).toISOString();
    const endDate = endOfDay(new Date()).toISOString();

    try {
      // Fetch all analytics events in date range
      const { data: events, error } = await supabase
        .from('notification_analytics')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      // Fetch notifications for type breakdown
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id, type, created_at')
        .gte('created_at', startDate);

      // Calculate summary stats
      const delivered = events?.filter(e => e.event_type === 'delivered').length || 0;
      const opened = events?.filter(e => e.event_type === 'opened').length || 0;
      const clicked = events?.filter(e => e.event_type === 'clicked').length || 0;
      const dismissed = events?.filter(e => e.event_type === 'dismissed').length || 0;

      // Use total notifications as delivered if no explicit delivered events
      const totalNotifications = notifications?.length || 0;
      const effectiveDelivered = delivered || totalNotifications;

      setSummary({
        totalDelivered: effectiveDelivered,
        totalOpened: opened,
        totalClicked: clicked,
        totalDismissed: dismissed,
        openRate: effectiveDelivered > 0 ? Math.round((opened / effectiveDelivered) * 100) : 0,
        clickRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0
      });

      // Calculate daily stats
      const dailyMap: Record<string, DailyStats> = {};
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), i), 'MMM dd');
        dailyMap[date] = { date, delivered: 0, opened: 0, clicked: 0 };
      }

      events?.forEach(event => {
        const date = format(new Date(event.created_at), 'MMM dd');
        if (dailyMap[date]) {
          if (event.event_type === 'delivered') dailyMap[date].delivered++;
          if (event.event_type === 'opened') dailyMap[date].opened++;
          if (event.event_type === 'clicked') dailyMap[date].clicked++;
        }
      });

      // Also count notifications as delivered if no explicit delivered events
      notifications?.forEach(notification => {
        const date = format(new Date(notification.created_at), 'MMM dd');
        if (dailyMap[date] && delivered === 0) {
          dailyMap[date].delivered++;
        }
      });

      setDailyStats(Object.values(dailyMap).reverse());

      // Calculate type breakdown
      const typeMap: Record<string, { total: number; opened: number }> = {};
      
      notifications?.forEach(notification => {
        const type = notification.type || 'unknown';
        if (!typeMap[type]) typeMap[type] = { total: 0, opened: 0 };
        typeMap[type].total++;
      });

      events?.filter(e => e.event_type === 'opened').forEach(event => {
        const notification = notifications?.find(n => n.id === event.notification_id);
        if (notification) {
          const type = notification.type || 'unknown';
          if (typeMap[type]) typeMap[type].opened++;
        }
      });

      setTypeBreakdown(
        Object.entries(typeMap).map(([type, data]) => ({
          type: formatTypeName(type),
          count: data.total,
          openRate: data.total > 0 ? Math.round((data.opened / data.total) * 100) : 0
        }))
      );

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTypeName = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as '7d' | '30d' | '90d')}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Bell className="w-4 h-4" />
              <span className="text-sm">Delivered</span>
            </div>
            <p className="text-3xl font-display text-foreground">{summary.totalDelivered}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Opened</span>
            </div>
            <p className="text-3xl font-display text-foreground">{summary.totalOpened}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-xs font-medium ${summary.openRate >= 50 ? 'text-green-600' : 'text-amber-600'}`}>
                {summary.openRate}% rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MousePointer className="w-4 h-4" />
              <span className="text-sm">Clicked</span>
            </div>
            <p className="text-3xl font-display text-foreground">{summary.totalClicked}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-xs font-medium ${summary.clickRate >= 30 ? 'text-green-600' : 'text-amber-600'}`}>
                {summary.clickRate}% CTR
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Engagement</span>
            </div>
            <p className="text-3xl font-display text-foreground">
              {summary.totalDelivered > 0 
                ? Math.round(((summary.totalOpened + summary.totalClicked) / summary.totalDelivered) * 100)
                : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Daily Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyStats}>
                  <defs>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="delivered"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorDelivered)"
                    name="Delivered"
                  />
                  <Area
                    type="monotone"
                    dataKey="opened"
                    stroke="hsl(var(--accent))"
                    fillOpacity={1}
                    fill="url(#colorOpened)"
                    name="Opened"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              By Notification Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeBreakdown.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeBreakdown} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="type" 
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'count' ? `${value} sent` : `${value}%`,
                        name === 'count' ? 'Total' : 'Open Rate'
                      ]}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Type Stats */}
      {typeBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typeBreakdown.map((item, index) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-foreground">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Sent</p>
                      <p className="text-lg font-medium text-foreground">{item.count}</p>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="text-sm text-muted-foreground">Open Rate</p>
                      <p className={`text-lg font-medium ${item.openRate >= 50 ? 'text-green-600' : 'text-amber-600'}`}>
                        {item.openRate}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationAnalytics;
