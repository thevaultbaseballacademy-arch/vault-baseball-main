import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CoachingMessenger from "@/components/coaching/CoachingMessenger";

const ParentMessages = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  if (!userId) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">MESSAGES</h1>
          <p className="text-sm text-muted-foreground">Message your athlete's coach directly</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden h-[600px]">
        <CoachingMessenger userId={userId} />
      </div>
    </div>
  );
};

export default ParentMessages;
