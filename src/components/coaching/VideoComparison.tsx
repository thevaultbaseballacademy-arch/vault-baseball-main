import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, Upload, X, Columns2,
  RotateCcw, Film, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";

interface VideoComparisonProps {
  athleteVideoSrc?: string; // URL or blob URL of athlete footage
  sessionId: string;
  userId: string;
  isCoach?: boolean;
  onClose?: () => void;
}

interface ReferenceVideo {
  id: string;
  label: string;
  url: string;
  type: "recording" | "reference" | "upload";
}

const VideoComparison = ({
  athleteVideoSrc,
  sessionId,
  userId,
  isCoach = false,
  onClose,
}: VideoComparisonProps) => {
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [leftSrc, setLeftSrc] = useState<string>(athleteVideoSrc || "");
  const [rightSrc, setRightSrc] = useState<string>("");
  const [referenceVideos, setReferenceVideos] = useState<ReferenceVideo[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [loadingSide, setLoadingSide] = useState<"left" | "right" | null>(null);

  // Load available reference videos (past recordings + highlight videos)
  useEffect(() => {
    const loadReferences = async () => {
      const refs: ReferenceVideo[] = [];

      // Fetch session recordings for this athlete
      const { data: recordings } = await supabase
        .from("session_recordings")
        .select("id, recording_url, notes, created_at")
        .eq("athlete_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (recordings) {
        recordings.forEach((r) => {
          refs.push({
            id: r.id,
            label: `Session ${new Date(r.created_at).toLocaleDateString()} ${r.notes ? `– ${r.notes}` : ""}`,
            url: r.recording_url,
            type: "recording",
          });
        });
      }

      // Fetch highlight videos
      const { data: highlights } = await supabase
        .from("highlight_videos")
        .select("id, title, video_url")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (highlights) {
        highlights.forEach((h) => {
          refs.push({
            id: h.id,
            label: h.title,
            url: h.video_url,
            type: "reference",
          });
        });
      }

      setReferenceVideos(refs);
    };

    loadReferences();
  }, [userId]);

  // Sync playback
  const syncVideos = useCallback(() => {
    const left = leftVideoRef.current;
    const right = rightVideoRef.current;
    if (!left || !right) return;

    if (Math.abs(left.currentTime - right.currentTime) > 0.15) {
      right.currentTime = left.currentTime;
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const left = leftVideoRef.current;
    if (left) {
      setCurrentTime(left.currentTime);
      syncVideos();
    }
  }, [syncVideos]);

  const handleLoadedMetadata = useCallback(() => {
    const left = leftVideoRef.current;
    const right = rightVideoRef.current;
    const d = Math.max(left?.duration || 0, right?.duration || 0);
    if (d && isFinite(d)) setDuration(d);
  }, []);

  const togglePlayPause = useCallback(() => {
    const left = leftVideoRef.current;
    const right = rightVideoRef.current;
    if (!left) return;

    if (isPlaying) {
      left.pause();
      right?.pause();
    } else {
      syncVideos();
      left.play();
      right?.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, syncVideos]);

  const seek = useCallback((values: number[]) => {
    const t = values[0];
    const left = leftVideoRef.current;
    const right = rightVideoRef.current;
    if (left) left.currentTime = t;
    if (right) right.currentTime = t;
    setCurrentTime(t);
  }, []);

  const stepFrame = useCallback((direction: -1 | 1) => {
    const left = leftVideoRef.current;
    const right = rightVideoRef.current;
    const step = direction * (1 / 30); // ~1 frame at 30fps
    if (left) {
      left.pause();
      left.currentTime = Math.max(0, left.currentTime + step);
    }
    if (right) {
      right.pause();
      right.currentTime = Math.max(0, right.currentTime + step);
    }
    setIsPlaying(false);
  }, []);

  const changeSpeed = useCallback(() => {
    const speeds = [0.25, 0.5, 0.75, 1];
    const idx = speeds.indexOf(playbackRate);
    const next = speeds[(idx + 1) % speeds.length];
    setPlaybackRate(next);
    if (leftVideoRef.current) leftVideoRef.current.playbackRate = next;
    if (rightVideoRef.current) rightVideoRef.current.playbackRate = next;
  }, [playbackRate]);

  const handleFileUpload = useCallback(
    (side: "left" | "right") => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "video/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (side === "left") setLeftSrc(url);
        else setRightSrc(url);
      };
      input.click();
    },
    []
  );

  const selectReference = useCallback((video: ReferenceVideo, side: "left" | "right") => {
    if (side === "left") setLeftSrc(video.url);
    else setRightSrc(video.url);
    setShowLibrary(false);
  }, []);

  const formatTime = (t: number) => {
    if (!isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="bg-card border border-border rounded-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Columns2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-display tracking-widest text-foreground">SIDE-BY-SIDE COMPARISON</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowLibrary(!showLibrary)}>
            <Film className="w-3 h-3 mr-1" /> Library
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Video library panel */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border overflow-hidden"
          >
            <div className="p-4 max-h-48 overflow-y-auto space-y-2">
              <p className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">
                SELECT A VIDEO TO LOAD
              </p>
              {referenceVideos.length === 0 ? (
                <p className="text-xs text-muted-foreground">No saved videos found. Upload a reference video below.</p>
              ) : (
                referenceVideos.map((v) => (
                  <div key={v.id} className="flex items-center justify-between bg-secondary/50 p-2 border border-border">
                    <div className="flex items-center gap-2 min-w-0">
                      <Film className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-xs text-foreground truncate">{v.label}</span>
                      <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted shrink-0">
                        {v.type === "recording" ? "SESSION" : "HIGHLIGHT"}
                      </span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => selectReference(v, "left")}>
                        Left
                      </Button>
                      <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => selectReference(v, "right")}>
                        Right
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side-by-side videos */}
      <div className="grid grid-cols-2 gap-px bg-border">
        {/* Left panel */}
        <div className="relative bg-foreground aspect-video">
          {leftSrc ? (
            <video
              ref={leftVideoRef}
              src={leftSrc}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              playsInline
              muted
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground font-display tracking-widest">ATHLETE VIDEO</p>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => handleFileUpload("left")}>
                Upload Video
              </Button>
            </div>
          )}
          <span className="absolute top-2 left-2 bg-foreground/70 backdrop-blur-sm px-2 py-0.5 text-[10px] text-primary-foreground font-display tracking-widest z-10">
            ATHLETE
          </span>
        </div>

        {/* Right panel */}
        <div className="relative bg-foreground aspect-video">
          {rightSrc ? (
            <video
              ref={rightVideoRef}
              src={rightSrc}
              className="w-full h-full object-contain"
              onLoadedMetadata={handleLoadedMetadata}
              playsInline
              muted
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground font-display tracking-widest">REFERENCE VIDEO</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => handleFileUpload("right")}>
                  Upload
                </Button>
                {referenceVideos.length > 0 && (
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowLibrary(true)}>
                    Library
                  </Button>
                )}
              </div>
            </div>
          )}
          <span className="absolute top-2 left-2 bg-foreground/70 backdrop-blur-sm px-2 py-0.5 text-[10px] text-primary-foreground font-display tracking-widest z-10">
            REFERENCE
          </span>
        </div>
      </div>

      {/* Playback controls */}
      <div className="px-4 py-3 border-t border-border space-y-2">
        {/* Timeline */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground font-mono w-10 text-right">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 1}
            step={0.01}
            onValueChange={seek}
            className="flex-1"
          />
          <span className="text-[10px] text-muted-foreground font-mono w-10">{formatTime(duration)}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => stepFrame(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => seek([0])}>
            <SkipBack className="w-3 h-3" />
          </Button>

          <Button variant="vault" size="icon" className="w-10 h-10" onClick={togglePlayPause}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => stepFrame(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="sm" className="text-[10px] font-mono h-8 px-2" onClick={changeSpeed}>
            {playbackRate}x
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-[10px] h-8 px-2 ml-2"
            onClick={() => {
              setLeftSrc("");
              setRightSrc("");
              setCurrentTime(0);
              setDuration(0);
            }}
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoComparison;
