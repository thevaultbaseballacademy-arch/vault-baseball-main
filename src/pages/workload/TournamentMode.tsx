import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Trophy, Plus, Shield, AlertTriangle,
  Clock, Target, Loader2, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWorkloadManagement, TournamentEvent } from "@/hooks/useWorkloadManagement";

const TournamentMode = () => {
  const navigate = useNavigate();
  const {
    tournaments, loading, createTournament,
    logTournamentGame, getTournamentPitchStatus,
  } = useWorkloadManagement();

  const [createOpen, setCreateOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [newTournament, setNewTournament] = useState({
    tournament_name: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    sport_type: "baseball",
  });

  const [gameForm, setGameForm] = useState({
    game_date: new Date().toISOString().split("T")[0],
    pitches_thrown: 0,
    innings_pitched: null as number | null,
    pitch_types: {} as Record<string, number>,
    max_velocity: null as number | null,
    pain_reported: false,
    pain_location: null as string | null,
    pain_level: null as number | null,
    notes: null as string | null,
  });

  const handleCreateTournament = async () => {
    setSaving(true);
    try {
      await createTournament(newTournament);
      setCreateOpen(false);
      setNewTournament({ tournament_name: "", start_date: new Date().toISOString().split("T")[0], end_date: new Date().toISOString().split("T")[0], sport_type: "baseball" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogGame = async () => {
    if (!selectedTournament) return;
    setSaving(true);
    try {
      await logTournamentGame(selectedTournament, gameForm);
      setGameOpen(false);
      setGameForm({
        game_date: new Date().toISOString().split("T")[0],
        pitches_thrown: 0, innings_pitched: null, pitch_types: {},
        max_velocity: null, pain_reported: false, pain_location: null,
        pain_level: null, notes: null,
      });
    } finally {
      setSaving(false);
    }
  };

  const activeTournaments = tournaments.filter(t => t.is_active);
  const pastTournaments = tournaments.filter(t => !t.is_active);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/workload")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display text-foreground mb-1">TOURNAMENT MODE</h1>
                <p className="text-muted-foreground">Multi-game weekend tracking with safety checks</p>
              </div>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" /> New Tournament</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">CREATE TOURNAMENT</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Tournament Name</Label>
                      <Input value={newTournament.tournament_name} onChange={e => setNewTournament(f => ({ ...f, tournament_name: e.target.value }))} placeholder="e.g. Summer Classic" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Start Date</Label>
                        <Input type="date" value={newTournament.start_date} onChange={e => setNewTournament(f => ({ ...f, start_date: e.target.value }))} />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">End Date</Label>
                        <Input type="date" value={newTournament.end_date} onChange={e => setNewTournament(f => ({ ...f, end_date: e.target.value }))} />
                      </div>
                    </div>
                    <Button onClick={handleCreateTournament} disabled={saving || !newTournament.tournament_name} className="w-full">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Tournament"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Active Tournaments */}
            {activeTournaments.length === 0 && (
              <div className="bg-card border border-border p-8 text-center">
                <Trophy className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No active tournaments</p>
                <p className="text-xs text-muted-foreground mt-1">Create one for multi-game weekend tracking</p>
              </div>
            )}

            {activeTournaments.map(t => (
              <TournamentCard
                key={t.id}
                tournament={t}
                pitchStatus={getTournamentPitchStatus(t.id)}
                expanded={expandedId === t.id}
                onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)}
                onLogGame={() => {
                  setSelectedTournament(t.id);
                  setGameOpen(true);
                }}
              />
            ))}

            {pastTournaments.length > 0 && (
              <div>
                <h3 className="font-display text-muted-foreground text-sm mb-3">PAST TOURNAMENTS</h3>
                <div className="space-y-3">
                  {pastTournaments.map(t => (
                    <div key={t.id} className="bg-card border border-border p-4 flex items-center gap-4">
                      <Trophy className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-display text-foreground text-sm">{t.tournament_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.start_date).toLocaleDateString()} — {t.total_games_played} games, {t.total_pitches_thrown} pitches
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Log Game Dialog */}
          <Dialog open={gameOpen} onOpenChange={setGameOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">LOG GAME</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Pitches Thrown</Label>
                    <Input type="number" min={0} value={gameForm.pitches_thrown} onChange={e => setGameForm(f => ({ ...f, pitches_thrown: +e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Innings Pitched</Label>
                    <Input type="number" min={0} step={0.1} value={gameForm.innings_pitched || ""} onChange={e => setGameForm(f => ({ ...f, innings_pitched: e.target.value ? +e.target.value : null }))} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max Velocity (mph)</Label>
                  <Input type="number" value={gameForm.max_velocity || ""} onChange={e => setGameForm(f => ({ ...f, max_velocity: e.target.value ? +e.target.value : null }))} />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={gameForm.pain_reported} onCheckedChange={v => setGameForm(f => ({ ...f, pain_reported: v }))} />
                  <Label className="text-sm text-muted-foreground">Pain reported</Label>
                </div>
                {gameForm.pain_reported && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Pain Location</Label>
                      <Input value={gameForm.pain_location || ""} onChange={e => setGameForm(f => ({ ...f, pain_location: e.target.value }))} placeholder="e.g. shoulder" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Pain Level (1-10)</Label>
                      <Input type="number" min={1} max={10} value={gameForm.pain_level || ""} onChange={e => setGameForm(f => ({ ...f, pain_level: +e.target.value }))} />
                    </div>
                  </div>
                )}
                <Button onClick={handleLogGame} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log Game"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// ── Tournament Card Component ─────────────────────────────────────

interface TournamentCardProps {
  tournament: TournamentEvent;
  pitchStatus: ReturnType<ReturnType<typeof useWorkloadManagement>["getTournamentPitchStatus"]>;
  expanded: boolean;
  onToggle: () => void;
  onLogGame: () => void;
}

const TournamentCard = ({ tournament, pitchStatus, expanded, onToggle, onLogGame }: TournamentCardProps) => {
  const safeColor = pitchStatus.safeToPitch
    ? "border-green-500/20 bg-green-500/5"
    : "border-destructive/20 bg-destructive/5";
  const safeText = pitchStatus.safeToPitch
    ? "text-green-600 dark:text-green-400"
    : "text-destructive";

  return (
    <div className="bg-card border border-border overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display text-xl text-foreground">{tournament.tournament_name}</h3>
            <p className="text-xs text-muted-foreground">
              {new Date(tournament.start_date).toLocaleDateString()} — {new Date(tournament.end_date).toLocaleDateString()}
            </p>
          </div>
          <Button size="sm" onClick={onLogGame}>
            <Plus className="w-4 h-4 mr-1" /> Log Game
          </Button>
        </div>

        {/* Safe to Pitch Banner */}
        <div className={`border p-4 mb-4 ${safeColor}`}>
          <div className="flex items-center gap-3">
            {pitchStatus.safeToPitch ? (
              <Shield className={`w-6 h-6 ${safeText}`} />
            ) : (
              <AlertTriangle className={`w-6 h-6 ${safeText}`} />
            )}
            <div>
              <p className={`font-display text-lg ${safeText}`}>
                {pitchStatus.safeToPitch ? "SAFE TO PITCH" : "REST RECOMMENDED"}
              </p>
              <p className="text-xs text-muted-foreground">{pitchStatus.reason}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary p-3 text-center">
            <p className="text-xl font-display text-foreground">{pitchStatus.totalPitches}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Total Pitches</p>
          </div>
          <div className="bg-secondary p-3 text-center">
            <p className="text-xl font-display text-foreground">{pitchStatus.gamesPlayed}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Games</p>
          </div>
          <div className="bg-secondary p-3 text-center">
            <p className="text-xl font-display text-foreground">
              {pitchStatus.restHoursSinceLast ? `${pitchStatus.restHoursSinceLast}h` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase">Rest Since Last</p>
          </div>
        </div>
      </div>

      {/* Expandable Game History */}
      {pitchStatus.games.length > 0 && (
        <>
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-1 py-2 border-t border-border text-xs text-muted-foreground hover:text-foreground transition"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Hide" : "Show"} Game Log ({pitchStatus.games.length})
          </button>
          {expanded && (
            <div className="border-t border-border">
              {pitchStatus.games.map((g, i) => (
                <div key={g.id} className="flex items-center gap-3 px-6 py-3 border-b border-border last:border-0">
                  <span className="text-xs font-display text-muted-foreground w-10">G{g.game_number}</span>
                  <span className="text-xs text-muted-foreground w-16">
                    {new Date(g.game_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span className="font-display text-foreground">{g.pitches_thrown}</span>
                  <span className="text-xs text-muted-foreground">pitches</span>
                  {g.innings_pitched && <span className="text-xs text-muted-foreground ml-auto">{g.innings_pitched} IP</span>}
                  {g.max_velocity && <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary">{g.max_velocity} mph</span>}
                  {g.pain_reported && <span className="text-xs px-1.5 py-0.5 bg-destructive/10 text-destructive">Pain</span>}
                  {!g.safe_to_pitch && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TournamentMode;
