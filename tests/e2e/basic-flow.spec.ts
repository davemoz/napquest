import { test, expect } from "@playwright/test";

test.describe("Basic Application Flow", () => {
  test("should load the homepage and display key elements", async ({
    page,
  }) => {
    await page.goto("/");

    // Check title
    await expect(page).toHaveTitle(/NapQuest/);

    // Check for "Where are you?" input or similar text
    // "Actual nap time" only appears after routing.
    // Check for the search box placeholder instead.
    await expect(
      page.getByPlaceholder("Where would you like to go?")
    ).toBeVisible();

    // Check map canvas exists
    await expect(page.locator(".mapboxgl-canvas")).toBeVisible();
  });

  // Note: Testing actual Mapbox interactions or search requires mocking calls
  // or using a real API key. For basic flow, we ensure the UI renders.
});
