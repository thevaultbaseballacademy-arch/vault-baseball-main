import { Play, Lock, BookOpen, Clock, Upload, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VideoComingSoonProps {
  title: string;
  description?: string;
  duration?: string;
  isPreview?: boolean;
  isAdmin?: boolean;
  lessonId?: string;
  onAdminUpload?: (lessonId: string) => void;
}

const VideoComingSoon = ({ title, description, duration, isPreview, isAdmin, lessonId, onAdminUpload }: VideoComingSoonProps) => {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-border flex flex-col items-center justify-center gap-4 p-6">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      {isPreview ? (
        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Free Preview</Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          <Lock className="w-3 h-3 mr-1" /> Member Content
        </Badge>
      )}

      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-white/40" />
        </div>
        <div>
          <p className="text-white font-medium text-sm mb-1">{title}</p>
          {description && <p className="text-white/40 text-xs max-w-xs">{description}</p>}
        </div>

        <div className="flex items-center gap-3 mt-1">
          {duration && (
            <span className="text-white/30 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" /> {duration}
            </span>
          )}
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
            Video Coming Soon
          </Badge>
        </div>

        <p className="text-white/25 text-xs mt-1 max-w-xs">
          VAULT™ is onboarding credentialed coaches to film this content. Curriculum is finalized — production in progress.
        </p>
      </div>

      {isAdmin && lessonId && (
        <div className="relative z-10 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 gap-1.5"
            onClick={() => onAdminUpload?.(lessonId)}
          >
            <Upload className="w-3 h-3" /> Upload Video for this Lesson
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoComingSoon;
