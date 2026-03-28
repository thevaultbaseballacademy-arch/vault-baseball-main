import { motion } from "framer-motion";
import { Zap, Dumbbell, Shuffle, Heart, Target, ArrowRight, Power, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";

const Hero = () => {
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null);

  const pillars = [
    { 
      letter: "V", 
      name: "Velocity", 
      icon: Zap, 
      color: "bg-velocity", 
      textColor: "text-velocity",
      borderColor: "border-velocity",
      metric: "95+ MPH" 
    },
    { 
      letter: "A", 
      name: "Athleticism", 
      icon: Dumbbell, 
      color: "bg-athleticism", 
      textColor: "text-athleticism",
      borderColor: "border-athleticism",
      metric: "6.8s 60yd" 
    },
    { 
      letter: "U", 
      name: "Utility", 
      icon: Shuffle, 
      color: "bg-utility", 
      textColor: "text-utility",
      borderColor: "border-utility",
      metric: "5+ Positions" 
    },
    { 
      letter: "L", 
      name: "Longevity", 
      icon: Heart, 
      color: "bg-longevity", 
      textColor: "text-longevity",
      borderColor: "border-longevity",
      metric: "Zero DL Days" 
    },
    { 
      letter: "T", 
      name: "Transfer", 
      icon: Target, 
      color: "bg-transfer", 
      textColor: "text-transfer",
      borderColor: "border-transfer",
      metric: "Game-Ready" 
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Matte black overlay with accent streaks */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#181818] via-[#181818]/95 to-[#181818]/90" />
        
        {/* Pillar accent streaks */}
        <div className="absolute top-0 left-[10%] w-px h-full bg-gradient-to-b from-transparent via-velocity/30 to-transparent" />
        <div className="absolute top-0 left-[30%] w-px h-full bg-gradient-to-b from-transparent via-athleticism/20 to-transparent" />
        <div className="absolute top-0 left-[50%] w-px h-full bg-gradient-to-b from-transparent via-utility/20 to-transparent" />
        <div className="absolute top-0 left-[70%] w-px h-full bg-gradient-to-b from-transparent via-longevity/20 to-transparent" />
        <div className="absolute top-0 left-[90%] w-px h-full bg-gradient-to-b from-transparent via-transfer/20 to-transparent" />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(#F5F5F5 1px, transparent 1px),
            linear-gradient(90deg, #F5F5F5 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 border border-[#4A4A4A]/50 bg-[#181818]/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-longevity animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] text-[#B9B9B9]">System Active</span>
            </div>
            <div className="w-px h-4 bg-[#4A4A4A]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#F5F5F5]">V.A.U.L.T. OS v2.0</span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-6"
        >
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-display leading-[0.85] tracking-wider text-[#F5F5F5]">
            VAULT<span className="text-[#4A4A4A]">™</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-lg md:text-xl font-display tracking-[0.3em] text-[#B9B9B9] mb-3"
        >
          THE BASEBALL OPERATING SYSTEM
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-center text-base md:text-lg text-[#B9B9B9] max-w-2xl mx-auto mb-12 font-body"
        >
          5 Pillars. Game-Ready Transfers. Standardized for Next-Level Athletes.
        </motion.p>

        {/* 5 Pillars - Horizontal Dashboard Modules */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-[#B9B9B9]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#B9B9B9]">The 5 Pillars</span>
          </div>
          
          <div className="grid grid-cols-5 gap-1 md:gap-3 max-w-5xl mx-auto">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              const isHovered = hoveredPillar === index;
              
              return (
                <motion.div
                  key={pillar.letter}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.08 }}
                  onMouseEnter={() => setHoveredPillar(index)}
                  onMouseLeave={() => setHoveredPillar(null)}
                  className={`group relative bg-[#181818] border-2 ${isHovered ? pillar.borderColor : 'border-[#4A4A4A]/30'} p-3 md:p-5 cursor-pointer transition-all duration-200`}
                >
                  {/* Top accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${pillar.color} transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-50'}`} />
                  
                  <div className="relative flex flex-col items-center text-center">
                    <div className={`w-10 h-10 md:w-14 md:h-14 border ${isHovered ? pillar.borderColor : 'border-[#4A4A4A]/50'} flex items-center justify-center mb-2 md:mb-3 transition-colors`}>
                      <Icon className={`w-5 h-5 md:w-7 md:h-7 ${pillar.textColor}`} />
                    </div>
                    <span className={`text-3xl md:text-5xl font-display ${pillar.textColor} mb-1`}>{pillar.letter}</span>
                    <span className="text-[9px] md:text-xs text-[#B9B9B9] uppercase tracking-[0.15em]">{pillar.name}</span>
                    
                    {/* Metric badge */}
                    <div className={`mt-2 px-2 py-1 border ${isHovered ? pillar.borderColor : 'border-[#4A4A4A]/30'} transition-colors`}>
                      <span className="text-[8px] md:text-[10px] text-[#F5F5F5] uppercase tracking-wider">{pillar.metric}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Free Trial CTA — Primary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-block p-6 md:p-8 border-2 border-velocity/50 bg-[#181818]/80 backdrop-blur-sm mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-velocity via-athleticism to-transfer" />
            <p className="text-xs uppercase tracking-[0.25em] text-velocity mb-2 font-display">Start Free — No Card Required</p>
            <p className="text-xl md:text-2xl font-display text-[#F5F5F5] tracking-wide mb-1">
              7-Day Velocity Baseline Trial
            </p>
            <p className="text-sm text-[#B9B9B9] mt-2 font-body max-w-md mx-auto">
              Get your baseline scores across all 5 pillars. See exactly where you stand — and what it takes to play at the next level.
            </p>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/trial">
            <Button variant="activate" size="xl" className="w-full sm:w-auto group">
              <Power className="w-5 h-5 mr-2 animate-os-toggle" />
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/products/founders-access">
            <Button variant="vaultOutline" size="xl" className="w-full sm:w-auto border-[#F5F5F5]/30 text-[#F5F5F5] hover:bg-[#F5F5F5] hover:text-[#181818]">
              Secure Founder's Access — $499 Lifetime
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;
