# AI Calling Center - Sprint 8: Inbound Webhooks & Escalations

This document outlines the implementation of Sprint 8, focusing on handling inbound calls and escalating to human agents when necessary.

## 1. Inbound Webhook Setup

1.  Configure your VAPI/Twilio number to send a POST request to `https://<your-app-url>/api/vapi/inbound` on incoming calls.
2.  Ensure the `analyze_inbound_transcript` Supabase function is deployed.

## 2. Gemini/VAPI Integration

-   The `inbound-gemini.ts` library contains the prompt for analyzing inbound transcripts. This can be customized to better suit your needs.
-   The `human-transfer.ts` library contains a stub for transferring the call. You will need to replace this with the actual implementation from your voice provider's SDK.

## 3. End-to-End Testing

1.  **Inbound Call:** Place a call to your VAPI/Twilio number.
2.  **Transcript Analysis:** Check the `contacts` table to see the `intent_detected` and `confidence_score` tags.
3.  **Escalation:** Use a transcript that is likely to result in a low confidence score.
    -   Verify that the contact's status is updated to `escalated`.
    -   Check your Slack/Zendesk for the handoff notification.
    -   Look for the real-time alert on the dashboard.
4.  **Takeover:** Click the "Take Over" button and confirm that the call is transferred.
