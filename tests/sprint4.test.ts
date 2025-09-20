// tests/sprint4.test.ts
// PRD v1.3, Validation & Testing

import { describe, it, expect, vi } from "vitest";
import quotaCheck from "../services/core-api/src/middleware/quota-check";

describe("Sprint 4: Stripe & Quota Enforcement", () => {
  it("should block a request if quota is zero", async () => {
    const handler = vi.fn();
    const req = { headers: { authorization: "Bearer test" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    
    // Mock Supabase client to return a profile with 0 quota
    vi.mock("../lib/supabase", () => ({
        getSupabaseClient: () => ({
            auth: { getUser: () => ({ data: { user: { id: '123' } } }) },
            from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: { quota_minutes: 0 } }) }) }) })
        })
    }));

    await quotaCheck(handler)(req, res);

    expect(res.status).toHaveBeenCalledWith(402);
    expect(handler).not.toHaveBeenCalled();
  });

  it("should allow a request if quota is positive", async () => {
    const handler = vi.fn();
    const req = { headers: { authorization: "Bearer test" } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    
    // Mock Supabase client to return a profile with positive quota
    vi.mock("../lib/supabase", () => ({
        getSupabaseClient: () => ({
            auth: { getUser: () => ({ data: { user: { id: '123' } } }) },
            from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: { quota_minutes: 100 } }) }) }) })
        })
    }));

    await quotaCheck(handler)(req, res);

    expect(handler).toHaveBeenCalled();
  });
});
