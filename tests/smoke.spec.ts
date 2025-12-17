import { test, expect } from "@playwright/test";

test("landing page renders", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("FreeKanban")).toBeVisible();
  await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
});

