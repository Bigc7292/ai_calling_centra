// supabase/functions/analyze_inbound_transcript/index.ts
// PRD v1.3, Section 2: Inbound processing + escalation logic

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { analyzeTranscript } from "../../lib/inbound-gemini.ts";

serve(async (req) => {
  const { transcript, contact_id } = await req.json();
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

  const { intent, confidence_score } = await analyzeTranscript(transcript);

  let statusUpdate = {};
  if (confidence_score < 70) {
    statusUpdate = { status: 'escalated', tags: { intent_detected: intent, confidence_score } };
    // Trigger handoff API
    await fetch(`${Deno.env.get("API_URL")}/api/calls/escalate`, { 
        method: "POST", 
        body: JSON.stringify({ contact_id, transcript, intent })
    });
  }

  const { error } = await supabase
    .from('contacts')
    .update(statusUpdate)
    .eq('id', contact_id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Transcript analyzed" }), { status: 200 });
});
