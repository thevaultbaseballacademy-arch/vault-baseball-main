import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Users, Plus, Trash2, AlertTriangle,
  Check, Loader2, Info, RefreshCw, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Substitution {
  inning: number;
  action: string; // 'dp_enters_defense', 'flex_enters_batting', 'dp_leaves', 'flex_leaves'
  player_in: string;
  player_out: string;
  notes: string;
}

interface DPFlexLineup {
  id: string;
  game_date: string;
  game_label: string | null;
  dp_player_name: string;
  dp_batting_order: number | null;
  flex_player_name: string;
  flex_position: string;
  substitutions: Substitution[];
  is_dp_active: boolean;
  notes: string | null;
}

const FLEX_POSITIONS = ["Pitcher", "Catcher", "1B", "2B", "SS", "3B", "LF", "CF", "RF"];

const DP_FLEX_RULES = [
  { rule: "The DP bats but does not play defense", icon: "🏏" },
  { rule: "The Flex plays defense but does not bat", icon: "🧤" },
  { rule: "The DP may enter defense for any player (not just the Flex)", icon: "🔄" },
  { rule: "If the DP plays defense for the Flex, the Flex leaves the game", icon: "⚠️" },
  { rule: "The Flex can only enter the batting order in the DP's spot", icon: "📋" },
  { rule: "The DP can never play defense in the Flex's position (unless the Flex leaves)", icon: "🚫" },
  { rule: "Either the DP, the Flex, or both can be in the game at any time", icon: "✅" },
  { rule: "If both leave, the game continues with 9 batters", icon: "9️⃣" },
];

const DPFlexBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lineups, setLineups] = useState<DPFlexLineup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form
  const [dpName, setDpName] = useState("");
  const [dpOrder, setDpOrder] = useState("");
  const [flexName, setFlexName] = useState("");
  const [flexPosition, setFlexPosition] = useState("Pitcher");
  const [gameLabel, setGameLabel] = useState("");
  const [lineupNotes, setLineupNotes] = useState("");
  const [subs, setSubs] = useState<Substitution[]>([]);
  const [showRules, setShowRules] = useState(false);

  // Validation
  const [violations, setViolations] = useState<string[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("dpflex_lineups").select("*").eq("coach_user_id", user.id).order("game_date", { ascending: false }).limit(20);
    setLineups((data as any[]) || []);
    setLoading(false);
  };

  const validateLineup = () => {
    const v: string[] = [];
    if (dpName === flexName && dpName) v.push("DP and Flex cannot be the same player");
    
    subs.forEach((sub, i) => {
      if (sub.action === "dp_enters_defense" && sub.player_out === flexName) {
        // DP playing defense for Flex = Flex must leave
        const hasFlexLeave = subs.some((s, j) => j > i && s.action === "flex_leaves");
        if (!hasFlexLeave) v.push(`Inning ${sub.inning}: If DP enters for Flex, Flex must leave the game`);
      }
    });
    setViolations(v);
    return v.length === 0;
  };

  const addSub = () => {
    setSubs([...subs, { inning: subs.length > 0 ? subs[subs.length - 1].inning + 1 : 1, action: "dp_enters_defense", player_in: dpName, player_out: "", notes: "" }]);
  };

  const updateSub = (idx: number, field: keyof Substitution, value: any) => {
    const updated = [...subs];
    (updated[idx] as any)[field] = value;
    setSubs(updated);
    validateLineup();
  };

  const removeSub = (idx: number) => {
    setSubs(subs.filter((_, i) => i !== idx));
  };

  const saveLineup = async () => {
    if (!dpName || !flexName) return;
    if (!validateLineup()) {
      toast({ title: "Rule violations found", description: "Fix the highlighted issues before saving", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("dpflex_lineups").insert({
      coach_user_id: user.id,
      dp_player_name: dpName,
      dp_batting_order: parseInt(dpOrder) || null,
      flex_player_name: flexName,
      flex_position: flexPosition,
      game_label: gameLabel || null,
      substitutions: subs as any,
      notes: lineupNotes || null,
      is_dp_active: true,
    } as any);
    toast({ title: "DP/Flex lineup saved" });
    setDpName(""); setFlexName(""); setSubs([]); setGameLabel(""); setLineupNotes("");
    loadData();
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/softball")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Softball
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-display text-foreground">DP/FLEX RULE BUILDER</h1>
                <p className="text-muted-foreground">Manage designated player & flex substitutions</p>
              </div>
              <Badge variant="outline" className="font-display text-xs">🥎 SOFTBALL</Badge>
            </div>

            {/* Rules Reference */}
            <div className="bg-card border border-border p-4">
              <button onClick={() => setShowRules(!showRules)} className="flex items-center gap-2 w-full text-left">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-display text-foreground text-sm">OFFICIAL DP/FLEX RULES</span>
                <span className="text-xs text-muted-foreground ml-auto">{showRules ? "Hide" : "Show"}</span>
              </button>
              {showRules && (
                <div className="mt-3 space-y-2">
                  {DP_FLEX_RULES.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span>{r.icon}</span>
                      <span className="text-muted-foreground">{r.rule}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Builder */}
            <div className="bg-card border border-border p-6 space-y-5">
              <h3 className="font-display text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Create Lineup
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 p-4 border border-border">
                  <h4 className="font-display text-xs text-muted-foreground">DESIGNATED PLAYER (DP)</h4>
                  <div>
                    <Label className="text-xs text-muted-foreground">Player Name</Label>
                    <Input value={dpName} onChange={(e) => setDpName(e.target.value)} placeholder="DP player name" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Batting Order #</Label>
                    <Input type="number" value={dpOrder} onChange={(e) => setDpOrder(e.target.value)} placeholder="e.g. 4" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Bats but does not play defense</p>
                </div>
                <div className="space-y-3 p-4 border border-border">
                  <h4 className="font-display text-xs text-muted-foreground">FLEX PLAYER</h4>
                  <div>
                    <Label className="text-xs text-muted-foreground">Player Name</Label>
                    <Input value={flexName} onChange={(e) => setFlexName(e.target.value)} placeholder="Flex player name" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Defensive Position</Label>
                    <Select value={flexPosition} onValueChange={setFlexPosition}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FLEX_POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Plays defense but does not bat</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Game Label</Label>
                <Input value={gameLabel} onChange={(e) => setGameLabel(e.target.value)} placeholder="e.g. Game 2 vs. Eagles" />
              </div>

              {/* Substitutions */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-display text-sm text-foreground flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> IN-GAME SUBSTITUTIONS
                  </h4>
                  <Button size="sm" variant="outline" onClick={addSub}><Plus className="w-3 h-3 mr-1" /> Add</Button>
                </div>
                {subs.map((sub, idx) => (
                  <div key={idx} className="bg-secondary p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="shrink-0">
                        <Label className="text-[10px] text-muted-foreground">Inning</Label>
                        <Input type="number" value={sub.inning} onChange={(e) => updateSub(idx, "inning", parseInt(e.target.value) || 1)}
                          className="w-14 h-8 text-center text-xs" />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[10px] text-muted-foreground">Action</Label>
                        <Select value={sub.action} onValueChange={(v) => updateSub(idx, "action", v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dp_enters_defense">DP enters defense</SelectItem>
                            <SelectItem value="flex_enters_batting">Flex enters batting</SelectItem>
                            <SelectItem value="dp_leaves">DP leaves game</SelectItem>
                            <SelectItem value="flex_leaves">Flex leaves game</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 mt-4" onClick={() => removeSub(idx)}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Violations */}
              {violations.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 p-3 space-y-1">
                  {violations.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-destructive">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <Textarea value={lineupNotes} onChange={(e) => setLineupNotes(e.target.value)} rows={2} />
              </div>

              <Button onClick={saveLineup} disabled={saving || !dpName || !flexName} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Save Lineup
              </Button>
            </div>

            {/* Saved Lineups */}
            {lineups.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display text-foreground text-sm">SAVED LINEUPS</h3>
                {lineups.map(l => (
                  <div key={l.id} className="bg-card border border-border p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(l.game_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {l.game_label && ` — ${l.game_label}`}
                      </span>
                      <Badge variant={l.is_dp_active ? "default" : "secondary"} className="text-[10px]">
                        {l.is_dp_active ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><span className="text-muted-foreground">DP:</span> <span className="font-display text-foreground">{l.dp_player_name}</span> {l.dp_batting_order && `(#${l.dp_batting_order})`}</div>
                      <div><span className="text-muted-foreground">Flex:</span> <span className="font-display text-foreground">{l.flex_player_name}</span> ({l.flex_position})</div>
                    </div>
                    {l.substitutions && (l.substitutions as any[]).length > 0 && (
                      <div className="mt-2 text-[10px] text-muted-foreground">
                        {(l.substitutions as any[]).map((s: any, i: number) => (
                          <span key={i}>Inn {s.inning}: {s.action.replace(/_/g, " ")}{i < (l.substitutions as any[]).length - 1 ? " → " : ""}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DPFlexBuilder;
