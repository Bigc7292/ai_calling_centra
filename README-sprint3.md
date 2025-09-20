# AI Calling Center - Sprint 3: Lead Upload & Quick Campaign

This document outlines the implementation of Sprint 3, focusing on bulk lead ingestion and immediate campaign activation.

## 1. CSV Sample

Your CSV file should have the following headers: `name`, `email`, `phone`.

```csv
name,email,phone
John Doe,john.doe@example.com,+15551234567
Jane Smith,jane.smith@example.com,+15557654321
```

## 2. Queue Setup

This sprint introduces BullMQ for background job processing. Ensure your Redis server is running and the `BULLMQ_REDIS_URL` environment variable is set.

```
BULLMQ_REDIS_URL="localhost:6379"
```

## 3. End-to-End Testing

1.  **Upload Leads:** Use the new drag-and-drop component in the dashboard to upload a CSV of leads.
2.  **Verify Hashes:** Check the browser console for the generated PII hashes.
3.  **Create Campaign:** Use the campaign creator wizard to set up a new campaign, selecting the leads you just uploaded.
4.  **Quick Start:** Check the "Quick Start" box to immediately queue the campaign for dialing.
5.  **Monitor Queue:** You should see jobs being added to the `campaign-dialing` queue in your BullMQ dashboard.
