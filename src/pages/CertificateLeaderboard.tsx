import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Award, Medal, Crown, GraduationCap, Calendar, ChevronRight, Clock, CalendarDays, CalendarRange, Infinity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCertificateLeaderboard, TimeFilter } from "@/hooks/useCertificateLeaderboard";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">#{rank}</span>;
  }
};

const getRankBadgeClass = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-500 to-amber-500 text-black border-yellow-400";
    case 2:
      return "bg-gradient-to-r from-gray-400 to-gray-500 text-black border-gray-300";
    case 3:
      return "bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-500";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const timeFilterLabels: Record<TimeFilter, { label: string; icon: React.ReactNode; description: string }> = {
  week: { label: "This Week", icon: <Clock className="w-4 h-4" />, description: "Last 7 days" },
  month: { label: "This Month", icon: <CalendarDays className="w-4 h-4" />, description: "Last 30 days" },
  year: { label: "This Year", icon: <CalendarRange className="w-4 h-4" />, description: "Last 365 days" },
  all: { label: "All Time", icon: <Infinity className="w-4 h-4" />, description: "Since the beginning" },
};

const CertificateLeaderboard = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const { data: leaderboard, isLoading } = useCertificateLeaderboard(50, timeFilter);

  const topThree = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-primary" />
            <h1 className="font-bebas text-4xl md:text-5xl tracking-wide">
              Certificate Leaderboard
            </h1>
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Celebrating our top achievers who have earned the most course completion certificates at VAULT™ Baseball.
          </p>
        </motion.div>

        {/* Time Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)} className="w-full max-w-lg">
            <TabsList className="grid grid-cols-4 w-full h-auto p-1">
              {(Object.keys(timeFilterLabels) as TimeFilter[]).map((filter) => (
                <TabsTrigger
                  key={filter}
                  value={filter}
                  className="flex flex-col gap-0.5 py-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    {timeFilterLabels[filter].icon}
                    <span className="hidden sm:inline">{timeFilterLabels[filter].label}</span>
                    <span className="sm:hidden">{filter === 'all' ? '∞' : filter.charAt(0).toUpperCase()}</span>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Current Filter Info */}
        <motion.div
          key={timeFilter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <Badge variant="outline" className="gap-2 px-4 py-2">
            {timeFilterLabels[timeFilter].icon}
            <span>{timeFilterLabels[timeFilter].description}</span>
          </Badge>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <motion.div 
            key={timeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                {/* Second Place */}
                {topThree[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="md:order-1 md:mt-8"
                  >
                    <Card className="border-gray-400/50 bg-gradient-to-b from-gray-400/10 to-transparent overflow-hidden">
                      <CardContent className="p-6 text-center">
                        <div className="mb-4">
                          <Medal className="w-12 h-12 text-gray-400 mx-auto" />
                        </div>
                        <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-gray-400/50">
                          <AvatarImage src={topThree[1].avatar_url || ""} />
                          <AvatarFallback className="bg-gray-600 text-white text-xl">
                            {topThree[1].display_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold text-lg mb-1">{topThree[1].display_name}</h3>
                        <Badge className={getRankBadgeClass(2)}>
                          <Award className="w-3 h-3 mr-1" />
                          {topThree[1].certificate_count} Certificates
                        </Badge>
                        <div className="mt-4 text-xs text-muted-foreground">
                          {topThree[1].courses_completed.slice(0, 2).join(", ")}
                          {topThree[1].courses_completed.length > 2 && ` +${topThree[1].courses_completed.length - 2} more`}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* First Place */}
                {topThree[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:order-2"
                  >
                    <Card className="border-primary/50 bg-gradient-to-b from-primary/20 to-transparent overflow-hidden relative">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15)_0%,transparent_70%)]" />
                      <CardContent className="p-6 text-center relative">
                        <div className="mb-4">
                          <Crown className="w-16 h-16 text-yellow-500 mx-auto animate-pulse" />
                        </div>
                        <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/50">
                          <AvatarImage src={topThree[0].avatar_url || ""} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                            {topThree[0].display_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-xl mb-2">{topThree[0].display_name}</h3>
                        <Badge className={getRankBadgeClass(1)}>
                          <Trophy className="w-3 h-3 mr-1" />
                          {topThree[0].certificate_count} Certificates
                        </Badge>
                        <div className="mt-4 text-sm text-muted-foreground">
                          {topThree[0].courses_completed.slice(0, 3).join(", ")}
                          {topThree[0].courses_completed.length > 3 && ` +${topThree[0].courses_completed.length - 3} more`}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Third Place */}
                {topThree[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:order-3 md:mt-12"
                  >
                    <Card className="border-amber-600/50 bg-gradient-to-b from-amber-600/10 to-transparent overflow-hidden">
                      <CardContent className="p-6 text-center">
                        <div className="mb-4">
                          <Medal className="w-10 h-10 text-amber-600 mx-auto" />
                        </div>
                        <Avatar className="w-16 h-16 mx-auto mb-4 ring-4 ring-amber-600/50">
                          <AvatarImage src={topThree[2].avatar_url || ""} />
                          <AvatarFallback className="bg-amber-700 text-white text-lg">
                            {topThree[2].display_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold mb-1">{topThree[2].display_name}</h3>
                        <Badge className={getRankBadgeClass(3)}>
                          <Award className="w-3 h-3 mr-1" />
                          {topThree[2].certificate_count} Certificates
                        </Badge>
                        <div className="mt-4 text-xs text-muted-foreground">
                          {topThree[2].courses_completed.slice(0, 2).join(", ")}
                          {topThree[2].courses_completed.length > 2 && ` +${topThree[2].courses_completed.length - 2} more`}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}

            {/* Rest of Leaderboard */}
            {rest.length > 0 && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    All Achievers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {rest.map((entry, index) => (
                      <motion.div
                        key={entry.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="w-8 flex justify-center">
                          {getRankIcon(index + 4)}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={entry.avatar_url || ""} />
                          <AvatarFallback className="bg-muted">
                            {entry.display_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{entry.display_name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.courses_completed.slice(0, 2).join(", ")}
                            {entry.courses_completed.length > 2 && ` +${entry.courses_completed.length - 2} more`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(entry.latest_certificate_date), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge variant="secondary" className="gap-1">
                            <Award className="w-3 h-3" />
                            {entry.certificate_count}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {timeFilter === 'all' ? 'No Certificates Yet' : `No Certificates ${timeFilterLabels[timeFilter].description}`}
              </h3>
              <p className="text-muted-foreground mb-4">
                {timeFilter === 'all' 
                  ? 'Be the first to complete a course and earn your certificate!'
                  : `No one has earned a certificate ${timeFilterLabels[timeFilter].description.toLowerCase()}. Check back soon!`
                }
              </p>
              <a
                href="/courses"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Browse Courses <ChevronRight className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CertificateLeaderboard;
