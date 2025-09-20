# AI Calling Center - Sprint 7: Blockchain Compliance & A/B Testing

This document outlines the implementation of Sprint 7, focusing on finalizing blockchain compliance features and introducing an A/B testing framework for campaigns.

## 1. A/B Campaign Setup

1.  When creating a campaign, enable the A/B test toggle.
2.  Select two different scripts (A and B) for the test.
3.  Set the split percentage (e.g., 70 for a 70/30 split).
4.  Launch the campaign.

## 2. Compliance Testing

1.  Navigate to the compliance settings page.
2.  View the audit logs fetched from the Polygon contract.
3.  Request data erasure for a contact.
4.  Verify that the `erasePII` function is called on the contract and the corresponding PII data in the Supabase database is nullified.

## 3. End-to-End Flow

-   **A/B Test:** Create and launch an A/B test campaign. After the campaign is complete, check the analytics dashboard to see the performance comparison between the two script variants.
-   **Compliance:** Request data erasure and verify that the data is removed from the application and the erasure is logged on the blockchain.
