import { test, expect } from "@playwright/test";

test("landing page renders", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Log in", exact: true })).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByRole("button", { name: "Get Started", exact: true })).toBeVisible();
});
