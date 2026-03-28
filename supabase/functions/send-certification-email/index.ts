import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CertificationEmailRequest {
  email: string;
  coachName: string;
  certificationName: string;
  passed: boolean;
  score: number;
  passingScore: number;
  expiresAt?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-CERT-EMAIL] ${step}${detailsStr}`);
};

const handler = async (req: Request): Promise<Response> => {
  logStep("Function invoked");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication: Require valid user JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logStep("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      logStep("Invalid JWT", { error: claimsError?.message });
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    logStep("Authenticated user", { userId });

    const { 
      email, 
      coachName, 
      certificationName, 
      passed, 
      score, 
      passingScore,
      expiresAt 
    }: CertificationEmailRequest = await req.json();

    logStep(`Sending ${passed ? 'pass' : 'fail'} email to ${email} for ${certificationName}`);

    const subject = passed 
      ? `🎉 Congratulations! You've Earned Your ${certificationName} Certification`
      : `${certificationName} Exam Results - Keep Striving!`;

    const passedHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #D4AF37; font-size: 24px; margin: 0; letter-spacing: 2px;">THE VAULT</h1>
              <p style="color: #9CA3AF; font-size: 12px; margin: 8px 0 0 0;">BASEBALL ACADEMY</p>
            </div>
            
            <!-- Main Card -->
            <div style="background: linear-gradient(135deg, #1F2937 0%, #111827 100%); border: 1px solid #D4AF37; border-radius: 16px; padding: 40px; text-align: center;">
              <!-- Success Icon -->
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">✓</span>
              </div>
              
              <h2 style="color: #FFFFFF; font-size: 28px; margin: 0 0 8px 0;">Congratulations, ${coachName}!</h2>
              <p style="color: #9CA3AF; font-size: 16px; margin: 0 0 32px 0;">You've successfully passed your certification exam.</p>
              
              <!-- Certification Badge -->
              <div style="background: rgba(212, 175, 55, 0.1); border: 2px solid #D4AF37; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <p style="color: #D4AF37; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Certification Earned</p>
                <h3 style="color: #FFFFFF; font-size: 24px; margin: 0;">${certificationName}</h3>
              </div>
              
              <!-- Score -->
              <div style="display: inline-block; background: rgba(16, 185, 129, 0.1); border-radius: 8px; padding: 16px 32px; margin-bottom: 32px;">
                <p style="color: #9CA3AF; font-size: 12px; margin: 0 0 4px 0;">Your Score</p>
                <p style="color: #10B981; font-size: 36px; font-weight: bold; margin: 0;">${score}%</p>
                <p style="color: #6B7280; font-size: 12px; margin: 4px 0 0 0;">Passing: ${passingScore}%</p>
              </div>
              
              <!-- Validity -->
              ${expiresAt ? `
              <div style="border-top: 1px solid #374151; padding-top: 24px; margin-top: 24px;">
                <p style="color: #9CA3AF; font-size: 14px; margin: 0;">
                  Valid until: <strong style="color: #FFFFFF;">${new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </p>
              </div>
              ` : ''}
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #6B7280; font-size: 12px; margin: 0;">
                You can download your certificate from your dashboard.
              </p>
              <p style="color: #4B5563; font-size: 11px; margin: 16px 0 0 0;">
                © ${new Date().getFullYear()} The Vault Baseball Academy. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const failedHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #D4AF37; font-size: 24px; margin: 0; letter-spacing: 2px;">THE VAULT</h1>
              <p style="color: #9CA3AF; font-size: 12px; margin: 8px 0 0 0;">BASEBALL ACADEMY</p>
            </div>
            
            <!-- Main Card -->
            <div style="background: linear-gradient(135deg, #1F2937 0%, #111827 100%); border: 1px solid #374151; border-radius: 16px; padding: 40px; text-align: center;">
              <h2 style="color: #FFFFFF; font-size: 28px; margin: 0 0 8px 0;">Keep Pushing, ${coachName}!</h2>
              <p style="color: #9CA3AF; font-size: 16px; margin: 0 0 32px 0;">Your ${certificationName} exam results are in.</p>
              
              <!-- Score -->
              <div style="display: inline-block; background: rgba(239, 68, 68, 0.1); border-radius: 8px; padding: 16px 32px; margin-bottom: 32px;">
                <p style="color: #9CA3AF; font-size: 12px; margin: 0 0 4px 0;">Your Score</p>
                <p style="color: #EF4444; font-size: 36px; font-weight: bold; margin: 0;">${score}%</p>
                <p style="color: #6B7280; font-size: 12px; margin: 4px 0 0 0;">Required: ${passingScore}%</p>
              </div>
              
              <!-- Encouragement -->
              <div style="background: rgba(59, 130, 246, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <p style="color: #60A5FA; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">Don't Give Up!</p>
                <p style="color: #9CA3AF; font-size: 14px; margin: 0; line-height: 1.6;">
                  Every expert was once a beginner. Review the material, focus on areas that need improvement, and try again when you're ready. We believe in you!
                </p>
              </div>
              
              <!-- Tips -->
              <div style="text-align: left; border-top: 1px solid #374151; padding-top: 24px;">
                <p style="color: #FFFFFF; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Tips for next time:</p>
                <ul style="color: #9CA3AF; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Review the course materials thoroughly</li>
                  <li>Focus on the sections where you lost points</li>
                  <li>Take practice notes as you study</li>
                  <li>Get a good night's rest before retaking</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #6B7280; font-size: 12px; margin: 0;">
                You can retake the exam from your certifications dashboard.
              </p>
              <p style="color: #4B5563; font-size: 11px; margin: 16px 0 0 0;">
                © ${new Date().getFullYear()} The Vault Baseball Academy. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "VAULT Baseball <onboarding@resend.dev>",
      to: [email],
      subject,
      html: passed ? passedHtml : failedHtml,
    });

    logStep("Email sent successfully", { response: emailResponse });

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("Error", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
