import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signUpUrl = "https://vault-baseball.lovable.app/auth";

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;font-weight:800;letter-spacing:2px;color:#000000;margin:0;">VAULT BASEBALL</h1>
    </div>
    <div style="background:#f8f8f8;border:1px solid #e5e5e5;padding:32px 24px;margin-bottom:24px;">
      <h2 style="font-size:20px;font-weight:700;color:#000000;margin:0 0 16px;">You've Been Invited to Join the Coaching Staff</h2>
      <p style="font-size:15px;color:#555555;line-height:1.6;margin:0 0 16px;">
        ${name ? `Hey ${name},` : "Hey,"}<br><br>
        You've been added to the Vault Baseball coaching staff with full platform access. Create your account to get started.
      </p>
      <p style="font-size:15px;color:#555555;line-height:1.6;margin:0 0 24px;">
        Make sure to sign up with this email: <strong>${email}</strong>
      </p>
      <div style="text-align:center;">
        <a href="${signUpUrl}" style="display:inline-block;background:#000000;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:1px;text-decoration:none;padding:14px 32px;">
          CREATE YOUR ACCOUNT
        </a>
      </div>
    </div>
    <p style="font-size:12px;color:#999999;text-align:center;margin:0;">
      Vault Baseball — Development Through Systems
    </p>
  </div>
</body>
</html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vault Baseball <onboarding@resend.dev>",
        to: [email],
        subject: "You're Invited to the Vault Baseball Coaching Staff",
        html: htmlBody,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return new Response(JSON.stringify({ error: "Failed to send email", details: resendData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: resendData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
