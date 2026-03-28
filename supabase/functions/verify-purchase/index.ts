import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PURCHASE] ${step}${detailsStr}`);
};

// Complete map of Stripe price IDs to product keys
const PRICE_TO_PRODUCT_KEY: Record<string, string> = {
  // Subscriptions
  'price_1SjGMKPhXS410TO5XQcZm9fZ': 'basic',
  'price_1SjGMYPhXS410TO5bGu1kSSZ': 'performance',
  'price_1SjGMhPhXS410TO59WKiE81b': 'elite',
  'price_1T8ckaPhXS410TO57tcuh1nv': 'remote_training',
  'price_1SqEGEPhXS410TO5DeHOuqVH': 'small_org_license',
  'price_1SqEGIPhXS410TO5JUNSsTCq': 'org_quick_start',
  'price_1SqEGOPhXS410TO5XtSbPx0v': 'certified_coach',
  'price_1SrNRkPhXS410TO5vvzFSpNX': 'vault_trial',
  // Full Release Systems
  'price_1SqEGAPhXS410TO5ZIx2g0RZ': 'longevity_system',
  'price_1SqEGCPhXS410TO5iCsokNpV': 'transfer_system',
  // Stand-alone Products (new prices)
  'price_1T8ckXPhXS410TO5tYyygmol': 'velo_check',
  'price_1T8ckYPhXS410TO5WkQI2EpC': 'velocity_12week',
  // Stand-alone Products (legacy prices)
  'price_1SqEGGPhXS410TO52G0rlmEk': 'velocity_12week',
  'price_1SqEW4PhXS410TO51a1fzsw1': 'velocity_accelerator',
  'price_1SqEGKPhXS410TO5JALh4Imp': 'velo_check',
  'price_1SqEGMPhXS410TO5PNwPNJOe': 'recruitment_audit',
  // Bundles
  'price_1SqEW6PhXS410TO5GbLVm4te': 'velocity_max_pack',
  'price_1SqEW8PhXS410TO5A7WuQgc6': 'recruiting_edge_pack',
  'price_1SqEW9PhXS410TO5detPNFap': 'coach_authority_pack',
  // New Revenue Products
  'price_1SqMSsPhXS410TO5HQjuGUIn': 'transfer_intensive',
  'price_1SqMSuPhXS410TO5ymOiyyUa': 'vault_verified_coach',
  'price_1SqMSxPhXS410TO5rYo4echT': 'showcase_prep',
  'price_1SqMSzPhXS410TO5VpvnedaW': 'video_analysis_5pack',
  // High-Ticket & Limited Offers
  'price_1SqNiiPhXS410TO51M25fyJR': 'org_starter_pack',
  'price_1StVz1PhXS410TO5hktrpoe1': 'performance_blueprint',
  'price_1SqNikPhXS410TO5rLuqRrBn': 'founders_access',
};

// All course IDs in the platform
const ALL_COURSES = [
  'velocity-system', 'hitting-velocity-12week', 'pitching-velocity-8week', 'elite-pitching-12week',
  'elite-speed-agility-12week', 'youth-vertical-6week', 'elite-vertical-12week',
  'strength-conditioning-12week', 'youth-catcher-8week', 'elite-catcher-12week',
  'vault-catcher-complete', 'arm-health-workload', 'arm-care-complete',
  'pitcher-catcher-overlap', 'mobility-durability', 'transfer-system',
  'competitive-execution', 'elite-mindset-10week', 'winning-mindset-10week',
  'organizational-development', 'strength-power-system', 'annual-development-calendar',
  'infield-development', 'outfield-development',
];

// Complete map of product keys to course IDs they grant access to
const PRODUCT_TO_COURSES: Record<string, string[]> = {
  // Subscriptions — tiered access
  'basic': [
    'elite-speed-agility-12week', 'youth-vertical-6week', 'elite-mindset-10week',
    'arm-care-complete', 'mobility-durability',
  ],
  'performance': [
    'velocity-system', 'hitting-velocity-12week', 'pitching-velocity-8week',
    'strength-conditioning-12week', 'elite-speed-agility-12week', 'youth-vertical-6week',
    'elite-vertical-12week', 'arm-health-workload', 'arm-care-complete', 'mobility-durability',
    'elite-mindset-10week', 'competitive-execution',
  ],
  'remote_training': ALL_COURSES,
  'elite': ALL_COURSES,
  'vault_trial': ALL_COURSES,
  // Org licenses — full access
  'small_org_license': ALL_COURSES,
  'org_quick_start': ALL_COURSES,
  'org_starter_pack': ALL_COURSES,
  // Stand-alone products
  'velocity_12week': ['velocity-system', 'hitting-velocity-12week', 'pitching-velocity-8week', 'elite-pitching-12week'],
  'velocity_accelerator': ['velocity-system', 'hitting-velocity-12week'],
  'longevity_system': ['arm-health-workload', 'arm-care-complete', 'mobility-durability', 'pitcher-catcher-overlap'],
  'longevity_beta': ['arm-health-workload', 'arm-care-complete', 'mobility-durability', 'pitcher-catcher-overlap'],
  'transfer_system': ['transfer-system', 'competitive-execution'],
  'transfer_beta': ['transfer-system', 'competitive-execution'],
  'transfer_intensive': ['transfer-system', 'competitive-execution'],
  // Bundles
  'velocity_max_pack': [
    'velocity-system', 'hitting-velocity-12week', 'pitching-velocity-8week',
    'elite-speed-agility-12week', 'strength-conditioning-12week',
  ],
  'recruiting_edge_pack': ['velocity-system', 'hitting-velocity-12week', 'elite-mindset-10week'],
  'coach_authority_pack': ALL_COURSES,
  // Founder's Access — EVERYTHING, lifetime
  'founders_access': ALL_COURSES,
  // Services (no course access but still tracked)
  'velo_check': [],
  'recruitment_audit': [],
  'certified_coach': [],
  'vault_verified_coach': [],
  'showcase_prep': [],
  'video_analysis_5pack': [],
  'performance_blueprint': [],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Validate Stripe key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not configured");
      return new Response(JSON.stringify({ 
        error: "Payment verification system not configured",
        code: "STRIPE_NOT_CONFIGURED"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Use service role to insert purchases
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

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

    const { sessionId } = requestBody;
    if (!sessionId || typeof sessionId !== 'string') {
      logStep("ERROR: Invalid session ID", { sessionId });
      return new Response(JSON.stringify({ 
        error: "Session ID is required",
        code: "MISSING_SESSION_ID"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Session ID received", { sessionId: sessionId.substring(0, 20) + '...' });

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(JSON.stringify({ 
        error: "Please sign in to verify your purchase",
        code: "AUTH_REQUIRED"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      logStep("ERROR: Auth failed", { error: authError?.message });
      return new Response(JSON.stringify({ 
        error: "Session expired. Please sign in again.",
        code: "AUTH_FAILED"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session with retries
    let session;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['line_items', 'payment_intent', 'subscription'],
        });
        break;
      } catch (stripeError) {
        retryCount++;
        const errorMsg = stripeError instanceof Error ? stripeError.message : String(stripeError);
        logStep(`WARN: Stripe retrieve attempt ${retryCount} failed`, { error: errorMsg });
        
        if (retryCount >= maxRetries) {
          // Check if it's a "no such session" error
          if (errorMsg.includes("No such checkout.session")) {
            return new Response(JSON.stringify({ 
              verified: false,
              error: "Invalid or expired checkout session",
              code: "INVALID_SESSION"
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            });
          }
          throw stripeError;
        }
        // Wait before retry with exponential backoff
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount - 1)));
      }
    }

    if (!session) {
      logStep("ERROR: Failed to retrieve session after retries");
      return new Response(JSON.stringify({ 
        verified: false,
        error: "Unable to verify payment. Please try again.",
        code: "SESSION_RETRIEVAL_FAILED"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    logStep("Session retrieved", { 
      status: session.status,
      paymentStatus: session.payment_status,
      mode: session.mode
    });

    // Check payment status
    if (session.payment_status !== 'paid') {
      logStep("Payment not completed", { paymentStatus: session.payment_status });
      return new Response(JSON.stringify({ 
        verified: false, 
        message: "Payment not yet completed. Please complete your payment.",
        paymentStatus: session.payment_status,
        code: "PAYMENT_INCOMPLETE"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if purchase already recorded
    const { data: existingPurchase } = await supabaseAdmin
      .from('user_purchases')
      .select('id, product_key')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();

    if (existingPurchase) {
      logStep("Purchase already processed", { purchaseId: existingPurchase.id });
      
      // Get the courses for this product
      const existingProductKey = existingPurchase.product_key;
      const existingCourses = PRODUCT_TO_COURSES[existingProductKey] || [];
      
      return new Response(JSON.stringify({ 
        verified: true, 
        message: "Purchase already recorded",
        alreadyProcessed: true,
        productKey: existingProductKey,
        coursesUnlocked: existingCourses,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get product info from line items
    const lineItems = session.line_items?.data || [];
    logStep("Processing line items", { count: lineItems.length });

    if (lineItems.length === 0) {
      logStep("WARN: No line items found in session");
      return new Response(JSON.stringify({ 
        verified: true,
        message: "Payment verified but no products found",
        products: [],
        coursesUnlocked: [],
        code: "NO_LINE_ITEMS"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const purchasedProducts: string[] = [];
    const coursesToEnroll: string[] = [];
    const errors: string[] = [];

    for (const item of lineItems) {
      const priceId = item.price?.id;
      logStep("Processing line item", { priceId, amount: item.amount_total });
      
      if (!priceId) {
        logStep("WARN: Line item missing price ID");
        continue;
      }

      const productKey = PRICE_TO_PRODUCT_KEY[priceId];
      
      if (!productKey) {
        logStep("WARN: Unknown price ID", { priceId });
        // Still record the purchase with the price ID as key
        try {
          await supabaseAdmin
            .from('user_purchases')
            .insert({
              user_id: user.id,
              product_key: `unknown_${priceId}`,
              stripe_session_id: sessionId,
              stripe_payment_intent_id: typeof session.payment_intent === 'string' 
                ? session.payment_intent 
                : session.payment_intent?.id,
              amount_cents: item.amount_total || 0,
              status: 'completed',
            });
          logStep("Recorded unknown product purchase", { priceId });
        } catch (insertError) {
          logStep("ERROR: Failed to insert unknown product", { error: String(insertError) });
        }
        continue;
      }

      purchasedProducts.push(productKey);
      
      // Get courses this product grants access to
      const courses = PRODUCT_TO_COURSES[productKey] || [];
      coursesToEnroll.push(...courses);

      // Record the purchase
      try {
        const { error: insertError } = await supabaseAdmin
          .from('user_purchases')
          .insert({
            user_id: user.id,
            product_key: productKey,
            stripe_session_id: sessionId,
            stripe_payment_intent_id: typeof session.payment_intent === 'string' 
              ? session.payment_intent 
              : session.payment_intent?.id,
            amount_cents: item.amount_total || 0,
            status: 'completed',
          });
        
        if (insertError) {
          logStep("ERROR: Failed to insert purchase", { error: insertError.message, productKey });
          errors.push(`Failed to record ${productKey}`);
        } else {
          logStep("Purchase recorded", { productKey, amount: item.amount_total });
        }
      } catch (insertError) {
        logStep("ERROR: Exception inserting purchase", { error: String(insertError) });
        errors.push(`Exception recording ${productKey}`);
      }
    }

    // Auto-enroll user in purchased courses
    const uniqueCourses = [...new Set(coursesToEnroll)];
    logStep("Enrolling in courses", { courses: uniqueCourses });

    for (const courseId of uniqueCourses) {
      try {
        // Check if already enrolled using maybeSingle to avoid errors
        const { data: existingEnrollment } = await supabaseAdmin
          .from('course_enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle();

        if (!existingEnrollment) {
          const { error: enrollError } = await supabaseAdmin
            .from('course_enrollments')
            .insert({
              user_id: user.id,
              course_id: courseId,
              status: 'active',
            });
          
          if (enrollError) {
            logStep("ERROR: Failed to enroll in course", { courseId, error: enrollError.message });
            errors.push(`Failed to enroll in ${courseId}`);
          } else {
            logStep("Enrolled in course", { courseId });
          }
        } else {
          logStep("Already enrolled in course", { courseId });
        }
      } catch (enrollError) {
        logStep("ERROR: Exception enrolling in course", { courseId, error: String(enrollError) });
        errors.push(`Exception enrolling in ${courseId}`);
      }
    }

    // Determine if this is a founder's access purchase
    const isFoundersAccess = purchasedProducts.includes('founders_access');

    logStep("Purchase verification complete", { 
      products: purchasedProducts, 
      courses: uniqueCourses,
      isFoundersAccess,
      errors: errors.length
    });

    return new Response(JSON.stringify({ 
      verified: true,
      products: purchasedProducts,
      productKey: purchasedProducts[0], // Primary product
      coursesUnlocked: uniqueCourses,
      isFoundersAccess,
      message: errors.length > 0 
        ? "Purchase verified with some warnings" 
        : "Purchase verified and access granted!",
      warnings: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR: Unexpected error", { message: errorMessage });
    
    // Return generic error without exposing internal details
    return new Response(JSON.stringify({ 
      error: "An error occurred verifying your purchase. Please contact support.",
      code: "VERIFICATION_ERROR"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
