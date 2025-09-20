// supabase/functions/process_stripe_webhook/index.ts
// PRD v1.3, Section 5: Supabase Edge for webhooks

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@10.17.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), { apiVersion: "2022-11-15" });

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get("STRIPE_WEBHOOK_SECRET"));
  } catch (err) {
    return new Response(err.message, { status: 400 });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

  switch (event.type) {
    case 'invoice.paid': {
      const invoice = event.data.object;
      const { data: profile } = await supabase.from('profiles').select('*').eq('stripe_customer_id', invoice.customer).single();
      
      // Assuming 1000 minutes for a standard plan purchase
      const newQuota = (profile.quota_minutes || 0) + 1000;

      await supabase.from('profiles').update({ quota_minutes: newQuota, plan: 'pro' }).eq('stripe_customer_id', invoice.customer);
      await supabase.from('billing_logs').insert({ user_id: profile.user_id, stripe_invoice_id: invoice.id, minutes_billed: 1000, amount_cents: invoice.amount_paid, status: 'paid' });
      break;
    }
    case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        // Flag user, send notification, etc.
        break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
