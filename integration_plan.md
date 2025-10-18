Top Loader Agent AI — Integration Plan

Date: 2025-10-17

Overview / Vision

Top Loader Agent AI is a rebranded, AI-enhanced calling-centre CRM built from the open-source Frappe CRM base. The product combines CRM workflows with AI capabilities (script suggestion, campaign generation, call summarization/insights, agent assist) and seamless telephony (Twilio) to deliver a highly-personalized outbound calling platform for agents and supervisors.

Primary goals

- Ship an MVP that lets teams create calling campaigns, select leads, generate AI-written scripts, run calls (Twilio), and review analytics.
- Make it easy for agents to handle calls with AI assistance and human transfer flows.
- Maintain data privacy and ensure secure access controls for PII and recordings.
- Provide a path to extend to inbound flows, analytics, and deeper automation.

Target users and personas

- Admin (owner): configures campaigns, user roles, high-level analytics.
- Campaign manager: creates campaigns, selects leads, starts/stops campaigns, reviews results.
- Agent: receives/places calls, sees script prompts and AI suggestions, marks dispositions, escalates to human transfer.
- Supervisor: monitors agents in real time, audits recordings/transcripts, exports reports.

Key features and functions

1. Campaign Creator wizard (MVP)
   - Name campaign, schedule, quick start option.
   - AI script suggestion (prompted by industry/goal) and script editor.
   - Lead selection (segments, CSV import), dedup and opt-out checks.
   - Quick Start option to immediately begin dialing.

2. Telephony and Call Flow
   - Twilio Voice SDK integration for web-based calls.
   - Call queue and agent assignment.
   - Warm/hot transfer to a human, with context passed (lead + script + previous notes).
   - Call recording and transcript storage (configurable retention).

3. AI capabilities
   - Script suggestion & refinement (LLM endpoint / Gemini integration).
   - Campaign generation (create scripts + dial plan from a brief).
   - Real-time agent assist (topic cues, objection handling suggestions).
   - Post-call summarization, sentiment analysis, and tags.

4. Lead & Data management
   - CRUD for leads, import/export CSV, segmentation, status, and opt-out handling.
   - Mapping leads to campaigns and call attempts, dispositions and follow-ups.

5. Dashboard & Analytics
   - Campaign metrics: attempts, connects, conversion rate, talk time.
   - Agent performance metrics and leaderboards.
   - Searchable call transcripts and exports.

6. Security, Compliance & Authentication
   - Role-based access control (admin, manager, agent, supervisor).
   - JWT/OAuth for API access, scoped tokens for telephony.
   - GDPR/CCPA considerations for PII & call recording.

Architecture & Tech choices (suggested)

- Backend: Keep or adapt Frappe backend data models for leads and campaigns (Python/Frappe). Expose REST/GraphQL endpoints for campaign management, script suggestion, and call logs.
- Frontend options:
  - Option A (recommended): Build our React/Next frontend (existing `apps/frontend` with `campaign-creator.tsx`) and use Frappe as the backend. This keeps our React codebase and integrates AI and Twilio directly.
  - Option B: Modify Frappe's Vue/Vite frontend to add AI features (faster if staying within Frappe ecosystem). Tradeoff: larger change to Vue stack if our existing UI is React.
- Telephony: Twilio Voice + Twilio Programmable Voice SDK (web client) and Twilio webhooks for call status.
- AI: Use a hosted LLM endpoint (Gemini / OpenAI / Azure OpenAI). All LLM calls go through backend endpoints to keep API keys server-side.
- Data storage: Use Frappe's DB or Postgres for production; store transcripts and recordings in object storage (S3/GCS) with links in DB.
- CI/CD: GitHub Actions pipeline, Docker images for backend, and Vite/Next build for frontend deployed to Cloud Run or similar (project already has cloud-run.yaml / Dockerfile).

Data model (core entities - simplified)

- Lead { id, name, phone, email, status, source, opt_out, metadata }
- Campaign { id, name, owner_id, start_at, quick_start_bool, script_text, status }
- CallAttempt { id, campaign_id, lead_id, agent_id, start_time, end_time, duration, recording_url, transcript, disposition }
- Agent { id, user_id, status, metrics }
- ScriptSuggestion { id, campaign_id, prompt, model_used, suggestion_text }

AI integration points (detailed)

- Script Suggestion endpoint
  - POST /api/gemini/suggest — receives { industry, goal, context } and returns suggested script.
  - Called from Campaign Creator UI (already present in `campaign-creator.tsx`). Backend should add rate limiting, caching, and logging.

- Campaign Generation
  - Endpoint to produce multi-step dial plans and scripts from a short brief.

- Real-time Agent Assist
  - Websocket or socket.io channel that streams AI suggestions or fallback prompts to agent UI during calls.

- Post-call processing
  - After a call ends, pass recording to transcription (speech->text), then run summarization, sentiment, and tag extraction.

Security & Privacy

- Keep LLM API keys server-side and never in frontend. Sign and scope telephony tokens per-session.
- Implement RBAC, audit logs of sensitive actions, and configurable retention for recordings/transcripts.
- Ensure opt-out list is enforced before dialing.

Milestones, tasks and rough timeline (MVP-focused)

Phase 0 — Setup (0.5-1 day)
- Confirm dev environment for Frappe repo and our React app. Install Node, Yarn, Python, and any Frappe requirements. (We already cloned.)
- Create branch `rebrand/top-loader-agent-ai` in the cloned repo or create a new repo fork.

Phase 1 — Minimal Integration & Rebrand (3-5 days)
- Rebrand assets: names, logos, README.
- Wire basic auth and create test users.
- Ensure frontend can call backend endpoints locally (CORS, dev proxies).

Phase 2 — Campaign Creator + Script Suggestion (5-8 days)
- Implement server endpoint `/api/gemini/suggest` with LLM wiring and logs.
- Hook the Campaign Creator UI to the endpoint (already present in other repo). Improve UI to show loading, allow edits.
- Add tests for endpoint and UI interactions.

Phase 3 — Telephony & Agent UI (7-14 days)
- Integrate Twilio: obtain dev keys, implement call initiation and agent web client.
- Implement call recording upload and post-call transcription.
- Add agent assist channel and basic suggestion overlays.

Phase 4 — Analytics, QA & Deploy (5-10 days)
- Dashboards, export, reporting.
- E2E tests and security review.
- Deploy to staging and then production.

Acceptance Criteria (MVP)

- Admins can create a campaign, request a script suggestion, select leads, and start a campaign.
- Agents can make/receive calls via web client and see the script in the UI.
- Calls generate recordings and transcripts stored and accessible to supervisors.
- AI script suggestions are generated without exposing API keys to the frontend.
- Role-based access works and opt-out leads are not dialed.

Risks & mitigation

- Frappe backend complexity: If integrating deeply into Frappe proves slow, we can keep the Frappe DB models and build a parallel API layer that our React app calls.
- Telephony costs & rate limits: Use a staging Twilio account and cap concurrent calls in dev.
- LLM cost/latency: Cache repeated script suggestions and provide a synchronous fallback (template-based) if the model is slow.

Immediate next actions (I can run now)

- Create branch `rebrand/top-loader-agent-ai` in the clone and commit an initial README swap.
- Implement a simple server endpoint `/api/gemini/suggest` in the backend scaffolding (stub that returns canned suggestions) so the frontend integration is testable.
- Start the frontend dev server to verify Campaign Creator UI (`campaign-creator.tsx`) works and can call the stub endpoint.

Files & areas likely to change first

- Frontend: `apps/frontend/...` (or `frontend/` in the cloned repo depending on chosen approach)
- Backend: add routes under `api/` (e.g., `api/gemini/suggest`) and `campaigns` endpoints
- Auth: `components/AuthProvider` (existing) and server-side token handling
- Telephony: services/Twilio integration module
- CI: `.github/workflows/*`

Recorded by: Assistant

---

SaaS Onboarding, Verification & Voice Customization (detailed spec)

Overview

This product will be delivered as a SaaS platform. New accounts sign up for a free trial; the first user to sign up for a new company domain is given Admin access. Before being allowed to place or receive calls the company must pass a verification flow (document upload + AI verification) to ensure they represent a legitimate organisation.

Signup & account creation flow

1. User lands on the signup page and enters:
    - Full name
    - Work email (must be a company domain; block common public domains like gmail, yahoo for admin signup)
    - Password (or OAuth sign-up option for SSO later)
    - Company name (optional auto-detected from email domain)

2. System checks email domain:
    - If domain is new (not seen before in the system), create a Company entity and assign the user the `Admin` role for that company.
    - If domain already exists, offer to join that company and be added as a staff member (invitation flow required).

3. Send verification email; require clicking the link to continue.

Document upload & AI verification (required before dialing)

Purpose: validate the business identity before allowing calls (Twilio compliance and to reduce fraud).

Steps:
1. Prompt admin to upload a supporting document proving company identity. Acceptable documents:
    - Business registration certificate
    - VAT/tax registration document
    - Utility bill with company name & address
    - Official letter on company letterhead
2. User uploads file(s) (PDF, JPG, PNG). Store uploads in secure object storage with restricted access.
3. A backend job (or immediate API call) invokes a trained verification AI model or pipeline to:
    - Extract text fields (OCR) and parse company name, address, registration number, and date.
    - Compare extracted company name and domain/email used to sign up (fuzzy matching, normalization).
    - Check for document integrity signs (e.g., tampering heuristics, metadata checks) and flag low-confidence matches.
4. If the AI validation confidence is high, mark the company `verified` and allow telephony actions.
5. If the AI validation is uncertain or fails, escalate to manual review by a human admin (dashboard queue) where staff can approve/reject.
6. Send status updates to the admin (verified/pending/failed) and record audit logs.

Restrictions prior to verification

- Users can create campaigns and configure the account, but cannot create dial sessions or place/receive calls until company is `verified`.
- API tokens for Twilio or telephony are disabled until the account is approved.

Trial & Billing

- Offer a free trial period (e.g., 14 days) with limited dial minutes. Trial starts only after email verification (not the document verification).
- Collect billing details before trial expiry (Stripe integration recommended). Allow admins to enter payment details and upgrade plans.
- Enforce trial limits: minutes, number of agents, number of leads imported.

Roles and Permissions

- Admin: full access; can invite users, manage billing, upload verification documents, and view all analytics.
- Manager: create campaigns, view team metrics, manage leads.
- Agent: handle calls, view assigned leads and scripts, update dispositions.
- Auditor/Supervisor: view recordings, transcripts, and export reports.

Dashboard experience (post-verification)

- Home/Dashboard shows KPI tiles: active campaigns, minutes used, attempts, connects, conversion rate, agent availability.
- Charts: campaign performance over time, agent leaderboards, call quality sentiment.
- Recent activity feed: last calls, transcriptions, scripts generated, and verification statuses.
- Menu with tabs:
   - Users: invite staff, upload CSV to bulk invite, manage roles
   - Leads: import CSV/Excel, view lead profiles (conversations history, mp3s, attempts, dispositions)
   - Campaigns: create/edit campaigns (Campaign Creator wizard)
   - AI Customization: configure company voice, set script tone and rules, manage custom prompt templates
   - Billing: plan, usage, invoices
   - Settings: webhooks, telephony keys, API keys

Lead profile specifics

- Each lead profile must contain:
   - Personal details (name, phone, email)
   - All interaction logs: timestamps, direction (outbound/inbound), MP3 links to recordings, full verbatim transcript, AI-generated summary, sentiment score, call attempts and statuses (no-answer, busy, rejected)
   - Dispositions and notes added by agents
   - History of script versions used when contacting the lead

AI Voice and Customization

This is accessible from the `AI Customization` tab in the dashboard. Features:

- Select or upload a company voice:
   - Provide several prebuilt voices (male/female/neutral) using the chosen TTS provider.
   - Option to upload a custom voice sample and train a company-specific voice (requires user consent and legal checks). This should be gated as a paid feature and require manual approval.

- Voice settings:
   - Speech rate, pitch, pronunciation dictionary, and fallback phrases.
   - Preferred language and locale for calls.

- Script tone & templates:
   - Company can choose a default tone (formal, friendly, direct) that the AI will use when suggesting scripts.
   - Save custom prompt templates for repeated campaign types.

Data model additions (high-level)

- Company { id, name, domain, verified_status, verification_docs[], trial_expires_at, plan }
- VerificationJob { id, company_id, status, confidence, reviewer_id, notes }
- BillingAccount { company_id, stripe_customer_id, plan_id }
- LeadInteraction { id, lead_id, campaign_id, timestamp, direction, recording_url, transcript, summary, sentiment }

Security & Compliance (critical)

- Ensure file uploads are scanned and stored securely in object storage with access controls.
- Implement RBAC and audit logging for all verification and telephony-related actions.
- Mask sensitive PII in logs where possible. Allow admins to purge data per compliance requests.
- Use encryption at rest for recordings and transcripts and TLS in transit.

Acceptance Criteria for SaaS onboarding and verification

1. A user signs up with a company email and becomes Admin for that domain.
2. Admin can upload verification documents; AI runs validation and returns a confidence score.
3. If verified, the company status toggles to `verified` and telephony features are enabled.
4. Until verified, telephony tokens or actions are blocked and the UI clearly communicates the status and next steps.
5. Trials are enforced and billing flow is present.

Operational notes

- Keep a manual reviewer queue so low-confidence verifications can be approved quickly.
- Track verification metrics (avg review time, false positives) to improve the AI verifier.
- Provide an admin endpoint to re-run verification if the company submits additional documents.

Next actionable steps I can perform now (pick any):

1. Implement the company model (`Company.verified_status` etc.) and a verification upload endpoint (server-side stub).
2. Add UI screens for signup validation, document upload, and verification status in the frontend.
3. Add stubbed AI verification service that returns a confidence score (so flows can be tested end-to-end).
4. Wire trial limits and create a billing placeholder (Stripe integration later).

---

I'll save these details to `integration_plan.md` (done). Tell me which next action above to implement and I will start it and update the todo list accordingly.
