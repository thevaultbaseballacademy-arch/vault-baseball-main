import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, User, Award } from "lucide-react";
import { useSharedMetrics } from "@/hooks/useDeviceMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import vaultLogo from "@/assets/vault-logo-new.webp";

interface SharedMetricsData {
  error?: string;
  profile?: {
    avatar_url?: string;
    display_name?: string;
    position?: string;
    graduation_year?: number;
    height_inches?: number;
    weight_lbs?: number;
    throwing_arm?: string;
    batting_side?: string;
  };
  pitching_metrics?: Array<{ velocity_mph?: number; spin_rate_rpm?: number }>;
  hitting_metrics?: Array<{ exit_velocity_mph?: number; bat_speed_mph?: number }>;
  throwing_metrics?: Array<{ measured_velocity_mph?: number }>;
}

const SharedMetricsView = () => {
  const { token } = useParams<{ token: string }>();
  const { data: rawData, isLoading, error } = useSharedMetrics(token);
  const data = rawData as SharedMetricsData | null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !data || data.error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <img src={vaultLogo} alt="VAULT" className="h-16 mb-6" />
        <h1 className="font-display text-2xl font-bold mb-2">Invalid or Expired Link</h1>
        <p className="text-muted-foreground">This metrics share link is no longer valid.</p>
      </div>
    );
  }

  const { profile, pitching_metrics, hitting_metrics, throwing_metrics } = data;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <img src={vaultLogo} alt="VAULT" className="h-10" />
          <Badge variant="outline">Verified Athlete Profile</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback>
                <User className="w-10 h-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display text-2xl font-bold">{profile.display_name || 'Athlete'}</h1>
              <div className="flex gap-2 mt-1 text-sm text-muted-foreground">
                {profile.position && <span>{profile.position}</span>}
                {profile.graduation_year && <span>Class of {profile.graduation_year}</span>}
              </div>
              <div className="flex gap-2 mt-2 text-xs">
                {profile.height_inches && (
                  <Badge variant="secondary">
                    {Math.floor(profile.height_inches / 12)}'{profile.height_inches % 12}"
                  </Badge>
                )}
                {profile.weight_lbs && <Badge variant="secondary">{profile.weight_lbs} lbs</Badge>}
                {profile.throwing_arm && <Badge variant="secondary">Throws {profile.throwing_arm}</Badge>}
                {profile.batting_side && <Badge variant="secondary">Bats {profile.batting_side}</Badge>}
              </div>
            </div>
          </motion.div>
        )}

        {/* Pitching Metrics */}
        {pitching_metrics && pitching_metrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-wider text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-vault-velocity" />
                Pitching Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-secondary/30">
                  <p className="text-xs text-muted-foreground uppercase">Max Velocity</p>
                  <p className="text-2xl font-display font-bold text-vault-velocity">
                    {Math.max(...pitching_metrics.filter((m: any) => m.velocity_mph).map((m: any) => m.velocity_mph)).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">mph</p>
                </div>
                <div className="text-center p-4 bg-secondary/30">
                  <p className="text-xs text-muted-foreground uppercase">Avg Spin Rate</p>
                  <p className="text-2xl font-display font-bold">
                    {(pitching_metrics.filter((m: any) => m.spin_rate_rpm).reduce((a: number, m: any) => a + m.spin_rate_rpm, 0) / pitching_metrics.filter((m: any) => m.spin_rate_rpm).length).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">rpm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hitting Metrics */}
        {hitting_metrics && hitting_metrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-wider text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-vault-utility" />
                Hitting Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-secondary/30">
                  <p className="text-xs text-muted-foreground uppercase">Max Exit Velo</p>
                  <p className="text-2xl font-display font-bold text-vault-utility">
                    {Math.max(...hitting_metrics.filter((m: any) => m.exit_velocity_mph).map((m: any) => m.exit_velocity_mph)).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">mph</p>
                </div>
                <div className="text-center p-4 bg-secondary/30">
                  <p className="text-xs text-muted-foreground uppercase">Avg Bat Speed</p>
                  <p className="text-2xl font-display font-bold">
                    {(hitting_metrics.filter((m: any) => m.bat_speed_mph).reduce((a: number, m: any) => a + m.bat_speed_mph, 0) / hitting_metrics.filter((m: any) => m.bat_speed_mph).length || 0).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">mph</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground pt-8">
          Powered by VAULT™ Baseball Operating System
        </p>
      </main>
    </div>
  );
};

export default SharedMetricsView;
