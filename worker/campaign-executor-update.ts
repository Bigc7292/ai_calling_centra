// worker/campaign-executor-update.ts
// PRD v1.3, Section 7: Updated BullMQ worker for A/B assignment

import { Worker } from "bullmq";
import { getSupabaseClient } from "../lib/supabase";

// ... (connection setup from Sprint 6)

new Worker("campaign-dialing", async (job) => {
  const { campaignId } = job.data;
  const supabase = getSupabaseClient();
  const { data: campaign } = await supabase.from("campaigns").select("*, leads(*), split_percentage").eq("id", campaignId).single();

  for (const lead of campaign.leads) {
    const variant = Math.random() * 100 < campaign.split_percentage ? 'A' : 'B';
    await supabase.from('contacts').update({ metadata: { ...lead.metadata, variant } }).eq('id', lead.id);
    
    const scriptId = variant === 'A' ? campaign.script_a_id : campaign.script_b_id;
    // Fetch script content and execute call with VAPI
  }
}, { connection });
