import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain, TrendingUp, TrendingDown, Minus, BarChart3,
  Zap, Target, Shield, Trophy, Star, Loader2,
  Send, Bot, User, CheckCircle2, AlertTriangle, Info,
  Activity, Calendar, Sparkles, RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useParentPortal } from "@/hooks/useParentPortal";

interface Message { role: "user" | "assistant"; content: string; }

const PARENT_AI_SYSTEM = `You are VAULT™ Parent Intelligence — an AI advisor that helps parents understand their athlete's development data, what it means, and what actions to take.

You have access to the athlete's development scores, KPI data, training consistency, and recruiting status.

Your role:
1. Translate athlete data into plain language parents understand
2. Explain what the numbers mean in recruiting context
3. Give specific, actionable recommendations for parents
4. Be honest — don't inflate grades or progress
5. Acknowledge when data is limited or insufficient to make conclusions
6. Always be age-appropriate in your recommendations
7. Emphasize that you are supplementing — not replacing — coach guidance

You speak like a trusted, knowledgeable advisor — not a salesperson or hype machine.`;

const ParentAnalytics = () => {
  const [searchParams] = useSearchParams();
  const athleteId = searchParams.get("athlete");
  const { activeLinks, fetchAthleteData, athleteData } = useParentPortal();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const selectedLink = athleteId
    ? activeLinks.find(l => l.athlete_user_id === athleteId)
    : activeLinks[0];
  const currentAthleteId = selectedLink?.athlete_user_id;

  useEffect(() => {
    if (currentAthleteId && !athleteData[currentAthleteId]) fetchAthleteData(currentAthleteId);
  }, [currentAthleteId]);

  const data = currentAthleteId ? athleteData[currentAthleteId] : null;
  const profile = data?.profile;
  const dev = data?.development_score;
  const kpis = data?.recent_kpis || [];
  const checkins = data?.checkins || [];
  const homework = data?.homework;

  // Build context for AI
  const buildContext = () => {
    if (!data || !profile) return "No athlete data available.";
    const recentSleep = checkins.slice(0, 7).map(c => c.sleep_hours).filter(Boolean);
    const avgSleep = recentSleep.length ? (recentSleep.reduce((s, h) => s + (h || 0), 0) / recentSleep.length).toFixed(1) : "unknown";
    const recentSoreness = checkins.slice(0, 7).map(c => c.soreness_level).filter(Boolean);
    const avgSoreness = recentSoreness.length ? (recentSoreness.reduce((s, v) => s + (v || 0), 0) / recentSoreness.length).toFixed(1) : "unknown";
    return `
ATHLETE PROFILE: ${profile.display_name}, ${profile.position || "Position not set"}, ${profile.sport_type} athlete, Class of ${profile.graduation_year || "Unknown"}

DEVELOPMENT SCORES:
- Overall Score: ${dev?.overall_score || "N/A"}/100
- Training Consistency: ${dev?.training_consistency || "N/A"}%
- Skill Development: ${dev?.skill_development || "N/A"}%
- Work Ethic: ${dev?.work_ethic || "N/A"}%
- Improvement Status: ${dev?.improvement_status || "stable"}
- Readiness Score: ${dev?.readiness_score || "N/A"}/100
- Consistency Score: ${dev?.consistency_score || "N/A"}%

KEY PERFORMANCE INDICATORS (most recent):
${kpis.slice(0, 8).map(k => `- ${k.kpi_name}: ${k.kpi_value} ${k.kpi_unit || ""}`).join("\n") || "No KPIs logged yet"}

TRAINING COMPLIANCE (this week):
- Homework assigned: ${homework?.assigned_this_week || 0}
- Homework completed: ${homework?.completed_this_week || 0}
- Completion rate: ${homework?.assigned_this_week ? Math.round(((homework?.completed_this_week || 0) / homework.assigned_this_week) * 100) : "N/A"}%

WELLNESS (7-day avg):
- Sleep: ${avgSleep} hours/night
- Soreness: ${avgSoreness}/5
- Check-in streak: ${checkins.length} days tracked

STRENGTHS FLAGGED BY SYSTEM: ${dev?.strengths_summary?.join(", ") || "None identified yet"}
DEVELOPMENT GAPS: ${dev?.gaps_summary?.join(", ") || "None identified yet"}
TOP PRIORITIES: ${dev?.top_priorities?.join(", ") || "None set"}
`;
  };

  const initializeChat = async () => {
    if (initialized || !data) return;
    setInitialized(true);
    setIsLoading(true);
    try {
      const context = buildContext();
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: PARENT_AI_SYSTEM,
          messages: [{
            role: "user",
            content: `Here is my athlete's complete VAULT™ data:\n\n${context}\n\nPlease give me a brief, honest summary of where my athlete stands and the 2-3 most important things I should know right now as a parent.`
          }]
        })
      });
      const res = await response.json();
      const text = res.content?.map((c: any) => c.text || "").join("") || "Unable to analyze data at this time.";
      setMessages([{ role: "assistant", content: text }]);
    } catch {
      setMessages([{ role: "assistant", content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);
    try {
      const context = buildContext();
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: PARENT_AI_SYSTEM + `\n\nAthlete context:\n${context}`,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const res = await response.json();
      const text = res.content?.map((c: any) => c.text || "").join("") || "Unable to respond.";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentAthleteId) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Link an athlete to access AI analytics.</p>
        <Link to="/parent" className="text-primary text-sm hover:underline mt-2 inline-block">Go to My Athletes</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
          <Brain className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">AI Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Intelligent analysis of {profile?.display_name || "your athlete"}'s development data
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Dev Score", value: dev?.overall_score ? `${dev.overall_score}/100` : "—", color: "text-primary", icon: BarChart3 },
          { label: "Consistency", value: dev?.training_consistency ? `${dev.training_consistency}%` : "—", color: "text-green-500", icon: Activity },
          { label: "KPIs Logged", value: kpis.length.toString(), color: "text-blue-500", icon: Target },
          { label: "Status", value: dev?.improvement_status || "—", color: dev?.improvement_status === "improving" ? "text-green-500" : dev?.improvement_status === "regressing" ? "text-red-500" : "text-amber-500", icon: TrendingUp },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.color}`} />
            <p className={`text-xl font-display capitalize ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* AI Chat */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            <span className="font-medium text-sm text-foreground">VAULT™ Parent Intelligence</span>
            <Badge className="bg-purple-500/10 text-purple-500 border-0 text-[10px]">AI</Badge>
          </div>
          {!initialized && data && (
            <Button size="sm" variant="vault" onClick={initializeChat} className="h-7 text-xs gap-1.5">
              <Sparkles className="w-3 h-3" /> Analyze My Athlete
            </Button>
          )}
          {initialized && (
            <Button size="sm" variant="ghost" onClick={() => { setMessages([]); setInitialized(false); }} className="h-7 text-xs gap-1">
              <RefreshCw className="w-3 h-3" /> Reset
            </Button>
          )}
        </div>

        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {!initialized && !isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Click "Analyze My Athlete" to get an AI-powered breakdown of your athlete's current development status, what the data means, and what you should focus on.</p>
            </div>
          )}
          {isLoading && messages.length === 0 && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-500" />
              </div>
              <div className="bg-secondary rounded-xl p-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-purple-500/10" : "bg-primary"}`}>
                {msg.role === "assistant" ? <Brain className="w-4 h-4 text-purple-500" /> : <User className="w-4 h-4 text-primary-foreground" />}
              </div>
              <div className={`max-w-[80%] rounded-xl p-3 text-sm ${msg.role === "assistant" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && messages.length > 0 && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 text-purple-500" />
              </div>
              <div className="bg-secondary rounded-xl p-3"><Loader2 className="w-4 h-4 animate-spin" /></div>
            </div>
          )}
        </div>

        {initialized && (
          <>
            <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-border/50">
              {["What should I focus on this month?", "Is my athlete on track for D1?", "What do the KPIs mean?", "How can I help at home?"].map(q => (
                <button key={q} onClick={() => setInput(q)} className="text-xs bg-secondary hover:bg-secondary/80 rounded-full px-3 py-1 text-muted-foreground transition-colors">
                  {q}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about your athlete's development..."
                className="resize-none h-12 text-sm"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              />
              <Button onClick={sendMessage} disabled={isLoading || !input.trim()} className="shrink-0 h-12 w-12 p-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Strengths + Gaps */}
      {dev && (dev.strengths_summary?.length || dev.gaps_summary?.length) ? (
        <div className="grid md:grid-cols-2 gap-4">
          {dev.strengths_summary?.length ? (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-display text-sm text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Current Strengths
              </h3>
              <div className="space-y-1.5">
                {dev.strengths_summary.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    <p className="text-sm text-muted-foreground">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {dev.gaps_summary?.length ? (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-display text-sm text-foreground mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" /> Development Focus Areas
              </h3>
              <div className="space-y-1.5">
                {dev.gaps_summary.map((g, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <p className="text-sm text-muted-foreground">{g}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground text-center">
        VAULT™ AI Analytics analyzes your athlete's data to provide development insights. For decisions about training load, injury, or major program changes, always consult directly with your athlete's coach.
      </p>
    </div>
  );
};

export default ParentAnalytics;
