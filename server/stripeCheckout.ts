import { Request, Response } from "express";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { PRODUCTS } from "./products";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-10-29.clover",
});

export async function createCheckoutSession(req: Request, res: Response) {
  try {
    const { userId, userEmail, userName } = req.body;

    if (!userId || !userEmail) {
      return res.status(400).json({ error: "Missing user information" });
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRODUCTS.PRO_PLAN.priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId.toString(),
      metadata: {
        user_id: userId.toString(),
        customer_email: userEmail,
        customer_name: userName || "",
      },
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard?upgrade=success`,
      cancel_url: `${origin}/dashboard?upgrade=cancelled`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("[Stripe Checkout] Error:", error);
    res.status(500).json({ error: error.message });
  }
}
