// api/analytics/ab-results.ts
// PRD v1.3, Section 7: Express route for A/B data

import { getSupabaseClient } from "@/lib/supabase";

export default async function handler(req, res) {
  const supabase = getSupabaseClient(req.headers.authorization);
  const { campaign_id } = req.query;

  const { data, error } = await supabase
    .from('contacts')
    .select('metadata->>variant, status')
    .in('campaigns', [campaign_id]);

  if (error) return res.status(500).json({ error: error.message });

  // Aggregate results
  const results = data.reduce((acc, curr) => {
    const variant = curr.variant || 'A';
    if (!acc[variant]) acc[variant] = { total: 0, booked: 0 };
    acc[variant].total++;
    if (curr.status === 'booked') acc[variant].booked++;
    return acc;
  }, {});

  res.status(200).json(results);
}
