// api/middleware/quota-check.ts
// PRD v1.3, Section 6: Middleware

import { getSupabaseClient } from "@/lib/supabase";

export default function quotaCheck(handler) {
  return async (req, res) => {
    const supabase = getSupabaseClient(req.headers.authorization);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('quota_minutes').eq('user_id', user.id).single();

    if (profile.quota_minutes <= 0) {
      return res.status(402).json({ error: "Quota exceeded, please upgrade your plan." });
    }

    return handler(req, res);
  };
}
