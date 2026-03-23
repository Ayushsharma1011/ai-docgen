import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/stripe/checkout
 * Creates a Stripe checkout session for token packs or plan upgrades.
 * 
 * Body: { type: "tokens" | "plan", amount?: number, plan?: "pro" | "premium" }
 * 
 * NOTE: Replace the TODO sections below with real Stripe SDK calls once you
 * add STRIPE_SECRET_KEY to your environment variables.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, amount, plan } = body;

    if (!type) return NextResponse.json({ error: "type is required (tokens | plan)" }, { status: 400 });

    // TODO: Initialize Stripe
    // import Stripe from "stripe";
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // TODO: Create checkout session
    // const session = await stripe.checkout.sessions.create({ ... });

    // Placeholder response until Stripe is wired up
    return NextResponse.json({
      message: "Stripe not yet configured. Add STRIPE_SECRET_KEY to .env.local.",
      type,
      amount,
      plan,
      userId: user.id,
    }, { status: 501 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events (payment success → top up tokens / update plan).
 */
export async function handleWebhook(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  // TODO: Verify webhook signature and handle events:
  // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  // switch (event.type) {
  //   case "checkout.session.completed": { ... top up tokens or update plan ... }
  // }

  return NextResponse.json({ received: true });
}
