import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Verify admin role
    const { data: adminRole } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!adminRole) {
      throw new Error("Admin access required");
    }

    const { coach_id, amount_cents, description } = await req.json();

    if (!coach_id || !amount_cents || amount_cents <= 0) {
      throw new Error("Invalid payout parameters");
    }

    // Get coach details
    const { data: coach, error: coachError } = await supabaseClient
      .from("coaches")
      .select("id, name, email, stripe_account_id")
      .eq("id", coach_id)
      .single();

    if (coachError || !coach) {
      throw new Error("Coach not found");
    }

    if (!coach.stripe_account_id) {
      throw new Error("Coach does not have a Stripe Connect account");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create the transfer
    const transfer = await stripe.transfers.create({
      amount: amount_cents,
      currency: "usd",
      destination: coach.stripe_account_id,
      description: description || `Payout to ${coach.name}`,
      metadata: {
        coach_id: coach.id,
        coach_email: coach.email,
      },
    });

    // Record the payout in database
    const { data: payout, error: payoutError } = await supabaseClient
      .from("coach_payouts")
      .insert({
        coach_id: coach.id,
        amount_cents,
        description: description || `Payout to ${coach.name}`,
        stripe_transfer_id: transfer.id,
        status: "completed",
        processed_at: new Date().toISOString(),
        processed_by: user.id,
      })
      .select()
      .single();

    if (payoutError) {
      console.error("Failed to record payout:", payoutError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        transfer_id: transfer.id,
        payout_id: payout?.id,
        amount: amount_cents,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isAuthError = errorMessage === "Unauthorized" || errorMessage === "Admin access required";
    return new Response(
      JSON.stringify({ error: isAuthError ? errorMessage : "An error occurred. Please try again." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: isAuthError ? 401 : 500,
      }
    );
  }
});
