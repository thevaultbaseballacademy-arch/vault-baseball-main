import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Whitelist of valid Stripe price IDs for subscriptions
const VALID_SUBSCRIPTION_PRICE_IDS = [
  'price_1SjGMKPhXS410TO5XQcZm9fZ', // basic
  'price_1SjGMYPhXS410TO5bGu1kSSZ', // performance
  'price_1SjGMhPhXS410TO59WKiE81b', // elite
  'price_1T8ckaPhXS410TO57tcuh1nv', // remote_training $199/mo
  'price_1SqEGEPhXS410TO5DeHOuqVH', // small_org_license
  'price_1SqEGIPhXS410TO5JUNSsTCq', // org_quick_start
  'price_1SqEGOPhXS410TO5XtSbPx0v', // certified_coach
  'price_1SrNRkPhXS410TO5vvzFSpNX', // vault_trial - 7-day trial then $499/month
];

// Price IDs that should have a 7-day trial period
const TRIAL_PRICE_IDS = [
  'price_1SrNRkPhXS410TO5vvzFSpNX', // vault_trial
];

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Validate Stripe key first
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not configured");
      return new Response(JSON.stringify({ 
        error: "Payment system not configured. Please contact support.",
        code: "STRIPE_NOT_CONFIGURED"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Validate key type
    if (stripeKey.startsWith("pk_")) {
      logStep("ERROR: Invalid key type - using publishable key instead of secret key");
      return new Response(JSON.stringify({ 
        error: "Payment system misconfigured. Please contact support.",
        code: "INVALID_KEY_TYPE"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      logStep("ERROR: Invalid request body", { error: String(parseError) });
      return new Response(JSON.stringify({ 
        error: "Invalid request format",
        code: "INVALID_REQUEST"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { priceId } = requestBody;
    
    // Validate priceId is a non-empty string
    if (!priceId || typeof priceId !== 'string') {
      logStep("ERROR: Invalid price ID format", { priceId });
      return new Response(JSON.stringify({ 
        error: "Invalid price ID format",
        code: "INVALID_PRICE_ID"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Validate priceId is in the whitelist
    if (!VALID_SUBSCRIPTION_PRICE_IDS.includes(priceId)) {
      logStep("ERROR: Unauthorized price ID attempted", { priceId });
      return new Response(JSON.stringify({ 
        error: "This product requires a different checkout process",
        code: "PRICE_NOT_AUTHORIZED"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    logStep("Price ID validated", { priceId });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(JSON.stringify({ 
        error: "Please sign in to subscribe",
        code: "AUTH_REQUIRED"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError) {
      logStep("ERROR: Auth validation failed", { error: authError.message });
      return new Response(JSON.stringify({ 
        error: "Session expired. Please sign in again.",
        code: "AUTH_FAILED"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = data.user;
    if (!user?.email) {
      logStep("ERROR: User email not available");
      return new Response(JSON.stringify({ 
        error: "User email not available",
        code: "EMAIL_REQUIRED"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create Stripe customer
    let customerId: string | undefined;
    try {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing customer found", { customerId });
      }
    } catch (stripeError) {
      logStep("WARN: Failed to lookup customer", { error: String(stripeError) });
      // Continue without customer ID - Stripe will create one
    }

    const origin = req.headers.get("origin") || "https://vault-baseball.lovable.app";
    
    // Check if this price should have a trial period
    const hasTrial = TRIAL_PRICE_IDS.includes(priceId);
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: hasTrial ? {
        trial_period_days: 7,
      } : undefined,
      success_url: hasTrial 
        ? `${origin}/velocity-baseline?subscription=success` 
        : `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: hasTrial 
        ? `${origin}/trial?subscription=canceled`
        : `${origin}/payment-canceled`,
      allow_promotion_codes: true,
      payment_method_types: ['card', 'klarna', 'affirm'],
      payment_method_options: {
        klarna: { preferred_locale: 'en-US' },
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR: Unexpected error", { message: errorMessage });
    
    // Check for specific Stripe errors
    if (errorMessage.includes("No such price")) {
      return new Response(JSON.stringify({ 
        error: "Product pricing configuration error. Please contact support.",
        code: "INVALID_PRICE"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    return new Response(JSON.stringify({ 
      error: "An error occurred during checkout. Please try again.",
      code: "CHECKOUT_ERROR"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
