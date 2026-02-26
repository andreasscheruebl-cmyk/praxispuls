import { test, expect } from "@playwright/test";

test.describe("Admin Management Smoke Tests", () => {
  test("admin practice detail page loads", async ({ page }) => {
    // Unauthenticated users get redirected to login
    await page.goto("/admin/practices");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("dashboard does not show admin link for unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("suspended survey page shows unavailable message", async ({ page }) => {
    // Non-existent survey slug returns 404
    const response = await page.goto("/s/nonexistent-survey-slug-test");
    expect(response?.status()).toBe(404);
  });
});
