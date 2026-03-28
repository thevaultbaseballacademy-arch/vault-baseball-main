import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const certificationNames: Record<string, string> = {
  foundations: "Foundations",
  performance: "Performance",
  catcher_specialist: "Catcher Specialist",
  infield_specialist: "Infield Specialist",
  outfield_specialist: "Outfield Specialist",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[MANUAL-REMINDER] ${step}`, details ? JSON.stringify(details) : "");
};

interface ManualReminderRequest {
  certificationId: string;
  userId: string;
  daysUntilExpiry: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Processing manual reminder request");

    // Security: Require admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logStep("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Verify the user is an admin
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !userData?.user) {
      logStep("Invalid token", { error: authError });
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check admin role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    
    if (roleError || !roleData) {
      logStep("User is not an admin", { userId: userData.user.id });
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    logStep("Admin authorized", { userId: userData.user.id });

    const { certificationId, userId, daysUntilExpiry }: ManualReminderRequest = await req.json();
    
    logStep("Processing request", { certificationId, userId, daysUntilExpiry });

    // Get certification details
    const { data: cert, error: certError } = await supabase
      .from("user_certifications")
      .select("id, certification_type, expires_at, certificate_number")
      .eq("id", certificationId)
      .single();

    if (certError || !cert) {
      logStep("Certification not found", { error: certError });
      throw new Error("Certification not found");
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, display_name")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile?.email) {
      logStep("Profile not found", { error: profileError });
      throw new Error("User profile not found");
    }

    const certName = certificationNames[cert.certification_type] || cert.certification_type;
    const expiryDate = new Date(cert.expires_at).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const isUrgent = daysUntilExpiry <= 7;
    const urgencyColor = isUrgent ? "#dc2626" : "#c9a227";

    logStep("Sending manual reminder email", { 
      email: profile.email, 
      certification: certName,
      daysUntilExpiry 
    });

    const emailResponse = await resend.emails.send({
      from: "The Vault <onboarding@resend.dev>",
      to: [profile.email],
      subject: `${isUrgent ? "🚨 URGENT: " : "⚠️ "}Your ${certName} Certification Expires ${daysUntilExpiry <= 0 ? "Today" : `in ${daysUntilExpiry} Days`}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #1a1a2e 0%, #0f0f23 100%); border-radius: 16px; overflow: hidden; border: 2px solid ${urgencyColor};">
            
            <!-- Header -->
            <div style="background: ${isUrgent ? "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)" : "linear-gradient(135deg, #c9a227 0%, #a88a1e 100%)"}; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                ${isUrgent ? "🚨 Urgent Reminder" : "⚠️ Certification Reminder"}
              </h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              <p style="color: #ffffff; font-size: 18px; margin: 0 0 16px 0;">
                Hi ${profile.display_name || "Coach"},
              </p>
              
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                This is a reminder that your <strong style="color: ${urgencyColor};">${certName}</strong> certification ${daysUntilExpiry <= 0 ? "has expired" : `will expire in ${daysUntilExpiry} days`}.
              </p>
              
              <div style="background: ${isUrgent ? "rgba(220, 38, 38, 0.1)" : "rgba(201, 162, 39, 0.1)"}; border: 2px solid ${urgencyColor}; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
                <p style="color: ${urgencyColor}; font-size: 24px; font-weight: bold; margin: 0;">
                  ${expiryDate}
                </p>
                ${cert.certificate_number ? `<p style="color: #666; font-size: 14px; margin: 8px 0 0 0;">Certificate #${cert.certificate_number}</p>` : ""}
              </div>
              
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${isUrgent 
                  ? "Please take action immediately to maintain your certified coach status." 
                  : "We recommend renewing your certification before it expires to maintain your verified status."}
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://thevault.coach/certifications" style="display: inline-block; background: ${isUrgent ? "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)" : "linear-gradient(135deg, #c9a227 0%, #a88a1e 100%)"}; color: #ffffff; text-decoration: none; padding: 18px 36px; border-radius: 8px; font-weight: bold; font-size: 18px;">
                  Renew Certification
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #0a0a0a; padding: 24px; text-align: center; border-top: 1px solid #222;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                The Vault Baseball Training<br>
                This is a manual reminder sent by an administrator.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    logStep("Email sent successfully", { response: emailResponse });

    return new Response(
      JSON.stringify({ success: true, message: "Reminder sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error sending manual reminder", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
