import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, Medal, Award, Crown, Star, 
  ChevronDown, Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCertificationDisplayName, type CertificationType } from "@/lib/certificationPricing";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  certification_type: CertificationType;
  score: number;
  issued_at: string;
  total_certifications: number;
}

const CERTIFICATION_TYPES: (CertificationType | 'all')[] = [
  'all',
  'foundations',
  'performance',
  'catcher_specialist',
  'infield_specialist',
  'outfield_specialist',
];

const CertificationLeaderboard = () => {
  const [selectedCert, setSelectedCert] = useState<CertificationType | 'all'>('all');

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['certification-leaderboard', selectedCert],
    queryFn: async () => {
      // Fetch active certifications with profile info
      let query = supabase
        .from('user_certifications')
        .select(`
          user_id,
          certification_type,
          score,
          issued_at
        `)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('score', { ascending: false });

      if (selectedCert !== 'all') {
        query = query.eq('certification_type', selectedCert as any);
      }

      const { data: certs, error } = await query.limit(50);
      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set((certs || []).map(c => c.user_id))];
      
      if (userIds.length === 0) return [];

      // Fetch profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      // Count total certifications per user
      const certCountMap = new Map<string, number>();
      (certs || []).forEach(c => {
        certCountMap.set(c.user_id, (certCountMap.get(c.user_id) || 0) + 1);
      });

      // If showing all, get the best score per user
      if (selectedCert === 'all') {
        const bestScores = new Map<string, typeof certs[0]>();
        (certs || []).forEach(c => {
          const existing = bestScores.get(c.user_id);
          if (!existing || c.score > existing.score) {
            bestScores.set(c.user_id, c);
          }
        });

        return Array.from(bestScores.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, 25)
          .map(c => {
            const profile = profileMap.get(c.user_id);
            return {
              user_id: c.user_id,
              display_name: profile?.display_name || 'Coach',
              avatar_url: profile?.avatar_url || null,
              certification_type: c.certification_type as CertificationType,
              score: c.score,
              issued_at: c.issued_at,
              total_certifications: certCountMap.get(c.user_id) || 1,
            };
          });
      }

      // For specific certification, return top scores
      return (certs || []).slice(0, 25).map(c => {
        const profile = profileMap.get(c.user_id);
        return {
          user_id: c.user_id,
          display_name: profile?.display_name || 'Coach',
          avatar_url: profile?.avatar_url || null,
          certification_type: c.certification_type as CertificationType,
          score: c.score,
          issued_at: c.issued_at,
          total_certifications: certCountMap.get(c.user_id) || 1,
        };
      });
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/10 to-orange-500/10 border-amber-600/30';
      default:
        return 'bg-card border-border';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Trophy className="w-5 h-5" />
                <span className="font-medium">Coach Excellence</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display text-foreground">
                CERTIFICATION LEADERBOARD
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Recognizing our top-performing certified coaches
              </p>
            </div>

            {/* Filter */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-4 justify-between flex-wrap">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="w-4 h-4" />
                    <span>Filter by certification:</span>
                  </div>
                  <Select
                    value={selectedCert}
                    onValueChange={(v) => setSelectedCert(v as CertificationType | 'all')}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Select certification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Certifications</SelectItem>
                      {CERTIFICATION_TYPES.filter(t => t !== 'all').map(type => (
                        <SelectItem key={type} value={type}>
                          {getCertificationDisplayName(type as CertificationType)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Top 3 Podium */}
            {!isLoading && leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 items-end">
                {/* 2nd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-gray-400/30 bg-gradient-to-b from-gray-400/5 to-transparent">
                    <CardContent className="pt-6 text-center">
                      <div className="relative inline-block mb-3">
                        <Avatar className="w-16 h-16 border-2 border-gray-400">
                          <AvatarImage src={leaderboard[1]?.avatar_url || ''} />
                          <AvatarFallback className="bg-gray-400/20 text-gray-600">
                            {getInitials(leaderboard[1]?.display_name || 'C')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          2
                        </div>
                      </div>
                      <h3 className="font-medium text-sm text-foreground truncate">
                        {leaderboard[1]?.display_name}
                      </h3>
                      <p className="text-2xl font-display text-gray-500 mt-1">
                        {leaderboard[1]?.score}%
                      </p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {getCertificationDisplayName(leaderboard[1]?.certification_type)}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                >
                  <Card className="border-yellow-500/30 bg-gradient-to-b from-yellow-500/10 to-transparent relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Crown className="w-12 h-12 text-yellow-500 drop-shadow-lg" />
                    </div>
                    <CardContent className="pt-10 pb-6 text-center">
                      <div className="relative inline-block mb-3">
                        <Avatar className="w-20 h-20 border-4 border-yellow-500">
                          <AvatarImage src={leaderboard[0]?.avatar_url || ''} />
                          <AvatarFallback className="bg-yellow-500/20 text-yellow-600">
                            {getInitials(leaderboard[0]?.display_name || 'C')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          1
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground truncate">
                        {leaderboard[0]?.display_name}
                      </h3>
                      <p className="text-3xl font-display text-yellow-500 mt-1">
                        {leaderboard[0]?.score}%
                      </p>
                      <Badge className="mt-2 bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                        {getCertificationDisplayName(leaderboard[0]?.certification_type)}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-amber-600/30 bg-gradient-to-b from-amber-600/5 to-transparent">
                    <CardContent className="pt-6 text-center">
                      <div className="relative inline-block mb-3">
                        <Avatar className="w-16 h-16 border-2 border-amber-600">
                          <AvatarImage src={leaderboard[2]?.avatar_url || ''} />
                          <AvatarFallback className="bg-amber-600/20 text-amber-700">
                            {getInitials(leaderboard[2]?.display_name || 'C')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          3
                        </div>
                      </div>
                      <h3 className="font-medium text-sm text-foreground truncate">
                        {leaderboard[2]?.display_name}
                      </h3>
                      <p className="text-2xl font-display text-amber-600 mt-1">
                        {leaderboard[2]?.score}%
                      </p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {getCertificationDisplayName(leaderboard[2]?.certification_type)}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}

            {/* Full Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No certified coaches yet for this category.</p>
                    <p className="text-sm mt-1">Be the first to earn your certification!</p>
                  </div>
                ) : (
                  leaderboard.map((entry, index) => (
                    <motion.div
                      key={`${entry.user_id}-${entry.certification_type}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-4 p-3 rounded-lg border ${getRankBg(index + 1)}`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0">
                        {getRankIcon(index + 1)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={entry.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(entry.display_name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {entry.display_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{getCertificationDisplayName(entry.certification_type)}</span>
                          {entry.total_certifications > 1 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {entry.total_certifications} certs
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex-shrink-0 text-right">
                        <p className={`text-xl font-display ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-amber-600' :
                          'text-foreground'
                        }`}>
                          {entry.score}%
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Info */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Rankings are based on certification exam scores.</p>
              <p className="mt-1">Only active, non-expired certifications are shown.</p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CertificationLeaderboard;
