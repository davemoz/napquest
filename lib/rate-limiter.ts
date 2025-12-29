export class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number; // tokens per millisecond
  private lastRefill: number;

  constructor(maxTokens: number, refillIntervalMs: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = maxTokens / refillIntervalMs;
    this.lastRefill = Date.now();
  }

  tryRemoveToken(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  private refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

// Simple in-memory store for IP-based limiting.
// Note: This will be reset if the serverless function cold starts,
// which is acceptable for a basic implementation.
const ipLimiters = new Map<string, RateLimiter>();

// Default config: 10 requests per 10 seconds (10000ms)
const MAX_TOKENS = 10;
const REFILL_INTERVAL = 10000;

export function checkRateLimit(ip: string): boolean {
  let limiter = ipLimiters.get(ip);
  if (!limiter) {
    limiter = new RateLimiter(MAX_TOKENS, REFILL_INTERVAL);
    ipLimiters.set(ip, limiter);
  }
  return limiter.tryRemoveToken();
}
