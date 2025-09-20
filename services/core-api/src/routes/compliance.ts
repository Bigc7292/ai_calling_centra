// api/compliance.ts
// PRD v1.3, Section 4: Express routes: erase (POST), logs (GET)

import { getSupabaseClient } from "@/lib/supabase";
import { getContractLogs } from "@/lib/blockchain-client";

export default async function handler(req, res) {
  const supabase = getSupabaseClient(req.headers.authorization);
  const { data: { user } } = await supabase.auth.getUser();

  if (req.method === "POST" && req.url.includes("/erase")) {
    const { contact_id, walletSignature } = req.body;
    // 1. Verify signature (simplified)

    // 2. Instruct client to send transaction (this is a conceptual stub)
    // In a real app, the client would use ethers.js to call the contract
    // and the backend would wait for the transaction to be mined.

    // 3. Trigger Supabase Edge Function
    const { error } = await supabase.functions.invoke('erase_pii_data', { body: { contact_id } });
    if (error) return res.status(500).json({ error: error.message });

    return res.status(202).json({ message: "Erasure process initiated" });
  }

  if (req.method === "GET" && req.url.includes("/logs")) {
    const { data: profile } = await supabase.from('profiles').select('wallet_address').eq('user_id', user.id).single();
    try {
      const logs = await getContractLogs(profile.wallet_address, 0, 100);
      return res.status(200).json(logs);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch contract logs", details: error.message });
    }
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
