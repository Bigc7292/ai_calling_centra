import express from "express";
import cors from "cors";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "@eva/config";

const app = express();
app.use(cors());
app.use(express.json());

const env = loadEnv();
const supa = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Minimal bootstrap tenant endpoint (one-time)
app.post("/tenants/bootstrap", async (req, res) => {
  try {
    const body = z.object({
      userId: z.string().uuid(),
      email: z.string().email(),
      tenantName: z.string().min(2)
    }).parse(req.body);

    // create user row if missing
    await supa.from("users").upsert({ id: body.userId, email: body.email });

    // create tenant
    const { data: t, error: terr } = await supa.from("tenants").insert({ name: body.tenantName }).select().single();
    if (terr) return res.status(500).json({ error: terr.message });

    await supa.from("tenant_members").insert({ tenant_id: t!.id, user_id: body.userId, role: "OWNER" });
    await supa.from("profiles").upsert({ user_id: body.userId, default_tenant_id: t!.id });

    res.json({ tenantId: t!.id });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || "bad_request" });
  }
});

const port = Number(process.env.PORT || env.PORT);
app.listen(port, "0.0.0.0", () => console.log(`[core-api] listening on ${port}`));
