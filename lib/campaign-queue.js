// lib/campaign-queue.ts
// PRD v1.3, Section 5: BullMQ for upload queues
import { Queue, Worker } from "bullmq";
import { getSupabaseClient } from "./supabase";
const connection = {
    host: process.env.BULLMQ_REDIS_URL.split(":")[0],
    port: parseInt(process.env.BULLMQ_REDIS_URL.split(":")[1]),
};
export const campaignQueue = new Queue("campaign-dialing", { connection });
export const dncScrubQueue = new Queue("dnc-scrubbing", { connection });
export async function enqueueCampaign(campaignId) {
    await campaignQueue.add("start-campaign", { campaignId });
}
export async function enqueueDNCScrub(phones) {
    await dncScrubQueue.add("scrub-phones", { phones });
}
// Worker to process campaign dialing
new Worker("campaign-dialing", async (job) => {
    const { campaignId } = job.data;
    const supabase = getSupabaseClient(); // Assumes service role key is set in env
    const { data: campaign } = await supabase.from("campaigns").select("*, leads(*)").eq("id", campaignId).single();
    for (const lead of campaign.leads) {
        // PRD v1.3, Section 6: Call Sprint 2 endpoint
        // This is a mock of calling the VAPI endpoint
        console.log(`Dialing lead ${lead.phone} for campaign ${campaign.name}`);
        // In a real app, you would make an API call to your /api/calls/outbound endpoint
        // and decrement the user's quota
    }
    await supabase.from("campaigns").update({ status: 'completed' }).eq('id', campaignId);
}, { connection });
// Worker to process DNC scrubbing
new Worker("dnc-scrubbing", async (job) => {
    const { phones } = job.data;
    const supabase = getSupabaseClient();
    // Mock call to DNC scrub function
    const { data: scrubbedPhones } = await supabase.functions.invoke('bulk_dnc_scrub', {
        body: { phones },
    });
    // Update contacts based on scrubbed results
}, { connection });
