import { test, expect } from "@playwright/test";

test.describe("Settings Modal", () => {
  test("should open and display settings", async ({ page }) => {
    await page.goto("/");

    // Check for Settings button (it's an IconButton with an aria-label or FaCog icon)
    // Looking at DirectionsForm.tsx (user didn't provide content yet but assuming it's there)
    // We will assume aria-label="Settings" or similar.
    // Actually, let's verify what the button looks like.
    // If we can't find it easily, we might need to add an ID or aria-label.

    // Generic selector for the gear icon if aria-label is missing
    const settingsButton = page.locator('button[aria-label="Information"]');

    // If the button exists, click it
    await settingsButton.click();

    // Verify Modal Appears
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

    // Verify Disclaimer
    await expect(
      page.getByText("NapQuest is an independent application")
    ).toBeVisible();

    // Close Modal
    await page.locator('button[aria-label="Close settings"]').click();

    // Verify Modal Disappears
    await expect(
      page.getByRole("heading", { name: "Settings" })
    ).not.toBeVisible();
  });
});
