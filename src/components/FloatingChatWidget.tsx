import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Loader2,
  Minimize2,
  Trash2,
  LogIn
} from "lucide-react";
import { useSupportChat } from "@/hooks/useSupportChat";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const FloatingChatWidget = React.forwardRef<HTMLDivElement>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { messages, isLoading, error, sendMessage, clearChat } = useSupportChat();
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendMessage(chatInput);
      setChatInput("");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Don't render on pages where it interferes with the UI
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path === "/contact" || path === "/book-session") {
      return null;
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          aria-label="Open chat support"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 bg-card border border-border rounded-xl shadow-2xl transition-all duration-200 overflow-hidden",
            isMinimized ? "w-72 h-14" : "w-[360px] h-[500px] max-h-[80vh]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold text-sm">Vault AI Support</span>
            </div>
            <div className="flex items-center gap-1">
              {!isMinimized && messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-1.5 hover:bg-primary-foreground/20 rounded transition-colors"
                  aria-label="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-primary-foreground/20 rounded transition-colors"
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-primary-foreground/20 rounded transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="flex flex-col h-[calc(100%-52px)]">
              {/* Show login prompt if not authenticated */}
              {isAuthenticated === false ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="p-3 bg-muted rounded-full mb-3">
                    <LogIn className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Sign in required</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Please sign in to use the AI chat support
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => { handleClose(); navigate("/auth"); }}
                  >
                    Sign In
                  </Button>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 p-3">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="p-3 bg-muted rounded-full mb-3">
                          <MessageCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">Need help?</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Ask me anything about Vault Baseball
                        </p>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {["Course info", "Certifications", "Pricing"].map((q) => (
                            <button
                              key={q}
                              onClick={() => sendMessage(q)}
                              className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "flex gap-2",
                              msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                          >
                            {msg.role === "assistant" && (
                              <div className="p-1.5 bg-primary/10 rounded-lg h-fit shrink-0">
                                <Bot className="h-3.5 w-3.5 text-primary" />
                              </div>
                            )}
                            <div
                              className={cn(
                                "rounded-lg px-3 py-2 max-w-[85%] text-sm",
                                msg.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              )}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            {msg.role === "user" && (
                              <div className="p-1.5 bg-secondary rounded-lg h-fit shrink-0">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        ))}
                        {isLoading && messages[messages.length - 1]?.role === "user" && (
                          <div className="flex gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg h-fit">
                              <Bot className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="bg-muted rounded-lg px-3 py-2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {error && (
                    <div className="px-3 py-2 text-xs text-destructive bg-destructive/10 border-t border-border">
                      {error}
                    </div>
                  )}

                  {/* Input */}
                  <form onSubmit={handleSubmit} className="p-3 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask a question..."
                        disabled={isLoading}
                        className="flex-1 text-sm h-9"
                      />
                      <Button 
                        type="submit" 
                        size="sm" 
                        disabled={isLoading || !chatInput.trim()}
                        className="h-9 w-9 p-0"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
});

FloatingChatWidget.displayName = "FloatingChatWidget";
