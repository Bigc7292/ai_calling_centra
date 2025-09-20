// supabase/functions/dnc_monitor/index.ts
// PRD v1.3, Section 7: Edge Function for DNC violation check

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { io } from "https://esm.sh/socket.io-client@4.7.2";

serve(async (req) => {
  const { record: contact } = await req.json();
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

  if (contact.status === 'dnc') {
    // Check for recent calls to this number
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentCalls, error } = await supabase
        .from('contacts')
        .select('call_logs')
        .eq('id', contact.id)
        .gt('call_logs[0]->>ts', thirtyDaysAgo); // Simplified check

    if (recentCalls && recentCalls.length > 1) { // More than the initial call that set DNC
        const { error: alertError } = await supabase.from('compliance_alerts').insert({
            user_id: contact.user_id,
            type: 'DNC_Violation',
            severity: 'Critical',
            contact_id: contact.id,
            details: { message: `Attempted to call DNC contact again.` }
        });

        if (!alertError) {
            const socket = io(Deno.env.get("WEBSOCKET_URL"));
            socket.emit("compliance_alert", { userId: contact.user_id, type: 'DNC_Violation' });
        }
    }
  }

  return new Response(JSON.stringify({ message: "DNC status checked" }), { status: 200 });
});
