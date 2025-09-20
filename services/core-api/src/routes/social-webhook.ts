// api/social-webhook.ts
// PRD v1.3, Section 6: X/Twitter webhook handler (enqueues)

import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { socialIngestQueue } from "@/worker/social-ingest-worker";

const SocialLeadSchema = z.object({
    name: z.string(),
    phone: z.string().refine(phone => /^\+[1-9]\d{1,14}$/.test(phone)),
    source: z.literal('twitter/x'),
});

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    // PRD v1.3, Section 6: Zod validation
    const validation = SocialLeadSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).toString() });
    }

    // PRD v1.3, Section 6: Enqueue lead to BullMQ
    await socialIngestQueue.add("new-social-lead", validation.data);

    res.status(202).json({ message: "Lead received and queued for processing" });
}
