"use client";

import { useState } from "react";
import { apiFetch } from "../../lib/apiFetch";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const createCheckoutSession = async (lookup_key: string, quantity?: number) => {
    setLoading(true);
    try {
      const response = await apiFetch("/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lookup_key, quantity }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.assign(url);
      } else {
        const errorData = await response.json();
        alert(`Failed to create checkout session: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1 style={{ marginTop: 0 }}>Settings</h1>

      <h2 style={{ marginTop: 30 }}>Platform Plans</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        <button className="btn" onClick={() => createCheckoutSession("platform_200_monthly")} disabled={loading}>Subscribe $200/month</button>
        <button className="btn" onClick={() => createCheckoutSession("platform_400_monthly")} disabled={loading}>Subscribe $400/month</button>
        <button className="btn" onClick={() => createCheckoutSession("platform_700_monthly")} disabled={loading}>Subscribe $700/month</button>
      </div>

      <h2 style={{ marginTop: 30 }}>Minutes Bundles (Weekly)</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        <button className="btn-outline" onClick={() => createCheckoutSession("minutes_1000_weekly")} disabled={loading}>Buy 1000 minutes</button>
        <button className="btn-outline" onClick={() => createCheckoutSession("minutes_3000_weekly")} disabled={loading}>Buy 3000 minutes</button>
        <button className="btn-outline" onClick={() => createCheckoutSession("minutes_7000_weekly")} disabled={loading}>Buy 7000 minutes</button>
      </div>

      <h2 style={{ marginTop: 30 }}>Overage Credits</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        <button className="btn-outline" onClick={() => createCheckoutSession("overage_500_minutes")} disabled={loading}>Buy 500 minutes ($70)</button>
      </div>

      {/* Add other settings here later */}
      <p style={{ marginTop: 40 }}>Add Calendar connect, DNC, etc. here.</p>
    </div>
  );
}