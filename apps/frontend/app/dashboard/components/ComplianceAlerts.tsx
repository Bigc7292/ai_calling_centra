// app/dashboard/components/ComplianceAlerts.tsx
// PRD v1.3, Section 7: Realtime alerts display

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import { io } from "socket.io-client";

export default function ComplianceAlerts() {
  const { session, user } = useAuth();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const res = await fetch("/api/compliance-alerts", { headers: { Authorization: `Bearer ${session.access_token}` } });
      setAlerts(await res.json());
    };
    if(session) fetchAlerts();

    const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL);
    socket.on("compliance_alert", (data) => {
      if (data.userId === user.id) {
        setAlerts(prev => [data, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, [session, user]);

  return (
    <div>
      {/* Badge with alerts.length */}
      {/* Modal with TanStack Table of alerts */}
    </div>
  );
}
