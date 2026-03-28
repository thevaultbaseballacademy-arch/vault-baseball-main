import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emails } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(JSON.stringify({ error: "emails array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const email of emails) {
      try {
        const emailResponse = await resend.emails.send({
          from: "VAULT Baseball <onboarding@resend.dev>",
          to: [email],
          subject: "🎉 Welcome to the 22M Program — Full Access Activated!",
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#c9a227;font-size:28px;margin:0;">VAULT BASEBALL</h1>
      <p style="color:#888;font-size:14px;margin-top:4px;">22M Founding Athlete Program</p>
    </div>
    
    <div style="background-color:#141414;border:1px solid #222;border-radius:12px;padding:32px;">
      <h2 style="color:#ffffff;font-size:22px;margin-top:0;">You're In! 🏆</h2>
      
      <p style="color:#cccccc;font-size:16px;line-height:1.6;">
        Congratulations — your account has been upgraded with <strong style="color:#c9a227;">full 22M Founding Athlete access</strong>. Here's what's now unlocked for you:
      </p>
      
      <div style="background-color:#1a1a1a;border-left:3px solid #c9a227;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;">
        <p style="color:#ffffff;margin:0 0 12px 0;font-weight:bold;">✅ Full Course Library Access</p>
        <p style="color:#aaa;margin:0 0 16px 0;font-size:14px;">All courses including the Velocity System, Longevity System, Transfer System, and more — completely unlocked.</p>
        
        <p style="color:#ffffff;margin:0 0 12px 0;font-weight:bold;">✅ Development Platform Access</p>
        <p style="color:#aaa;margin:0 0 16px 0;font-size:14px;">Full access to metrics tracking, check-ins, progress reports, and all athlete development tools.</p>
        
        <p style="color:#ffffff;margin:0 0 12px 0;font-weight:bold;">✅ 3 Free Comp Lessons</p>
        <p style="color:#aaa;margin:0;font-size:14px;">You have <strong style="color:#c9a227;">3 complimentary 1-on-1 lessons</strong> with any Vault coach. Book them anytime from your dashboard.</p>
      </div>
      
      <div style="text-align:center;margin-top:32px;">
        <a href="https://vault-baseball.lovable.app/dashboard" 
           style="display:inline-block;background-color:#c9a227;color:#000000;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;">
          Go to Your Dashboard →
        </a>
      </div>
      
      <p style="color:#888;font-size:13px;margin-top:24px;text-align:center;">
        Questions? Reply to this email or reach out through the app.
      </p>
    </div>
    
    <p style="color:#555;font-size:12px;text-align:center;margin-top:24px;">
      © 2026 Vault Baseball. All rights reserved.
    </p>
  </div>
</body>
</html>`,
        });

        console.log(`Email sent to ${email}:`, emailResponse);
        results.push({ email, success: true });
      } catch (emailErr: any) {
        console.error(`Failed to send to ${email}:`, emailErr);
        results.push({ email, success: false, error: emailErr.message });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
