# AI Calling Center - Sprint 2: VAPI Endpoints & Core Schema

This document outlines the setup, deployment, and testing for Sprint 2, which enables the first end-to-end AI call flow per PRD v1.3, Sec 7.

## 1. Overview

This sprint builds on the user authentication from Sprint 1 to introduce:
- **Outbound Calling:** An API to initiate AI-powered calls via the VAPI service.
- **VAPI Webhooks:** A webhook to receive real-time call data, including transcripts and outcomes.
- **AI Analysis:** A Supabase Edge Function that uses the Gemini API to analyze call transcripts for sentiment and content, then automatically tags the corresponding contact.
- **Live Dashboard:** A frontend component that displays active calls and their status in real-time using Socket.io.
- **Database Schema:** A new `contacts` table to store call information, leads, and analysis results.

## 2. Environment Setup

Add the following variables to your existing `.env.local` file in the `apps/frontend` directory.

```env
# VAPI Configuration (per PRD Sec 5)
VAPI_API_KEY="your-vapi-api-key"
NEXT_PUBLIC_VAPI_ASSISTANT_ID="your-vapi-assistant-id"

# Gemini API Key for Analysis (per PRD Sec 5)
GEMINI_API_KEY="your-gemini-api-key"

# Socket.io Server
NEXT_PUBLIC_WEBSOCKET_URL="http://localhost:3001"
```

## 3. Database Setup (Supabase)

Apply the new migration to your Supabase project by running the schema changes in `supabase/migrations/002_contacts.sql` in the Supabase SQL Editor. This will create the `contacts` table, associated `enums`, and the trigger to invoke the analysis function.

## 4. Deploying Supabase Edge Function

Deploy the `analyze_transcript` function to your Supabase project using the Supabase CLI.

```bash
# From the /home/marketing/ai_calling_centra/supabase directory
supabase functions deploy analyze_transcript --no-verify-jwt
```
Set the required environment variables for the function:
```bash
supabase secrets set --env-file ./functions/.env
```
Your `./functions/.env` file should contain:
```
GEMINI_API_KEY=your-gemini-api-key
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 5. Running the Application with Socket.io

This sprint introduces a real-time component that requires a custom Node.js server to run alongside Next.js.

**1. Install Dependencies:**
```bash
# In apps/frontend directory
npm install socket.io-client socket.io bullmq
```

**2. Run the Custom Server:**
A custom server file (`apps/frontend/server.ts`) is included to manage both the Next.js app and the Socket.io server. Update your `apps/frontend/package.json` scripts:

```json
"scripts": {
  "dev": "node server.js",
  "build": "next build",
  "start": "NODE_ENV=production node server.js"
}
```

Now, run the development server from the `apps/frontend` directory:
```bash
npm run dev
```
This will start the Next.js app on port 3000 and the Socket.io server on port 3001.

## 6. VAPI Configuration

1.  **Create an Assistant:** In your VAPI dashboard, create an assistant with a basic script (e.g., "Hello, this is a test call from AI Calling Center. Have a great day!"). Note the Assistant ID.
2.  **Set Webhook URL:** Configure the assistant's webhook URL to point to your public-facing endpoint. Use a service like ngrok during development:
    `https://your-ngrok-url.ngrok.io/api/vapi/webhook`

## 7. Running Tests

The test suite uses Vitest to validate the new API endpoints and services.

Run tests from the project root (`/home/marketing/ai_calling_centra`):
```bash
npm run test
```
This will execute the tests defined in `tests/sprint2.test.ts`.
