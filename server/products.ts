/**
 * Stripe Products and Prices Configuration
 * 
 * Define all products and prices here for centralized management
 */

export const PRODUCTS = {
  PRO_PLAN: {
    name: "Mood2Music Pro",
    description: "Unlimited playlists, advanced features, and priority support",
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_1234567890", // Replace with actual price ID from Stripe Dashboard
    amount: 999, // $9.99 in cents
    currency: "usd",
    interval: "month" as const,
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
