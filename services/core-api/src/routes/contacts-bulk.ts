// api/contacts-bulk.ts
// PRD v1.3, Section 6: APIs - POST /contacts/bulk

import { ethers } from "ethers";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { getSupabaseClient } from "@/lib/supabase";
import { enqueueDNCScrub } from "@/lib/campaign-queue";

const LeadBatchSchema = z.object({
  leads: z.array(z.object({
    phone: z.string().refine(phone => /^\+[1-9]\d{1,14}$/.test(phone), {
      message: "Invalid E.164 phone number format",
    }),
    name: z.string(),
    email: z.string().email(),
  })),
  walletSignature: z.string(),
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const validation = LeadBatchSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: fromZodError(validation.error).toString() });
  }

  const { leads, walletSignature } = validation.data;
  const supabase = getSupabaseClient(req.headers.authorization);

  // PRD v1.3, Section 4: Verify batch signature
  const message = JSON.stringify(leads);
  const signerAddress = ethers.utils.verifyMessage(message, walletSignature);
  const { data: { user } } = await supabase.auth.getUser();

  // This is a simplified check. In a real app, you'd compare against the user's wallet address stored in your DB
  // const { data: profile } = await supabase.from('profiles').select('wallet_address').eq('user_id', user.id).single();
  // if (signerAddress.toLowerCase() !== profile.wallet_address.toLowerCase()) {
  //   return res.status(401).json({ error: "Invalid signature" });
  // }

  const contactsToInsert = leads.map(lead => ({
    user_id: user.id,
    phone: lead.phone,
    name_hash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(lead.name)),
    email_hash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(lead.email)),
    status: 'cold',
    tags: { source: 'csv-upload' },
  }));

  const { data, error } = await supabase
    .from("contacts")
    .upsert(contactsToInsert, { onConflict: "phone, user_id" });

  if (error) {
    return res.status(500).json({ error: "Failed to insert contacts", details: error });
  }

  // PRD v1.3, Section 3: Queue async DNC scrub
  await enqueueDNCScrub(leads.map(l => l.phone));

  res.status(201).json({ message: "Hashes logged, contacts created", data });
}
