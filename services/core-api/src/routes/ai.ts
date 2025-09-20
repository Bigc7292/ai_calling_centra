// api/ai.ts
// PRD v1.3, Section 6: Express routes: suggest-script, fine-tune (upload)

import { getSupabaseClient } from "@/lib/supabase";
import { generateScript } from "@/lib/gemini-script-gen";

export default async function handler(req, res) {
  const supabase = getSupabaseClient(req.headers.authorization);
  const { data: { user } } = await supabase.auth.getUser();

  if (req.method === "POST" && req.url.includes("/suggest-script")) {
    const { industry, goal } = req.body;
    try {
      const script = await generateScript(industry, goal);
      return res.status(200).json({ script });
    } catch (error) {
      return res.status(500).json({ error: "Failed to generate script", details: error.message });
    }
  }

  if (req.method === "POST" && req.url.includes("/fine-tune")) {
    // Stub for file upload and fine-tuning job creation
    const { data, error } = await supabase.from('ai_jobs').insert({ user_id: user.id, type: 'data', status: 'pending' });
    if (error) return res.status(500).json({ error: "Failed to create fine-tuning job", details: error });
    return res.status(202).json({ message: "Fine-tuning job created" });
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
