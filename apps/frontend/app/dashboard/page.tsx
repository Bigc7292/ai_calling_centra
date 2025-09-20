// app/dashboard/page.tsx
// PRD v1.3, Section 2: Main dashboard grid layout

"use client";

import StatsCards from "./components/StatsCards";
import FunnelChart from "./components/FunnelChart";
import HeatmapChart from "./components/HeatmapChart";
import GeoMap from "./components/GeoMap";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="col-span-full">
        <StatsCards />
      </div>
      <div className="col-span-full lg:col-span-2">
        <FunnelChart />
      </div>
      <div className="col-span-full lg:col-span-2">
        <HeatmapChart />
      </div>
      <div className="col-span-full">
        <GeoMap />
      </div>
    </div>
  );
}
