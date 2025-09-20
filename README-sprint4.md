# AI Calling Center - Sprint 4: Stripe & Quota Enforcement

This document outlines the implementation of Sprint 4, focusing on integrating Stripe for billing and enforcing usage quotas.

## 1. Stripe Setup

1.  Create a new product in your Stripe dashboard.
2.  Add a metered price for this product (e.g., $0.04 per minute).
3.  Note the Price ID and set it as `STRIPE_PRICE_ID` in your environment variables.
4.  Set your Stripe secret key as `STRIPE_SECRET_KEY`.
5.  Set your Stripe publishable key as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

## 2. Webhook Configuration

1.  Create a new webhook endpoint in your Stripe dashboard.
2.  Set the endpoint URL to `https://<your-app-url>/api/stripe/webhook`.
3.  Select the `invoice.paid` and `payment_intent.payment_failed` events.
4.  Note the webhook signing secret and set it as `STRIPE_WEBHOOK_SECRET`.

## 3. End-to-End Testing

1.  **Sign up:** Create a new trial account.
2.  **Subscribe:** Navigate to the billing settings and subscribe to the Pro plan.
3.  **Verify Quota:** Check that your quota has been updated.
4.  **Make Calls:** Use the campaign feature to make calls and verify that your quota is decremented.
5.  **Exceed Quota:** Make calls until your quota is depleted and verify that you are blocked from making further calls.
