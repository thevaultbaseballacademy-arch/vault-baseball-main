import { useState } from "react";
import { motion } from "framer-motion";
import {
  Apple, Zap, Brain, Shield, AlertTriangle, ChevronRight,
  Loader2, CheckCircle2, Info, Flame, Droplets, Dumbbell,
  Clock, BookOpen, Star, Send, Bot, User, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Legal Disclaimer — required for any nutrition AI product ─────────────────
const LEGAL_DISCLAIMER = `VAULT™ Nutrition Coach provides general sports nutrition education and information based on established sports science research. This tool is NOT a substitute for advice from a licensed registered dietitian, physician, or other qualified healthcare provider. Information provided is for educational purposes only and does not constitute medical or dietary advice. Athletes with medical conditions, eating disorders, or specific health concerns should consult a licensed healthcare professional before making dietary changes. Calorie and macronutrient recommendations are estimates — individual needs vary based on metabolism, body composition, training load, and health status. VAULT™ is not liable for outcomes resulting from use of this tool.`;

// ─── Evidence-based nutrition data (all from public sports science research) ──
const nutritionPrinciples = [
  {
    title: "Carbohydrate Timing",
    science: "Carbohydrates are the primary fuel for high-intensity sport. Research consistently supports pre-exercise carbohydrate loading (1-4g/kg body weight, 1-4 hours pre-exercise) for performance. During exercise >90 min, 30-60g/hour of carbohydrates can maintain performance (Burke et al., 2011, Journal of Sports Sciences).",
    practical: "Pre-game meal: rice, pasta, or oats 2-3 hours before. During long tournaments: sports drinks, fruit, or easily digestible carbs every 45-60 minutes.",
    icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10",
  },
  {
    title: "Protein for Recovery & Muscle",
    science: "The International Society of Sports Nutrition (ISSN) recommends 1.4-2.0g protein per kg body weight per day for athletic individuals. Post-exercise protein synthesis is maximized with 20-40g high-quality protein within 2 hours of training (Morton et al., 2018, Br J Sports Med).",
    practical: "Post-practice: 4-6oz chicken, turkey, eggs, Greek yogurt, or protein shake. Distribute protein across 4-5 meals rather than in one large serving.",
    icon: Dumbbell, color: "text-blue-500", bg: "bg-blue-500/10",
  },
  {
    title: "Hydration & Performance",
    science: "Even 2% body weight fluid loss can impair cognitive function and physical performance. Sweat rates vary widely — athletes should target urine that is pale yellow. Electrolyte replacement (sodium, potassium) is especially important in heat and multi-game days (Sawka et al., 2007, Medicine & Science in Sports & Exercise).",
    practical: "Drink 16-20oz water 2 hours before activity. Replace fluids lost during exercise. Post-exercise: 16-24oz per pound of body weight lost.",
    icon: Droplets, color: "text-cyan-500", bg: "bg-cyan-500/10",
  },
  {
    title: "Pre-Game Meal Strategy",
    science: "Pre-competition nutrition should balance sufficient fuel while avoiding gastrointestinal discomfort. High-GI carbohydrates close to competition provide readily available glucose. Fat slows gastric emptying — limit high-fat foods 2-3 hours before games (Jeukendrup & Killer, 2010, Current Sports Medicine Reports).",
    practical: "2-3 hours before: Complex carbs + lean protein + vegetables. 30-60 min before: Light carbohydrate snack if needed. Avoid: fried food, heavy dairy, high fiber within 1-2 hours.",
    icon: Clock, color: "text-green-500", bg: "bg-green-500/10",
  },
  {
    title: "Recovery Nutrition",
    science: "The post-exercise 'anabolic window' is real but longer than previously thought — up to 2 hours for muscle glycogen replenishment and protein synthesis optimization. A carbohydrate:protein ratio of 3:1 or 4:1 is supported by research for glycogen restoration (Ivy et al., 2002, Journal of Applied Physiology).",
    practical: "Within 30-60 min post-exercise: Chocolate milk, Greek yogurt + fruit, or rice + protein. Prioritize whole foods when possible.",
    icon: RefreshCw, color: "text-purple-500", bg: "bg-purple-500/10",
  },
  {
    title: "Youth Athlete Considerations (Ages 12-18)",
    science: "Young athletes have higher protein needs per pound than adults due to growth demands. The American Academy of Pediatrics advises against weight-loss dieting for adolescent athletes without medical supervision. Bone density development requires adequate calcium (1300mg/day) and Vitamin D (600-1000 IU/day) — National Institutes of Health guidelines.",
    practical: "Three full meals daily is non-negotiable. Dairy, leafy greens, and fortified foods for calcium. Don't skip breakfast. Protein shakes can supplement but not replace real food.",
    icon: Shield, color: "text-red-500", bg: "bg-red-500/10",
  },
];

// ─── Meal plan templates (original, not copied from any source) ────────────────
const mealPlanTemplates = {
  game_day: {
    title: "Game Day Fuel Plan",
    timing: "For 3pm game start",
    meals: [
      { time: "8:00 AM", meal: "Breakfast", foods: "2 eggs scrambled + 1 cup oatmeal with banana + 16oz water", macros: "~550 cal, 28g protein, 75g carbs, 12g fat" },
      { time: "11:30 AM", meal: "Pre-Game Meal (3.5hr before)", foods: "4oz grilled chicken + 1.5 cups white rice + steamed vegetables + 20oz water", macros: "~620 cal, 40g protein, 80g carbs, 8g fat" },
      { time: "2:00 PM", meal: "Pre-Game Snack (1hr before)", foods: "1 banana + handful of pretzels + 12oz water or sports drink", macros: "~200 cal, 2g protein, 45g carbs, 1g fat" },
      { time: "During Game", meal: "Inning Fuel (as needed)", foods: "Water every inning. Sports drink or orange slices if sluggish or hot weather.", macros: "Electrolytes + 15-30g carbs per hour if multi-game day" },
      { time: "Within 1hr Post-Game", meal: "Recovery Meal", foods: "Chocolate milk or Greek yogurt + granola + fruit, then full dinner within 2 hours", macros: "~400-500 cal, 25g protein, 60g carbs, 8g fat" },
    ],
  },
  tournament: {
    title: "Tournament Weekend Plan",
    timing: "Multi-game weekend (2-3 games/day)",
    meals: [
      { time: "6:30 AM", meal: "Early Breakfast", foods: "Bagel + 2 tbsp peanut butter + banana + chocolate milk", macros: "~650 cal, 24g protein, 95g carbs, 16g fat" },
      { time: "Between Games", meal: "Quick Recovery Fuel", foods: "Turkey sandwich on white bread + Gatorade + banana", macros: "~450 cal, 26g protein, 65g carbs, 7g fat" },
      { time: "Dinner", meal: "Heavy Recovery Meal", foods: "Pasta with meat sauce + salad + bread + water", macros: "~800-900 cal, 35g protein, 110g carbs, 18g fat" },
      { time: "Before Bed", meal: "Casein Protein (optional)", foods: "1 cup cottage cheese OR Greek yogurt for overnight muscle recovery", macros: "~200 cal, 25g protein, 10g carbs, 3g fat" },
    ],
  },
  build_phase: {
    title: "Off-Season Build Phase",
    timing: "High-training load, muscle building focus",
    meals: [
      { time: "7:00 AM", meal: "Breakfast", foods: "3 eggs + 2 slices whole grain toast + avocado + OJ", macros: "~600 cal, 25g protein, 60g carbs, 28g fat" },
      { time: "10:30 AM", meal: "Mid-Morning Snack", foods: "Greek yogurt + mixed berries + handful walnuts", macros: "~300 cal, 18g protein, 30g carbs, 12g fat" },
      { time: "1:00 PM", meal: "Lunch", foods: "6oz salmon or chicken + 1.5 cups brown rice + vegetables + olive oil", macros: "~650 cal, 45g protein, 65g carbs, 18g fat" },
      { time: "Pre-Workout", meal: "Pre-Training Fuel", foods: "Banana + rice cakes + water (30-60 min before)", macros: "~180 cal, 2g protein, 45g carbs, 1g fat" },
      { time: "Post-Workout", meal: "Immediate Recovery", foods: "Whey or plant protein shake + fruit + water", macros: "~300 cal, 30g protein, 35g carbs, 3g fat" },
      { time: "7:00 PM", meal: "Dinner", foods: "8oz lean beef or chicken + sweet potato + leafy greens + olive oil", macros: "~750 cal, 50g protein, 55g carbs, 22g fat" },
    ],
  },
};

// ─── Common supplements — evidence-based info only ────────────────────────────
const supplementInfo = [
  { name: "Creatine Monohydrate", evidence: "Strong", safe_for_youth: "Not recommended under 18 without physician approval", notes: "Most researched supplement in sports science. 3-5g/day shown to increase short-burst power. ISSN rates as safe and effective for adults. Youth athletes should not supplement without medical guidance — food-first approach is appropriate.", color: "text-green-500" },
  { name: "Protein Powder", evidence: "Strong", safe_for_youth: "Generally considered safe; whole food preferred", notes: "Convenient way to meet protein goals. Whey or plant-based are both effective. FDA does not pre-approve supplements — choose NSF Certified for Sport or Informed Sport certified products. Prioritize real food first.", color: "text-blue-500" },
  { name: "Caffeine", evidence: "Strong", safe_for_youth: "Not recommended under 18", notes: "Performance benefits well-established at 3-6mg/kg body weight. NOT appropriate for youth athletes under 18. Energy drinks pose cardiac risks in young athletes — American Academy of Pediatrics advises against them.", color: "text-amber-500" },
  { name: "Vitamin D", evidence: "Moderate-Strong", safe_for_youth: "Yes, especially in northern climates", notes: "Many athletes are deficient, especially those training indoors. Deficiency linked to stress fracture risk and immune function. 600-1000 IU/day from food and sunlight is the standard recommendation. Test before supplementing.", color: "text-cyan-500" },
  { name: "Iron", evidence: "Strong (when deficient)", safe_for_youth: "Only if deficient — test first", notes: "Female athletes and rapid-growth male athletes at higher risk for deficiency. Symptoms: fatigue, poor recovery, reduced performance. Never supplement without blood test showing deficiency — excess iron is harmful.", color: "text-purple-500" },
  { name: "Pre-Workout Blends", evidence: "Mixed / Caution", safe_for_youth: "Not recommended under 18", notes: "Most pre-workouts contain caffeine + other stimulants. Not tested for safety in youth athletes. Many contain proprietary blends with unknown ingredients. Not appropriate for high school or younger athletes.", color: "text-red-500" },
];

// ─── Chat message type ─────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are VAULT™ Nutrition Coach, an AI sports nutrition educator for baseball and softball athletes. You provide evidence-based sports nutrition education and general information based on established sports science research.

CRITICAL LEGAL RULES YOU MUST ALWAYS FOLLOW:
1. You are NOT a registered dietitian, nutritionist, or medical professional. You provide EDUCATION, not medical advice.
2. Always recommend athletes consult a licensed registered dietitian or physician for personalized dietary plans.
3. Never recommend specific supplement doses beyond general ranges from published sports science organizations (ISSN, ACSM, AND).
4. For youth athletes under 18: be conservative with supplement recommendations — most supplements are NOT recommended without physician approval.
5. Never promote extreme caloric restriction, disordered eating patterns, or rapid weight loss.
6. If an athlete describes symptoms of an eating disorder, immediately recommend they speak with a healthcare provider.
7. All recommendations must align with general evidence from peer-reviewed sports nutrition research.
8. Source your claims to specific research organizations or journals where possible.
9. Clearly distinguish between "strong evidence," "moderate evidence," and "individual variation" in your answers.
10. When uncertain, say so and recommend professional consultation.

Your knowledge base covers:
- Pre/during/post-game nutrition timing
- Macronutrient needs for baseball/softball athletes
- Hydration strategies
- Youth athlete nutrition (ages 12-18) 
- Tournament weekend fueling
- Off-season muscle building vs in-season maintenance
- Evidence-based supplement information
- Recovery nutrition
- Weight management for athletes (performance focus, not aesthetics)

Tone: Expert, educational, encouraging, practical. Like a knowledgeable strength coach discussing nutrition — not a clinical dietitian, not a bro-science gym rat.

Baseball/softball specific context you understand:
- Multi-game tournament weekends with 2-3 games per day
- Long season (100+ game schedules)
- Varying positions have different energy expenditure
- Heat/sun exposure at outdoor games
- Mental performance matters (brain fuel = carbs + omega-3s)
- Youth athletes ages 12-18 are your primary audience`;

const NutritionCoach = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I'm VAULT™ Nutrition Coach — your sports nutrition education resource for baseball and softball. I'm here to help you understand evidence-based fueling strategies to support your development and performance.\n\n**Important:** I provide sports nutrition education, not medical or dietary advice. For a personalized nutrition plan, always work with a licensed registered dietitian.\n\nWhat nutrition question can I help you with? You can ask about:\n- Pre-game and tournament fueling\n- Protein, carbs, and hydration for baseball/softball\n- Recovery nutrition after practice\n- Youth athlete nutrition (ages 12-18)\n- What the research says about supplements"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [athleteProfile, setAthleteProfile] = useState({ age: "", weight: "", position: "", trainingDays: "", sport: "baseball" });

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const conversationMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: userMessage },
      ];

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: conversationMessages,
        }),
      });

      const data = await response.json();
      const text = data.content?.map((c: any) => c.text || "").join("") || "I couldn't generate a response. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!disclaimerAccepted) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24">
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-8">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <Apple className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-3xl font-display text-foreground text-center mb-2">VAULT™ NUTRITION COACH</h1>
              <p className="text-center text-muted-foreground mb-6">AI-Powered Sports Nutrition Education</p>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-2 text-sm">Important — Please Read Before Continuing</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{LEGAL_DISCLAIMER}</p>
                  </div>
                </div>
              </div>

              <Button variant="vault" size="lg" className="w-full h-12" onClick={() => setDisclaimerAccepted(true)}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> I Understand — Take Me to Nutrition Coach
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">By continuing, you acknowledge this tool provides sports nutrition education, not medical advice.</p>
            </motion.div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Apple className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-display text-foreground">VAULT™ NUTRITION COACH</h1>
                <p className="text-xs text-muted-foreground">Sports Nutrition Education · Not Medical Advice</p>
              </div>
              <Badge className="ml-auto bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" /> Education Only
              </Badge>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="chat">AI Coach Chat</TabsTrigger>
              <TabsTrigger value="principles">Nutrition Science</TabsTrigger>
              <TabsTrigger value="meal-plans">Meal Plans</TabsTrigger>
              <TabsTrigger value="supplements">Supplements</TabsTrigger>
            </TabsList>

            {/* ── CHAT TAB ── */}
            <TabsContent value="chat">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-card border border-border rounded-2xl flex flex-col" style={{ height: "600px" }}>
                  <div className="p-4 border-b border-border flex items-center gap-2">
                    <Bot className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-sm text-foreground">Nutrition Coach</span>
                    <Badge className="ml-auto bg-green-500/10 text-green-500 border-green-500/20 text-xs">Online</Badge>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-green-500/10" : "bg-primary"}`}>
                          {msg.role === "assistant" ? <Bot className="w-3.5 h-3.5 text-green-500" /> : <User className="w-3.5 h-3.5 text-primary-foreground" />}
                        </div>
                        <div className={`max-w-[80%] rounded-xl p-3 text-sm ${msg.role === "assistant" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"}`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <Bot className="w-3.5 h-3.5 text-green-500" />
                        </div>
                        <div className="bg-secondary rounded-xl p-3">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-border flex gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about game-day fueling, recovery, hydration, meal timing..."
                      className="resize-none h-12 text-sm"
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    />
                    <Button onClick={sendMessage} disabled={isLoading || !input.trim()} className="shrink-0 h-12 w-12 p-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <h3 className="font-display text-sm text-foreground mb-3">Suggested Questions</h3>
                    <div className="space-y-2">
                      {[
                        "What should I eat 2 hours before a game?",
                        "How much protein do I need as a 16-year-old pitcher?",
                        "What should I eat during a tournament weekend?",
                        "Is creatine safe for high school athletes?",
                        "How do I stay hydrated in hot weather?",
                        "Best foods for overnight recovery?",
                      ].map((q) => (
                        <button key={q} onClick={() => { setInput(q); }} className="w-full text-left text-xs text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-lg p-2.5 transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-xs text-amber-600 font-medium mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Reminder</p>
                    <p className="text-xs text-muted-foreground">This AI provides sports nutrition education only. For a personalized nutrition plan, consult a licensed registered dietitian.</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── PRINCIPLES TAB ── */}
            <TabsContent value="principles">
              <div className="grid md:grid-cols-2 gap-4">
                {nutritionPrinciples.map((p, i) => (
                  <motion.div key={p.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="bg-card border border-border rounded-2xl p-6">
                    <div className={`w-10 h-10 rounded-xl ${p.bg} flex items-center justify-center mb-3`}>
                      <p.icon className={`w-5 h-5 ${p.color}`} />
                    </div>
                    <h3 className="font-display text-foreground mb-3">{p.title}</h3>
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">The Science</p>
                      <p className="text-sm text-muted-foreground">{p.science}</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-3">
                      <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-1">Practical Application</p>
                      <p className="text-sm text-muted-foreground">{p.practical}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* ── MEAL PLANS TAB ── */}
            <TabsContent value="meal-plans">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Note:</span> These are sample meal plan templates based on sports science guidelines. Calorie and macro values are approximations. Individual needs vary. These are educational examples — not personalized dietary prescriptions.</p>
              </div>
              <div className="space-y-8">
                {Object.values(mealPlanTemplates).map((plan) => (
                  <div key={plan.title} className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-display text-xl text-foreground">{plan.title}</h3>
                        <p className="text-sm text-muted-foreground">{plan.timing}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {plan.meals.map((meal, i) => (
                        <div key={i} className="flex gap-4 bg-secondary rounded-xl p-4">
                          <div className="w-20 shrink-0">
                            <p className="text-xs font-medium text-foreground">{meal.time}</p>
                            <p className="text-xs text-muted-foreground">{meal.meal}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground mb-1">{meal.foods}</p>
                            <p className="text-xs text-muted-foreground">{meal.macros}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ── SUPPLEMENTS TAB ── */}
            <TabsContent value="supplements">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Critical Reminder:</span> The supplement industry is largely unregulated. Always choose NSF Certified for Sport or Informed Sport certified products. Youth athletes under 18 should consult a physician before taking any supplement beyond basic vitamins. The FDA does not pre-approve dietary supplements for safety or effectiveness.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {supplementInfo.map((supp) => (
                  <div key={supp.name} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display text-foreground">{supp.name}</h3>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge className={`text-xs ${supp.color.replace("text-", "bg-").replace("500", "500/10")} ${supp.color} border-0`}>
                          Evidence: {supp.evidence}
                        </Badge>
                        <Badge variant="outline" className="text-xs">Youth: {supp.safe_for_youth.split(" — ")[0]}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{supp.notes}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default NutritionCoach;
