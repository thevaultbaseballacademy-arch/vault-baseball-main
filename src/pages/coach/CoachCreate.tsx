import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSport } from "@/contexts/SportContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, PenTool, Send, FileText, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const CoachCreate = () => {
  const queryClient = useQueryClient();
  const { sport } = useSport();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    content_type: "drill",
    title: "",
    description: "",
    sport_type: sport,
    skill_category: "",
    difficulty: "intermediate",
    age_group: "",
    coaching_points: "",
  });

  // Keep form sport_type in sync with global toggle
  useEffect(() => {
    setForm((prev) => ({ ...prev, sport_type: sport }));
  }, [sport]);

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => { const { data } = await supabase.auth.getUser(); return data.user; },
  });

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["coach-submissions", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_submissions")
        .select("*")
        .eq("created_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createContent = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("content_submissions").insert({
        content_type: form.content_type,
        title: form.title,
        content_data: {
          description: form.description,
          sport_type: form.sport_type,
          skill_category: form.skill_category,
          difficulty: form.difficulty,
          age_group: form.age_group,
          coaching_points: form.coaching_points,
        },
        sport_type: form.sport_type,
        status: "draft",
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Draft saved");
      queryClient.invalidateQueries({ queryKey: ["coach-submissions"] });
      setShowCreate(false);
      setForm({ content_type: "drill", title: "", description: "", sport_type: sport, skill_category: "", difficulty: "intermediate", age_group: "", coaching_points: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const submitForApproval = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("content_submissions").update({ status: "pending" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Submitted for approval");
      queryClient.invalidateQueries({ queryKey: ["coach-submissions"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const drafts = submissions?.filter((s) => s.status === "draft") || [];
  const pending = submissions?.filter((s) => s.status === "pending") || [];
  const approved = submissions?.filter((s) => s.status === "approved") || [];
  const rejected = submissions?.filter((s) => s.status === "rejected") || [];
  const revision = submissions?.filter((s) => s.status === "revision") || [];

  const statusIcon = (s: string) => {
    switch (s) {
      case "approved": return <CheckCircle className="w-4 h-4 text-primary" />;
      case "rejected": return <XCircle className="w-4 h-4 text-destructive" />;
      case "pending": return <Send className="w-4 h-4 text-accent-foreground" />;
      case "revision": return <RotateCcw className="w-4 h-4 text-muted-foreground" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const renderItems = (items: typeof submissions, showSubmit: boolean) => {
    if (!items?.length) {
      return (
        <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">
          No content here
        </CardContent></Card>
      );
    }
    return items.map((item) => (
      <Card key={item.id}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {statusIcon(item.status)}
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.content_type} • {item.sport_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
              {showSubmit && (
                <Button size="sm" variant="outline" onClick={() => submitForApproval.mutate(item.id)}>
                  <Send className="w-3 h-3 mr-1" /> Submit
                </Button>
              )}
            </div>
          </div>
          {item.status === "rejected" && item.rejection_note && (
            <p className="text-xs text-destructive mt-2 bg-destructive/5 p-2 rounded">
              Rejection note: {item.rejection_note}
            </p>
          )}
          {item.status === "revision" && item.revision_note && (
            <p className="text-xs text-muted-foreground mt-2 bg-secondary p-2 rounded">
              Revision feedback: {item.revision_note}
            </p>
          )}
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display tracking-wide">CONTENT CREATION</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {drafts.length} drafts · {pending.length} pending · {approved.length} approved · {rejected.length} rejected
          </p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm"><PenTool className="w-4 h-4 mr-1" /> New Content</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Content</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.content_type} onValueChange={(v) => setForm({ ...form, content_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="drill">Drill</SelectItem>
                  <SelectItem value="program">Program</SelectItem>
                  <SelectItem value="kpi_suggestion">KPI Suggestion</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.sport_type} onValueChange={(v: string) => setForm({ ...form, sport_type: v as "baseball" | "softball" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baseball">Baseball</SelectItem>
                    <SelectItem value="softball">Softball</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Skill Category" value={form.skill_category} onChange={(e) => setForm({ ...form, skill_category: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Age Group" value={form.age_group} onChange={(e) => setForm({ ...form, age_group: e.target.value })} />
              </div>
              <Textarea placeholder="Coaching Points" value={form.coaching_points} onChange={(e) => setForm({ ...form, coaching_points: e.target.value })} />
              <Button onClick={() => createContent.mutate()} disabled={!form.title || createContent.isPending} className="w-full">
                {createContent.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save Draft
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="drafts">
        <TabsList className="flex-wrap">
          <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
          <TabsTrigger value="revision">Revision ({revision.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="drafts" className="space-y-3 mt-4">{renderItems(drafts, true)}</TabsContent>
        <TabsContent value="revision" className="space-y-3 mt-4">{renderItems(revision, true)}</TabsContent>
        <TabsContent value="pending" className="space-y-3 mt-4">{renderItems(pending, false)}</TabsContent>
        <TabsContent value="approved" className="space-y-3 mt-4">{renderItems(approved, false)}</TabsContent>
        <TabsContent value="rejected" className="space-y-3 mt-4">{renderItems(rejected, true)}</TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachCreate;
