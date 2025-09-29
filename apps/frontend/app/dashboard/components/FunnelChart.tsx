// app/dashboard/components/FunnelChart.tsx
// PRD v1.3, Section 2: Recharts component

"use client";

import { useState, useEffect } from "react";
import { FunnelChart, Funnel, Tooltip, LabelList } from 'recharts';
import { useAuth } from "../../../components/AuthProvider";
import { mapToFunnelData } from "../../../lib/chart-data-mapper";

export default function FunnelChartComponent() {
  const { session } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/analytics/funnel", { headers: { Authorization: `Bearer ${session.access_token}` } });
      const apiData = await res.json();
      setData(mapToFunnelData(apiData));
    };
    if(session) fetchData();
  }, [session]);

  if (data.length === 0) return <div>Loading...</div>;

  return (
    <FunnelChart width={730} height={250}>
        <Tooltip />
        <Funnel dataKey="value" data={data} isAnimationActive>
            <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
        </Funnel>
    </FunnelChart>
  );
}
