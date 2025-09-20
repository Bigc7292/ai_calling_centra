// api/cron-jobs.ts
// PRD v1.3, Section 7: Express route for scheduled Insight generation

import { getSupabaseClient } from "@/lib/supabase";
import { generateInsights } from "@/lib/gemini-insights";

export default async function handler(req, res) {
  // Add auth check for cron jobs
  if (req.headers.authorization !== `Bearer ${process.env.SUPABASE_CRON_AUTH}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabaseClient(); // Service role
  const { data: users, error: usersError } = await supabase.from('profiles').select('user_id');
  if (usersError) return res.status(500).json({ error: usersError.message });

  for (const user of users) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: calls, error: callsError } = await supabase
        .from('contacts')
        .select('call_logs, transcript')
        .eq('user_id', user.user_id)
        .gt('created_at', oneWeekAgo);

    if (callsError) continue;

    const insight = await generateInsights(calls);
    await supabase.from('insights').insert({ user_id: user.user_id, type: 'weekly', insight });
  }

  res.status(200).json({ message: "Weekly insights generated" });
}
