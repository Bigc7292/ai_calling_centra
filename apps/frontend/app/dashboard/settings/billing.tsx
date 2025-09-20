// app/dashboard/settings/billing.tsx
// PRD v1.3, Section 2: Dashboard settings: Billing view

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { getQuotaPercentage, showLowQuotaToast } from "../../../lib/quota-utils";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function BillingSettings() {
  const { session } = useAuth();
  const [quota, setQuota] = useState(0);
  const [plan, setPlan] = useState('trial');

  useEffect(() => {
    const fetchQuota = async () => {
      const res = await fetch("/api/billing/quota", { headers: { Authorization: `Bearer ${session.access_token}` } });
      const data = await res.json();
      setQuota(data.quota_minutes);
      setPlan(data.plan);
      if (data.quota_minutes < 20) {
        showLowQuotaToast();
      }
    };
    fetchQuota();
  }, [session]);

  const handleSubscribe = async () => {
    const res = await fetch("/api/billing/subscribe", { 
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` }
    });
    const { id: sessionId } = await res.json();
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-medium">Your Plan: {plan}</h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${getQuotaPercentage(quota, plan)}%` }}></div>
        </div>
        <p>{quota} minutes remaining</p>
        {plan === 'trial' && (
            <button onClick={handleSubscribe} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
                Upgrade to Pro
            </button>
        )}
      </div>
      {/* Billing history table would go here */}
    </div>
  );
}
