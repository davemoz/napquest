import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkRateLimit, RateLimiter } from "./rate-limiter";

describe("RateLimiter", () => {
  it("should allow requests up to the max tokens", () => {
    const limiter = new RateLimiter(5, 1000); // 5 tokens, refill every 1s
    for (let i = 0; i < 5; i++) {
      expect(limiter.tryRemoveToken()).toBe(true);
    }
    expect(limiter.tryRemoveToken()).toBe(false);
  });

  it("should refill tokens over time", () => {
    vi.useFakeTimers();
    const limiter = new RateLimiter(5, 1000); // 5 tokens, 1000ms total refill time (5 tokens/1000ms = 0.005 tokens per ms?? No, logic is maxTokens / interval)
    // Actually the logic in rate-limiter.ts is:
    // refillRate = maxTokens / refillIntervalMs
    // So 5 / 1000 = 0.005 tokens/ms.
    // To get 1 token, we need 1 / 0.005 = 200ms.

    // Consume all tokens
    for (let i = 0; i < 5; i++) {
      limiter.tryRemoveToken();
    }
    expect(limiter.tryRemoveToken()).toBe(false);

    // Advance time by 200ms (enough for 1 token)
    vi.advanceTimersByTime(200);
    expect(limiter.tryRemoveToken()).toBe(true);
    expect(limiter.tryRemoveToken()).toBe(false);

    // Advance time by 1000ms (full refill)
    vi.advanceTimersByTime(1000);
    // Should be able to consume 5 again
    for (let i = 0; i < 5; i++) {
      expect(limiter.tryRemoveToken()).toBe(true);
    }

    vi.useRealTimers();
  });
});
