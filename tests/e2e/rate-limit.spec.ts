import { test, expect } from "@playwright/test";

test.describe("Rate Limiting", () => {
  test("should return 429 after exceeding the limit", async ({ request }) => {
    // The limit is 10 requests per 10 seconds.
    // We will fire 12 requests rapidly.

    // Use the Matrix endpoint as it's a simple POST
    const endpoint = "/api/directions-matrix";
    const body = "-74.006,40.7128;-73.935,40.730"; // Simple coord string

    const promises = [];
    for (let i = 0; i < 15; i++) {
      promises.push(
        request.post(endpoint, {
          data: body,
          headers: {
            // Mock a unique IP for this test if possible?
            // In generic localhost tests, we might all share one IP.
            // So we rely on the server seeing us as one IP.
          },
        })
      );
    }

    const responses = await Promise.all(promises);

    // Count how many were 429
    const tooMany = responses.filter((r) => r.status() === 429);

    // We expect at least some to fail.
    // (Technically the first 10 succeed, next 5 fail)
    expect(tooMany.length).toBeGreaterThan(0);
  });
});
