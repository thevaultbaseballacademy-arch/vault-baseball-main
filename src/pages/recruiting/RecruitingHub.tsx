import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  GraduationCap, Target, Calendar, Users, CheckSquare,
  Bot, ChevronRight, TrendingUp, Award, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRecruitingProfile } from "@/hooks/useRecruitingProfile";
import { useSport } from "@/contexts/SportContext";

const RecruitingHub = () => {
  const { profile, showcases, contacts, checklist, loading, readinessScore } = useRecruitingProfile();
  const { sportConfig } = useSport();

  const commitmentLabel: Record<string, string> = {
    uncommitted: "Uncommitted",
    verbal_commit: "Verbal Commit",
    signed: "Signed NLI",
    enrolled: "Enrolled",
  };

  const upcomingShowcases = showcases.filter(
    (s) => s.event_date && new Date(s.event_date) >= new Date() && s.status !== "cancelled"
  ).slice(0, 3);

  const activeContacts = contacts.filter((c) => c.contact_status !== "declined").slice(0, 5);
  const completedItems = checklist.filter((c) => c.is_completed).length;

  const sections = [
    { title: "Recruiting Profile", desc: "Academic info, videos, NCAA registration", icon: GraduationCap, href: "/recruiting/profile", color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Showcase Tracker", desc: "Camps, combines, showcases, visits", icon: Calendar, href: "/recruiting/showcases", color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "College Contacts", desc: "Track outreach to college coaches", icon: Users, href: "/recruiting/contacts", color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Readiness Checklist", desc: "Step-by-step recruiting preparation", icon: CheckSquare, href: "/recruiting/checklist", color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Recruiting Assistant", desc: "AI help with emails, timelines, prep", icon: Bot, href: "/recruiting/assistant", color: "text-primary", bg: "bg-primary/10" },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-secondary animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h1 className="text-3xl font-display text-foreground">RECRUITING HUB</h1>
                <p className="text-muted-foreground text-sm">{sportConfig.displayName} Recruiting Readiness</p>
              </div>
            </div>
          </motion.div>

          {/* Readiness Score */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                <h2 className="font-display text-lg text-foreground">Recruiting Readiness</h2>
              </div>
              <span className="text-2xl font-display text-green-500">{readinessScore}%</span>
            </div>
            <Progress value={readinessScore} className="h-3 mb-2" />
            <p className="text-xs text-muted-foreground">{completedItems} of {checklist.length} items completed</p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-secondary rounded-xl p-3 text-center">
                <p className="text-2xl font-display text-foreground">{contacts.length}</p>
                <p className="text-xs text-muted-foreground">Schools</p>
              </div>
              <div className="bg-secondary rounded-xl p-3 text-center">
                <p className="text-2xl font-display text-foreground">{showcases.length}</p>
                <p className="text-xs text-muted-foreground">Events</p>
              </div>
              <div className="bg-secondary rounded-xl p-3 text-center">
                <p className="text-2xl font-display text-foreground capitalize">
                  {commitmentLabel[profile?.commitment_status || "uncommitted"]}
                </p>
                <p className="text-xs text-muted-foreground">Status</p>
              </div>
            </div>
          </motion.div>

          {/* Section Cards */}
          <div className="space-y-3 mb-8">
            {sections.map((section, i) => (
              <motion.div key={section.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                <Link to={section.href}>
                  <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-accent/50 transition-all group">
                    <div className={`w-12 h-12 rounded-xl ${section.bg} flex items-center justify-center shrink-0`}>
                      <section.icon className={`w-6 h-6 ${section.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-foreground">{section.title}</h3>
                      <p className="text-sm text-muted-foreground">{section.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Upcoming Showcases Preview */}
          {upcomingShowcases.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" /> Upcoming Events
                </h3>
                <Link to="/recruiting/showcases" className="text-xs text-primary hover:underline">View All</Link>
              </div>
              <div className="space-y-2">
                {upcomingShowcases.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.event_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.event_date ? new Date(s.event_date).toLocaleDateString() : "TBD"}
                        {s.location ? ` • ${s.location}` : ""}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 capitalize">{s.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Active Contacts Preview */}
          {activeContacts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" /> Active Contacts
                </h3>
                <Link to="/recruiting/contacts" className="text-xs text-primary hover:underline">View All</Link>
              </div>
              <div className="space-y-2">
                {activeContacts.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Award className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.school_name}</p>
                      <p className="text-xs text-muted-foreground">{c.coach_name || "No contact yet"} • {c.division || "—"}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      c.interest_level === "high" || c.interest_level === "mutual"
                        ? "bg-green-500/10 text-green-500"
                        : c.interest_level === "medium"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-secondary text-muted-foreground"
                    }`}>{c.interest_level}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default RecruitingHub;
