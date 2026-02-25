import { test, expect } from "@playwright/test";

test.describe("Admin Auth Protection", () => {
  test("admin redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("admin subpages redirect unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/admin/practices");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });
});
