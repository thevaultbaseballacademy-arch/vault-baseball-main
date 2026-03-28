import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, SwitchCamera,
  Maximize2, Minimize2, Loader2, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebRTC } from "@/hooks/useWebRTC";

interface LiveVideoCallProps {
  sessionId: string;
  userId: string;
  isCoach?: boolean;
  onEnd?: () => void;
}

const LiveVideoCall = ({ sessionId, userId, isCoach = false, onEnd }: LiveVideoCallProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    errorMessage,
    startCall,
    hangUp,
    toggleMute,
    toggleVideo,
    switchCamera,
  } = useWebRTC({ sessionId, userId });

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleEnd = () => {
    hangUp();
    onEnd?.();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative bg-foreground rounded-none overflow-hidden" style={{ aspectRatio: "16/9", minHeight: 320 }}>
      {/* Remote video (large) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Connecting overlay */}
      <AnimatePresence>
        {(callState === "idle" || callState === "connecting") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground flex flex-col items-center justify-center gap-4 z-10"
          >
            {callState === "idle" ? (
              <>
                <Video className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground font-display tracking-widest text-sm">LIVE SESSION</p>
                <p className="text-muted-foreground/60 text-xs max-w-xs text-center">
                  {isCoach ? "Start the session to connect with your athlete." : "Join the session to connect with your coach."}
                </p>
                <Button variant="vault" onClick={() => startCall(isCoach)} className="mt-2">
                  {isCoach ? "Start Session" : "Join Session"}
                </Button>
              </>
            ) : (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
                <p className="text-primary-foreground/80 font-display tracking-widest text-xs">CONNECTING…</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disconnected overlay */}
      {callState === "disconnected" && (
        <div className="absolute inset-0 bg-foreground/90 flex flex-col items-center justify-center gap-3 z-10">
          <p className="text-destructive font-display tracking-widest text-sm">DISCONNECTED</p>
          <Button variant="vault" size="sm" onClick={() => startCall(isCoach)}>
            Reconnect
          </Button>
        </div>
      )}

      {/* Error overlay */}
      {callState === "error" && (
        <div className="absolute inset-0 bg-foreground/95 flex flex-col items-center justify-center gap-3 z-10 px-6 text-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <p className="text-destructive font-display tracking-widest text-sm">CONNECTION ERROR</p>
          <p className="text-muted-foreground text-xs max-w-sm">
            {errorMessage || "We couldn't establish the live session. Please retry."}
          </p>
          <Button variant="vault" size="sm" onClick={() => startCall(isCoach)}>
            Retry Session
          </Button>
        </div>
      )}

      {/* Local video (picture-in-picture) */}
      {localStream && (
        <div className="absolute top-3 right-3 w-32 sm:w-44 aspect-video rounded-none border-2 border-border/30 overflow-hidden shadow-lg z-20">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {isVideoOff && (
            <div className="absolute inset-0 bg-foreground flex items-center justify-center">
              <VideoOff className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      {/* Session info badge */}
      {callState === "connected" && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-foreground/70 backdrop-blur-sm px-3 py-1.5 rounded-none">
            <span className="w-2 h-2 rounded-full bg-vault-longevity animate-pulse" />
            <span className="text-[10px] text-primary-foreground/90 font-display tracking-widest">LIVE</span>
          </span>
        </div>
      )}

      {/* Controls */}
      {localStream && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 inset-x-0 z-20 flex items-center justify-center gap-2 p-4 bg-gradient-to-t from-foreground/80 to-transparent"
        >
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full w-11 h-11 border-border/30 ${isMuted ? "bg-destructive text-destructive-foreground" : "bg-foreground/50 text-primary-foreground"}`}
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={`rounded-full w-11 h-11 border-border/30 ${isVideoOff ? "bg-destructive text-destructive-foreground" : "bg-foreground/50 text-primary-foreground"}`}
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-11 h-11 border-border/30 bg-foreground/50 text-primary-foreground sm:hidden"
            onClick={switchCamera}
          >
            <SwitchCamera className="w-4 h-4" />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="rounded-full w-13 h-13"
            onClick={handleEnd}
          >
            <PhoneOff className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-11 h-11 border-border/30 bg-foreground/50 text-primary-foreground hidden sm:flex"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default LiveVideoCall;
