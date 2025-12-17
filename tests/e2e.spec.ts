import { test, expect } from "@playwright/test";

function uniqueEmail() {
  const nonce = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `e2e-${nonce}@example.com`;
}

test.describe("Auth & Onboarding", () => {
  test("can register and complete onboarding", async ({ page }) => {
    test.setTimeout(120_000);
    test.skip(
      test.info().project.name !== "chromium",
      "Full registration flow is validated on Chromium to reduce cross-browser flakiness."
    );
    const email = uniqueEmail();

    await page.goto("/?login=true", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("tab", { name: "Register" })).toBeVisible({
      timeout: 60_000,
    });
    await page.getByRole("tab", { name: "Register" }).click();

    await page.locator("#name").fill("E2E User");
    await page.locator("#register-email").fill(email);
    await page.locator("#register-password").fill("Password123!");
    await page.locator("#confirm-password").fill("Password123!");

    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page.getByText("Ukuran Tim")).toBeVisible({ timeout: 60_000 });

    await page.getByText("Hanya saya", { exact: true }).click();
    await expect(page.getByText("Tujuan")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Pekerjaan", { exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByText("Pekerjaan", { exact: true }).click();

    await expect(page.getByRole("combobox")).toBeVisible({ timeout: 30_000 });
    await page.getByRole("combobox").click();
    await expect(page.getByText("IT / Software", { exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByText("IT / Software", { exact: true }).click();

    await page.getByRole("button", { name: "Mulai Sekarang" }).click();

    await expect(page.getByText("My First Project")).toBeVisible({
      timeout: 60_000,
    });
  });

  test("shows error toast on invalid credentials", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/?login=true", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#email")).toBeVisible({ timeout: 60_000 });
    await page.locator("#email").fill("wrong@example.com");
    await page.locator("#password").fill("wrongpassword");

    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Login failed")).toBeVisible({ timeout: 60_000 });
  });

  test("redirects unauthenticated settings access", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/settings/profile", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\\?login=true/);
  });
});
