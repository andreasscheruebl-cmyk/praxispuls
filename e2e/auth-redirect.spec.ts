import { test, expect } from "@playwright/test";

test.describe("Auth Protection", () => {
  test("dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("onboarding redirects to login", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("settings redirects to login", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });
});
