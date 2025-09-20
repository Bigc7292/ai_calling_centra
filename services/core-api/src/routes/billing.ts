// api/billing.ts
// PRD v1.3, Section 6: APIs - /billing endpoints

import { getSupabaseClient } from "@/lib/supabase";
import { stripe } from "@/lib/stripe-client";

export default async function handler(req, res) {
  const supabase = getSupabaseClient(req.headers.authorization);
  const { data: { user } } = await supabase.auth.getUser();

  if (req.method === "POST" && req.url.includes("/subscribe")) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('user_id', user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // From your Stripe dashboard
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?canceled=true`,
    });

    res.status(200).json({ id: session.id });
  }

  if (req.method === "GET" && req.url.includes("/quota")) {
    const { data: profile } = await supabase.from('profiles').select('quota_minutes, plan').eq('user_id', user.id).single();
    res.status(200).json(profile);
  }

  if (req.method === "POST" && req.url.includes("/webhook")) {
      // This endpoint just forwards to the Supabase Edge Function
      const webhookResponse = await supabase.functions.invoke('process_stripe_webhook', {
          body: req.body,
          headers: req.headers
      });
      res.status(webhookResponse.error ? 500 : 200).json(webhookResponse);
  }
}
