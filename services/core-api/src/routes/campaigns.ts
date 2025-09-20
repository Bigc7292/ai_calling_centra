// api/campaigns.ts
// PRD v1.3, Section 6: APIs - /campaigns endpoints

import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { getSupabaseClient } from "@/lib/supabase";
import { enqueueCampaign } from "@/lib/campaign-queue";

const CampaignSchema = z.object({
  name: z.string(),
  schedule: z.string().optional(),
  script: z.object({}).passthrough(),
  leads: z.array(z.string().uuid()),
});

export default async function handler(req, res) {
  const supabase = getSupabaseClient(req.headers.authorization);
  const { data: { user } } = await supabase.auth.getUser();

  if (req.method === "POST") {
    const validation = CampaignSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: fromZodError(validation.error).toString() });
    }

    const { name, schedule, script, leads } = validation.data;
    const { data, error } = await supabase
      .from("campaigns")
      .insert({ user_id: user.id, name, cron: schedule, script, leads })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "Failed to create campaign", details: error });
    }

    if (req.query.start === "true") {
      await enqueueCampaign(data.id);
      const { data: updatedCampaign, error: updateError } = await supabase
        .from("campaigns")
        .update({ status: 'active' })
        .eq('id', data.id)
        .select()
        .single();
      if (updateError) {
        // Handle error, maybe log it
      }
      return res.status(202).json({ message: "Campaign created and queued for dialing", data: updatedCampaign });
    }

    return res.status(201).json({ message: "Campaign created", data });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch campaigns", details: error });
    }
    return res.status(200).json(data);
  }

  if (req.method === "POST" && req.url.includes("/start")) {
      const campaignId = req.url.split("/")[3];
      await enqueueCampaign(campaignId);
      const { data: updatedCampaign, error: updateError } = await supabase
        .from("campaigns")
        .update({ status: 'active' })
        .eq('id', campaignId)
        .select()
        .single();
      if (updateError) {
        // Handle error
      }
      return res.status(202).json({ message: "Campaign queued for dialing", data: updatedCampaign });
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
