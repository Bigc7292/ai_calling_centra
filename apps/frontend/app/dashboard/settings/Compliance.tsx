// app/dashboard/settings/Compliance.tsx
// PRD v1.3, Section 2: Audit log UI + Erasure button

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../components/AuthProvider";

export default function ComplianceSettings() {
  const { session } = useAuth();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch("/api/compliance/logs", { headers: { Authorization: `Bearer ${session.access_token}` } });
      const data = await res.json();
      setLogs(data);
    };
    if(session) fetchLogs();
  }, [session]);

  const handleErasureRequest = async (contactId) => {
      await fetch("/api/compliance/erase", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ contact_id: contactId, walletSignature: "0x0" /* Placeholder */ })
      });
  }

  return (
    <div>
      {/* Table displaying logs */}
      {/* Button to trigger handleErasureRequest */}
    </div>
  );
}
