import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CourseCertificateEmailRequest {
  email: string;
  recipientName: string;
  courseTitle: string;
  certificateNumber: string;
  completionDate: string;
  verifyUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-course-certificate-email function invoked");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      recipientName, 
      courseTitle, 
      certificateNumber,
      completionDate,
      verifyUrl
    }: CourseCertificateEmailRequest = await req.json();

    console.log(`Sending course certificate email to ${email} for ${courseTitle}`);

    const subject = `🎓 Congratulations! You've Completed ${courseTitle}`;

    const html = `
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
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">🎓</span>
              </div>
              
              <h2 style="color: #FFFFFF; font-size: 28px; margin: 0 0 8px 0;">Congratulations, ${recipientName}!</h2>
              <p style="color: #9CA3AF; font-size: 16px; margin: 0 0 32px 0;">You've successfully completed your course.</p>
              
              <!-- Course Badge -->
              <div style="background: rgba(212, 175, 55, 0.1); border: 2px solid #D4AF37; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <p style="color: #D4AF37; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Course Completed</p>
                <h3 style="color: #FFFFFF; font-size: 24px; margin: 0;">${courseTitle}</h3>
              </div>
              
              <!-- Certificate Details -->
              <div style="background: rgba(16, 185, 129, 0.1); border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="color: #9CA3AF; font-size: 13px; padding: 8px 0; text-align: left;">Certificate Number:</td>
                    <td style="color: #FFFFFF; font-size: 13px; padding: 8px 0; text-align: right; font-family: monospace;">${certificateNumber}</td>
                  </tr>
                  <tr>
                    <td style="color: #9CA3AF; font-size: 13px; padding: 8px 0; text-align: left;">Completion Date:</td>
                    <td style="color: #FFFFFF; font-size: 13px; padding: 8px 0; text-align: right;">${new Date(completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Verify Button -->
              <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #111827; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">
                Verify Certificate
              </a>
              
              <!-- What's Next -->
              <div style="border-top: 1px solid #374151; padding-top: 24px; margin-top: 32px;">
                <p style="color: #D4AF37; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">What's Next?</p>
                <p style="color: #9CA3AF; font-size: 14px; margin: 0; line-height: 1.6;">
                  Download your certificate from your dashboard and share it with coaches, recruiters, or on social media to showcase your achievement!
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #6B7280; font-size: 12px; margin: 0;">
                Keep training and unlock your full potential with VAULT Baseball.
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
      html,
    });

    console.log("Course certificate email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending course certificate email:", error);
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
