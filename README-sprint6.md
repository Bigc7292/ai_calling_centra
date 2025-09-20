# AI Calling Center - Sprint 6: AI Training UI & Social Sync

This document outlines the implementation of Sprint 6, focusing on the AI script editor and social media lead ingestion.

## 1. Setup

Install the required libraries for the script editor:

```bash
npm install reactflow
```

## 2. Gemini API

Ensure your Gemini API key is set as `GEMINI_PRO_API_KEY` in your environment variables.

## 3. End-to-End Testing

1.  **Script Editor:**
    -   Navigate to the campaign creator.
    -   Click "Suggest Script" and verify that a script is loaded into the React Flow editor.
    -   Modify the script and save the campaign.
2.  **Social Webhook:**
    -   Send a POST request to `/api/social/x-hook` with a valid lead payload.
    -   Check the `social-ingest` queue in your BullMQ dashboard to see the job.
    -   Verify that the worker processes the job, a new contact is created with `status='hot'`, and a new campaign is launched.
