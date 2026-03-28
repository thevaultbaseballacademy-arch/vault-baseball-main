import { motion } from "framer-motion";
import { Video, Check, ArrowRight, Loader2, Clock, FileVideo, MessageSquare, Repeat, Star, Zap, Target, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const VideoAnalysis = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.video_analysis_5pack;

  const process = [
    { icon: FileVideo, title: "1. Upload Your Video", description: "Submit any video through our secure portal. Works with iPhone, Android, high-speed cameras — any format, any angle." },
    { icon: Clock, title: "2. Expert Analysis", description: "VAULT coaches review your mechanics frame-by-frame, identifying the highest-leverage fixes for your development." },
    { icon: MessageSquare, title: "3. Video Response", description: "Receive a detailed video breakdown (5-10 min) with specific drills and action items tailored to your mechanics." },
    { icon: Repeat, title: "4. Track Progress", description: "Use all 5 analyses whenever you need feedback. Submit re-check videos to measure improvement over time." },
  ];

  const whatYouGet = [
    { item: "5 professional video analyses", detail: "Use anytime, no expiration" },
    { item: "Detailed video response for each submission", detail: "5-10 minute breakdown with screen annotations" },
    { item: "3 specific VAULT fixes per analysis", detail: "Prioritized for maximum impact" },
    { item: "Drill recommendations for each fix", detail: "Exactly what to work on next" },
    { item: "Priority queue turnaround", detail: "48-hour guaranteed response time" },
    { item: "Re-check videos to track progress", detail: "Compare before/after mechanics" },
    { item: "Works for hitting, pitching, or fielding", detail: "All baseball movements covered" },
    { item: "Lifetime access — no expiration", detail: "Use at your own pace over months or years" },
  ];

  const exampleFixes = [
    { 
      area: "Pitching", 
      description: "Arm health and velocity optimization",
      fixes: [
        "Hip lead timing — creating separation before arm acceleration",
        "Arm path efficiency — eliminating wasted motion and stress points",
        "Stride direction — optimizing energy transfer to the target",
        "Trunk rotation sequencing — unlocking hidden velocity",
        "Release point consistency — improving command"
      ] 
    },
    { 
      area: "Hitting", 
      description: "Contact quality and power generation",
      fixes: [
        "Bat path optimization — getting on plane earlier",
        "Hip rotation sequencing — generating rotational power",
        "Load mechanics — timing and rhythm improvements",
        "Barrel accuracy — reducing swing-and-miss",
        "Launch angle adjustments — optimizing ball flight"
      ] 
    },
    { 
      area: "Fielding", 
      description: "Speed and efficiency improvements",
      fixes: [
        "First step quickness — reaction time improvements",
        "Glove positioning — catching the ball out front",
        "Transfer speed — shaving time on throws",
        "Footwork patterns — efficient body positioning",
        "Arm action — quick, accurate release"
      ] 
    },
  ];

  const pricing = [
    { name: "Single Analysis", price: "$39", perUnit: "$39/video", highlight: false },
    { name: "5-Pack", price: "$149", perUnit: "$29.80/video", highlight: true, savings: "Save $46" },
    { name: "10-Pack", price: "$249", perUnit: "$24.90/video", highlight: false, savings: "Save $141" },
  ];

  const whoItsFor = [
    { title: "Basic/Performance Members", description: "Add expert video feedback to your self-guided training", icon: Users },
    { title: "Serious Travel Ball Players", description: "Get college-level coaching without the travel costs", icon: Target },
    { title: "Parents Wanting Expert Guidance", description: "Know exactly what your athlete should work on", icon: Shield },
    { title: "Athletes Between Lessons", description: "Get feedback between in-person sessions", icon: TrendingUp },
  ];

  const testimonials = [
    { name: "Coach Dave M.", role: "12U Travel Ball", quote: "I use these for my entire team. Parents love getting professional analysis for each kid without paying for individual lessons.", rating: 5 },
    { name: "Ryan S.", role: "High School RHP", quote: "My in-person coach charges $80/session. These analyses give me just as much to work on at a fraction of the cost.", rating: 5 },
    { name: "Parent of Tommy K.", role: "14U Player", quote: "Finally, I know if what my son's travel coach is teaching is actually correct. VAULT confirmed some things and corrected others.", rating: 5 },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-600 text-sm font-medium border border-cyan-500/20">
                <Video className="w-4 h-4" />
                Perfect Add-On for Members — Zero Overhead
              </span>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-cyan-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                VIDEO ANALYSIS 5-PACK
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                Get professional eyes on your mechanics. Upload any video, receive a detailed video breakdown 
                with 3 specific VAULT fixes within 48 hours. No guessing, no generic advice — just actionable feedback.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-600">
                  <Clock className="w-3 h-3 mr-1" /> 48-Hour Turnaround
                </Badge>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-600">
                  <Video className="w-3 h-3 mr-1" /> 5 Full Analyses
                </Badge>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-600">
                  <Zap className="w-3 h-3 mr-1" /> 3 Fixes Per Video
                </Badge>
              </div>
            </motion.div>

            {/* Process */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">How It Works</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {process.map((step, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5 text-center relative">
                    {i < process.length - 1 && (
                      <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-muted-foreground z-10">
                        →
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mx-auto mb-3">
                      <step.icon className="w-6 h-6 text-cyan-500" />
                    </div>
                    <h3 className="font-medium text-foreground text-sm mb-2">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Who It's For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            >
              {whoItsFor.map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-5 h-5 text-cyan-500" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </motion.div>

            {/* Example Fixes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-2 text-center">Example VAULT Fixes</h3>
              <p className="text-center text-muted-foreground mb-6">Real examples of what our coaches identify and correct</p>
              <div className="grid md:grid-cols-3 gap-4">
                {exampleFixes.map((category, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <h4 className="font-display text-foreground mb-1">{category.area}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{category.description}</p>
                    <ul className="space-y-2">
                      {category.fixes.map((fix, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                          {fix}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pricing Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">Choose Your Pack</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {pricing.map((option, i) => (
                  <div 
                    key={i} 
                    className={`rounded-xl p-6 text-center ${
                      option.highlight 
                        ? 'bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-2 border-cyan-500/40' 
                        : 'bg-card border border-border'
                    }`}
                  >
                    {option.highlight && (
                      <Badge className="bg-cyan-500 text-white border-0 mb-3">
                        Most Popular
                      </Badge>
                    )}
                    <h4 className="font-display text-foreground text-lg mb-2">{option.name}</h4>
                    <div className="text-3xl font-display text-foreground mb-1">{option.price}</div>
                    <p className="text-sm text-muted-foreground mb-3">{option.perUnit}</p>
                    {option.savings && (
                      <p className="text-sm text-cyan-500 font-medium mb-4">{option.savings}</p>
                    )}
                    {option.highlight && (
                      <Button
                        variant="vault"
                        className="w-full"
                        onClick={() => checkout('video_analysis_5pack')}
                        disabled={loading === 'video_analysis_5pack'}
                      >
                        {loading === 'video_analysis_5pack' ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Get 5-Pack Now
                      </Button>
                    )}
                    {!option.highlight && (
                      <p className="text-xs text-muted-foreground">Contact us for this option</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-6 mb-12"
            >
              <h3 className="text-xl font-display text-foreground mb-6 text-center">What You Get With Each Analysis</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {whatYouGet.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-foreground text-sm font-medium">{item.item}</span>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">What People Are Saying</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {testimonials.map((testimonial, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-cyan-500 text-cyan-500" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-3">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-cyan-500/5 to-cyan-600/10 border border-cyan-500/20 rounded-2xl p-8 text-center"
            >
              <h3 className="text-2xl font-display text-foreground mb-4">Stop Guessing. Start Improving.</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Most athletes train with bad habits because they've never had expert eyes on their mechanics. 
                Get specific, actionable fixes from VAULT coaches who've helped thousands of athletes.
              </p>
              <Button
                variant="vault"
                size="xl"
                onClick={() => checkout('video_analysis_5pack')}
                disabled={loading === 'video_analysis_5pack'}
              >
                {loading === 'video_analysis_5pack' ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                Get Your 5-Pack — {formatPrice(product.price)}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                48-hour turnaround guaranteed • No expiration on analyses • Works for any skill level
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default VideoAnalysis;