// lib/stripe-client.ts
// PRD v1.3, Section 5: Stripe SDK wrapper
import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
});
