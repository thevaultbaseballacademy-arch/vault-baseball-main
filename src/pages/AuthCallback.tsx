import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically exchanges the token from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          navigate("/auth", { replace: true });
          return;
        }

        if (session?.user) {
          // Check role to route correctly
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id);

          const userRoles = roles?.map(r => r.role) || [];

          if (userRoles.includes("owner")) {
            navigate("/owner", { replace: true });
          } else if (userRoles.includes("admin")) {
            navigate("/admin", { replace: true });
          } else if (userRoles.includes("coach")) {
            navigate("/coach-dashboard", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        } else {
          navigate("/auth", { replace: true });
        }
      } catch {
        navigate("/auth", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground text-sm">Verifying your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
