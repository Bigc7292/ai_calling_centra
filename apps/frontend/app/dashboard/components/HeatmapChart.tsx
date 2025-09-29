// app/dashboard/components/HeatmapChart.tsx
// PRD v1.3, Section 2: Recharts component

"use client";

import { useState, useEffect } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAuth } from "../../../components/AuthProvider";
import { mapToHeatmapData } from "../../../lib/chart-data-mapper";

export default function HeatmapChartComponent() {
  const { session } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/analytics/heatmap", { headers: { Authorization: `Bearer ${session.access_token}` } });
      const apiData = await res.json();
      setData(mapToHeatmapData(apiData));
    };
    if(session) fetchData();
  }, [session]);

  if (data.length === 0) return <div>Loading...</div>;

  return (
    <ScatterChart width={730} height={250}>
        <CartesianGrid />
        <XAxis type="category" dataKey="hour" name="hour" />
        <YAxis type="category" dataKey="day" name="day" />
        <ZAxis type="number" dataKey="calls" name="calls" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Calls" data={data} fill="#8884d8" />
    </ScatterChart>
  );
}
