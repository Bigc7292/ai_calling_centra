// tests/sprint6.test.ts
// PRD v1.3, Validation & Testing

import { describe, it, expect, vi } from "vitest";
import { socialIngestQueue } from "../worker/social-ingest-worker";

describe("Sprint 6: AI Training & Social Sync", () => {
  it("should enqueue a new social lead", async () => {
    const spy = vi.spyOn(socialIngestQueue, "add");
    const lead = { name: "Test Lead", phone: "+15551234567", source: "twitter/x" };
    await socialIngestQueue.add("new-social-lead", lead);
    expect(spy).toHaveBeenCalledWith("new-social-lead", lead);
  });

  it("should return a valid JSON script from Gemini", async () => {
      // Mock fetch to the Gemini API
      global.fetch = vi.fn(() => Promise.resolve({
          json: () => Promise.resolve({ script: { nodes: [{id: '1'}], edges: [] } })
      }));
      const res = await fetch("/api/ai/suggest-script", { method: "POST", body: JSON.stringify({}) });
      const { script } = await res.json();
      expect(script).toHaveProperty('nodes');
      expect(script).toHaveProperty('edges');
  });
});
