import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RedirectConfig {
  target: string;
  source: string;
}

const REDIRECTS: Record<string, RedirectConfig> = {
  "/app": { target: "/dashboard", source: "short_app" },
  "/training": { target: "/training-hub", source: "short_training" },
  "/vault": { target: "/vault", source: "short_vault" },
  "/start": { target: "/trial", source: "short_start" },
  "/22m": { target: "/claim-22m", source: "short_22m" },
  "/coaching": { target: "/products/remote-training", source: "short_coaching" },
  "/trial": { target: "/trial", source: "short_trial" },
  "/join": { target: "/auth", source: "short_join" },
  "/programs": { target: "/my-programs", source: "short_programs" },
  "/courses": { target: "/courses", source: "short_courses" },
  "/coach": { target: "/find-coach", source: "short_coach" },
  "/marketplace": { target: "/marketplace", source: "short_marketplace" },
  "/velocity": { target: "/products/velocity-system", source: "short_velocity" },
  "/founders": { target: "/products/founders-access", source: "short_founders" },
  "/guide": { target: "/free-velocity-guide", source: "short_guide" },
};

const ShortRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const trackAndRedirect = async () => {
      const config = REDIRECTS[location.pathname];
      
      if (!config) {
        navigate("/", { replace: true });
        return;
      }

      // Track the short link visit internally
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Log to activity feed if user is logged in
        if (user) {
          await supabase.from("activity_feed").insert({
            user_id: user.id,
            activity_type: "short_link_visit",
            title: "Visited via short link",
            description: `Source: ${config.source}`,
            metadata: {
              short_path: location.pathname,
              target_path: config.target,
              source: config.source,
              timestamp: new Date().toISOString(),
            },
          });
        }
      } catch (error) {
        // Silent fail - don't block redirect
        console.debug("Analytics tracking skipped");
      }

      // Redirect to target
      navigate(config.target, { replace: true });
    };

    trackAndRedirect();
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Redirecting...</p>
      </div>
    </div>
  );
};

export default ShortRedirect;
