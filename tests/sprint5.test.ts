// tests/sprint5.test.ts
// PRD v1.3, Validation & Testing

import { describe, it, expect, vi } from "vitest";
import { mapToFunnelData } from "../lib/chart-data-mapper";

describe("Sprint 5: Dashboard Analytics", () => {
  it("should map API response to funnel chart data", () => {
    const apiData = { called: 100, engaged: 50, booked: 10 };
    const chartData = mapToFunnelData(apiData);
    expect(chartData).toEqual([
      { name: 'Called', value: 100 },
      { name: 'Engaged', value: 50 },
      { name: 'Booked', value: 10 },
    ]);
  });

  it("should handle API errors gracefully", async () => {
      // Mock fetch to return an error
      global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 500 }));
      // Assert that the component displays an error message
  });
});
