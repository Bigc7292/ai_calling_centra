"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default icon issues with Webpack/Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

interface MeetingGeo {
  lat: number;
  lon: number;
  city: string;
  country: string;
  starts_at: string;
}

interface MeetingGeoMapProps {
  meetingGeos: MeetingGeo[];
}

export default function MeetingGeoMap({ meetingGeos }: MeetingGeoMapProps) {
  const defaultCenter: [number, number] = [20, 0]; // Centered on the world
  const defaultZoom = 2;

  return (
    <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: "400px", width: "100%", borderRadius: "8px" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {meetingGeos.map((geo, index) => (
        <Marker key={index} position={[geo.lat, geo.lon]}>
          <Popup>
            <strong>{geo.city}, {geo.country}</strong><br/>
            Meeting at: {new Date(geo.starts_at).toLocaleString()}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
