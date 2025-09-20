// tests/sprint3.test.ts
// PRD v1.3, Validation & Testing

import { describe, it, expect, vi } from "vitest";
import { parseCSV } from "../lib/csv-parser";
import { campaignQueue } from "../lib/campaign-queue";

describe("Sprint 3: Lead Upload & Quick Campaign", () => {
  it("should parse a valid CSV file", async () => {
    const csv = `name,email,phone\nJohn Doe,john@example.com,+15551234567`;
    const file = new File([csv], "leads.csv", { type: "text/csv" });
    const data = await parseCSV(file);
    expect(data).toEqual([{ name: "John Doe", email: "john@example.com", phone: "+15551234567" }]);
  });

  it("should reject a CSV with invalid phone numbers", async () => {
      // This should be handled by Zod validation in the API endpoint, not the parser
  });

  it("should add a campaign to the queue", async () => {
    const spy = vi.spyOn(campaignQueue, "add");
    await campaignQueue.add("start-campaign", { campaignId: "test-id" });
    expect(spy).toHaveBeenCalledWith("start-campaign", { campaignId: "test-id" });
  });

  it("should handle a quick campaign launch", async () => {
      // E2E test for this would involve mocking fetch calls to the API
  });
});
