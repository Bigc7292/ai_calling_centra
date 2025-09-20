// app/dashboard/analytics/Insights.tsx
// PRD v1.3, Section 7: Insights display + action button

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../components/AuthProvider";

export default function Insights() {
  const { session } = useAuth();
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      const res = await fetch("/api/analytics/insights", { headers: { Authorization: `Bearer ${session.access_token}` } });
      const data = await res.json();
      setInsights(data[0]); // Get latest
    };
    if(session) fetchInsights();
  }, [session]);

  const handleApproveTweak = () => {
      // Pre-populate script editor with insight.recommendation.change
  }

  if (!insights) return <div>Loading insights...</div>;

  return (
    <div>
      <h3>Weekly Insights</h3>
      {/* Display objections, positive_insights, recommendation */}
      <button onClick={handleApproveTweak}>Approve Tweak</button>
    </div>
  );
}
