// api/analytics.ts
// PRD v1.3, Section 2 & 5: Express routes for all GET analytics endpoints

import { getSupabaseClient } from "@/lib/supabase";

export default async function handler(req, res) {
  const supabase = getSupabaseClient(req.headers.authorization);
  const { data: { user } } = await supabase.auth.getUser();

  if (req.method === "GET") {
    if (req.url.includes("/kpis")) {
      const { data, error } = await supabase.from('analytics_kpis').select('*').eq('user_id', user.id).single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (req.url.includes("/funnel")) {
        const { data, error } = await supabase.rpc('get_funnel_data', { p_user_id: user.id });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    if (req.url.includes("/heatmap")) {
        const { data, error } = await supabase.rpc('get_heatmap_data', { p_user_id: user.id });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    if (req.url.includes("/geo-map")) {
        const { data, error } = await supabase.from('contacts').select('metadata->ip_geo, status').eq('user_id', user.id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }
  }

  res.status(405).json({ error: "Method Not Allowed" });
}