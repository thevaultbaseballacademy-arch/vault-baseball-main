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
  console.log(`[EXPIRATION-REMINDER] ${step}`, details ? JSON.stringify(details) : "");
};

interface CertToProcess {
  id: string;
  user_id: string;
  certification_type: string;
  expires_at: string;
  certificate_number: string | null;
}

async function sendReminderEmail(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  cert: CertToProcess,
  daysUntilExpiry: number,
  updateField: "expiration_reminder_sent" | "final_warning_sent",
  updateTimeField: "expiration_reminder_sent_at" | "final_warning_sent_at"
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user profile for email and name
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, display_name")
      .eq("user_id", cert.user_id)
      .single();

    if (profileError || !profile?.email) {
      logStep("Could not find profile for user", { userId: cert.user_id, error: profileError });
      return { success: false, error: "Profile not found" };
    }

    const certName = certificationNames[cert.certification_type] || cert.certification_type;
    const expiryDate = new Date(cert.expires_at).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const isFinalWarning = daysUntilExpiry === 7;
    const urgencyColor = isFinalWarning ? "#dc2626" : "#c9a227";
    const urgencyEmoji = isFinalWarning ? "🚨" : "⚠️";
    const urgencyText = isFinalWarning ? "FINAL WARNING" : "Certification Expiring Soon";

    logStep(`Sending ${isFinalWarning ? "final warning" : "30-day reminder"} email`, { 
      email: profile.email, 
      certification: certName,
      expiryDate 
    });

    const emailResponse = await resend.emails.send({
      from: "The Vault <onboarding@resend.dev>",
      to: [profile.email],
      subject: `${urgencyEmoji} ${isFinalWarning ? "URGENT: " : ""}Your ${certName} Certification Expires in ${daysUntilExpiry} Days`,
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
            <div style="background: ${isFinalWarning ? "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)" : "linear-gradient(135deg, #c9a227 0%, #a88a1e 100%)"}; padding: 32px; text-align: center;">
              <h1 style="color: ${isFinalWarning ? "#ffffff" : "#0a0a0a"}; margin: 0; font-size: 28px; font-weight: bold;">
                ${urgencyEmoji} ${urgencyText}
              </h1>
              ${isFinalWarning ? `<p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Act now to avoid losing your certification</p>` : ""}
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              <p style="color: #ffffff; font-size: 18px; margin: 0 0 16px 0;">
                Hi ${profile.display_name || "Coach"},
              </p>
              
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${isFinalWarning ? "<strong style=\"color: #dc2626;\">This is your final reminder.</strong> " : ""}Your <strong style="color: ${urgencyColor};">${certName}</strong> certification ${isFinalWarning ? "will expire in just 7 days" : "is set to expire"} on:
              </p>
              
              <div style="background: ${isFinalWarning ? "rgba(220, 38, 38, 0.1)" : "rgba(201, 162, 39, 0.1)"}; border: 2px solid ${urgencyColor}; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
                <p style="color: ${urgencyColor}; font-size: 24px; font-weight: bold; margin: 0;">
                  ${expiryDate}
                </p>
                ${isFinalWarning ? `<p style="color: #dc2626; font-size: 18px; font-weight: bold; margin: 8px 0 0 0;">⏰ Only 7 days remaining!</p>` : ""}
                ${cert.certificate_number ? `<p style="color: #666; font-size: 14px; margin: 8px 0 0 0;">Certificate #${cert.certificate_number}</p>` : ""}
              </div>
              
              ${isFinalWarning ? `
              <div style="background: rgba(220, 38, 38, 0.1); border-left: 4px solid #dc2626; padding: 16px; margin: 0 0 24px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #ffffff; font-size: 16px; margin: 0; font-weight: bold;">
                  ⚠️ What happens if you don't renew?
                </p>
                <ul style="color: #a0a0a0; font-size: 14px; margin: 12px 0 0 0; padding-left: 20px;">
                  <li>Your verified coach status will be revoked</li>
                  <li>You'll lose access to certified coach resources</li>
                  <li>Your profile badge will be removed</li>
                  <li>You'll need to retake the full certification exam</li>
                </ul>
              </div>
              ` : `
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                To maintain your certified status and continue demonstrating your expertise, please renew your certification before it expires.
              </p>
              `}
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://thevault.coach/certifications" style="display: inline-block; background: ${isFinalWarning ? "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)" : "linear-gradient(135deg, #c9a227 0%, #a88a1e 100%)"}; color: #ffffff; text-decoration: none; padding: 18px 36px; border-radius: 8px; font-weight: bold; font-size: 18px;">
                  ${isFinalWarning ? "Renew Now - Don't Wait!" : "Renew Certification"}
                </a>
              </div>
              
              ${!isFinalWarning ? `
              <div style="border-top: 1px solid #333; padding-top: 24px; margin-top: 32px;">
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                  <strong style="color: #c9a227;">Why Renew?</strong><br>
                  • Maintain your verified coach status<br>
                  • Keep access to exclusive resources<br>
                  • Stay current with the latest methodologies<br>
                  • Continue building trust with athletes and parents
                </p>
              </div>
              ` : ""}
            </div>
            
            <!-- Footer -->
            <div style="background: #0a0a0a; padding: 24px; text-align: center; border-top: 1px solid #222;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                The Vault Baseball Training<br>
                Questions? Reply to this email for support.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    logStep("Email sent successfully", { response: emailResponse });

    // Mark reminder as sent
    const { error: updateError } = await supabase
      .from("user_certifications")
      .update({
        [updateField]: true,
        [updateTimeField]: new Date().toISOString(),
      })
      .eq("id", cert.id);

    if (updateError) {
      logStep("Error updating certification reminder status", { error: updateError });
      return { success: false, error: `Failed to update status: ${updateError.message}` };
    }

    return { success: true };
  } catch (emailError: unknown) {
    const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
    logStep("Error sending email for certification", { certId: cert.id, error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

function getDateRange(daysFromNow: number): { startOfDay: Date; endOfDay: Date } {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysFromNow);
  
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting expiration reminder check");

    // Security: Validate request comes from authorized source
    const authHeader = req.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");
    
    // Allow if valid cron secret OR valid admin JWT
    let isAuthorized = false;
    
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      logStep("Authorized via cron secret");
      isAuthorized = true;
    } else if (authHeader?.startsWith("Bearer ")) {
      // Check if it's a valid admin user
      const supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseAuth.auth.getUser(token);
      
      if (userData?.user) {
        const supabaseService = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          { auth: { persistSession: false } }
        );
        const { data: roleData } = await supabaseService
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        if (roleData) {
          logStep("Authorized via admin JWT", { userId: userData.user.id });
          isAuthorized = true;
        }
      }
    }
    
    if (!isAuthorized) {
      logStep("Unauthorized access attempt");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let thirtyDayRemindersSent = 0;
    let sevenDayWarningsSent = 0;
    const errors: string[] = [];

    // Process 30-day reminders
    const thirtyDayRange = getDateRange(30);
    logStep("Checking for 30-day reminders", { 
      startOfDay: thirtyDayRange.startOfDay.toISOString(),
      endOfDay: thirtyDayRange.endOfDay.toISOString()
    });

    const { data: thirtyDayCerts, error: thirtyDayError } = await supabase
      .from("user_certifications")
      .select("id, user_id, certification_type, expires_at, certificate_number")
      .eq("status", "active")
      .eq("expiration_reminder_sent", false)
      .gte("expires_at", thirtyDayRange.startOfDay.toISOString())
      .lte("expires_at", thirtyDayRange.endOfDay.toISOString());

    if (thirtyDayError) {
      logStep("Error fetching 30-day certifications", { error: thirtyDayError });
      errors.push(`30-day fetch error: ${thirtyDayError.message}`);
    } else {
      logStep("Found 30-day expiring certifications", { count: thirtyDayCerts?.length || 0 });
      
      for (const cert of thirtyDayCerts || []) {
        const result = await sendReminderEmail(
          supabase, 
          cert, 
          30, 
          "expiration_reminder_sent", 
          "expiration_reminder_sent_at"
        );
        if (result.success) {
          thirtyDayRemindersSent++;
        } else if (result.error) {
          errors.push(`30-day cert ${cert.id}: ${result.error}`);
        }
      }
    }

    // Process 7-day final warnings
    const sevenDayRange = getDateRange(7);
    logStep("Checking for 7-day final warnings", { 
      startOfDay: sevenDayRange.startOfDay.toISOString(),
      endOfDay: sevenDayRange.endOfDay.toISOString()
    });

    const { data: sevenDayCerts, error: sevenDayError } = await supabase
      .from("user_certifications")
      .select("id, user_id, certification_type, expires_at, certificate_number")
      .eq("status", "active")
      .eq("final_warning_sent", false)
      .gte("expires_at", sevenDayRange.startOfDay.toISOString())
      .lte("expires_at", sevenDayRange.endOfDay.toISOString());

    if (sevenDayError) {
      logStep("Error fetching 7-day certifications", { error: sevenDayError });
      errors.push(`7-day fetch error: ${sevenDayError.message}`);
    } else {
      logStep("Found 7-day expiring certifications", { count: sevenDayCerts?.length || 0 });
      
      for (const cert of sevenDayCerts || []) {
        const result = await sendReminderEmail(
          supabase, 
          cert, 
          7, 
          "final_warning_sent", 
          "final_warning_sent_at"
        );
        if (result.success) {
          sevenDayWarningsSent++;
        } else if (result.error) {
          errors.push(`7-day cert ${cert.id}: ${result.error}`);
        }
      }
    }

    logStep("Completed expiration reminder process", { 
      thirtyDayRemindersSent, 
      sevenDayWarningsSent, 
      errors 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        thirty_day_reminders_sent: thirtyDayRemindersSent,
        seven_day_warnings_sent: sevenDayWarningsSent,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error in expiration reminder function", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
