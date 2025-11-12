import { Request, Response } from "express";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { subscriptions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-10-29.clover",
});

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).send("No signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log("[Stripe Webhook] Event received:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[Stripe Webhook] Invoice paid:", invoice.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[Stripe Webhook] Payment failed:", invoice.id);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook] Error processing event:", error);
    res.status(500).json({ error: error.message });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const subscriptionId = session.subscription as string;

  if (!userId || !subscriptionId) {
    console.error("[Stripe Webhook] Missing user_id or subscription_id");
    return;
  }

  const db = await getDb();
  if (!db) return;

  // Update user subscription to Pro
  await db
    .update(subscriptions)
    .set({
      planType: "pro",
      status: "active",
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: session.customer as string,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.userId, parseInt(userId)));

  console.log(`[Stripe Webhook] Upgraded user ${userId} to Pro`);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const db = await getDb();
  if (!db) return;

  const stripeStatus = subscription.status;
  const planType = stripeStatus === "active" ? "pro" : "free";
  const status = stripeStatus === "active" ? "active" : stripeStatus === "canceled" ? "cancelled" : "expired";

  await db
    .update(subscriptions)
    .set({
      planType,
      status,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Stripe Webhook] Updated subscription ${subscription.id} to ${planType}`);
}
