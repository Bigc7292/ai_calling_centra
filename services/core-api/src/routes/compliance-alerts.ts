// api/compliance-alerts.ts
// PRD v1.3, Section 7: Express route for alerts (GET) and Socket.io event

import { getSupabaseClient } from "@/lib/supabase";

export default async function handler(req, res) {
  const supabase = getSupabaseClient(req.headers.authorization);
  const { data: { user } } = await supabase.auth.getUser();

  if (req.method === "GET") {
    const { data, error } = await supabase
        .from('compliance_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
