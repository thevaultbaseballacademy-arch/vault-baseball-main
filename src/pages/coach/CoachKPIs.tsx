import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Target, TrendingDown, TrendingUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const CoachKPIs = () => {
  const queryClient = useQueryClient();
  const [selectedAthlete, setSelectedAthlete] = useState<string>("all");
  const [showEntry, setShowEntry] = useState(false);
  const [entryForm, setEntryForm] = useState({ athlete_id: "", kpi_name: "", kpi_category: "", kpi_value: "", kpi_unit: "", notes: "" });

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => { const { data } = await supabase.auth.getUser(); return data.user; },
  });

  const { data: athletes } = useQuery({
    queryKey: ["coach-athletes-list", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_assigned_athlete_profiles", { coach_id: user!.id });
      if (error) throw error;
      return data || [];
    },
  });

  const athleteIds = athletes?.map((a: any) => a.user_id) || [];

  const { data: kpis, isLoading } = useQuery({
    queryKey: ["coach-kpis", athleteIds],
    enabled: athleteIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("athlete_kpis")
        .select("*")
        .in("user_id", athleteIds)
        .order("recorded_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  const addKpi = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("athlete_kpis").insert({
        user_id: entryForm.athlete_id,
        kpi_name: entryForm.kpi_name,
        kpi_category: entryForm.kpi_category,
        kpi_value: parseFloat(entryForm.kpi_value),
        kpi_unit: entryForm.kpi_unit || null,
        notes: entryForm.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("KPI recorded");
      queryClient.invalidateQueries({ queryKey: ["coach-kpis"] });
      setShowEntry(false);
      setEntryForm({ athlete_id: "", kpi_name: "", kpi_category: "", kpi_value: "", kpi_unit: "", notes: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const filteredKpis = selectedAthlete === "all"
    ? kpis
    : kpis?.filter((k) => k.user_id === selectedAthlete);

  const getAthleteName = (id: string) =>
    athletes?.find((a: any) => a.user_id === id)?.display_name || "Unknown";

  const getKpiTrend = (userId: string, kpiName: string) => {
    const entries = kpis?.filter((k) => k.user_id === userId && k.kpi_name === kpiName).slice(0, 3) || [];
    if (entries.length < 2) return null;
    return entries[0].kpi_value > entries[1].kpi_value ? "up" : entries[0].kpi_value < entries[1].kpi_value ? "down" : null;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display tracking-wide">KPI TRACKER</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and update athlete KPIs</p>
        </div>
        <Dialog open={showEntry} onOpenChange={setShowEntry}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Record KPI</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record KPI Score</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={entryForm.athlete_id} onValueChange={(v) => setEntryForm({ ...entryForm, athlete_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select athlete" /></SelectTrigger>
                <SelectContent>
                  {athletes?.map((a: any) => (
                    <SelectItem key={a.user_id} value={a.user_id}>{a.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="KPI Name (e.g., Bat Speed)" value={entryForm.kpi_name} onChange={(e) => setEntryForm({ ...entryForm, kpi_name: e.target.value })} />
              <Input placeholder="Category (e.g., Hitting)" value={entryForm.kpi_category} onChange={(e) => setEntryForm({ ...entryForm, kpi_category: e.target.value })} />
              <div className="flex gap-2">
                <Input placeholder="Value" type="number" value={entryForm.kpi_value} onChange={(e) => setEntryForm({ ...entryForm, kpi_value: e.target.value })} />
                <Input placeholder="Unit (mph, etc.)" value={entryForm.kpi_unit} onChange={(e) => setEntryForm({ ...entryForm, kpi_unit: e.target.value })} />
              </div>
              <Textarea placeholder="Notes (optional)" value={entryForm.notes} onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })} />
              <Button onClick={() => addKpi.mutate()} disabled={!entryForm.athlete_id || !entryForm.kpi_name || !entryForm.kpi_value || addKpi.isPending} className="w-full">
                {addKpi.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
        <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Athletes</SelectItem>
          {athletes?.map((a: any) => (
            <SelectItem key={a.user_id} value={a.user_id}>{a.display_name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!filteredKpis?.length ? (
        <Card><CardContent className="py-12 text-center">
          <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No KPI data yet</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filteredKpis.map((kpi) => {
            const trend = getKpiTrend(kpi.user_id, kpi.kpi_name);
            return (
              <Card key={kpi.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{kpi.kpi_name}</p>
                      <Badge variant="outline" className="text-[10px]">{kpi.kpi_category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{getAthleteName(kpi.user_id)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-display">{kpi.kpi_value}</span>
                    {kpi.kpi_unit && <span className="text-xs text-muted-foreground">{kpi.kpi_unit}</span>}
                    {trend === "up" && <TrendingUp className="w-4 h-4 text-primary" />}
                    {trend === "down" && <TrendingDown className="w-4 h-4 text-destructive" />}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CoachKPIs;
