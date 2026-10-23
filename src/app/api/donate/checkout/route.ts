import { NextResponse } from "next/server";
import Stripe from "stripe";
import { site } from "@/lib/site";

const types = ["one-off", "monthly", "sponsorship"] as const;
type DonationType = (typeof types)[number];

const MIN_POUNDS = 1;
const MAX_POUNDS = 10_000;

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: "Card donations are not switched on yet." }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as {
    type?: string;
    amount?: number;
    giftAid?: boolean;
    name?: string;
  } | null;

  const type = types.find((t) => t === body?.type) as DonationType | undefined;
  const amount = Number(body?.amount);
  if (!type || !Number.isFinite(amount) || amount < MIN_POUNDS || amount > MAX_POUNDS) {
    return NextResponse.json(
      { error: `Choose a donation type and an amount between £${MIN_POUNDS} and £${MAX_POUNDS.toLocaleString("en-GB")}.` },
      { status: 400 },
    );
  }

  const unitAmount = Math.round(amount * 100);
  const recurring = type !== "one-off";
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const metadata = {
    donation_type: type,
    gift_aid: body?.giftAid ? "yes" : "no",
    donor_name: (body?.name ?? "").slice(0, 100),
  };

  const stripe = new Stripe(key);
  const session = await stripe.checkout.sessions.create({
    mode: recurring ? "subscription" : "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: unitAmount,
          product_data: {
            name: type === "sponsorship" ? `${site.name} monthly sponsorship` : `Donation to ${site.fullName}`,
          },
          ...(recurring ? { recurring: { interval: "month" as const } } : {}),
        },
      },
    ],
    metadata,
    ...(recurring ? { subscription_data: { metadata } } : { payment_intent_data: { metadata } }),
    success_url: `${origin}/donate/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/donate`,
  });

  return NextResponse.json({ url: session.url });
}
