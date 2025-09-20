// app/dashboard/components/StatsCards.tsx
// PRD v1.3, Section 2.2: Stats Cards Component

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";

export default function StatsCards() {
  const { session } = useAuth();
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    const fetchKpis = async () => {
      const res = await fetch("/api/analytics/kpis", { headers: { Authorization: `Bearer ${session.access_token}` } });
      const data = await res.json();
      setKpis(data);
    };
    if(session) fetchKpis();
  }, [session]);

  if (!kpis) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calls Made, Booked Meetings, Minutes Used, Conversion Rate */}
    </div>
  );
}
