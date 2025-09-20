## 2. User Experience & Flows

### Onboarding Journey (Zero-to-First-Call in <3 Min – Micro-Interactions Detailed)
1. **Landing Page (`/`):**
   - Hero: 15s LoD video (AI agent closing a deal); A/B variants: Static vs. animated.
   - CTAs: "Free Trial" (primary, green) + "Demo Video" (secondary).
   - Personalization: Geo-IP detects industry (e.g., "Real Estate? See how we book 30% more viewings").
2. **Signup (`/signup`):**
   - Form: Email/password (min 8 chars, zxcvbn strength check) or OAuth (Google/LinkedIn for pro users).
   - Wallet Gen: Modal with progress bar – "Securing your data..." → Exports mnemonic QR code (downloadable PDF).
   - Trial: Instant 100-min credit; Phantom Stripe token for churn prediction.
   - Micro: Success confetti animation; Error: Inline validation (e.g., "Weak password – add a number").
   - Redirect: `/verify` if pro features selected.
3. **Verification (`/verify`):**
   - Upload: Drag-drop zone for PDF/JPG (max 5MB); Auto-scan via Gemini Vision API ("Is this a valid business license? Extract entity name, issue date. Flag fakes: watermark check, text anomalies").
   - Outcomes: 90% auto-approve (<10s); 8% soft-flag (e.g., "Blurry – reupload"); 2% manual (admin queue via Supabase Realtime).
   - Micro: Loading spinner with tips ("90% approved instantly!").
4. **AI Setup (`/ai-setup`):**
   - Industry: Chained dropdowns (e.g., Real Estate → Residential/Commercial); Presets load Gemini-tuned scripts.
   - Voice: 15 presets (e.g., "Confident Male – 120WPM"); Upload 10s sample → Fine-tune via Gemini ("Match tone to this audio").
   - Data: CSV validator (PapaParse JS) – Columns: phone (E.164 enforce), name/email (auto-hash preview); Bulk preview table with edit inline.
   - Script Builder: Node-based editor (React Flow) – Nodes: "Greet" (text-to-speech), "Qualify" (branch on yes/no), "Book" (Calendly API sync). Gemini assist: "Suggest objection handlers for real estate pricing".
   - Micro: Undo/redo; Auto-save to Supabase; Preview button (simulate call audio).
5. **First Campaign Launch:** `/dashboard` auto-redirect → One-click "Quick Start" (uses uploaded leads) → Dial button with countdown ("Starting in 3...").

**Edge Cases & Accessibility:**
- Offline: IndexedDB for drafts; Sync on reconnect.
- Teams: Invite modal (email + role: Admin/Viewer/Editor); RLS auto-applies.
- A11y: ARIA labels on all interactive; Screen reader flow (e.g., NVDA-tested script editor); Color contrast 4.5:1.

### Core Dashboard (`/dashboard` – Responsive, AI-Augmented)
- **Layout:** Sidebar nav (collapsible on mobile); Main grid (Masonry for cards); Dark/Light theme (localStorage persist).
- **Components (with Interactions):**
  - **Stats Cards:** 4x KPI tiles (e.g., Calls: 247 [sparkline up 12%]); Hover: Drill-down modal (e.g., "Top performers: Script v2").
  - **Lead Manager:** TanStack Table – Columns: Phone (masked), Status (badges: Hot/Green, Cold/Blue), Tags (chips editable); Actions: Bulk select → Tag/Export/Delete. Upload: Progress bar + validation errors (e.g., "5 invalid phones skipped").
  - **Campaign Creator:** Multi-step wizard – Step 1: Name/Schedule (Cron-like picker, e.g., "Mon-Fri 9-5 EST"); Step 2: Script (visual graph + code view); Step 3: A/B Split (50/50 traffic, Gemini variant gen); Step 4: Leads (filter by tags). Test: "Simulate 10 calls" button.
  - **Live Calls:** Realtime grid (WebSockets) – Columns: Caller ID, Duration (timer), Transcript Snippet (live scroll); Buttons: Mute/Transcribe/Handover (to Slack channel). Alerts: Vibration on mobile for escalations.
  - **Analytics Tab:**
    - Graphs: Recharts (funnel, line for conversions; Sankey for drop-offs); Export PNG/CSV.
    - Geo-Map: Leaflet with clusters (anonymized lat/long from IP); Click: "View calls in NYC".
    - Insights Engine: Gemini-powered (weekly cron): "Insight: 40% hangups at pricing – Reco: Add value prop early. [Approve tweak]".
  - **Settings:** Accordion sections – Integrations (API key vaults with encrypt); Compliance (DNC toggle + last scrub date); Billing (usage forecast chart).

**UX Principles (Fine-Tuned):** Progressive disclosure (e.g., advanced script options hidden); Micro-animations (e.g., badge pulses on new bookings); Personalization (e.g., "Based on your real estate focus..."); Error States: Empathetic toasts ("Oops, VAPI hiccup – retrying... [95% success]").

### Inbound Support Flow (Seamless Escalation)
- **Trigger:** Twilio SIP → VAPI inbound endpoint → AI routes (IVR menu via DTMF/NLU).
- **Core Loop:** Greet → Intent Detect (Gemini: "Classify: refund/schedule/support") → Respond (script branch) → Confidence Score (<70% → Escalate).
- **Handover:** Whisper mode ("Transferring to human..."); Queue to Zendesk/Slack with context packet (transcript + tags).
- **Post-Call:** Async Gemini: "Sentiment: Angry (scale 1-10)? Tags: {resolved: false}". Survey: SMS follow-up ("Rate 1-5?").
