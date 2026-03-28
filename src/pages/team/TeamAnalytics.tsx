import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BarChart3, Users, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTeamManagement } from "@/hooks/useTeamManagement";

const TeamAnalytics = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get("id");
  const { selectedTeam, setSelectedTeamId, activeMembers, events, announcements } = useTeamManagement();

  useEffect(() => { if (teamId) setSelectedTeamId(teamId); }, [teamId]);

  const totalEvents = events.length;
  const games = events.filter((e) => e.event_type === "game").length;
  const practices = events.filter((e) => e.event_type === "practice").length;
  const tournaments = events.filter((e) => e.event_type === "tournament").length;

  const positionBreakdown = activeMembers.reduce<Record<string, number>>((acc, m) => {
    const pos = m.position || "Unassigned";
    acc[pos] = (acc[pos] || 0) + 1;
    return acc;
  }, {});

  const roleBreakdown = activeMembers.reduce<Record<string, number>>((acc, m) => {
    acc[m.role] = (acc[m.role] || 0) + 1;
    return acc;
  }, {});

  const rosterFill = selectedTeam ? Math.round((activeMembers.length / selectedTeam.max_roster_size) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/team")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Team Hub
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-display text-foreground">TEAM ANALYTICS</h1>
            <p className="text-muted-foreground text-sm">{selectedTeam?.name} overview</p>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Roster Fill */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Roster Capacity
                </h3>
                <span className="text-sm text-muted-foreground">
                  {activeMembers.length} / {selectedTeam?.max_roster_size || 25}
                </span>
              </div>
              <Progress value={rosterFill} className="h-3" />
            </div>

            {/* Position Distribution */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" /> Position Distribution
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {Object.entries(positionBreakdown).sort((a, b) => b[1] - a[1]).map(([pos, count]) => (
                  <div key={pos} className="bg-secondary rounded-xl p-3 text-center">
                    <p className="text-lg font-display text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">{pos}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Breakdown */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-foreground mb-4">Role Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(roleBreakdown).map(([role, count]) => (
                  <div key={role} className="flex items-center gap-3">
                    <span className="text-sm text-foreground capitalize w-32">{role.replace("_", " ")}</span>
                    <div className="flex-1">
                      <Progress value={(count / activeMembers.length) * 100} className="h-2" />
                    </div>
                    <span className="text-sm font-display text-foreground w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Summary */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" /> Upcoming Schedule
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <p className="text-2xl font-display text-foreground">{totalEvents}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <p className="text-2xl font-display text-foreground">{games}</p>
                  <p className="text-xs text-muted-foreground">Games</p>
                </div>
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <p className="text-2xl font-display text-foreground">{practices}</p>
                  <p className="text-xs text-muted-foreground">Practices</p>
                </div>
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <p className="text-2xl font-display text-foreground">{tournaments}</p>
                  <p className="text-xs text-muted-foreground">Tournaments</p>
                </div>
              </div>
            </div>

            {/* Communications */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" /> Communications
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <p className="text-2xl font-display text-foreground">{announcements.length}</p>
                  <p className="text-xs text-muted-foreground">Announcements</p>
                </div>
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <p className="text-2xl font-display text-foreground">{announcements.filter((a) => a.priority === "urgent").length}</p>
                  <p className="text-xs text-muted-foreground">Urgent</p>
                </div>
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <p className="text-2xl font-display text-foreground">{announcements.filter((a) => a.pinned).length}</p>
                  <p className="text-xs text-muted-foreground">Pinned</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamAnalytics;
