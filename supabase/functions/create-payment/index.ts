import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Whitelist of valid Stripe price IDs for one-time payments
const VALID_PAYMENT_PRICE_IDS = [
  // Full Release Systems
  'price_1SqEGAPhXS410TO5ZIx2g0RZ', // longevity_system
  'price_1SqEGCPhXS410TO5iCsokNpV', // transfer_system
  // Stand-alone Products (new $97/$397 prices)
  'price_1T8ckXPhXS410TO5tYyygmol', // velo_check $97
  'price_1T8ckYPhXS410TO5WkQI2EpC', // velocity_system $397
  // Legacy prices (keep for existing purchases)
  'price_1SqEGGPhXS410TO52G0rlmEk', // velocity_12week (old)
  'price_1SqEW4PhXS410TO51a1fzsw1', // velocity_accelerator
  'price_1SqEGKPhXS410TO5JALh4Imp', // velo_check (old)
  'price_1SqEGMPhXS410TO5PNwPNJOe', // recruitment_audit
  // Bundles
  'price_1SqEW6PhXS410TO5GbLVm4te', // velocity_max_pack
  'price_1SqEW8PhXS410TO5A7WuQgc6', // recruiting_edge_pack
  'price_1SqEW9PhXS410TO5detPNFap', // coach_authority_pack
  // New Revenue Products
  'price_1SqMSsPhXS410TO5HQjuGUIn', // transfer_intensive
  'price_1SqMSuPhXS410TO5ymOiyyUa', // vault_verified_coach
  'price_1SqMSxPhXS410TO5rYo4echT', // showcase_prep
  'price_1SqMSzPhXS410TO5VpvnedaW', // video_analysis_5pack
  // High-Ticket & Limited Offers
  'price_1SqNiiPhXS410TO51M25fyJR', // org_starter_pack
  'price_1StVz1PhXS410TO5hktrpoe1', // performance_blueprint
  'price_1SqNikPhXS410TO5rLuqRrBn', // founders_access
  // Lesson Packages
  'price_1T1LZOPhXS410TO5lhAYrmKO', // 8-lesson pack $349
  'price_1T1LZNPhXS410TO5u5o2Szl4', // 4-lesson pack $199
];

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
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

    const { priceId, successUrl, cancelUrl } = requestBody;
    
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
    if (!VALID_PAYMENT_PRICE_IDS.includes(priceId)) {
      logStep("ERROR: Unauthorized price ID attempted", { priceId });
      return new Response(JSON.stringify({ 
        error: "This product is not available for purchase",
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

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Try to get authenticated user (optional for one-time payments)
    const authHeader = req.headers.get("Authorization");
    let userEmail: string | undefined;
    let userId: string | undefined;
    let customerId: string | undefined;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const { data, error: authError } = await supabaseClient.auth.getUser(token);
        if (!authError && data.user?.email) {
          userEmail = data.user.email;
          userId = data.user.id;
          logStep("User authenticated", { userId, email: userEmail });
          
          // Check if a Stripe customer record exists for this user
          try {
            const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
            if (customers.data.length > 0) {
              customerId = customers.data[0].id;
              logStep("Existing customer found", { customerId });
            }
          } catch (lookupError) {
            logStep("WARN: Customer lookup failed", { error: String(lookupError) });
          }
        }
      } catch (authError) {
        logStep("WARN: Auth validation failed, continuing as guest", { error: String(authError) });
      }
    } else {
      logStep("No auth header, processing as guest checkout");
    }

    const origin = req.headers.get("origin") || "https://vault-baseball.lovable.app";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/payment-canceled`,
      allow_promotion_codes: true,
      payment_method_types: ['card', 'klarna', 'affirm'],
      payment_method_options: {
        klarna: { preferred_locale: 'en-US' },
        affirm: { capture_method: 'automatic' },
      },
      metadata: {
        user_id: userId || 'guest',
        price_id: priceId,
      },
    });

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      userId: userId || 'guest'
    });

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
