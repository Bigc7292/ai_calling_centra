// app/dashboard/live-calls-inbound.tsx
// PRD v1.3, Section 2: Enhanced live calls component

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import { io } from "socket.io-client";

export default function LiveCallsInbound() {
  const { session } = useAuth();
  const [escalatedCalls, setEscalatedCalls] = useState([]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL);
    socket.on("escalation", (data) => {
      // Add visual/auditory alert
      setEscalatedCalls(prev => [...prev, data.contact_id]);
    });

    return () => socket.disconnect();
  }, []);

  const handleTakeover = async (callId) => {
      await fetch("/api/calls/takeover", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ call_id: callId })
      });
  }

  return (
    <div>
      {/* Display live calls, with special styling for escalated calls */}
      {/* {escalatedCalls.includes(call.id) && <button onClick={() => handleTakeover(call.id)}>Take Over</button>} */}
    </div>
  );
}
