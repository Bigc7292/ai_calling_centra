import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "@eva/config/dist/index.js"; // Explicitly point to index.js
import { authMiddleware, requireRole } from "./auth.js"; // Added .js extension
import Stripe from "stripe";
import analyticsRouter from "./routes/analytics.js"; // Added .js extension

const app = express();

// Stripe webhook needs the raw body, so apply json parsing conditionally
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/webhooks/stripe") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(cors());

const env = loadEnv();
const supa = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

// Minimal bootstrap tenant endpoint (one-time)
app.post("/tenants/bootstrap", async (req: Request, res: Response) => {
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

// Stripe Webhook
app.post("/webhooks/stripe", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.log(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Log the event for now as per acceptance criteria
  console.log(`✅ Stripe Webhook received: ${event.type}`);

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session completed:", checkoutSession);
      // TODO: Grant entitlements based on checkoutSession.metadata or line items
      break;
    case "customer.subscription.created":
      const subscriptionCreated = event.data.object as Stripe.Subscription;
      console.log("Subscription created:", subscriptionCreated);
      // TODO: Update user's subscription status
      break;
    case "customer.subscription.updated":
      const subscriptionUpdated = event.data.object as Stripe.Subscription;
      console.log("Subscription updated:", subscriptionUpdated);
      // TODO: Update user's subscription status
      break;
    case "customer.subscription.deleted":
      const subscriptionDeleted = event.data.object as Stripe.Subscription;
      console.log("Subscription deleted:", subscriptionDeleted);
      // TODO: Revoke user's subscription access
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});


// Protected routes
app.use(authMiddleware);

app.get("/me", (req: Request, res: Response) => {
  res.json({ user: req.user, tenantId: req.tenantId, role: req.role });
});

// Contact APIs
app.get("/contacts", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    let query = supa.from("contacts").select("id, name, phone, email").eq("tenant_id", req.tenantId);

    if (q) {
      query = query.ilike("name", `%${q}%`);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e?.message || "bad_request" });
  }
});

app.get("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: contact, error: contactError } = await supa.from("contacts").select("*").eq("tenant_id", req.tenantId).eq("id", id).single();
    if (contactError) return res.status(404).json({ error: "Contact not found" });

    // Stubs for related data
    const calls: any[] = [];
    const transcripts: any[] = [];
    const meetings: any[] = [];

    res.json({ contact, calls, transcripts, meetings });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || "bad_request" });
  }
});

// Broker Export API
app.get("/exports/broker", async (req: Request, res: Response) => {
  try {
    const { campaignId, from, to } = req.query;

    // Set CSV headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=\"broker_export.csv\"");

    // Write CSV headers
    res.write("name,phone,email,interests,budget_usd,nationality,meeting_time,meeting_url\n");

    // Fetch data - simplified for now, constrained by tenant_id
    let query = supa.from("contacts").select("name, phone, email").eq("tenant_id", req.tenantId);

    // Add dummy data for fields not yet in contacts table
    const dummyInterests = "Real Estate";
    const dummyBudget = 100000;
    const dummyNationality = "Unknown";
    const dummyMeetingTime = "";
    const dummyMeetingUrl = "";

    const { data: contacts, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    contacts.forEach(contact => {
      res.write(`${contact.name || ''},${contact.phone || ''},${contact.email || ''},${dummyInterests},${dummyBudget},${dummyNationality},${dummyMeetingTime},${dummyMeetingUrl}\n`);
    });

    res.end();
  } catch (e: any) {
    res.status(400).json({ error: e?.message || "bad_request" });
  }
});

// Billing APIs
app.post("/billing/checkout", requireRole("OWNER"), async (req: Request, res: Response) => {
  try {
    const { lookup_key, quantity = 1 } = z.object({
      lookup_key: z.string(),
      quantity: z.number().optional()
    }).parse(req.body);

    const prices = await stripe.prices.list({
      lookup_keys: [lookup_key],
      expand: ['data.product'],
    });

    const price = prices.data[0];

    if (!price) {
      return res.status(404).json({ error: "Price not found." });
    }

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      line_items: [
        {
          price: price.id,
          quantity: quantity,
        },
      ],
      mode: price.type === "recurring" ? "subscription" : "payment",
      success_url: `${env.WEB_BASE_URL}/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.WEB_BASE_URL}/settings/billing?canceled=true`,
      metadata: {
        tenantId: req.tenantId,
        userId: req.user?.id,
        lookupKey: lookup_key,
      },
    } as Stripe.Checkout.SessionCreateParams);

    res.json({ url: session.url });
  } catch (e: any) {
    console.error("Stripe Checkout error:", e);
    res.status(400).json({ error: e?.message || "Bad request" });
  }
});

// Mount analytics router
app.use("/analytics", analyticsRouter);

app.get("/admin-only", requireRole("ADMIN"), (req: Request, res: Response) => {
  res.json({ message: "Welcome, Admin!", user: req.user, tenantId: req.tenantId, role: req.role });
});

const port = Number(process.env.PORT || env.PORT);
app.listen(port, "0.0.0.0", () => console.log(`[core-api] listening on ${port}`));
