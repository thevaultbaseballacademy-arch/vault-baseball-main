import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { FileCheck, Check, X, RotateCcw, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OwnerContentQueue = () => {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["content-queue", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("content_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["owner-profiles-lookup"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name");
      return data || [];
    },
  });

  const getCreatorName = (userId: string) =>
    profiles.find(p => p.user_id === userId)?.display_name || "Unknown Coach";

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const updates: any = {
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      };
      if (status === "approved") updates.published_at = new Date().toISOString();
      if (status === "rejected") updates.rejection_note = note || null;
      if (status === "revision") updates.revision_note = note || null;

      const { error } = await supabase.from("content_submissions").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast({ title: `Content ${status}` });
      qc.invalidateQueries({ queryKey: ["content-queue"] });
      setSelectedId(null);
      setActionNote("");
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const statusColors: Record<string, string> = {
    draft: "bg-secondary text-muted-foreground",
    pending: "bg-accent/20 text-accent-foreground",
    approved: "bg-primary/10 text-primary",
    rejected: "bg-destructive/10 text-destructive",
    revision: "bg-secondary text-foreground",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display text-foreground">CONTENT QUEUE</h1>
        <p className="text-sm text-muted-foreground">Review and approve coach-submitted content</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 flex-wrap">
        {["pending", "draft", "approved", "rejected", "revision", "all"].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Queue */}
      <div className="space-y-3">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {submissions.map(item => (
          <div key={item.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${statusColors[item.status] || ""}`}>
                    {item.status.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                    {item.content_type}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{item.sport_type}</span>
                </div>
                <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  by {getCreatorName(item.created_by)} · {new Date(item.created_at).toLocaleDateString()}
                </p>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
                )}
                {item.rejection_note && (
                  <p className="text-xs text-destructive mt-2 italic">Rejection: {item.rejection_note}</p>
                )}
                {item.revision_note && (
                  <p className="text-xs text-muted-foreground mt-2 italic">Revision note: {item.revision_note}</p>
                )}
              </div>

              {/* Actions */}
              {item.status === "pending" && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateStatus.mutate({ id: item.id, status: "approved" })}
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                   <button
                    onClick={() => setSelectedId(selectedId === `rev-${item.id}` ? null : `rev-${item.id}`)}
                    className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                    title="Request revision"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Rejection / revision note input */}
            {(selectedId === item.id || selectedId === `rev-${item.id}`) && (
              <div className="mt-3 pt-3 border-t border-border">
                <textarea
                  value={actionNote}
                  onChange={e => setActionNote(e.target.value)}
                  placeholder={selectedId?.startsWith("rev-") ? "Describe what needs revision..." : "Optional rejection reason..."}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground resize-none"
                  rows={2}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      const status = selectedId?.startsWith("rev-") ? "revision" : "rejected";
                      updateStatus.mutate({ id: item.id, status, note: actionNote });
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground"
                  >
                    {selectedId?.startsWith("rev-") ? "Request Revision" : "Reject"}
                  </button>
                  <button
                    onClick={() => { setSelectedId(null); setActionNote(""); }}
                    className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {!isLoading && submissions.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <FileCheck className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No content in this status</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerContentQueue;
