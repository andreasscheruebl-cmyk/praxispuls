import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/PraxisPuls/);
    await expect(page.locator("body")).toBeVisible();
  });

  // login + register tests moved to auth-redirect.spec.ts (require Supabase Auth)

  test("impressum page loads", async ({ page }) => {
    await page.goto("/impressum");
    await expect(page.locator("h1")).toContainText(/Impressum/i);
  });

  test("datenschutz page loads", async ({ page }) => {
    await page.goto("/datenschutz");
    await expect(page.locator("h1")).toContainText(/Datenschutz/i);
  });

  test("agb page loads", async ({ page }) => {
    await page.goto("/agb");
    await expect(page.locator("h1")).toContainText(/Geschäftsbedingungen/i);
  });

  test("sitemap.xml returns XML", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("<urlset");
  });

  test("robots.txt returns correct content", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("User-Agent: *");
    expect(body).toContain("Disallow: /dashboard/");
  });
});
