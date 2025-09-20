// api/vapi-inbound.ts
// PRD v1.3, Section 6: Inbound VAPI webhook

import { getSupabaseClient } from "@/lib/supabase";

export default async function handler(req, res) {
  const supabase = getSupabaseClient(req.headers.authorization);
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Upsert contact based on inbound phone number
  const { data: contact, error } = await supabase
    .from('contacts')
    .upsert({ phone: req.body.phone, user_id: user.id }, { onConflict: 'phone, user_id' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // 2. Trigger Edge Function for analysis
  await supabase.functions.invoke('analyze_inbound_transcript', { 
      body: { transcript: req.body.transcript, contact_id: contact.id }
  });

  res.status(200).json({ message: "Inbound call received" });
}
