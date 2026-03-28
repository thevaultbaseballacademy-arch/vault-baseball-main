import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Minimize2, Trash2, ArrowRight } from "lucide-react";
import { useEddieChat } from "@/hooks/useEddieChat";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

// ── Product CTA detection & rendering ──
const PRODUCT_PATTERNS: { pattern: RegExp; href: string; label: string }[] = [
  { pattern: /\/free-velocity-guide/i, href: "/free-velocity-guide", label: "GET THE FREE VELOCITY GUIDE" },
  { pattern: /\/products\/velo-check/i, href: "/products/velo-check", label: "GET VELO-CHECK — $97" },
  { pattern: /\/products\/velocity-system/i, href: "/products/velocity-system", label: "START THE VELOCITY SYSTEM — $397" },
  { pattern: /\/products\/remote-training/i, href: "/products/remote-training", label: "JOIN REMOTE TRAINING — $199/MO" },
];

function extractProductCTAs(content: string) {
  const found: { href: string; label: string }[] = [];
  for (const p of PRODUCT_PATTERNS) {
    if (p.pattern.test(content)) found.push({ href: p.href, label: p.label });
  }
  return found;
}

const ProductCTA = ({ href, label }: { href: string; label: string }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(href)}
      className="mt-1.5 w-full flex items-center justify-between px-4 py-3 bg-foreground text-background text-[11px] font-display tracking-wider hover:bg-foreground/90 transition-colors"
    >
      {label}
      <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );
};

// ── Typing dots ──
const TypingIndicator = () => (
  <div className="flex gap-2">
    <div className="w-6 h-6 bg-foreground/10 flex items-center justify-center shrink-0">
      <span className="text-[10px] font-display text-foreground">E</span>
    </div>
    <div className="bg-muted px-3 py-2.5">
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
        <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
        <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  </div>
);

// ── Eddie's pre-loaded greeting (no API call needed) ──
const EDDIE_GREETING = `Welcome to Vault Baseball. I'm Eddie AI.

I help athletes and parents figure out the right next step for velocity, arm care, and long-term baseball development.

Let's start with a few quick questions so I can point you in the right direction.`;

export const EddieAIChat = React.forwardRef<HTMLDivElement>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const { messages, isLoading, error, sendMessage, clearChat, injectMessage } = useEddieChat();
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    if (!hasGreeted && messages.length === 0) {
      injectMessage({ role: "assistant", content: EDDIE_GREETING });
      setHasGreeted(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendMessage(chatInput);
      setChatInput("");
    }
  };

  const handleClear = () => {
    clearChat();
    setHasGreeted(false);
  };

  // Hide on /contact
  if (typeof window !== "undefined" && window.location.pathname === "/contact") return null;

  const quickStarters = [
    { text: "I'm a parent exploring training options", icon: "👨‍👩‍👦" },
    { text: "I'm a pitcher — I want to add velocity", icon: "⚾" },
    { text: "I'm a coach looking for a system", icon: "📋" },
    { text: "I'm not sure where to start", icon: "🤔" },
  ];

  return (
    <>
      {/* ── Floating trigger ── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-foreground text-background shadow-lg hover:bg-foreground/90 transition-all hover:scale-[1.03] active:scale-95 font-display text-base tracking-wider"
          aria-label="Ask Eddie AI"
        >
          <MessageCircle className="h-5 w-5" />
          ASK EDDIE AI
        </button>
      )}

      {/* ── Chat panel ── */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-card border border-border shadow-2xl transition-all duration-200 overflow-hidden flex flex-col",
            isMinimized
              ? "w-72 h-14"
              : "w-[calc(100vw-32px)] sm:w-[400px] h-[calc(100svh-100px)] sm:h-[580px] max-h-[85vh]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-foreground text-background shrink-0">
            <div className="flex items-center gap-3" onClick={() => isMinimized && setIsMinimized(false)}>
              <div className="w-8 h-8 bg-background/12 flex items-center justify-center">
                <span className="text-sm font-display">E</span>
              </div>
              <div>
                <span className="font-display text-sm tracking-wider">EDDIE MEJIA</span>
                <p className="text-[10px] opacity-50 tracking-wider font-display">DEVELOPMENT ARCHITECT</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {!isMinimized && messages.length > 0 && (
                <button onClick={handleClear} className="p-1.5 hover:bg-background/15 transition-colors" aria-label="Clear chat">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-background/15 transition-colors">
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => { setIsOpen(false); setIsMinimized(false); }} className="p-1.5 hover:bg-background/15 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <div className="flex flex-col flex-1 min-h-0">
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {messages.map((msg, idx) => {
                    const ctas = msg.role === "assistant" ? extractProductCTAs(msg.content) : [];
                    return (
                      <div key={idx} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                        {msg.role === "assistant" && (
                          <div className="w-6 h-6 bg-foreground/8 flex items-center justify-center shrink-0 mt-1">
                            <span className="text-[10px] font-display text-foreground">E</span>
                          </div>
                        )}
                        <div className="max-w-[85%]">
                          <div className={cn(
                            "px-3 py-2.5 text-[13px] leading-relaxed",
                            msg.role === "user"
                              ? "bg-foreground text-background"
                              : "bg-muted text-foreground"
                          )}>
                            {msg.role === "assistant" ? (
                              <div className="prose prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:text-foreground [&_a]:underline [&_a]:font-medium [&_ul]:mb-2 [&_li]:mb-1 [&_strong]:text-foreground">
                                <ReactMarkdown
                                  components={{
                                    a: ({ href, children }) => {
                                      const isInternal = href?.startsWith("/");
                                      if (isInternal) {
                                        return (
                                          <a href={href} onClick={(e) => { e.preventDefault(); if (href) window.location.href = href; }} className="text-foreground underline font-medium">
                                            {children}
                                          </a>
                                        );
                                      }
                                      return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
                                    }
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            )}
                          </div>
                          {ctas.length > 0 && (
                            <div className="space-y-1">
                              {ctas.map((cta) => <ProductCTA key={cta.href} href={cta.href} label={cta.label} />)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Show quick starters after greeting, before user has typed */}
                  {messages.length === 1 && messages[0].role === "assistant" && !isLoading && (
                    <div className="pl-8 space-y-1.5 mt-1">
                      {quickStarters.map((q) => (
                        <button
                          key={q.text}
                          onClick={() => sendMessage(q.text)}
                          className="w-full flex items-center gap-2 text-xs px-3 py-2.5 bg-card border border-border text-foreground text-left hover:border-foreground/20 transition-colors"
                        >
                          <span className="text-sm">{q.icon}</span>
                          <span>{q.text}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Typing indicator while streaming */}
                  {isLoading && messages[messages.length - 1]?.role === "user" && <TypingIndicator />}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {error && (
                <div className="px-3 py-2 text-xs text-destructive bg-destructive/5 border-t border-border shrink-0">
                  {error}
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-3 border-t border-border shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tell Eddie about your situation..."
                    disabled={isLoading}
                    className="flex-1 text-sm h-10"
                  />
                  <Button type="submit" size="sm" disabled={isLoading || !chatInput.trim()} className="h-10 w-10 p-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  Eddie will recommend the right Vault product for your athlete.
                </p>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
});

EddieAIChat.displayName = "EddieAIChat";
