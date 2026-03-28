import { useState, useRef, useEffect } from "react";
import { Play, Pause, Maximize, Volume2, VolumeX, RotateCcw, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  thumbnail?: string;
  isPreview?: boolean;
  onProgress?: (percent: number) => void;
  duration?: string;
}

const VideoPlayer = ({ videoUrl, title, thumbnail, isPreview, onProgress, duration }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const isVimeo = videoUrl.includes("vimeo.com");
  const isEmbeddable = isYouTube || isVimeo;

  const getEmbedUrl = () => {
    if (isYouTube) {
      const videoId = videoUrl.includes("youtu.be")
        ? videoUrl.split("/").pop()?.split("?")[0]
        : new URLSearchParams(new URL(videoUrl).search).get("v");
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white`;
    }
    if (isVimeo) {
      const videoId = videoUrl.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&color=ffffff`;
    }
    return videoUrl;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), 2500);
    }
  };

  useEffect(() => () => { if (controlsTimeout.current) clearTimeout(controlsTimeout.current); }, []);

  // ── Embeddable (YouTube / Vimeo) ──────────────────────────────────
  if (isEmbeddable) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
        {isPreview && (
          <Badge className="absolute top-3 left-3 z-10 bg-green-500 text-white shadow-lg">Free Preview</Badge>
        )}
        {!isPlaying ? (
          <button
            className="relative w-full h-full cursor-pointer group block"
            onClick={() => setIsPlaying(true)}
            aria-label={`Play ${title}`}
          >
            {thumbnail ? (
              <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-zinc-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-zinc-900 ml-1" fill="currentColor" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm font-medium truncate">{title}</p>
              {duration && (
                <p className="text-white/60 text-xs flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> {duration}
                </p>
              )}
            </div>
          </button>
        ) : (
          <iframe
            src={getEmbedUrl()}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="w-full h-full border-0"
          />
        )}
      </div>
    );
  }

  // ── Native video player ───────────────────────────────────────────
  return (
    <div
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-black group shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={() => { setShowControls(true); if (controlsTimeout.current) clearTimeout(controlsTimeout.current); controlsTimeout.current = setTimeout(() => setShowControls(false), 3000); }}
    >
      {isPreview && (
        <Badge className="absolute top-3 left-3 z-10 bg-green-500 text-white shadow-lg">Free Preview</Badge>
      )}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        muted={isMuted}
        poster={thumbnail}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setTotalDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          const pct = (v.currentTime / v.duration) * 100;
          setProgress(pct);
          setCurrentTime(v.currentTime);
          if (v.buffered.length > 0) setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
          onProgress?.(pct);
        }}
        onClick={() => {
          if (videoRef.current) {
            videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
          }
        }}
      />

      {/* Play overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <button
            className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
            onClick={() => videoRef.current?.play()}
            aria-label="Play"
          >
            <Play className="w-8 h-8 text-zinc-900 ml-1" fill="currentColor" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {/* Buffer + progress bar */}
        <div className="relative px-4 pt-2 pb-1">
          <div className="relative h-1 bg-white/20 rounded-full cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            if (videoRef.current) videoRef.current.currentTime = pct * videoRef.current.duration;
          }}>
            <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full" style={{ width: `${buffered}%` }} />
            <div className="absolute inset-y-0 left-0 bg-white rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 pb-4 bg-gradient-to-t from-black/90 to-transparent pt-2">
          <button
            className="w-9 h-9 flex items-center justify-center text-white hover:text-white/80 transition-colors rounded-full hover:bg-white/10"
            onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" fill="currentColor" />}
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center text-white hover:text-white/80 rounded-full hover:bg-white/10"
            onClick={() => { if (videoRef.current) videoRef.current.currentTime = 0; }}
            aria-label="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-white/70 text-xs font-mono min-w-[80px]">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
          <div className="flex-1" />
          <button
            className="w-9 h-9 flex items-center justify-center text-white hover:text-white/80 rounded-full hover:bg-white/10"
            onClick={() => setIsMuted(!isMuted)}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center text-white hover:text-white/80 rounded-full hover:bg-white/10"
            onClick={() => videoRef.current?.requestFullscreen()}
            aria-label="Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
