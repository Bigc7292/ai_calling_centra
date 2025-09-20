// supabase/functions/erase_pii_data/index.ts
// PRD v1.3, Section 4: Supabase action after on-chain call

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req) => {
  const { contact_id } = await req.json();
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

  const { error } = await supabase
    .from('contacts')
    .update({ 
        name_hash: null, 
        email_hash: null, 
        status: 'erased' 
    })
    .eq('id', contact_id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "PII data erased" }), { status: 200 });
});
