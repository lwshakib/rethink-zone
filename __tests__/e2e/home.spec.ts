import { test, expect } from "@playwright/test";

test("should navigate to the home page and show the hero section", async ({
  page,
}) => {
  // Start from the index page
  await page.goto("/");

  // Check for the main heading
  await expect(page.locator("h1")).toContainText(
    "Rethink the way you write, sketch, and ship in one place."
  );

  // Check for the CTA button
  const signUpLink = page.locator('a:has-text("Start free")').first();
  await expect(signUpLink).toBeVisible();
});

test("should have working navigation to workspaces", async ({ page }) => {
  await page.goto("/");

  // Click on the View workspaces button
  await page.click("text=View workspaces");

  // Should navigate to /workspaces or redirect to sign-in if protected
  await expect(page).toHaveURL(/.*(workspaces|sign-in)/);
});
