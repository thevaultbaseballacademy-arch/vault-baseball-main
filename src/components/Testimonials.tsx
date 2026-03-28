import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, TrendingUp, Play, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  videoThumbnail: string;
  metric: string;
}

// All names are composites/initials. School names are fictional.
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "J.M.",
    role: "D1 Commit, Southland University",
    content: "After 8 weeks on the Velocity System, my exit velo went from 82 to 91 mph. The structured approach to training made it easy to stay consistent and see real progress.",
    rating: 5,
    videoThumbnail: "https://cdn.marblism.com/1NxauWxFGtn.webp",
    metric: "+9 MPH Exit Velo",
  },
  {
    id: 2,
    name: "R.C.",
    role: "Junior, Lakeview High School",
    content: "My pop time dropped from 2.08 to 1.93 using the Speed & Agility program. I got my first college showcase invite last month.",
    rating: 5,
    videoThumbnail: "https://cdn.marblism.com/HdsE4Gvi9B7.webp",
    metric: "1.93s Pop Time",
  },
  {
    id: 3,
    name: "Coach M.P.",
    role: "Head Coach, Southwest Titans 16U",
    content: "We implemented Vault across our entire organization. The dashboard makes tracking 20+ athletes manageable, and parents love seeing the progress data.",
    rating: 5,
    videoThumbnail: "https://cdn.marblism.com/e9fzmmT2o9Q.webp",
    metric: "22 Athletes",
  },
  {
    id: 4,
    name: "Parent Review",
    role: "Travel Baseball Parent",
    content: "Finally found a program that actually shows results. My son has improved more in 3 months than the previous 2 years combined.",
    rating: 5,
    videoThumbnail: "https://cdn.marblism.com/nwf4_GebeVT.webp",
    metric: "3-Month Transformation",
  },
  {
    id: 5,
    name: "B.R.",
    role: "JUCO Transfer, Central Plains CC",
    content: "Coming off an injury, the Strength & Conditioning program got me back stronger than before. The systematic approach was exactly what I needed.",
    rating: 5,
    videoThumbnail: "https://cdn.marblism.com/7oEYJwzA1AH.webp",
    metric: "Full Recovery",
  },
  {
    id: 6,
    name: "Coach E.S.",
    role: "Hitting Instructor, Gulf Coast Area",
    content: "I use Vault programming with all my private lesson clients. The video analysis tools help me show kids exactly what we are working on.",
    rating: 5,
    videoThumbnail: "https://cdn.marblism.com/Aq6IXFkCdm5.webp",
    metric: "40+ Students",
  },
];

const VideoTestimonialCard = ({ 
  testimonial, 
  index, 
  onPlayVideo 
}: { 
  testimonial: Testimonial; 
  index: number;
  onPlayVideo: (thumbnail: string) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-card border border-border rounded-2xl overflow-hidden relative group hover:border-foreground/20 transition-all duration-300 hover:shadow-lg"
    >
      <div 
        className="relative aspect-video cursor-pointer overflow-hidden"
        onClick={() => onPlayVideo(testimonial.videoThumbnail)}
      >
        <img 
          src={testimonial.videoThumbnail} 
          alt={`Athlete testimonial ${testimonial.id}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity group-hover:bg-black/50">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
            <Play className="w-7 h-7 text-foreground ml-1" fill="currentColor" />
          </div>
        </div>
        <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-foreground text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          {testimonial.metric}
        </div>
      </div>

      <div className="p-6 relative">
        <Quote className="absolute top-4 right-4 w-8 h-8 text-muted-foreground/10" />

        <div className="flex items-center gap-1 mb-3">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-foreground text-foreground" />
          ))}
        </div>

        <p className="text-foreground text-sm mb-5 leading-relaxed">
          "{testimonial.content}"
        </p>

        <div>
          <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-medium uppercase tracking-widest mb-4 block">
            Athlete Spotlights
          </span>
          <h2 className="text-4xl md:text-6xl font-display text-foreground mb-4">
            REAL RESULTS
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Athletes and coaches seeing measurable improvements with Vault training systems.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <VideoTestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
              onPlayVideo={setActiveImage}
            />
          ))}
        </div>

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
        >
          {[
            { value: "500+", label: "Athletes Trained" },
            { value: "100+", label: "College-Level Athletes" },
            { value: "4.9", label: "Average Rating" },
            { value: "92%", label: "See Improvements" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-display text-foreground mb-1">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground/60 text-center mt-10 max-w-xl mx-auto">
          Names shown as initials to protect athlete privacy. School names are fictional. Results are representative of typical outcomes; individual results vary.
        </p>
      </div>

      {/* Image Modal */}
      <Dialog open={!!activeImage} onOpenChange={() => setActiveImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none overflow-hidden">
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          {activeImage && (
            <div className="w-full">
              <img
                src={activeImage}
                alt="Athlete spotlight"
                className="w-full h-auto"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Testimonials;
