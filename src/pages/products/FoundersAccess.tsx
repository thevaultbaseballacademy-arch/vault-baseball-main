import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, Lock, Users, CheckCircle, Crown, AlertTriangle, Timer, Play, ChevronLeft, ChevronRight, X, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const FoundersAccess = () => {
  const { checkout, loading } = useProductCheckout();
  const [spotsTaken, setSpotsTaken] = useState(0);
  const [recentFounders, setRecentFounders] = useState<Array<{
    id: string;
    displayName: string;
    avatarUrl: string | null;
    purchasedAt: string;
  }>>([]);
  const TOTAL_SPOTS = 1000;
  const { toast } = useToast();
  const initialLoadRef = useRef(true);
  
  // Countdown timer state - set end date to 30 days from now for demo
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate countdown end date - next Wednesday at 11:59:59 PM (EOD)
  const getNextWednesdayEOD = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 3 = Wednesday
    const daysUntilWednesday = (3 - dayOfWeek + 7) % 7;
    // If today is Wednesday, set to this Wednesday EOD if before midnight, otherwise next Wednesday
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + (daysUntilWednesday === 0 ? 0 : daysUntilWednesday));
    targetDate.setHours(23, 59, 59, 999);
    
    // If we're past this Wednesday's EOD, go to next Wednesday
    if (targetDate <= now) {
      targetDate.setDate(targetDate.getDate() + 7);
    }
    return targetDate;
  };
  
  const endDate = getNextWednesdayEOD();

  // Fetch recent founders
  const fetchRecentFounders = async () => {
    const { data: purchases } = await supabase
      .from('user_purchases')
      .select('user_id, purchased_at')
      .eq('product_key', 'founders_access')
      .eq('status', 'completed')
      .order('purchased_at', { ascending: false })
      .limit(8);

    if (purchases && purchases.length > 0) {
      const userIds = purchases.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const foundersWithProfiles = purchases.map(purchase => {
        const profile = profiles?.find(p => p.user_id === purchase.user_id);
        return {
          id: purchase.user_id,
          displayName: profile?.display_name || 'Vault Founder',
          avatarUrl: profile?.avatar_url || null,
          purchasedAt: purchase.purchased_at,
        };
      });

      setRecentFounders(foundersWithProfiles);
    }
  };

  // Fetch initial count and subscribe to realtime updates
  useEffect(() => {
    // Check how many Founder's Access purchases have been made
    const checkSpots = async () => {
      const { count } = await supabase
        .from('user_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('product_key', 'founders_access')
        .eq('status', 'completed');
      
      setSpotsTaken(count || 0);
      // Mark initial load as complete after fetching
      setTimeout(() => {
        initialLoadRef.current = false;
      }, 1000);
    };
    checkSpots();
    fetchRecentFounders();

    // Subscribe to realtime updates for new purchases
    const channel = supabase
      .channel('founders-access-purchases')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_purchases',
          filter: 'product_key=eq.founders_access',
        },
        (payload) => {
          // When a new founders_access purchase is inserted, refresh the count
          if (payload.new && (payload.new as any).status === 'completed') {
            setSpotsTaken((prev) => {
              const newCount = prev + 1;
              const remaining = TOTAL_SPOTS - newCount;
              // Only show toast after initial load
              if (!initialLoadRef.current) {
                // Refresh recent founders list
                fetchRecentFounders();
                
                toast({
                  title: "🔥 Spot Just Claimed!",
                  description: remaining > 0 
                    ? `Someone just became a Founder! Only ${remaining} spots remaining.`
                    : "That was the last spot! Founder's Access is now SOLD OUT.",
                  duration: 5000,
                });
              }
              
              return newCount;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_purchases',
          filter: 'product_key=eq.founders_access',
        },
        (payload) => {
          // When a purchase status changes to completed, refresh the count
          const oldStatus = (payload.old as any)?.status;
          const newStatus = (payload.new as any)?.status;
          if (oldStatus !== 'completed' && newStatus === 'completed') {
            setSpotsTaken((prev) => {
              const newCount = prev + 1;
              const remaining = TOTAL_SPOTS - newCount;
              
              // Only show toast after initial load
              if (!initialLoadRef.current) {
                // Refresh recent founders list
                fetchRecentFounders();
                
                toast({
                  title: "🔥 Spot Just Claimed!",
                  description: remaining > 0 
                    ? `Someone just became a Founder! Only ${remaining} spots remaining.`
                    : "That was the last spot! Founder's Access is now SOLD OUT.",
                  duration: 5000,
                });
              }
              
              return newCount;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = endDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const spotsRemaining = TOTAL_SPOTS - spotsTaken;
  const isSoldOut = spotsRemaining <= 0;
  const isUrgent = spotsRemaining <= 10 && !isSoldOut;
  const spotsPercentage = (spotsTaken / TOTAL_SPOTS) * 100;

  const pillars = [
    { name: "Velocity", letter: "V", status: "Available Now", color: "text-red-500", bg: "bg-red-500/10", borderColor: "border-red-500/30" },
    { name: "Athleticism", letter: "A", status: "Available Now", color: "text-blue-500", bg: "bg-blue-500/10", borderColor: "border-blue-500/30" },
    { name: "Utility", letter: "U", status: "Available Now", color: "text-green-500", bg: "bg-green-500/10", borderColor: "border-green-500/30" },
    { name: "Longevity", letter: "L", status: "V1 Protocols Active • Full Launch Q2 2026", color: "text-amber-500", bg: "bg-amber-500/10", borderColor: "border-amber-500/30" },
    { name: "Transfer", letter: "T", status: "V1 Protocols Active • Full Launch Q2 2026", color: "text-purple-500", bg: "bg-purple-500/10", borderColor: "border-purple-500/30" },
  ];

  const benefits = [
    "Lifetime access to ALL five VAULT™ pillars",
    "Priority access to Longevity & Transfer systems",
    "Exclusive Founder's Discord channel",
    "Direct input on future features",
    "Founder's badge on profile",
    "All future course content included",
    "No recurring fees - ever",
    "Grandfathered pricing locked in",
  ];

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const founderTestimonials = [
    {
      name: "Jake Morrison",
      role: "D1 Commit, Class of 2025",
      thumbnailUrl: "https://cdn.marblism.com/1NxauWxFGtn.webp",
      videoId: "dQw4w9WgXcQ",
      videoType: "youtube" as const,
      quote: "Best investment I've ever made",
      metric: "+8 mph"
    },
    {
      name: "Ryan Chen",
      role: "High School Junior",
      thumbnailUrl: "https://cdn.marblism.com/HdsE4Gvi9B7.webp",
      videoId: "76979871",
      videoType: "vimeo" as const,
      quote: "Completely transformed my game",
      metric: "3 Offers"
    },
    {
      name: "Mike Patterson",
      role: "Travel Ball Coach",
      thumbnailUrl: "https://cdn.marblism.com/e9fzmmT2o9Q.webp",
      videoId: "jNQXAC9IVRw",
      videoType: "youtube" as const,
      quote: "Worth every penny for my son",
      metric: "Top 100"
    },
    {
      name: "Sarah Williams",
      role: "Parent of 2027 Prospect",
      thumbnailUrl: "https://cdn.marblism.com/nwf4_GebeVT.webp",
      videoId: "L_jWHffIx5E",
      videoType: "youtube" as const,
      quote: "My son's development skyrocketed",
      metric: "+12 mph"
    },
    {
      name: "Bailey Ramirez",
      role: "JUCO Transfer",
      thumbnailUrl: "https://cdn.marblism.com/7oEYJwzA1AH.webp",
      videoId: "148751763",
      videoType: "vimeo" as const,
      quote: "Helped me get to the next level",
      metric: "D1 Offer"
    },
    {
      name: "Coach Eric Silva",
      role: "High School Head Coach",
      thumbnailUrl: "https://cdn.marblism.com/Aq6IXFkCdm5.webp",
      videoId: "ScMzIvxBSi4",
      videoType: "youtube" as const,
      quote: "Game-changer for our program",
      metric: "State Champs"
    },
    {
      name: "Dylan Foster",
      role: "Class of 2026 Pitcher",
      thumbnailUrl: "https://cdn.marblism.com/1NxauWxFGtn.webp",
      videoId: "9bZkp7q19f0",
      videoType: "youtube" as const,
      quote: "The velocity system is legit",
      metric: "+6 mph"
    },
    {
      name: "Marcus Johnson",
      role: "Travel Ball Parent",
      thumbnailUrl: "https://cdn.marblism.com/HdsE4Gvi9B7.webp",
      videoId: "kJQP7kiw5Fk",
      videoType: "youtube" as const,
      quote: "Structured approach we needed",
      metric: "5 Camps"
    },
  ];

  const getVideoEmbedUrl = (videoId: string, videoType: 'youtube' | 'vimeo') => {
    if (videoType === 'youtube') {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  };

  // Carousel setup with autoplay
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    slidesToScroll: 1,
  }, [autoplayPlugin.current]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Video modal state
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedTestimonialIndex, setSelectedTestimonialIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const selectedTestimonial = founderTestimonials[selectedTestimonialIndex];

  const openVideoModal = (testimonial: typeof founderTestimonials[0]) => {
    const index = founderTestimonials.findIndex(t => t.name === testimonial.name);
    setSelectedTestimonialIndex(index >= 0 ? index : 0);
    setVideoModalOpen(true);
  };

  const goToPrevTestimonial = useCallback(() => {
    setSlideDirection('left');
    setSelectedTestimonialIndex(prev => 
      prev === 0 ? founderTestimonials.length - 1 : prev - 1
    );
  }, []);

  const goToNextTestimonial = useCallback(() => {
    setSlideDirection('right');
    setSelectedTestimonialIndex(prev => 
      prev === founderTestimonials.length - 1 ? 0 : prev + 1
    );
  }, []);

  const goToTestimonial = useCallback((index: number) => {
    if (index === selectedTestimonialIndex) return;
    setSlideDirection(index > selectedTestimonialIndex ? 'right' : 'left');
    setSelectedTestimonialIndex(index);
  }, [selectedTestimonialIndex]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!videoContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation for video modal
  useEffect(() => {
    if (!videoModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevTestimonial();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextTestimonial();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoModalOpen, goToPrevTestimonial, goToNextTestimonial]);

  // Swipe gesture handling for video modal
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextTestimonial();
    } else if (isRightSwipe) {
      goToPrevTestimonial();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-500">Limited Time Founder's Window</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display leading-[0.9] mb-6">
                <span className="text-foreground">FOUNDER'S</span>
                <span className="block metallic-text">ACCESS</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
                Get <span className="text-foreground font-semibold">lifetime access</span> to the complete V.A.U.L.T. suite—including systems that haven't even launched yet.
              </p>
              <p className="text-lg text-amber-500 font-medium mb-8">
                One payment. Forever access. No recurring fees.
              </p>
            </motion.div>

            {/* Countdown Timer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <Timer className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pre-Sale Ends In</span>
              </div>
              <div className="flex items-center justify-center gap-3 md:gap-4">
                {[
                  { value: timeLeft.days, label: "Days" },
                  { value: timeLeft.hours, label: "Hours" },
                  { value: timeLeft.minutes, label: "Mins" },
                  { value: timeLeft.seconds, label: "Secs" },
                ].map((item, index) => (
                  <div key={item.label} className="flex items-center gap-3 md:gap-4">
                    <div className="text-center">
                      <div className="w-16 md:w-20 h-16 md:h-20 rounded-xl bg-card border border-border flex items-center justify-center">
                        <span className="text-2xl md:text-4xl font-display text-foreground">
                          {formatNumber(item.value)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 block">{item.label}</span>
                    </div>
                    {index < 3 && (
                      <span className="text-2xl md:text-3xl font-display text-muted-foreground mb-4">:</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Spots Counter & Pricing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10"
            >
              <motion.div
                animate={isUrgent ? {
                  boxShadow: [
                    "0 0 0 0 rgba(239, 68, 68, 0)",
                    "0 0 20px 4px rgba(239, 68, 68, 0.4)",
                    "0 0 0 0 rgba(239, 68, 68, 0)",
                  ],
                } : {}}
                transition={isUrgent ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                } : {}}
              >
                <Card className={`max-w-2xl mx-auto p-6 transition-all duration-300 ${
                  isSoldOut 
                    ? 'border-red-500/50 bg-red-500/5' 
                    : isUrgent 
                      ? 'border-red-500 bg-gradient-to-br from-red-500/10 to-red-500/5' 
                      : 'border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-amber-500/10'
                }`}>
                  {/* Spots Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        <span className="text-foreground font-semibold">{spotsTaken}</span> of {TOTAL_SPOTS} spots claimed
                      </span>
                      <motion.span 
                        className={`text-sm font-semibold ${isUrgent ? 'text-red-500' : 'text-amber-500'}`}
                        animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
                        transition={isUrgent ? { duration: 0.8, repeat: Infinity } : {}}
                      >
                        {spotsRemaining} remaining
                      </motion.span>
                    </div>
                    <Progress 
                      value={spotsPercentage} 
                      className={`h-3 ${isUrgent ? 'bg-red-500/20' : 'bg-muted'}`}
                    />
                    {isUrgent && (
                      <motion.div 
                        className="flex items-center justify-center gap-2 mt-3 text-red-500 text-sm font-semibold"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                        >
                          <AlertTriangle className="w-5 h-5" />
                        </motion.div>
                        <span>🔥 Almost sold out! Only {spotsRemaining} spots left!</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground line-through mb-1">$1,500+</div>
                      <motion.div 
                        className={`text-5xl font-display ${isUrgent ? 'text-red-500' : 'text-foreground'}`}
                        animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
                        transition={isUrgent ? { duration: 1, repeat: Infinity } : {}}
                      >
                        $499
                      </motion.div>
                      <div className="text-sm text-muted-foreground">Lifetime Access</div>
                    </div>
                    <div className="w-px h-16 bg-border" />
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">You Save</div>
                      <div className="text-3xl font-display text-green-500">$1,000+</div>
                      <div className="text-sm text-muted-foreground">vs. Individual</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div
                animate={isUrgent ? { scale: [1, 1.03, 1] } : {}}
                transition={isUrgent ? { duration: 0.8, repeat: Infinity } : {}}
              >
                <Button 
                  variant="vault" 
                  size="xl"
                  onClick={() => checkout('founders_access')}
                  disabled={loading === 'founders_access' || isSoldOut}
                  className={`mb-4 px-12 ${isUrgent ? 'animate-pulse bg-red-600 hover:bg-red-700' : ''}`}
                >
                  {isSoldOut ? (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Sold Out
                    </>
                  ) : loading === 'founders_access' ? (
                    'Processing...'
                  ) : (
                    <>
                      {isUrgent ? '🔥 ' : ''}Claim Your Founder's Spot - $499
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
              <p className="text-sm text-muted-foreground">
                💡 Have a referral code? Enter it at checkout • Secure payment via Stripe
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pillars Grid */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              All Five Pillars. Lifetime Access.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get immediate access to available systems and priority access to upcoming releases.
            </p>
          </motion.div>

          <div className="grid grid-cols-5 gap-2 md:gap-4 max-w-4xl mx-auto">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-3 md:p-6 text-center ${pillar.bg} ${pillar.borderColor} border-2 hover:scale-105 transition-transform`}>
                  <div className={`text-2xl md:text-4xl font-display ${pillar.color} mb-1 md:mb-2`}>
                    {pillar.letter}
                  </div>
                  <div className="font-semibold text-foreground text-xs md:text-base mb-1">{pillar.name}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground hidden md:block">{pillar.status}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Card className="p-8 bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-amber-500" />
                <h3 className="text-2xl font-display text-foreground">Founder's Benefits</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </section>

        {/* Recent Founders - Social Proof */}
        {recentFounders.length > 0 && (
          <section className="container mx-auto px-4 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                <Users className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-500">Recent Founders</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display text-foreground">
                Athletes Who Already Locked In
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {recentFounders.map((founder, index) => (
                <motion.div
                  key={founder.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <Card className="p-4 text-center bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-500/40 transition-colors">
                    {/* Avatar */}
                    <div className="relative mx-auto mb-3">
                      {founder.avatarUrl ? (
                        <img 
                          src={founder.avatarUrl} 
                          alt={founder.displayName}
                          className="w-14 h-14 rounded-full object-cover mx-auto border-2 border-amber-500/30"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto border-2 border-amber-500/30">
                          <span className="text-amber-500 font-semibold text-lg">
                            {getInitials(founder.displayName)}
                          </span>
                        </div>
                      )}
                      {/* Founder badge */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                        <Crown className="w-3 h-3 text-black" />
                      </div>
                    </div>
                    
                    {/* Name */}
                    <p className="font-semibold text-foreground text-sm truncate">
                      {founder.displayName}
                    </p>
                    
                    {/* Time ago */}
                    <p className="text-xs text-muted-foreground mt-1">
                      {getTimeAgo(founder.purchasedAt)}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {spotsTaken > recentFounders.length && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center text-muted-foreground text-sm mt-6"
              >
                +{spotsTaken - recentFounders.length} more founders have joined
              </motion.p>
            )}
          </section>
        )}

        {/* Video Testimonials Carousel */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
              <Play className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-500">Founder Stories</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display text-foreground">
              Hear From Our Founders
            </h2>
          </motion.div>

          {/* Carousel Container */}
          <div className="relative max-w-6xl mx-auto">
            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-background/80 backdrop-blur-sm border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500 hidden md:flex"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-background/80 backdrop-blur-sm border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500 hidden md:flex"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            {/* Carousel */}
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4 md:gap-6">
                {founderTestimonials.map((testimonial, index) => (
                  <div 
                    key={testimonial.name + index} 
                    className="flex-none w-[85%] sm:w-[45%] md:w-[31%]"
                  >
                    <Card className="overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-500/40 transition-all group h-full">
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={testimonial.thumbnailUrl}
                          alt={`${testimonial.name} testimonial`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Play button overlay */}
                        <button 
                          className="absolute inset-0 flex items-center justify-center"
                          onClick={() => openVideoModal(testimonial)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-amber-500 flex items-center justify-center shadow-lg cursor-pointer"
                          >
                            <Play className="w-5 h-5 md:w-6 md:h-6 text-black ml-1" fill="currentColor" />
                          </motion.div>
                        </button>

                        {/* Metric badge */}
                        <div className="absolute top-3 right-3 px-2 md:px-3 py-1 rounded-full bg-amber-500 text-black text-xs md:text-sm font-bold">
                          {testimonial.metric}
                        </div>

                        {/* Founder badge */}
                        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-amber-500 font-medium">Founder</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <p className="text-foreground font-semibold text-sm md:text-base">{testimonial.name}</p>
                        <p className="text-muted-foreground text-xs md:text-sm mb-2">{testimonial.role}</p>
                        <p className="text-amber-500 text-xs md:text-sm italic">"{testimonial.quote}"</p>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-2 mt-6">
              {founderTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    selectedIndex === index 
                      ? 'bg-amber-500 w-6' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            {/* Mobile Swipe Hint */}
            <p className="text-center text-muted-foreground text-xs mt-4 md:hidden">
              ← Swipe to see more →
            </p>
          </div>
        </section>

        {/* Text Testimonial */}
        <section className="container mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-foreground text-lg mb-4">
                "Getting Founder's Access was the best investment I've made for my baseball career. 
                The value keeps growing as new systems get released."
              </p>
              <p className="text-sm text-muted-foreground">— Early Access Athlete</p>
            </div>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-br from-amber-500/10 to-purple-500/10 rounded-3xl p-12 border border-amber-500/20"
          >
            <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              Be Part of the Foundation
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Only <span className="text-foreground font-semibold">{TOTAL_SPOTS}</span> athletes will ever get this offer. 
              Once they're gone, they're gone forever.
            </p>
            <div className="flex items-center justify-center gap-4 mb-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Lifetime Access
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                All 5 Pillars
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No Recurring Fees
              </span>
            </div>
            <Button 
              variant="vault" 
              size="xl"
              onClick={() => checkout('founders_access')}
              disabled={loading === 'founders_access' || isSoldOut}
              className="px-12"
            >
              {isSoldOut ? (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Sold Out
                </>
              ) : loading === 'founders_access' ? (
                'Processing...'
              ) : (
                <>
                  Lock In $499 Lifetime Access
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        </section>
      </main>

      <Footer />

      {/* Video Player Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 bg-black border-amber-500/30 overflow-hidden">
          <div 
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button */}
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Previous button */}
            <button
              onClick={goToPrevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            {/* Next button */}
            <button
              onClick={goToNextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>

            {/* Video Player with Slide Animation */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedTestimonialIndex}
                initial={{ x: slideDirection === 'right' ? 100 : -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: slideDirection === 'right' ? -100 : 100, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* Video Player */}
                <div ref={videoContainerRef} className="relative aspect-video bg-black group">
                  <iframe
                    src={getVideoEmbedUrl(selectedTestimonial.videoId, selectedTestimonial.videoType)}
                    title={`${selectedTestimonial.name} testimonial`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                  {/* Fullscreen toggle button */}
                  <button
                    onClick={toggleFullscreen}
                    className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5 text-white" />
                    ) : (
                      <Maximize className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>

                {/* Testimonial Info */}
                <div className="p-6 bg-gradient-to-br from-card to-card/80">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-amber-500 font-medium uppercase tracking-wider">Founder</span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-amber-500 text-black text-sm font-bold">
                        {selectedTestimonial.metric}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {selectedTestimonialIndex + 1} / {founderTestimonials.length}
                    </span>
                  </div>
                  <h3 className="text-xl font-display text-foreground mb-1">{selectedTestimonial.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{selectedTestimonial.role}</p>
                  <p className="text-amber-500 text-lg italic">"{selectedTestimonial.quote}"</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Thumbnail Navigation */}
            <div className="px-4 py-3 bg-black/90 border-t border-white/10">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {founderTestimonials.map((testimonial, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`relative flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden transition-all duration-200 ${
                      selectedTestimonialIndex === index
                        ? 'ring-2 ring-amber-500 scale-105'
                        : 'opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img
                      src={testimonial.thumbnailUrl}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedTestimonialIndex === index && (
                      <div className="absolute inset-0 bg-amber-500/20" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-muted-foreground text-xs mt-2 text-center hidden md:block">
                Click thumbnails or use ← → keys to navigate
              </p>
              <p className="text-muted-foreground text-xs mt-2 text-center md:hidden">
                Tap thumbnails or swipe to navigate
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoundersAccess;