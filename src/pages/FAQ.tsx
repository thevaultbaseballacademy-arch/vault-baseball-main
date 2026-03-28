import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  HelpCircle, 
  Search, 
  GraduationCap, 
  Award, 
  CreditCard, 
  Settings,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const faqData = {
  courses: {
    icon: GraduationCap,
    title: "Courses & Training",
    questions: [
      {
        q: "What programs are available on Vault Baseball?",
        a: "We offer elite training programs across all five V.A.U.L.T. pillars: Velocity (hitting and pitching systems), Athleticism (speed, strength, and conditioning), Utility (catcher development and positional versatility), Longevity (arm care and workload management), and Transfer (competitive execution). Each program is research-backed and includes video lessons, drills, metrics tracking, and progressive overload."
      },
      {
        q: "How long do I have access to a program after purchasing?",
        a: "Once you purchase a program, you have lifetime access to all course materials. This includes any future updates or additions to the content."
      },
      {
        q: "Can I download course videos for offline viewing?",
        a: "Currently, all content is streamed through our platform to ensure you always have access to the latest updates. Offline viewing is not available at this time."
      },
      {
        q: "How do I track my progress through a program?",
        a: "Your progress is automatically tracked as you complete lessons. You can view your progress on the course detail page and in your My Programs dashboard. Completed lessons are marked with a checkmark."
      },
      {
        q: "Are there any prerequisites for the programs?",
        a: "Our programs are designed for athletes ages 12–18 at various skill levels. Youth programs (ages 9–13) focus on foundational mechanics, while Elite programs are built for competitive high school athletes. Each program description includes the recommended skill level."
      },
      {
        q: "Do I receive a certificate after completing a program?",
        a: "Yes! Upon completing all lessons in a program, you'll receive a digital certificate of completion that you can download, share, and add to your profile."
      }
    ]
  },
  certifications: {
    icon: Award,
    title: "Certifications",
    questions: [
      {
        q: "What certifications does Vault Baseball offer?",
        a: "We offer five certification levels: Foundations (entry-level), Performance (advanced), and three Specialist certifications for Catcher, Infield, and Outfield positions. Each certification validates your coaching knowledge and skills."
      },
      {
        q: "How do I prepare for a certification exam?",
        a: "Each certification has recommended study materials and courses. We suggest completing the relevant courses, reviewing the exam topics outline, and practicing with sample questions when available."
      },
      {
        q: "What is the passing score for certification exams?",
        a: "The passing score varies by certification level: Foundations requires 70%, Performance requires 75%, and Specialist certifications require 80%. You'll receive your score immediately after completing the exam."
      },
      {
        q: "How long are certifications valid?",
        a: "Certifications are valid for 12 months from the date of issue. You'll receive reminder emails before expiration, and you can renew by retaking the exam at a discounted rate."
      },
      {
        q: "Can I retake a certification exam if I don't pass?",
        a: "Yes, you can retake any certification exam. There's a 24-hour waiting period between attempts, and each attempt requires a new exam fee unless you have an active subscription that includes unlimited attempts."
      },
      {
        q: "How do I verify someone's certification?",
        a: "You can verify any Vault Baseball certification using our public verification tool. Simply enter the certificate number on the Verify Certificate page to confirm its authenticity and current status."
      }
    ]
  },
  subscriptions: {
    icon: CreditCard,
    title: "Subscriptions & Billing",
    questions: [
      {
        q: "What subscription plans are available?",
        a: "We offer three tiers: Athlete ($29/month), Performance ($59/month), and Elite ($149/month). We also offer Founder's Lifetime Access at $499 — a one-time payment for permanent access to all current and future VAULT™ programs."
      },
      {
        q: "Can I cancel my subscription at any time?",
        a: "Yes, you can cancel your subscription at any time from your Account settings. You'll continue to have access until the end of your current billing period."
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor. We also support Apple Pay and Google Pay."
      },
      {
        q: "Is there a free trial available?",
        a: "Yes! We offer a 7-Day Velocity Baseline Trial — no credit card required. You'll get baseline scores across all 5 pillars so you can see exactly where you stand before committing."
      },
      {
        q: "What is your refund policy?",
        a: "We offer a 30-day money-back guarantee for first-time subscribers. If you're not satisfied, contact our support team within 30 days for a full refund. Please see our Refund Policy for complete details."
      },
      {
        q: "Do you offer team or organization discounts?",
        a: "Yes! We offer special pricing for teams, schools, and organizations. Contact our sales team for custom pricing based on your group size and needs."
      }
    ]
  },
  platform: {
    icon: Settings,
    title: "Platform & Account",
    questions: [
      {
        q: "How do I reset my password?",
        a: "Click 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link within a few minutes. Check your spam folder if you don't see it."
      },
      {
        q: "Can I change my email address?",
        a: "Yes, you can update your email address in your Account settings. You'll need to verify your new email address before the change takes effect."
      },
      {
        q: "Is my personal information secure?",
        a: "Absolutely. We use industry-standard encryption and security measures to protect your data. We never sell your personal information to third parties. See our Privacy Policy for details."
      },
      {
        q: "What devices and browsers are supported?",
        a: "Vault Baseball works on all modern web browsers (Chrome, Firefox, Safari, Edge) and is fully responsive for mobile devices. We recommend keeping your browser updated for the best experience."
      },
      {
        q: "How do I contact support?",
        a: "You can reach our support team through the Contact page, use our AI assistant for instant help, or email us at support@vaultbaseball.com. We typically respond within 24-48 hours."
      },
      {
        q: "Can I delete my account?",
        a: "Yes, you can request account deletion from your Privacy Settings page. Please note that this action is permanent and will remove all your data, including course progress and certificates."
      }
    ]
  }
};

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("courses");

  const filteredFaqs = Object.entries(faqData).reduce((acc, [key, category]) => {
    const filteredQuestions = category.questions.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredQuestions.length > 0) {
      acc[key] = { ...category, questions: filteredQuestions };
    }
    return acc;
  }, {} as typeof faqData);

  const totalResults = Object.values(filteredFaqs).reduce(
    (sum, cat) => sum + cat.questions.length,
    0
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display text-foreground mb-3 tracking-wider">
              FREQUENTLY ASKED QUESTIONS
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our programs, certifications, subscriptions, and platform.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Found {totalResults} result{totalResults !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* FAQ Content */}
          {searchQuery ? (
            // Search Results View
            <div className="space-y-6">
              {Object.entries(filteredFaqs).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <h2 className="font-semibold text-lg">{category.title}</h2>
                    </div>
                    <Accordion type="single" collapsible className="space-y-2">
                      {category.questions.map((item, idx) => (
                        <AccordionItem
                          key={idx}
                          value={`${key}-${idx}`}
                          className="border rounded-lg px-4"
                        >
                          <AccordionTrigger className="text-left hover:no-underline">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                );
              })}
              {totalResults === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No results found</h3>
                    <p className="text-muted-foreground mb-4">
                      We couldn't find any FAQs matching "{searchQuery}"
                    </p>
                    <Button variant="outline" onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            // Tabbed View
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                {Object.entries(faqData).map(([key, category]) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger key={key} value={key} className="gap-2">
                      <Icon className="h-4 w-4 hidden sm:block" />
                      <span className="text-xs sm:text-sm">{category.title.split(" ")[0]}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {Object.entries(faqData).map(([key, category]) => (
                <TabsContent key={key} value={key}>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((item, idx) => (
                      <AccordionItem
                        key={idx}
                        value={`item-${idx}`}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="text-left hover:no-underline">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Still Need Help */}
          <Card className="mt-12 bg-muted/50">
            <CardContent className="py-8 text-center">
              <MessageCircle className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <Link to="/contact">Contact Support</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact">Chat with AI Assistant</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
