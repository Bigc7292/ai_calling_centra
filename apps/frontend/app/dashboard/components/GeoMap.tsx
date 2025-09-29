// app/dashboard/components/GeoMap.tsx
// PRD v1.3, Section 2: Leaflet.js component stub

"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from "../../../components/AuthProvider";

export default function GeoMap() {
  const { session } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/analytics/geo-map", { headers: { Authorization: `Bearer ${session.access_token}` } });
      const apiData = await res.json();
      setData(apiData.filter(d => d.ip_geo)); // Filter out null geo data
    };
    if(session) fetchData();
  }, [session]);

  if (typeof window === 'undefined' || data.length === 0) return <div>Loading Map...</div>;

  return (
    <MapContainer center={[51.505, -0.09]} zoom={3} style={{ height: '400px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data.map((point, i) => (
          <Marker key={i} position={[point.ip_geo.lat, point.ip_geo.lon]}>
              <Popup>{point.status}</Popup>
          </Marker>
      ))}
    </MapContainer>
  );
}
