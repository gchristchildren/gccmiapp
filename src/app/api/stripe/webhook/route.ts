import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/admin";

/**
 * Records completed Stripe Checkout sessions in the donations table.
 * Needs STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET and SUPABASE_SERVICE_ROLE_KEY.
 * Point a Stripe webhook for `checkout.session.completed` at /api/stripe/webhook.
 * Note: this records the first payment only; monthly renewals are not recorded yet.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !key || !signature) return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });

  const stripe = new Stripe(key);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.payment_status === "paid" && s.amount_total) {
      const type = s.metadata?.donation_type;
      const { error } = await createServiceClient()
        .from("donations")
        .upsert(
          {
            stripe_session_id: s.id,
            amount_pence: s.amount_total,
            donation_type: type === "monthly" || type === "sponsorship" ? type : "one-off",
            gift_aid: s.metadata?.gift_aid === "yes",
            donor_name: s.metadata?.donor_name || s.customer_details?.name || null,
            donor_email: s.customer_details?.email ?? null,
          },
          { onConflict: "stripe_session_id", ignoreDuplicates: true },
        );
      if (error) return NextResponse.json({ error: "Could not record donation" }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}
