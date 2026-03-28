import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Loader2, Search, CheckCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCoachingMessages, useConversationList } from "@/hooks/useCoachingMessages";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  userId: string;
  defaultPartnerId?: string;
}

const CoachingMessenger = ({ userId, defaultPartnerId }: Props) => {
  const [activePartner, setActivePartner] = useState<string | null>(defaultPartnerId || null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { conversations, loading: convosLoading } = useConversationList(userId);
  const { messages, loading: msgsLoading, sendMessage, markAsRead } = useCoachingMessages(userId, activePartner);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activePartner) markAsRead();
  }, [activePartner, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await sendMessage(input);
    setInput("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) =>
    !searchQuery || c.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Conversation list view
  if (!activePartner) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-lg text-foreground">MESSAGES</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Direct communication with your coach or athlete</p>
        </div>
        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or keyword..."
              className="pl-9"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {convosLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-muted-foreground text-sm">
                {searchQuery ? "No conversations match your search." : "No conversations yet."}
              </p>
              {!searchQuery && (
                <p className="text-muted-foreground text-xs mt-1">Messages with your coach or athletes will appear here.</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredConversations.map((c) => (
                <button
                  key={c.partnerId}
                  onClick={() => setActivePartner(c.partnerId)}
                  className="w-full p-4 text-left hover:bg-secondary/50 transition-colors flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-display text-primary">{c.partnerName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-foreground">{c.partnerName}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(c.lastAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium flex-shrink-0">
                      {c.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  }

  // Chat view
  const partnerName = conversations.find((c) => c.partnerId === activePartner)?.partnerName || "Coach";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-3">
        <button onClick={() => setActivePartner(null)} className="p-1 hover:bg-secondary rounded-lg">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-display text-primary">{partnerName.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{partnerName}</p>
          <p className="text-[10px] text-muted-foreground">Direct message</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {msgsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">Start the conversation.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isOwn = msg.sender_id === userId;
              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.attachment_url && (
                      <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className={`text-xs underline mt-1 block ${isOwn ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        📎 Attachment
                      </a>
                    )}
                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : ""}`}>
                      <p className={`text-[10px] ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </p>
                      {/* Read receipt for own messages */}
                      {isOwn && (
                        msg.is_read
                          ? <CheckCheck className={`w-3 h-3 text-primary-foreground/80`} />
                          : <Check className={`w-3 h-3 text-primary-foreground/40`} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={2000}
          />
          <Button size="icon" variant="vault" onClick={handleSend} disabled={!input.trim() || sending}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoachingMessenger;
