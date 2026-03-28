import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Monitor, 
  Smartphone, 
  Laptop, 
  Loader2, 
  LogOut, 
  RefreshCw,
  Globe,
  Clock,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";

const SessionManagement = () => {
  const {
    sessions,
    loading,
    revokeSession,
    revokeAllOtherSessions,
    fetchSessions,
  } = useSessionManagement();
  
  const [showRevokeAll, setShowRevokeAll] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const getDeviceIcon = (os: string | null) => {
    if (!os) return Monitor;
    const lower = os.toLowerCase();
    if (lower.includes("android") || lower.includes("ios")) {
      return Smartphone;
    }
    if (lower.includes("mac") || lower.includes("windows") || lower.includes("linux")) {
      return Laptop;
    }
    return Monitor;
  };

  const handleRevoke = async (sessionId: string) => {
    setRevokingId(sessionId);
    await revokeSession(sessionId);
    setRevokingId(null);
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    await revokeAllOtherSessions();
    setRevokingAll(false);
    setShowRevokeAll(false);
  };

  const otherSessionsCount = sessions.filter(s => !s.is_current).length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display text-foreground">Active Sessions</h2>
              <p className="text-sm text-muted-foreground">
                Manage your active login sessions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchSessions}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {otherSessionsCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRevokeAll(true)}
                className="text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out All Others
              </Button>
            )}
          </div>
        </div>

        {loading && sessions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active sessions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.os);
              const isRevoking = revokingId === session.id;

              return (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg border ${
                    session.is_current
                      ? "bg-primary/5 border-primary/20"
                      : "bg-secondary/50 border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        session.is_current ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <DeviceIcon className={`w-5 h-5 ${
                          session.is_current ? "text-primary" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {session.device_info || "Unknown Device"}
                          </p>
                          {session.is_current && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {session.browser && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {session.browser}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.is_current 
                              ? "Active now"
                              : `Last active ${formatDistanceToNow(new Date(session.last_active_at))} ago`
                            }
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Signed in {formatDistanceToNow(new Date(session.created_at))} ago
                        </p>
                      </div>
                    </div>
                    {!session.is_current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(session.id)}
                        disabled={isRevoking}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        {isRevoking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Security tip:</strong> If you see a session you don't recognize, 
            revoke it immediately and consider changing your password.
          </p>
        </div>
      </motion.div>

      {/* Revoke All Confirmation */}
      <AlertDialog open={showRevokeAll} onOpenChange={setShowRevokeAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out All Other Sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign out {otherSessionsCount} other session{otherSessionsCount !== 1 ? "s" : ""}. 
              You'll remain signed in on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeAll}
              disabled={revokingAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing out...
                </>
              ) : (
                "Sign Out All Others"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SessionManagement;
