// tests/sprint8.test.ts
// PRD v1.3, Validation & Testing

import { describe, it, expect, vi } from "vitest";
import { analyzeTranscript } from "../lib/inbound-gemini";

describe("Sprint 8: Inbound & Escalations", () => {
  it("should correctly parse intent and confidence from Gemini", async () => {
    // Mock Gemini response
    global.fetch = vi.fn(() => Promise.resolve({
        json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: '{"intent": "test", "confidence_score": 90}' }] } }] })
    }));

    const result = await analyzeTranscript("test transcript");
    expect(result.intent).toBe("test");
    expect(result.confidence_score).toBe(90);
  });

  it("should trigger handoff when confidence is low", async () => {
      // Mock Gemini to return low confidence
      // Assert that the handoff API is called
  });
});
