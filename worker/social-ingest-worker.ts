// worker/social-ingest-worker.ts
// PRD v1.3, Section 6: BullMQ worker: hash, upsert, auto-dial

import { Worker, Queue } from "bullmq";
import { getSupabaseClient } from "../lib/supabase";
import { hashLead } from "../lib/csv-parser"; // Re-using from Sprint 3

const connection = {
  host: process.env.BULLMQ_REDIS_URL.split(":")[0],
  port: parseInt(process.env.BULLMQ_REDIS_URL.split(":")[1]),
};

export const socialIngestQueue = new Queue("social-ingest", { connection });

new Worker("social-ingest", async (job) => {
  const lead = job.data;
  const supabase = getSupabaseClient(); // Service role

  // Hash PII
  const nonce = Date.now();
  const name_hash = hashLead({ name: lead.name, phone: lead.phone, email: '' }, nonce);

  // Upsert contact
  const { data: contact, error } = await supabase
    .from("contacts")
    .upsert({ 
        phone: lead.phone, 
        name_hash, 
        status: 'hot', 
        metadata: { source: lead.source }
    }, { onConflict: "phone" })
    .select()
    .single();

  if (error) {
      console.error("Failed to upsert social lead", error);
      return;
  }

  // Auto-launch Quick Campaign
  // This is a simplified version. A real implementation would be more robust.
  const { data: campaign } = await supabase
    .from("campaigns")
    .insert({ name: `Hot Lead from ${lead.source}`, leads: [contact.id], script: { /* predefined hot lead script */ } })
    .select()
    .single();

  if (campaign) {
      await fetch(`${process.env.API_URL}/api/campaigns/${campaign.id}/start`, { method: "POST" });
  }

}, { connection });
