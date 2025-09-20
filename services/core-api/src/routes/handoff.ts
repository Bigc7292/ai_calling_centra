// api/handoff.ts
// PRD v1.3, Section 6: Express routes: escalate, takeover, Slack/Zendesk stub

import { transferCall } from "@/lib/human-transfer";
import { io } from "@/lib/socket"; // Assuming a socket.io setup

export default async function handler(req, res) {
  if (req.method === "POST" && req.url.includes("/escalate")) {
    const { contact_id, transcript, intent } = req.body;

    // Post to Slack/Zendesk
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      body: JSON.stringify({ text: `Escalation: Contact ${contact_id}, Intent: ${intent}\nTranscript: ${transcript}` })
    });

    // Emit Socket.io event
    io.emit("escalation", { contact_id, intent });

    res.status(200).json({ message: "Escalation processed" });
  }

  if (req.method === "POST" && req.url.includes("/takeover")) {
    const { call_id } = req.body;
    try {
      await transferCall(call_id, process.env.VAPI_TRANSFER_NUMBER);
      res.status(200).json({ message: "Call transferred to human agent" });
    } catch (error) {
      res.status(500).json({ error: "Failed to transfer call", details: error.message });
    }
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
