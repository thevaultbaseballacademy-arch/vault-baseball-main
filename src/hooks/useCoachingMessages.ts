import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CoachingMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  attachment_url: string | null;
  attachment_type: string | null;
  is_read: boolean;
  created_at: string;
}

function getConversationId(userA: string, userB: string) {
  return [userA, userB].sort().join("_");
}

export const useCoachingMessages = (userId: string | null, partnerId: string | null) => {
  const [messages, setMessages] = useState<CoachingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const conversationId = userId && partnerId ? getConversationId(userId, partnerId) : null;

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    const { data } = await supabase
      .from("coaching_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (data) setMessages(data as CoachingMessage[]);
    setLoading(false);
  }, [conversationId]);

  const fetchUnread = useCallback(async () => {
    if (!userId) return;
    const { count } = await supabase
      .from("coaching_messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .eq("is_read", false);
    setUnreadCount(count || 0);
  }, [userId]);

  useEffect(() => {
    fetchMessages();
    fetchUnread();
  }, [fetchMessages, fetchUnread]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "coaching_messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as CoachingMessage]);
          if ((payload.new as CoachingMessage).recipient_id === userId) {
            setUnreadCount((c) => c + 1);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, userId]);

  const sendMessage = async (content: string, attachmentUrl?: string, attachmentType?: string) => {
    if (!userId || !partnerId || !conversationId) return;
    const msg = {
      conversation_id: conversationId,
      sender_id: userId,
      recipient_id: partnerId,
      content: content.trim(),
      attachment_url: attachmentUrl || null,
      attachment_type: attachmentType || null,
    };
    await supabase.from("coaching_messages").insert(msg);
  };

  const markAsRead = async () => {
    if (!userId || !conversationId) return;
    await supabase
      .from("coaching_messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("recipient_id", userId)
      .eq("is_read", false);
    setUnreadCount(0);
  };

  return { messages, loading, unreadCount, sendMessage, markAsRead, fetchMessages };
};

// Hook to get all conversations for a user
export const useConversationList = (userId: string | null) => {
  const [conversations, setConversations] = useState<{ partnerId: string; partnerName: string; lastMessage: string; lastAt: string; unread: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      setLoading(true);
      // Get all messages involving this user
      const { data: msgs } = await supabase
        .from("coaching_messages")
        .select("*")
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(500);

      if (!msgs) { setLoading(false); return; }

      // Group by partner
      const partnerMap = new Map<string, { lastMessage: string; lastAt: string; unread: number }>();
      for (const m of msgs as CoachingMessage[]) {
        const partner = m.sender_id === userId ? m.recipient_id : m.sender_id;
        if (!partnerMap.has(partner)) {
          partnerMap.set(partner, {
            lastMessage: m.content,
            lastAt: m.created_at,
            unread: 0,
          });
        }
        if (m.recipient_id === userId && !m.is_read) {
          const entry = partnerMap.get(partner)!;
          entry.unread++;
        }
      }

      // Get partner names
      const partnerIds = [...partnerMap.keys()];
      if (partnerIds.length === 0) { setConversations([]); setLoading(false); return; }

      const { data: profiles } = await supabase.rpc("get_public_profiles_by_ids", { user_ids: partnerIds });

      const convos = partnerIds.map((pid) => {
        const entry = partnerMap.get(pid)!;
        const profile = (profiles as any[])?.find((p: any) => p.user_id === pid);
        return {
          partnerId: pid,
          partnerName: profile?.display_name || "Unknown",
          lastMessage: entry.lastMessage,
          lastAt: entry.lastAt,
          unread: entry.unread,
        };
      }).sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());

      setConversations(convos);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  return { conversations, loading };
};
