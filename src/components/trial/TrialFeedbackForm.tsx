import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Star, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrialFeedbackFormProps {
  onComplete: () => void;
}

const TrialFeedbackForm = ({ onComplete }: TrialFeedbackFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [favoriteFeature, setFavoriteFeature] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const features = [
    "Velocity Baseline",
    "Courses",
    "Dashboard & Metrics",
    "Community",
    "Coach Tools",
    "Device Integration",
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await (supabase.from("trial_feedback" as any) as any).insert({
          user_id: session.user.id,
          rating,
          feedback,
          favorite_feature: favoriteFeature,
        });
      }
      setSubmitted(true);
      toast({ title: "Thanks for your feedback!", description: "Your input helps us build a better VAULT™." });
      setTimeout(onComplete, 2000);
    } catch (error) {
      console.error("Feedback error:", error);
      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="font-display text-2xl text-foreground mb-2">THANK YOU!</h3>
        <p className="text-muted-foreground">Your feedback matters to us.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-primary font-semibold text-sm">SHARE YOUR EXPERIENCE</span>
        </div>
        <h2 className="font-display text-2xl text-foreground mb-2">
          HOW WAS YOUR TRIAL?
        </h2>
        <p className="text-muted-foreground text-sm">
          Help us improve VAULT™ — your feedback shapes what we build next.
        </p>
      </div>

      {/* Star Rating */}
      <div className="space-y-2">
        <Label className="text-center block">Overall Experience</Label>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Favorite Feature */}
      <div className="space-y-2">
        <Label>What was your favorite feature?</Label>
        <div className="flex flex-wrap gap-2">
          {features.map((feature) => (
            <button
              key={feature}
              type="button"
              onClick={() => setFavoriteFeature(feature)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                favoriteFeature === feature
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {feature}
            </button>
          ))}
        </div>
      </div>

      {/* Written Feedback */}
      <div className="space-y-2">
        <Label htmlFor="feedback">Anything else you'd like to share?</Label>
        <Textarea
          id="feedback"
          placeholder="What worked well? What could be better?"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          variant="vault"
          className="flex-1"
          disabled={submitting || rating === 0}
        >
          {submitting ? "Submitting..." : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>
        <Button
          onClick={onComplete}
          variant="outline"
          className="text-muted-foreground"
        >
          Skip
        </Button>
      </div>
    </motion.div>
  );
};

export default TrialFeedbackForm;
